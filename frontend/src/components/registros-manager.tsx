"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import {
  ApiError,
  createRegistro,
  deleteRegistro,
  listFazendas,
  listRegistros,
  listTalhoes,
  updateRegistro,
} from "@/lib/api";
import { formatDate, formatNumber, toInputDate } from "@/lib/format";
import type { Fazenda, RegistroColheita, Talhao } from "@/lib/types";

import { buttonClassName, inputClassName, Panel, secondaryButtonClassName, StatusCallout } from "./ui";

type RegistroForm = {
  fazenda_id: string;
  talhao_id: string;
  safra: string;
  data_fechamento: string;
  tipo_colheita: "manual" | "semimecanizada" | "mecanizada";
  producao_prevista_ton: string;
  producao_real_ton: string;
  equipe_responsavel: string;
  observacoes: string;
};

const initialForm: RegistroForm = {
  fazenda_id: "",
  talhao_id: "",
  safra: "2025/2026",
  data_fechamento: "2026-04-16",
  tipo_colheita: "mecanizada",
  producao_prevista_ton: "",
  producao_real_ton: "",
  equipe_responsavel: "",
  observacoes: "",
};

const initialFilters = {
  safra: "2025/2026",
  fazenda_id: "",
  talhao_id: "",
};

export function RegistrosManager() {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [registros, setRegistros] = useState<RegistroColheita[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState<RegistroForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const availableTalhoes = useMemo(
    () =>
      form.fazenda_id
        ? talhoes.filter((talhao) => talhao.fazenda_id === Number(form.fazenda_id))
        : talhoes,
    [form.fazenda_id, talhoes],
  );

  const previewLoss = useMemo(() => {
    const planned = Number(form.producao_prevista_ton || 0);
    const actual = Number(form.producao_real_ton || 0);
    if (!planned || actual > planned) {
      return null;
    }
    const lossTon = planned - actual;
    const lossPercent = (lossTon / planned) * 100;
    return {
      ton: lossTon,
      percent: lossPercent,
    };
  }, [form.producao_prevista_ton, form.producao_real_ton]);

  async function refresh() {
    try {
      const [farms, plots, harvests] = await Promise.all([
        listFazendas(),
        listTalhoes(),
        listRegistros({
          safra: filters.safra || undefined,
          fazendaId: filters.fazenda_id ? Number(filters.fazenda_id) : undefined,
          talhaoId: filters.talhao_id ? Number(filters.talhao_id) : undefined,
        }),
      ]);
      setFazendas(farms);
      setTalhoes(plots);
      setRegistros(harvests);
    } catch (caughtError) {
      setFeedback({
        tone: "error",
        message:
          caughtError instanceof ApiError
            ? caughtError.message
            : "Nao foi possivel carregar os registros.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await Promise.resolve();
      if (!active) {
        return;
      }
      setLoading(true);
      try {
        const [farms, plots, harvests] = await Promise.all([
          listFazendas(),
          listTalhoes(),
          listRegistros({
            safra: initialFilters.safra || undefined,
            fazendaId: initialFilters.fazenda_id ? Number(initialFilters.fazenda_id) : undefined,
            talhaoId: initialFilters.talhao_id ? Number(initialFilters.talhao_id) : undefined,
          }),
        ]);
        if (!active) {
          return;
        }
        setFazendas(farms);
        setTalhoes(plots);
        setRegistros(harvests);
      } catch (caughtError) {
        if (!active) {
          return;
        }
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel carregar os registros.",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function updateField<K extends keyof RegistroForm>(field: K, value: RegistroForm[K]) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "fazenda_id") {
        next.talhao_id = "";
      }
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const payload = {
          fazenda_id: Number(form.fazenda_id),
          talhao_id: Number(form.talhao_id),
          safra: form.safra.trim(),
          data_fechamento: form.data_fechamento,
          tipo_colheita: form.tipo_colheita,
          producao_prevista_ton: Number(form.producao_prevista_ton),
          producao_real_ton: Number(form.producao_real_ton),
          equipe_responsavel: form.equipe_responsavel.trim(),
          observacoes: form.observacoes.trim() || null,
        };

        if (editingId) {
          await updateRegistro(editingId, payload);
          setFeedback({ tone: "success", message: "Registro atualizado com sucesso." });
        } else {
          await createRegistro(payload);
          setFeedback({ tone: "success", message: "Registro criado com sucesso." });
        }
        resetForm();
        await refresh();
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel salvar o registro.",
        });
      }
    });
  }

  function handleEdit(registro: RegistroColheita) {
    setEditingId(registro.id);
    setForm({
      fazenda_id: String(registro.fazenda_id),
      talhao_id: String(registro.talhao_id),
      safra: registro.safra,
      data_fechamento: toInputDate(registro.data_fechamento),
      tipo_colheita: registro.tipo_colheita,
      producao_prevista_ton: String(registro.producao_prevista_ton),
      producao_real_ton: String(registro.producao_real_ton),
      equipe_responsavel: registro.equipe_responsavel,
      observacoes: registro.observacoes ?? "",
    });
  }

  function handleDelete(id: number) {
    if (!window.confirm("Deseja realmente excluir este fechamento de colheita?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteRegistro(id);
        setFeedback({ tone: "success", message: "Registro removido com sucesso." });
        if (editingId === id) {
          resetForm();
        }
        await refresh();
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel excluir o registro.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title={editingId ? "Editar fechamento" : "Novo fechamento"} eyebrow="Formulario Oracle">
          {feedback ? <StatusCallout tone={feedback.tone} message={feedback.message} /> : null}
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium">Fazenda</label>
              <select
                className={inputClassName}
                value={form.fazenda_id}
                onChange={(event) => updateField("fazenda_id", event.target.value)}
                required
              >
                <option value="">Selecione</option>
                {fazendas.map((fazenda) => (
                  <option key={fazenda.id} value={fazenda.id}>
                    {fazenda.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Talhao</label>
              <select
                className={inputClassName}
                value={form.talhao_id}
                onChange={(event) => updateField("talhao_id", event.target.value)}
                required
              >
                <option value="">Selecione</option>
                {availableTalhoes.map((talhao) => (
                  <option key={talhao.id} value={talhao.id}>
                    {talhao.codigo} - {talhao.fazenda_nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Safra</label>
              <input
                className={inputClassName}
                value={form.safra}
                onChange={(event) => updateField("safra", event.target.value)}
                placeholder="2025/2026"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Data de fechamento</label>
              <input
                className={inputClassName}
                type="date"
                value={form.data_fechamento}
                onChange={(event) => updateField("data_fechamento", event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tipo de colheita</label>
              <select
                className={inputClassName}
                value={form.tipo_colheita}
                onChange={(event) => updateField("tipo_colheita", event.target.value as RegistroForm["tipo_colheita"])}
              >
                <option value="manual">Manual</option>
                <option value="semimecanizada">Semimecanizada</option>
                <option value="mecanizada">Mecanizada</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Equipe responsavel</label>
              <input
                className={inputClassName}
                value={form.equipe_responsavel}
                onChange={(event) => updateField("equipe_responsavel", event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Producao prevista (ton)</label>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={form.producao_prevista_ton}
                onChange={(event) => updateField("producao_prevista_ton", event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Producao real (ton)</label>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={form.producao_real_ton}
                onChange={(event) => updateField("producao_real_ton", event.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Observacoes</label>
              <textarea
                className={`${inputClassName} min-h-28 resize-y`}
                value={form.observacoes}
                onChange={(event) => updateField("observacoes", event.target.value)}
                placeholder="Anote situacoes de manutencao, clima, solo ou equipe."
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[color:var(--line)] bg-white/60 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-[color:var(--ink)]">Previa automatica de perda</p>
                <p className="text-[color:var(--muted)]">
                  {previewLoss
                    ? `${formatNumber(previewLoss.ton, " ton")} | ${formatNumber(previewLoss.percent, "%")}`
                    : "Informe valores validos para producao prevista e real."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className={buttonClassName} type="submit" disabled={isPending}>
                  {editingId ? "Salvar alteracoes" : "Cadastrar registro"}
                </button>
                <button className={secondaryButtonClassName} type="button" onClick={resetForm}>
                  Limpar formulario
                </button>
              </div>
            </div>
          </form>
        </Panel>

        <Panel title="Consulta de fechamentos" eyebrow="Filtros">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              className={inputClassName}
              value={filters.safra}
              onChange={(event) => setFilters((current) => ({ ...current, safra: event.target.value }))}
              placeholder="Safra"
            />
            <select
              className={inputClassName}
              value={filters.fazenda_id}
              onChange={(event) =>
                setFilters((current) => ({ ...current, fazenda_id: event.target.value, talhao_id: "" }))
              }
            >
              <option value="">Todas as fazendas</option>
              {fazendas.map((fazenda) => (
                <option key={fazenda.id} value={fazenda.id}>
                  {fazenda.nome}
                </option>
              ))}
            </select>
            <select
              className={inputClassName}
              value={filters.talhao_id}
              onChange={(event) => setFilters((current) => ({ ...current, talhao_id: event.target.value }))}
            >
              <option value="">Todos os talhoes</option>
              {talhoes
                .filter((talhao) =>
                  filters.fazenda_id ? talhao.fazenda_id === Number(filters.fazenda_id) : true,
                )
                .map((talhao) => (
                  <option key={talhao.id} value={talhao.id}>
                    {talhao.codigo} - {talhao.fazenda_nome}
                  </option>
                ))}
            </select>
            <button className={secondaryButtonClassName} type="button" onClick={() => void refresh()}>
              Aplicar filtros
            </button>
          </div>

          {loading ? <div className="mt-4"><StatusCallout tone="info" message="Buscando registros no Oracle." /></div> : null}

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[color:var(--muted)]">
                <tr>
                  <th className="pb-3 pr-4">Safra</th>
                  <th className="pb-3 pr-4">Talhao</th>
                  <th className="pb-3 pr-4">Fechamento</th>
                  <th className="pb-3 pr-4">Previsto</th>
                  <th className="pb-3 pr-4">Realizado</th>
                  <th className="pb-3 pr-4">Perda</th>
                  <th className="pb-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id} className="border-t border-[color:var(--line)]">
                    <td className="py-3 pr-4">{registro.safra}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{registro.talhao_codigo}</p>
                      <p className="text-xs text-[color:var(--muted)]">{registro.fazenda_nome}</p>
                    </td>
                    <td className="py-3 pr-4">{formatDate(registro.data_fechamento)}</td>
                    <td className="py-3 pr-4">{formatNumber(registro.producao_prevista_ton, " ton")}</td>
                    <td className="py-3 pr-4">{formatNumber(registro.producao_real_ton, " ton")}</td>
                    <td className="py-3 pr-4">
                      {formatNumber(registro.perda_ton, " ton")} | {formatNumber(registro.perda_percentual, "%")}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(registro)}>
                          Editar
                        </button>
                        <button className={secondaryButtonClassName} type="button" onClick={() => handleDelete(registro.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
