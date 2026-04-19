"use client";

import { useEffect, useState, useTransition } from "react";

import {
  ApiError,
  createTalhao,
  deleteTalhao,
  listFazendas,
  listTalhoes,
  updateTalhao,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import type { Fazenda, Talhao } from "@/lib/types";

import { buttonClassName, inputClassName, Panel, secondaryButtonClassName, StatusCallout } from "./ui";

type TalhaoForm = {
  fazenda_id: string;
  codigo: string;
  nome: string;
  area_hectares: string;
  localizacao_descricao: string;
};

const initialForm: TalhaoForm = {
  fazenda_id: "",
  codigo: "",
  nome: "",
  area_hectares: "",
  localizacao_descricao: "",
};

export function TalhoesManager() {
  const farmSelectId = "talhao-fazenda";
  const codigoInputId = "talhao-codigo";
  const nomeInputId = "talhao-nome";
  const areaInputId = "talhao-area";
  const localizacaoInputId = "talhao-localizacao";
  const filterFarmId = "talhoes-filter-fazenda";
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [filterFarm, setFilterFarm] = useState("");
  const [form, setForm] = useState<TalhaoForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function refresh(farmId?: number) {
    try {
      const [farms, plots] = await Promise.all([
        listFazendas(),
        listTalhoes({ fazendaId: farmId }),
      ]);
      setFazendas(farms);
      setTalhoes(plots);
    } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel carregar as areas.",
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
      await refresh();
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

  function updateField<K extends keyof TalhaoForm>(field: K, value: TalhaoForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const payload = {
          fazenda_id: Number(form.fazenda_id),
          codigo: form.codigo.trim(),
          nome: form.nome.trim() || null,
          area_hectares: Number(form.area_hectares),
          localizacao_descricao: form.localizacao_descricao.trim() || null,
        };

        if (editingId) {
          await updateTalhao(editingId, payload);
          setFeedback({ tone: "success", message: "Area atualizada com sucesso." });
        } else {
          await createTalhao(payload);
          setFeedback({ tone: "success", message: "Area cadastrada com sucesso." });
        }

        resetForm();
        await refresh(filterFarm ? Number(filterFarm) : undefined);
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel salvar a area.",
        });
      }
    });
  }

  function handleEdit(talhao: Talhao) {
    setEditingId(talhao.id);
    setForm({
      fazenda_id: String(talhao.fazenda_id),
      codigo: talhao.codigo,
      nome: talhao.nome ?? "",
      area_hectares: String(talhao.area_hectares),
      localizacao_descricao: talhao.localizacao_descricao ?? "",
    });
  }

  function handleDelete(id: number) {
    if (!window.confirm("Deseja remover esta area e os apontamentos associados?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTalhao(id);
        setFeedback({ tone: "success", message: "Area removida com sucesso." });
        if (editingId === id) {
          resetForm();
        }
        await refresh(filterFarm ? Number(filterFarm) : undefined);
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel remover a area.",
        });
      }
    });
  }

  async function applyFilter() {
    await refresh(filterFarm ? Number(filterFarm) : undefined);
  }

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title={editingId ? "Editar area" : "Nova area"} eyebrow="Cadastro territorial">
          {feedback ? <StatusCallout tone={feedback.tone} message={feedback.message} /> : null}
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label htmlFor={farmSelectId} className="mb-1.5 block text-sm font-medium">
                Fazenda
              </label>
              <select
                id={farmSelectId}
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
              <label htmlFor={codigoInputId} className="mb-1.5 block text-sm font-medium">
                Codigo do talhao
              </label>
              <input
                id={codigoInputId}
                className={inputClassName}
                value={form.codigo}
                onChange={(event) => updateField("codigo", event.target.value)}
                placeholder="T01"
                required
              />
            </div>
            <div>
              <label htmlFor={nomeInputId} className="mb-1.5 block text-sm font-medium">
                Nome de referencia
              </label>
              <input
                id={nomeInputId}
                className={inputClassName}
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                placeholder="Baixada Norte"
              />
            </div>
            <div>
              <label htmlFor={areaInputId} className="mb-1.5 block text-sm font-medium">
                Area em hectares
              </label>
              <input
                id={areaInputId}
                className={inputClassName}
                type="number"
                min="0"
                step="0.01"
                value={form.area_hectares}
                onChange={(event) => updateField("area_hectares", event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor={localizacaoInputId} className="mb-1.5 block text-sm font-medium">
                Localizacao de campo
              </label>
              <input
                id={localizacaoInputId}
                className={inputClassName}
                value={form.localizacao_descricao}
                onChange={(event) => updateField("localizacao_descricao", event.target.value)}
                placeholder="Setor proximo a estrada principal"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-2.5">
              <button className={buttonClassName} type="submit" disabled={isPending}>
                {editingId ? "Salvar alteracoes" : "Cadastrar area"}
              </button>
              <button className={secondaryButtonClassName} type="button" onClick={resetForm}>
                Limpar formulario
              </button>
            </div>
          </form>
        </Panel>

        <Panel
          title="Areas mapeadas"
          eyebrow="Consulta territorial"
          actions={
            <div className="flex items-center gap-2">
              <label htmlFor={filterFarmId} className="sr-only">
                Filtrar areas por fazenda
              </label>
              <select
                id={filterFarmId}
                className={`${inputClassName} min-w-48`}
                value={filterFarm}
                onChange={(event) => setFilterFarm(event.target.value)}
              >
                <option value="">Todas as fazendas</option>
                {fazendas.map((fazenda) => (
                  <option key={fazenda.id} value={fazenda.id}>
                    {fazenda.nome}
                  </option>
                ))}
              </select>
              <button className={secondaryButtonClassName} type="button" onClick={() => void applyFilter()}>
                Aplicar
              </button>
            </div>
          }
        >
          {loading ? <StatusCallout tone="info" message="Atualizando areas mapeadas para consulta." /> : null}
          <div className="space-y-3 md:hidden">
            {talhoes.map((talhao) => (
              <article
                key={talhao.id}
                className="rounded-[20px] border border-[color:var(--line)] bg-white/72 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                      Talhao
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{talhao.codigo}</h3>
                    <p className="text-sm text-[color:var(--muted)]">{talhao.fazenda_nome}</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--canvas)]/70 px-3 py-1 text-sm font-medium">
                    {formatNumber(talhao.area_hectares, " ha")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {talhao.localizacao_descricao ?? "Sem detalhe"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(talhao)}>
                    Editar
                  </button>
                  <button
                    className={secondaryButtonClassName}
                    type="button"
                    onClick={() => handleDelete(talhao.id)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="hidden w-full max-w-full overflow-x-auto md:block">
            <table className="min-w-[720px] text-left text-sm">
              <thead className="text-[color:var(--muted)]">
                <tr>
                  <th className="pb-3 pr-4">Talhao</th>
                  <th className="pb-3 pr-4">Fazenda</th>
                  <th className="pb-3 pr-4">Area</th>
                  <th className="pb-3 pr-4">Localizacao</th>
                  <th className="pb-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {talhoes.map((talhao) => (
                  <tr key={talhao.id} className="border-t border-[color:var(--line)]">
                    <td className="py-2.5 pr-4 font-medium">{talhao.codigo}</td>
                    <td className="py-2.5 pr-4">{talhao.fazenda_nome}</td>
                    <td className="py-2.5 pr-4">{formatNumber(talhao.area_hectares, " ha")}</td>
                    <td className="py-2.5 pr-4">{talhao.localizacao_descricao ?? "Sem detalhe"}</td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(talhao)}>
                          Editar
                        </button>
                        <button
                          className={secondaryButtonClassName}
                          type="button"
                          onClick={() => handleDelete(talhao.id)}
                        >
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
