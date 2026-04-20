from __future__ import annotations

from collections import defaultdict
from datetime import date
from io import BytesIO
from typing import Any, Callable

import oracledb
import pandas as pd

from app.core.errors import AppError
from app.repositories.agro_repository import AgroRepository
from app.schemas.report import FazendaResumo, RankingItem, RelatorioEntidade, RelatorioSafra


EXPORT_COLUMNS = [
    "id",
    "fazenda_id",
    "fazenda_nome",
    "talhao_id",
    "talhao_codigo",
    "safra",
    "data_fechamento",
    "tipo_colheita",
    "producao_prevista_ton",
    "producao_real_ton",
    "perda_ton",
    "perda_percentual",
    "equipe_responsavel",
    "observacoes",
    "created_at",
    "updated_at",
]

NUMERIC_EXPORT_COLUMNS = [
    "id",
    "fazenda_id",
    "talhao_id",
    "producao_prevista_ton",
    "producao_real_ton",
    "perda_ton",
    "perda_percentual",
]

DATETIME_EXPORT_COLUMNS = [
    "data_fechamento",
    "created_at",
    "updated_at",
]


class AgroService:
    def __init__(self, repository: AgroRepository) -> None:
        self.repository = repository

    def list_fazendas(self) -> list[dict[str, Any]]:
        return self.repository.list_fazendas()

    def create_fazenda(self, nome: str) -> dict[str, Any]:
        return self._guard_database_operation(lambda: self.repository.create_fazenda(nome))

    def update_fazenda(self, fazenda_id: int, nome: str) -> dict[str, Any]:
        return self._guard_database_operation(lambda: self.repository.update_fazenda(fazenda_id, nome))

    def delete_fazenda(self, fazenda_id: int) -> None:
        self._guard_database_operation(lambda: self.repository.delete_fazenda(fazenda_id))

    def list_talhoes(self, fazenda_id: int | None = None) -> list[dict[str, Any]]:
        return self.repository.list_talhoes(fazenda_id)

    def create_talhao(self, payload: dict[str, Any]) -> dict[str, Any]:
        self._ensure_fazenda(payload["fazenda_id"])
        return self._guard_database_operation(lambda: self.repository.create_talhao(payload))

    def update_talhao(self, talhao_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        self._ensure_fazenda(payload["fazenda_id"])
        return self._guard_database_operation(lambda: self.repository.update_talhao(talhao_id, payload))

    def delete_talhao(self, talhao_id: int) -> None:
        self._guard_database_operation(lambda: self.repository.delete_talhao(talhao_id))

    def list_registros(
        self,
        safra: str | None = None,
        fazenda_id: int | None = None,
        talhao_id: int | None = None,
    ) -> list[dict[str, Any]]:
        return self.repository.list_registros(safra, fazenda_id, talhao_id)

    def create_registro(self, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = self._prepare_registro_payload(payload)
        return self._guard_database_operation(lambda: self.repository.create_registro(normalized))

    def update_registro(self, registro_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        normalized = self._prepare_registro_payload(payload, except_id=registro_id)
        return self._guard_database_operation(lambda: self.repository.update_registro(registro_id, normalized))

    def delete_registro(self, registro_id: int) -> None:
        self._guard_database_operation(lambda: self.repository.delete_registro(registro_id))

    def relatorio_safra(self, safra: str) -> RelatorioSafra:
        registros = self.repository.list_registros(safra=safra)
        resumo = self._build_resumo(registros)
        por_fazenda: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for registro in registros:
            por_fazenda[int(registro["fazenda_id"])].append(registro)

        consolidado = [
            FazendaResumo(
                fazenda_id=fazenda_id,
                fazenda_nome=items[0]["fazenda_nome"],
                total_previsto_ton=self._round(sum(float(item["producao_prevista_ton"]) for item in items)),
                total_realizado_ton=self._round(sum(float(item["producao_real_ton"]) for item in items)),
                perda_total_ton=self._round(sum(float(item["perda_ton"]) for item in items)),
                perda_percentual_medio=self._round(
                    sum(float(item["perda_percentual"]) for item in items) / len(items)
                ),
            )
            for fazenda_id, items in por_fazenda.items()
        ]

        ranking = [
            RankingItem(
                talhao_id=int(item["talhao_id"]),
                talhao_codigo=item["talhao_codigo"],
                fazenda_nome=item["fazenda_nome"],
                perda_ton=self._round(float(item["perda_ton"])),
                perda_percentual=self._round(float(item["perda_percentual"])),
            )
            for item in sorted(
                registros,
                key=lambda entry: (float(entry["perda_percentual"]), float(entry["perda_ton"])),
                reverse=True,
            )[:5]
        ]

        return RelatorioSafra(
            safra=safra,
            total_registros=resumo["total_registros"],
            total_previsto_ton=resumo["total_previsto_ton"],
            total_realizado_ton=resumo["total_realizado_ton"],
            perda_total_ton=resumo["perda_total_ton"],
            perda_percentual_medio=resumo["perda_percentual_medio"],
            ranking_maiores_perdas=ranking,
            consolidado_por_fazenda=sorted(consolidado, key=lambda item: item.fazenda_nome),
        )

    def relatorio_fazenda(self, fazenda_id: int, safra: str | None = None) -> RelatorioEntidade:
        fazenda = self._ensure_fazenda(fazenda_id)
        registros = self.repository.list_registros(safra=safra, fazenda_id=fazenda_id)
        resumo = self._build_resumo(registros)
        return RelatorioEntidade(
            titulo="Resumo por fazenda",
            identificador=fazenda["nome"],
            safra=safra,
            **resumo,
        )

    def relatorio_talhao(self, talhao_id: int, safra: str | None = None) -> RelatorioEntidade:
        talhao = self.repository.get_talhao(talhao_id)
        if talhao is None:
            raise AppError("Talhao nao encontrado.", 404)
        registros = self.repository.list_registros(safra=safra, talhao_id=talhao_id)
        resumo = self._build_resumo(registros)
        return RelatorioEntidade(
            titulo="Resumo por talhao",
            identificador=talhao["codigo"],
            safra=safra,
            **resumo,
        )

    def export_snapshot(self) -> dict[str, Any]:
        return self.repository.export_snapshot()

    def export_txt(self, safra: str | None = None) -> str:
        registros = self.repository.list_registros(safra=safra)
        resumo = self._build_resumo(registros)
        linhas = [
            "Relatorio Operacional de Colheita",
            "================================",
            f"Safra filtrada: {safra or 'Todas'}",
            f"Total de registros: {resumo['total_registros']}",
            f"Total previsto (ton): {resumo['total_previsto_ton']:.2f}",
            f"Total realizado (ton): {resumo['total_realizado_ton']:.2f}",
            f"Perda total (ton): {resumo['perda_total_ton']:.2f}",
            f"Perda percentual media: {resumo['perda_percentual_medio']:.2f}%",
            "",
            "Detalhamento:",
        ]
        for registro in registros:
            linhas.append(
                (
                    f"- {registro['fazenda_nome']} | {registro['talhao_codigo']} | "
                    f"Safra {registro['safra']} | Previsto {float(registro['producao_prevista_ton']):.2f} ton | "
                    f"Realizado {float(registro['producao_real_ton']):.2f} ton | "
                    f"Perda {float(registro['perda_percentual']):.2f}%"
                )
            )
        return "\n".join(linhas)

    def export_xlsx(self) -> bytes:
        try:
            registros = self.repository.list_registros()
            dataframe = pd.DataFrame.from_records(registros, columns=EXPORT_COLUMNS)

            for column in NUMERIC_EXPORT_COLUMNS:
                dataframe[column] = pd.to_numeric(dataframe[column], errors="coerce")

            for column in DATETIME_EXPORT_COLUMNS:
                dataframe[column] = pd.to_datetime(dataframe[column], errors="coerce")

            buffer = BytesIO()
            with pd.ExcelWriter(
                buffer,
                engine="openpyxl",
                date_format="YYYY-MM-DD",
                datetime_format="YYYY-MM-DD HH:MM:SS",
            ) as writer:
                dataframe.to_excel(writer, sheet_name="Registros", index=False)

            return buffer.getvalue()
        except AppError:
            raise
        except Exception as exc:
            raise AppError("Nao foi possivel gerar o arquivo Excel do relatorio.", 500) from exc

    def _prepare_registro_payload(self, payload: dict[str, Any], except_id: int | None = None) -> dict[str, Any]:
        self._ensure_fazenda(payload["fazenda_id"])
        talhao = self.repository.get_talhao(payload["talhao_id"])
        if talhao is None:
            raise AppError("Talhao nao encontrado.", 404)
        if int(talhao["fazenda_id"]) != payload["fazenda_id"]:
            raise AppError("O talhao selecionado nao pertence a fazenda informada.", 400)
        if self.repository.exists_safra_for_talhao(payload["talhao_id"], payload["safra"], except_id=except_id):
            raise AppError("Ja existe fechamento para este talhao nesta safra.", 409)
        if payload["producao_real_ton"] > payload["producao_prevista_ton"]:
            raise AppError("A producao real nao pode ser maior que a prevista neste MVP.", 400)

        perda_ton = payload["producao_prevista_ton"] - payload["producao_real_ton"]
        perda_percentual = (perda_ton / payload["producao_prevista_ton"]) * 100
        return {
            **payload,
            "data_fechamento": self._to_date(payload["data_fechamento"]),
            "perda_ton": self._round(perda_ton),
            "perda_percentual": self._round(perda_percentual),
        }

    def _ensure_fazenda(self, fazenda_id: int) -> dict[str, Any]:
        fazenda = self.repository.get_fazenda(fazenda_id)
        if fazenda is None:
            raise AppError("Fazenda nao encontrada.", 404)
        return fazenda

    def _build_resumo(self, registros: list[dict[str, Any]]) -> dict[str, Any]:
        total_registros = len(registros)
        total_previsto = sum(float(item["producao_prevista_ton"]) for item in registros)
        total_realizado = sum(float(item["producao_real_ton"]) for item in registros)
        perda_total = sum(float(item["perda_ton"]) for item in registros)
        perda_percentual_medio = (
            sum(float(item["perda_percentual"]) for item in registros) / total_registros if total_registros else 0.0
        )
        return {
            "total_registros": total_registros,
            "total_previsto_ton": self._round(total_previsto),
            "total_realizado_ton": self._round(total_realizado),
            "perda_total_ton": self._round(perda_total),
            "perda_percentual_medio": self._round(perda_percentual_medio),
        }

    def _guard_database_operation(self, action: Callable[[], Any]) -> Any:
        try:
            return action()
        except oracledb.IntegrityError as exc:
            raise AppError("Violacao de integridade ao gravar no Oracle. Verifique chaves e valores unicos.", 409) from exc
        except oracledb.DatabaseError as exc:
            raise AppError("Falha de comunicacao com o Oracle.", 500) from exc

    @staticmethod
    def _to_date(value: Any) -> date:
        if isinstance(value, date):
            return value
        return date.fromisoformat(str(value))

    @staticmethod
    def _round(value: float) -> float:
        return round(value, 2)
