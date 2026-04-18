"use client";

import { useEffect, useState } from "react";

import {
  ApiError,
  getExportUrl,
  getRelatorioFazenda,
  getRelatorioSafra,
  getRelatorioTalhao,
  listFazendas,
  listTalhoes,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Fazenda, RelatorioEntidade, RelatorioSafra, Talhao } from "@/lib/types";

import { Panel, secondaryButtonClassName, StatCard, StatusCallout } from "./ui";

export function RelatoriosDashboard() {
  const [safra, setSafra] = useState("2025/2026");
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [fazendaId, setFazendaId] = useState("");
  const [talhaoId, setTalhaoId] = useState("");
  const [report, setReport] = useState<RelatorioSafra | null>(null);
  const [farmReport, setFarmReport] = useState<RelatorioEntidade | null>(null);
  const [plotReport, setPlotReport] = useState<RelatorioEntidade | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadReports(targetSafra: string, selectedFarmId?: number, selectedPlotId?: number) {
    try {
      const [farms, plots, seasonReport, nextFarmReport, nextPlotReport] = await Promise.all([
        listFazendas(),
        listTalhoes(),
        getRelatorioSafra(targetSafra),
        selectedFarmId ? getRelatorioFazenda(selectedFarmId, targetSafra) : Promise.resolve(null),
        selectedPlotId ? getRelatorioTalhao(selectedPlotId, targetSafra) : Promise.resolve(null),
      ]);
      setFazendas(farms);
      setTalhoes(plots);
      setReport(seasonReport);
      setFarmReport(nextFarmReport);
      setPlotReport(nextPlotReport);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Nao foi possivel carregar os relatorios.",
      );
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await Promise.resolve();
      if (!active) {
        return;
      }
      setError(null);
      await loadReports(safra);
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [safra]);

  function handleConsultar() {
    setError(null);
    void loadReports(
      safra,
      fazendaId ? Number(fazendaId) : undefined,
      talhaoId ? Number(talhaoId) : undefined,
    );
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Consolidacao da safra"
        eyebrow="Relatorios"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={safra}
              onChange={(event) => setSafra(event.target.value)}
              className="rounded-full border border-[color:var(--line)] bg-white/70 px-4 py-2 text-sm outline-none"
            />
            <button className={secondaryButtonClassName} type="button" onClick={handleConsultar}>
              Atualizar relatorios
            </button>
          </div>
        }
      >
        {error ? <StatusCallout tone="error" message={error} /> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Registros" value={String(report?.total_registros ?? 0)} helper="Fechamentos encontrados" />
          <StatCard
            label="Previsto"
            value={formatNumber(report?.total_previsto_ton ?? 0, " ton")}
            helper="Volume planejado na safra"
          />
          <StatCard
            label="Realizado"
            value={formatNumber(report?.total_realizado_ton ?? 0, " ton")}
            helper="Volume efetivamente colhido"
          />
          <StatCard
            label="Perda media"
            value={formatNumber(report?.perda_percentual_medio ?? 0, "%")}
            helper="Media percentual de perda"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {getExportUrl("/export/json") ? (
            <a className={secondaryButtonClassName} href={getExportUrl("/export/json") ?? "#"} target="_blank" rel="noreferrer">
              Exportar JSON
            </a>
          ) : (
            <span className={secondaryButtonClassName}>Configure NEXT_PUBLIC_API_BASE_URL</span>
          )}
          {getExportUrl("/export/txt", safra) ? (
            <a
              className={secondaryButtonClassName}
              href={getExportUrl("/export/txt", safra) ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              Exportar TXT
            </a>
          ) : (
            <span className={secondaryButtonClassName}>URL da API ainda nao definida</span>
          )}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Ranking de maiores perdas" eyebrow="Safra">
          {report?.ranking_maiores_perdas.length ? (
            <div className="space-y-3">
              {report.ranking_maiores_perdas.map((item, index) => (
                <article key={`${item.talhao_id}-${item.talhao_codigo}`} className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ember)]">
                        Alerta {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{item.talhao_codigo}</h3>
                      <p className="text-sm text-[color:var(--muted)]">{item.fazenda_nome}</p>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[color:var(--accent)]">
                      {formatNumber(item.perda_percentual, "%")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">
                    Perda acumulada de {formatNumber(item.perda_ton, " ton")} para a safra consultada.
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <StatusCallout tone="info" message="Ainda nao ha ranking para a safra selecionada." />
          )}
        </Panel>

        <Panel title="Recortes por fazenda e talhao" eyebrow="Drill-down">
          <div className="grid gap-3 md:grid-cols-2">
            <select className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm outline-none" value={fazendaId} onChange={(event) => setFazendaId(event.target.value)}>
              <option value="">Selecione uma fazenda</option>
              {fazendas.map((fazenda) => (
                <option key={fazenda.id} value={fazenda.id}>
                  {fazenda.nome}
                </option>
              ))}
            </select>
            <select className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm outline-none" value={talhaoId} onChange={(event) => setTalhaoId(event.target.value)}>
              <option value="">Selecione um talhao</option>
              {talhoes.map((talhao) => (
                <option key={talhao.id} value={talhao.id}>
                  {talhao.codigo} - {talhao.fazenda_nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <button className={secondaryButtonClassName} type="button" onClick={handleConsultar}>
              Consultar recortes
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {farmReport ? (
              <article className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">{farmReport.titulo}</p>
                <h3 className="mt-2 text-xl font-semibold">{farmReport.identificador}</h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {farmReport.total_registros} registros | perda media de {formatNumber(farmReport.perda_percentual_medio, "%")}
                </p>
              </article>
            ) : null}

            {plotReport ? (
              <article className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ember)]">{plotReport.titulo}</p>
                <h3 className="mt-2 text-xl font-semibold">{plotReport.identificador}</h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {plotReport.total_registros} registros | perda total de {formatNumber(plotReport.perda_total_ton, " ton")}
                </p>
              </article>
            ) : null}

            {!farmReport && !plotReport ? (
              <StatusCallout tone="info" message="Escolha uma fazenda ou um talhao para abrir o detalhe do consolidado." />
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
