"use client";

import { useEffect, useState } from "react";

import { ApiError, getHealth, getRelatorioSafra, listFazendas, listRegistros, listTalhoes } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Fazenda, RegistroColheita, RelatorioSafra, Talhao } from "@/lib/types";

import { Panel, StatCard, StatusCallout } from "./ui";

const initialSafra = "2025/2026";

export function DashboardOverview() {
  const [safra, setSafra] = useState(initialSafra);
  const [report, setReport] = useState<RelatorioSafra | null>(null);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [registros, setRegistros] = useState<RegistroColheita[]>([]);
  const [apiStatus, setApiStatus] = useState<"loading" | "online" | "offline">("loading");
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(targetSafra: string) {
    try {
      const [health, farms, plots, harvests, summary] = await Promise.all([
        getHealth(),
        listFazendas(),
        listTalhoes(),
        listRegistros({ safra: targetSafra }),
        getRelatorioSafra(targetSafra),
      ]);
      setApiStatus(health.status === "ok" ? "online" : "offline");
      setFazendas(farms);
      setTalhoes(plots);
      setRegistros(harvests);
      setReport(summary);
    } catch (caughtError) {
      setApiStatus("offline");
      setReport(null);
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Nao foi possivel carregar o dashboard no momento.",
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
      setApiStatus("loading");
      await loadDashboard(safra);
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [safra]);

  return (
    <div className="space-y-5">
      <Panel
        title="Ritmo da safra em uma unica leitura"
        eyebrow="Panorama operacional"
        actions={
          <label className="flex items-center gap-3 rounded-full border border-white/60 bg-white/60 px-3.5 py-2 text-sm text-[color:var(--ink)]">
            <span>Safra</span>
            <input
              value={safra}
              onChange={(event) => setSafra(event.target.value)}
              className="w-28 bg-transparent outline-none"
            />
          </label>
        }
      >
        {apiStatus === "online" ? (
          <StatusCallout tone="success" message="Sincronizacao ativa e indicadores prontos para consulta." />
        ) : null}
        {apiStatus === "loading" ? (
          <StatusCallout tone="info" message="Atualizando indicadores e consolidando a leitura da safra." />
        ) : null}
        {error ? <StatusCallout tone="error" message={error} /> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Unidades ativas" value={String(fazendas.length)} helper="Fazendas conectadas ao acompanhamento" />
          <StatCard label="Areas mapeadas" value={String(talhoes.length)} helper="Talhoes disponiveis para execucao e analise" />
          <StatCard
            label="Apontamentos"
            value={String(report?.total_registros ?? registros.length)}
            helper="Lancamentos consolidados para a safra atual"
          />
          <StatCard
            label="Perda acumulada"
            value={formatNumber(report?.perda_total_ton ?? 0, " ton")}
            helper="Volume total desviado no periodo monitorado"
          />
        </div>
      </Panel>

      <div className="grid items-start gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Performance por unidade" eyebrow="Leitura rapida">
          {report?.consolidado_por_fazenda.length ? (
            <div className="space-y-3">
              <div className="space-y-2.5 md:hidden">
                {report.consolidado_por_fazenda.map((item) => (
                  <article
                    key={item.fazenda_id}
                    className="rounded-[20px] border border-[color:var(--line)] bg-white/72 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                          Unidade
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
                          {item.fazenda_nome}
                        </h3>
                      </div>
                      <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[color:var(--accent)]">
                        {formatNumber(item.perda_percentual_medio, "%")}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
                      <div className="rounded-2xl bg-[color:var(--canvas)]/55 px-3 py-2">
                        <dt className="text-[color:var(--muted)]">Previsto</dt>
                        <dd className="mt-1 font-semibold">{formatNumber(item.total_previsto_ton, " ton")}</dd>
                      </div>
                      <div className="rounded-2xl bg-[color:var(--canvas)]/55 px-3 py-2">
                        <dt className="text-[color:var(--muted)]">Realizado</dt>
                        <dd className="mt-1 font-semibold">{formatNumber(item.total_realizado_ton, " ton")}</dd>
                      </div>
                      <div className="rounded-2xl bg-[color:var(--canvas)]/55 px-3 py-2 col-span-2">
                        <dt className="text-[color:var(--muted)]">Perda acumulada</dt>
                        <dd className="mt-1 font-semibold">{formatNumber(item.perda_total_ton, " ton")}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>

              <div className="hidden w-full max-w-full overflow-x-auto md:block">
                <table className="min-w-[620px] text-left text-sm">
                  <thead className="text-[color:var(--muted)]">
                    <tr>
                      <th className="pb-3 pr-4">Fazenda</th>
                      <th className="pb-3 pr-4">Previsto</th>
                      <th className="pb-3 pr-4">Realizado</th>
                      <th className="pb-3 pr-4">Perda</th>
                      <th className="pb-3">Perda media</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.consolidado_por_fazenda.map((item) => (
                      <tr key={item.fazenda_id} className="border-t border-[color:var(--line)]">
                        <td className="py-3 pr-4 font-medium">{item.fazenda_nome}</td>
                        <td className="py-3 pr-4">{formatNumber(item.total_previsto_ton, " ton")}</td>
                        <td className="py-3 pr-4">{formatNumber(item.total_realizado_ton, " ton")}</td>
                        <td className="py-3 pr-4">{formatNumber(item.perda_total_ton, " ton")}</td>
                        <td className="py-3">{formatNumber(item.perda_percentual_medio, "%")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <StatusCallout tone="info" message="Ainda nao ha apontamentos suficientes para a safra informada." />
          )}
        </Panel>

        <Panel title="Areas que pedem atencao" eyebrow="Alertas">
          {report?.ranking_maiores_perdas.length ? (
            <div className="space-y-3">
              {report.ranking_maiores_perdas.map((item, index) => (
                <article
                  key={`${item.talhao_id}-${item.talhao_codigo}`}
                  className="rounded-[20px] border border-[color:var(--line)] bg-white/70 p-3.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ember)]">
                    Prioridade {index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{item.talhao_codigo}</h3>
                  <p className="text-sm text-[color:var(--muted)]">{item.fazenda_nome}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{formatNumber(item.perda_ton, " ton")}</span>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 font-semibold text-[color:var(--accent)]">
                      {formatNumber(item.perda_percentual, "%")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <StatusCallout tone="info" message="As prioridades aparecerao assim que a safra tiver apontamentos consolidados." />
          )}
        </Panel>
      </div>
    </div>
  );
}
