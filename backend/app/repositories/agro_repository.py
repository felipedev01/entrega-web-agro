from __future__ import annotations

from typing import Any

import oracledb

from app.core.errors import AppError
from app.db.oracle import get_connection


def _rows_to_dicts(cursor: oracledb.Cursor, rows: list[tuple[Any, ...]]) -> list[dict[str, Any]]:
    columns = [column[0].lower() for column in cursor.description or []]
    normalized_rows: list[dict[str, Any]] = []
    for row in rows:
        values: list[Any] = []
        for value in row:
            if hasattr(value, "read"):
                values.append(value.read())
            else:
                values.append(value)
        normalized_rows.append(dict(zip(columns, values, strict=False)))
    return normalized_rows


class AgroRepository:
    def list_fazendas(self) -> list[dict[str, Any]]:
        sql = """
            SELECT id, nome, created_at, updated_at
            FROM fazendas
            ORDER BY nome
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql)
            return _rows_to_dicts(cursor, cursor.fetchall())

    def get_fazenda(self, fazenda_id: int) -> dict[str, Any] | None:
        sql = """
            SELECT id, nome, created_at, updated_at
            FROM fazendas
            WHERE id = :fazenda_id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"fazenda_id": fazenda_id})
            row = cursor.fetchone()
            if row is None:
                return None
            return _rows_to_dicts(cursor, [row])[0]

    def create_fazenda(self, nome: str) -> dict[str, Any]:
        sql = """
            INSERT INTO fazendas (nome)
            VALUES (:nome)
            RETURNING id INTO :id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            out_id = cursor.var(oracledb.NUMBER)
            cursor.execute(sql, {"nome": nome.strip(), "id": out_id})
            connection.commit()
            return self.get_fazenda(int(out_id.getvalue()[0]))

    def update_fazenda(self, fazenda_id: int, nome: str) -> dict[str, Any]:
        sql = """
            UPDATE fazendas
            SET nome = :nome,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :fazenda_id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"nome": nome.strip(), "fazenda_id": fazenda_id})
            if cursor.rowcount == 0:
                raise AppError("Fazenda nao encontrada.", 404)
            connection.commit()
        return self.get_fazenda(fazenda_id)

    def delete_fazenda(self, fazenda_id: int) -> None:
        sql = "DELETE FROM fazendas WHERE id = :fazenda_id"
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"fazenda_id": fazenda_id})
            if cursor.rowcount == 0:
                raise AppError("Fazenda nao encontrada.", 404)
            connection.commit()

    def list_talhoes(self, fazenda_id: int | None = None) -> list[dict[str, Any]]:
        sql = """
            SELECT t.id, t.fazenda_id, f.nome AS fazenda_nome, t.codigo, t.nome,
                   t.area_hectares, t.localizacao_descricao, t.created_at, t.updated_at
            FROM talhoes t
            JOIN fazendas f ON f.id = t.fazenda_id
            WHERE (:fazenda_id IS NULL OR t.fazenda_id = :fazenda_id)
            ORDER BY f.nome, t.codigo
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"fazenda_id": fazenda_id})
            return _rows_to_dicts(cursor, cursor.fetchall())

    def get_talhao(self, talhao_id: int) -> dict[str, Any] | None:
        sql = """
            SELECT t.id, t.fazenda_id, f.nome AS fazenda_nome, t.codigo, t.nome,
                   t.area_hectares, t.localizacao_descricao, t.created_at, t.updated_at
            FROM talhoes t
            JOIN fazendas f ON f.id = t.fazenda_id
            WHERE t.id = :talhao_id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"talhao_id": talhao_id})
            row = cursor.fetchone()
            if row is None:
                return None
            return _rows_to_dicts(cursor, [row])[0]

    def create_talhao(self, payload: dict[str, Any]) -> dict[str, Any]:
        sql = """
            INSERT INTO talhoes (
                fazenda_id, codigo, nome, area_hectares, localizacao_descricao
            )
            VALUES (
                :fazenda_id, :codigo, :nome, :area_hectares, :localizacao_descricao
            )
            RETURNING id INTO :id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            out_id = cursor.var(oracledb.NUMBER)
            cursor.execute(sql, {**payload, "id": out_id})
            connection.commit()
            return self.get_talhao(int(out_id.getvalue()[0]))

    def update_talhao(self, talhao_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        sql = """
            UPDATE talhoes
            SET fazenda_id = :fazenda_id,
                codigo = :codigo,
                nome = :nome,
                area_hectares = :area_hectares,
                localizacao_descricao = :localizacao_descricao,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :talhao_id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {**payload, "talhao_id": talhao_id})
            if cursor.rowcount == 0:
                raise AppError("Talhao nao encontrado.", 404)
            connection.commit()
        return self.get_talhao(talhao_id)

    def delete_talhao(self, talhao_id: int) -> None:
        sql = "DELETE FROM talhoes WHERE id = :talhao_id"
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"talhao_id": talhao_id})
            if cursor.rowcount == 0:
                raise AppError("Talhao nao encontrado.", 404)
            connection.commit()

    def list_registros(
        self,
        safra: str | None = None,
        fazenda_id: int | None = None,
        talhao_id: int | None = None,
    ) -> list[dict[str, Any]]:
        sql = """
            SELECT r.id, r.fazenda_id, f.nome AS fazenda_nome, r.talhao_id, t.codigo AS talhao_codigo,
                   r.safra, r.data_fechamento, r.tipo_colheita, r.producao_prevista_ton,
                   r.producao_real_ton, r.perda_ton, r.perda_percentual, r.equipe_responsavel,
                   r.observacoes, r.created_at, r.updated_at
            FROM registros_colheita r
            JOIN fazendas f ON f.id = r.fazenda_id
            JOIN talhoes t ON t.id = r.talhao_id
            WHERE (:safra IS NULL OR r.safra = :safra)
              AND (:fazenda_id IS NULL OR r.fazenda_id = :fazenda_id)
              AND (:talhao_id IS NULL OR r.talhao_id = :talhao_id)
            ORDER BY r.data_fechamento DESC, f.nome, t.codigo
        """
        params = {"safra": safra, "fazenda_id": fazenda_id, "talhao_id": talhao_id}
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, params)
            return _rows_to_dicts(cursor, cursor.fetchall())

    def get_registro(self, registro_id: int) -> dict[str, Any] | None:
        sql = """
            SELECT r.id, r.fazenda_id, f.nome AS fazenda_nome, r.talhao_id, t.codigo AS talhao_codigo,
                   r.safra, r.data_fechamento, r.tipo_colheita, r.producao_prevista_ton,
                   r.producao_real_ton, r.perda_ton, r.perda_percentual, r.equipe_responsavel,
                   r.observacoes, r.created_at, r.updated_at
            FROM registros_colheita r
            JOIN fazendas f ON f.id = r.fazenda_id
            JOIN talhoes t ON t.id = r.talhao_id
            WHERE r.id = :registro_id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"registro_id": registro_id})
            row = cursor.fetchone()
            if row is None:
                return None
            return _rows_to_dicts(cursor, [row])[0]

    def create_registro(self, payload: dict[str, Any]) -> dict[str, Any]:
        sql = """
            INSERT INTO registros_colheita (
                fazenda_id, talhao_id, safra, data_fechamento, tipo_colheita,
                producao_prevista_ton, producao_real_ton, perda_ton, perda_percentual,
                equipe_responsavel, observacoes
            )
            VALUES (
                :fazenda_id, :talhao_id, :safra, :data_fechamento, :tipo_colheita,
                :producao_prevista_ton, :producao_real_ton, :perda_ton, :perda_percentual,
                :equipe_responsavel, :observacoes
            )
            RETURNING id INTO :id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            out_id = cursor.var(oracledb.NUMBER)
            cursor.execute(sql, {**payload, "id": out_id})
            connection.commit()
            return self.get_registro(int(out_id.getvalue()[0]))

    def update_registro(self, registro_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        sql = """
            UPDATE registros_colheita
            SET fazenda_id = :fazenda_id,
                talhao_id = :talhao_id,
                safra = :safra,
                data_fechamento = :data_fechamento,
                tipo_colheita = :tipo_colheita,
                producao_prevista_ton = :producao_prevista_ton,
                producao_real_ton = :producao_real_ton,
                perda_ton = :perda_ton,
                perda_percentual = :perda_percentual,
                equipe_responsavel = :equipe_responsavel,
                observacoes = :observacoes,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :registro_id
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {**payload, "registro_id": registro_id})
            if cursor.rowcount == 0:
                raise AppError("Registro de colheita nao encontrado.", 404)
            connection.commit()
        return self.get_registro(registro_id)

    def delete_registro(self, registro_id: int) -> None:
        sql = "DELETE FROM registros_colheita WHERE id = :registro_id"
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"registro_id": registro_id})
            if cursor.rowcount == 0:
                raise AppError("Registro de colheita nao encontrado.", 404)
            connection.commit()

    def exists_safra_for_talhao(self, talhao_id: int, safra: str, except_id: int | None = None) -> bool:
        sql = """
            SELECT COUNT(1)
            FROM registros_colheita
            WHERE talhao_id = :talhao_id
              AND safra = :safra
              AND (:except_id IS NULL OR id <> :except_id)
        """
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(sql, {"talhao_id": talhao_id, "safra": safra, "except_id": except_id})
            return bool(cursor.fetchone()[0])

    def export_snapshot(self) -> dict[str, Any]:
        return {
            "fazendas": self.list_fazendas(),
            "talhoes": self.list_talhoes(),
            "registros_colheita": self.list_registros(),
        }
