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
    <div className="space-y-6">
      <Panel
        title="Controle da safra em um so lugar"
        eyebrow="Visao executiva"
        actions={
          <label className="flex items-center gap-3 rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm text-[color:var(--ink)]">
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
          <StatusCallout tone="success" message="API online e Oracle respondendo no endpoint de saude." />
        ) : null}
        {apiStatus === "loading" ? (
          <StatusCallout tone="info" message="Consultando a API Python e o Oracle para montar o painel." />
        ) : null}
        {error ? <StatusCallout tone="error" message={error} /> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Fazendas" value={String(fazendas.length)} helper="Propriedades cadastradas no Oracle" />
          <StatCard label="Talhoes" value={String(talhoes.length)} helper="Malha produtiva ativa para o sistema" />
          <StatCard
            label="Registros da safra"
            value={String(report?.total_registros ?? registros.length)}
            helper="Fechamentos consultados para a safra atual"
          />
          <StatCard
            label="Perda total"
            value={formatNumber(report?.perda_total_ton ?? 0, " ton")}
            helper="Soma de perdas operacionais no periodo"
          />
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Consolidado por fazenda" eyebrow="Leitura rapida">
          {report?.consolidado_por_fazenda.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
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
          ) : (
            <StatusCallout tone="info" message="Ainda nao ha registros para a safra informada." />
          )}
        </Panel>

        <Panel title="Top perdas" eyebrow="Alertas">
          {report?.ranking_maiores_perdas.length ? (
            <div className="space-y-3">
              {report.ranking_maiores_perdas.map((item, index) => (
                <article
                  key={`${item.talhao_id}-${item.talhao_codigo}`}
                  className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ember)]">
                    Posicao {index + 1}
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
            <StatusCallout tone="info" message="O ranking aparecera assim que a safra tiver fechamentos cadastrados." />
          )}
        </Panel>
      </div>
    </div>
  );
}
