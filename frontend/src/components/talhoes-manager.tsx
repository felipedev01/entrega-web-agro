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
            : "Nao foi possivel carregar os talhoes.",
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
          setFeedback({ tone: "success", message: "Talhao atualizado com sucesso." });
        } else {
          await createTalhao(payload);
          setFeedback({ tone: "success", message: "Talhao criado com sucesso." });
        }

        resetForm();
        await refresh(filterFarm ? Number(filterFarm) : undefined);
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel salvar o talhao.",
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
    if (!window.confirm("Deseja realmente excluir este talhao e os fechamentos associados?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTalhao(id);
        setFeedback({ tone: "success", message: "Talhao removido com sucesso." });
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
              : "Nao foi possivel excluir o talhao.",
        });
      }
    });
  }

  async function applyFilter() {
    await refresh(filterFarm ? Number(filterFarm) : undefined);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title={editingId ? "Editar talhao" : "Novo talhao"} eyebrow="Formulario">
          {feedback ? <StatusCallout tone={feedback.tone} message={feedback.message} /> : null}
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
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
              <label className="mb-2 block text-sm font-medium">Codigo</label>
              <input
                className={inputClassName}
                value={form.codigo}
                onChange={(event) => updateField("codigo", event.target.value)}
                placeholder="T01"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Nome opcional</label>
              <input
                className={inputClassName}
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                placeholder="Baixada Norte"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Area em hectares</label>
              <input
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
              <label className="mb-2 block text-sm font-medium">Localizacao</label>
              <input
                className={inputClassName}
                value={form.localizacao_descricao}
                onChange={(event) => updateField("localizacao_descricao", event.target.value)}
                placeholder="Setor proximo a estrada principal"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button className={buttonClassName} type="submit" disabled={isPending}>
                {editingId ? "Salvar alteracoes" : "Cadastrar talhao"}
              </button>
              <button className={secondaryButtonClassName} type="button" onClick={resetForm}>
                Limpar formulario
              </button>
            </div>
          </form>
        </Panel>

        <Panel
          title="Mapa de talhoes"
          eyebrow="Consulta"
          actions={
            <div className="flex items-center gap-2">
              <select
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
          {loading ? <StatusCallout tone="info" message="Buscando talhoes cadastrados no Oracle." /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
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
                    <td className="py-3 pr-4 font-medium">{talhao.codigo}</td>
                    <td className="py-3 pr-4">{talhao.fazenda_nome}</td>
                    <td className="py-3 pr-4">{formatNumber(talhao.area_hectares, " ha")}</td>
                    <td className="py-3 pr-4">{talhao.localizacao_descricao ?? "Sem detalhe"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(talhao)}>
                          Editar
                        </button>
                        <button className={secondaryButtonClassName} type="button" onClick={() => handleDelete(talhao.id)}>
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
