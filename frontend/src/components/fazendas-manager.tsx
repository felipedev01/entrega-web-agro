"use client";

import { useEffect, useState, useTransition } from "react";

import { ApiError, createFazenda, deleteFazenda, listFazendas, updateFazenda } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Fazenda } from "@/lib/types";

import { buttonClassName, inputClassName, Panel, secondaryButtonClassName, StatusCallout } from "./ui";

export function FazendasManager() {
  const nomeInputId = "fazenda-nome";
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
              : "Nao foi possivel carregar as unidades.",
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
          setFeedback({ tone: "success", message: "Unidade atualizada com sucesso." });
        } else {
          await createFazenda({ nome });
          setFeedback({ tone: "success", message: "Unidade cadastrada com sucesso." });
        }
        resetForm();
        await refresh();
      } catch (caughtError) {
        setFeedback({
          tone: "error",
          message:
            caughtError instanceof ApiError
              ? caughtError.message
              : "Nao foi possivel salvar a unidade.",
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
    if (!window.confirm("Deseja remover esta unidade e os dados relacionados?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteFazenda(id);
        setFeedback({ tone: "success", message: "Unidade removida com sucesso." });
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
              : "Nao foi possivel remover a unidade.",
        });
      }
    });
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title={editingId ? "Editar unidade" : "Nova unidade"} eyebrow="Cadastro mestre">
        {feedback ? <StatusCallout tone={feedback.tone} message={feedback.message} /> : null}
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor={nomeInputId}
              className="mb-1.5 block text-sm font-medium text-[color:var(--ink)]"
            >
              Nome da unidade
            </label>
            <input
              id={nomeInputId}
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Fazenda Santa Helena"
              required
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button className={buttonClassName} type="submit" disabled={isPending}>
              {editingId ? "Salvar alteracoes" : "Cadastrar unidade"}
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

      <Panel title="Unidades cadastradas" eyebrow="Base operacional">
        {loading ? <StatusCallout tone="info" message="Atualizando unidades disponiveis para a operacao." /> : null}
        <div className="space-y-3 md:hidden">
          {fazendas.map((fazenda) => (
            <article
              key={fazenda.id}
              className="rounded-[20px] border border-[color:var(--line)] bg-white/72 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Unidade
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{fazenda.nome}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Criada em {formatDate(fazenda.created_at)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(fazenda)}>
                  Editar
                </button>
                <button
                  className={secondaryButtonClassName}
                  type="button"
                  onClick={() => handleDelete(fazenda.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="hidden w-full max-w-full overflow-x-auto md:block">
          <table className="min-w-[560px] text-left text-sm">
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
                  <td className="py-2.5 pr-4 font-medium">{fazenda.nome}</td>
                  <td className="py-2.5 pr-4">{formatDate(fazenda.created_at)}</td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      <button className={secondaryButtonClassName} type="button" onClick={() => handleEdit(fazenda)}>
                        Editar
                      </button>
                      <button
                        className={secondaryButtonClassName}
                        type="button"
                        onClick={() => handleDelete(fazenda.id)}
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
  );
}
