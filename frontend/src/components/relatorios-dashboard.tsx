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

const initialSafra = "2025/2026";

export function RelatoriosDashboard() {
  const safraInputId = "relatorios-safra";
  const fazendaSelectId = "relatorios-fazenda";
  const talhaoSelectId = "relatorios-talhao";
  const [safraInput, setSafraInput] = useState(initialSafra);
  const [appliedSafra, setAppliedSafra] = useState(initialSafra);
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
      setFarmReport(null);
      setPlotReport(null);
      await loadReports(initialSafra);
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  function handleConsultar() {
    setError(null);
    const nextSafra = safraInput.trim() || "2025/2026";
    setAppliedSafra(nextSafra);
    void loadReports(
      nextSafra,
      fazendaId ? Number(fazendaId) : undefined,
      talhaoId ? Number(talhaoId) : undefined,
    );
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Leitura consolidada da safra"
        eyebrow="Centro de insights"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={safraInputId} className="sr-only">
              Safra do relatorio
            </label>
            <input
              id={safraInputId}
              value={safraInput}
              onChange={(event) => setSafraInput(event.target.value)}
              className="rounded-full border border-[color:var(--line)] bg-white/70 px-4 py-2 text-sm outline-none"
            />
            <button className={secondaryButtonClassName} type="button" onClick={handleConsultar}>
              Atualizar leitura
            </button>
          </div>
        }
      >
        {error ? <StatusCallout tone="error" message={error} /> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Apontamentos" value={String(report?.total_registros ?? 0)} helper="Lancamentos consolidados" />
          <StatCard
            label="Previsto"
            value={formatNumber(report?.total_previsto_ton ?? 0, " ton")}
            helper="Volume projetado para a safra"
          />
          <StatCard
            label="Realizado"
            value={formatNumber(report?.total_realizado_ton ?? 0, " ton")}
            helper="Volume efetivamente executado"
          />
          <StatCard
            label="Perda media"
            value={formatNumber(report?.perda_percentual_medio ?? 0, "%")}
            helper="Leitura percentual do desvio operacional"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {getExportUrl("/export/json") ? (
            <a className={secondaryButtonClassName} href={getExportUrl("/export/json") ?? "#"} target="_blank" rel="noreferrer">
              Baixar JSON
            </a>
          ) : (
            <span className={secondaryButtonClassName}>Exportacao indisponivel neste ambiente</span>
          )}
          {getExportUrl("/export/txt", appliedSafra) ? (
            <a
              className={secondaryButtonClassName}
              href={getExportUrl("/export/txt", appliedSafra) ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              Baixar TXT
            </a>
          ) : (
            <span className={secondaryButtonClassName}>Canal de exportacao indisponivel neste ambiente</span>
          )}
          {getExportUrl("/export/xlsx") ? (
            <a
              className={secondaryButtonClassName}
              href={getExportUrl("/export/xlsx") ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              Baixar Excel completo
            </a>
          ) : (
            <span className={secondaryButtonClassName}>Canal de exportacao indisponivel neste ambiente</span>
          )}
        </div>
      </Panel>

      <div className="grid items-start gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Areas com maior perda" eyebrow="Prioridades">
          {report?.ranking_maiores_perdas.length ? (
            <div className="w-full max-w-full space-y-2.5">
              {report.ranking_maiores_perdas.map((item, index) => (
                <article key={`${item.talhao_id}-${item.talhao_codigo}`} className="rounded-[20px] border border-[color:var(--line)] bg-white/70 p-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ember)]">
                        Prioridade {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{item.talhao_codigo}</h3>
                      <p className="text-sm text-[color:var(--muted)]">{item.fazenda_nome}</p>
                    </div>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[color:var(--accent)]">
                      {formatNumber(item.perda_percentual, "%")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--muted)]">
                    Perda acumulada de {formatNumber(item.perda_ton, " ton")} na leitura atual da safra.
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <StatusCallout tone="info" message="Ainda nao ha prioridades abertas para a safra selecionada." />
          )}
        </Panel>

        <Panel title="Detalhe por unidade e area" eyebrow="Drill-down">
          <div className="grid gap-2.5 md:grid-cols-2">
            <label htmlFor={fazendaSelectId} className="sr-only">
              Selecionar unidade para detalhamento
            </label>
            <select
              id={fazendaSelectId}
              className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm outline-none"
              value={fazendaId}
              onChange={(event) => setFazendaId(event.target.value)}
            >
              <option value="">Selecione uma unidade</option>
              {fazendas.map((fazenda) => (
                <option key={fazenda.id} value={fazenda.id}>
                  {fazenda.nome}
                </option>
              ))}
            </select>
            <label htmlFor={talhaoSelectId} className="sr-only">
              Selecionar talhao para detalhamento
            </label>
            <select
              id={talhaoSelectId}
              className="rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm outline-none"
              value={talhaoId}
              onChange={(event) => setTalhaoId(event.target.value)}
            >
              <option value="">Selecione um talhao</option>
              {talhoes.map((talhao) => (
                <option key={talhao.id} value={talhao.id}>
                  {talhao.codigo} - {talhao.fazenda_nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2.5">
            <button className={secondaryButtonClassName} type="button" onClick={handleConsultar}>
              Abrir detalhe
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {farmReport ? (
              <article className="rounded-[20px] border border-[color:var(--line)] bg-white/70 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">{farmReport.titulo}</p>
                <h3 className="mt-2 text-xl font-semibold">{farmReport.identificador}</h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {farmReport.total_registros} apontamentos | perda media de {formatNumber(farmReport.perda_percentual_medio, "%")}
                </p>
              </article>
            ) : null}

            {plotReport ? (
              <article className="rounded-[20px] border border-[color:var(--line)] bg-white/70 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ember)]">{plotReport.titulo}</p>
                <h3 className="mt-2 text-xl font-semibold">{plotReport.identificador}</h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {plotReport.total_registros} apontamentos | perda total de {formatNumber(plotReport.perda_total_ton, " ton")}
                </p>
              </article>
            ) : null}

            {!farmReport && !plotReport ? (
              <StatusCallout tone="info" message="Escolha uma unidade ou area para abrir o detalhamento da leitura." />
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
