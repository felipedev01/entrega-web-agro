"use client";

import { useEffect, useState, useTransition } from "react";

import { ApiError, createFazenda, deleteFazenda, listFazendas, updateFazenda } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Fazenda } from "@/lib/types";

import { buttonClassName, inputClassName, Panel, secondaryButtonClassName, StatusCallout } from "./ui";

export function FazendasManager() {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [nome, setNome] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    try {
      setFazendas(await listFazendas());
    } catch (caughtError) {
      setFeedback({
        tone: "error",
        message:
          caughtError instanceof ApiError
            ? caughtError.message
            : "Nao foi possivel carregar as fazendas.",
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
    setNome("");
    setEditingId(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        if (editingId) {
          await updateFazenda(editingId, { nome });
          setFeedback({ tone: "success", message: "Fazenda atualizada com sucesso." });
        } else {
          await createFazenda({ nome });
          setFeedback({ tone: "success", message: "Fazenda criada com sucesso." });
        }
        resetForm();
        await refresh();
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel salvar a fazenda.",
        });
      }
    });
  }

  function handleEdit(fazenda: Fazenda) {
    setFeedback(null);
    setEditingId(fazenda.id);
    setNome(fazenda.nome);
  }

  function handleDelete(id: number) {
    if (!window.confirm("Deseja realmente excluir esta fazenda e os dados relacionados?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteFazenda(id);
        setFeedback({ tone: "success", message: "Fazenda removida com sucesso." });
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
              : "Nao foi possivel excluir a fazenda.",
        });
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title={editingId ? "Editar fazenda" : "Nova fazenda"} eyebrow="Formulario">
        {feedback ? <StatusCallout tone={feedback.tone} message={feedback.message} /> : null}
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--ink)]">Nome da fazenda</label>
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Fazenda Sao Jose"
              required
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={buttonClassName} type="submit" disabled={isPending}>
              {editingId ? "Salvar alteracoes" : "Cadastrar fazenda"}
            </button>
            <button
              className={secondaryButtonClassName}
              type="button"
              onClick={resetForm}
              disabled={isPending}
            >
              Limpar formulario
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Fazendas cadastradas" eyebrow="Leitura Oracle">
        {loading ? <StatusCallout tone="info" message="Buscando fazendas cadastradas no Oracle." /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[color:var(--muted)]">
              <tr>
                <th className="pb-3 pr-4">Nome</th>
                <th className="pb-3 pr-4">Criada em</th>
                <th className="pb-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {fazendas.map((fazenda) => (
                <tr key={fazenda.id} className="border-t border-[color:var(--line)]">
                  <td className="py-3 pr-4 font-medium">{fazenda.nome}</td>
                  <td className="py-3 pr-4">{formatDate(fazenda.created_at)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(fazenda)}>
                        Editar
                      </button>
                      <button className={secondaryButtonClassName} type="button" onClick={() => handleDelete(fazenda.id)}>
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
  );
}
