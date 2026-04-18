import { FazendasManager } from "@/components/fazendas-manager";
import { PageFrame } from "@/components/ui";

export default function FazendasPage() {
  return (
    <PageFrame
      title="CRUD de fazendas"
      description="Cadastre, edite e remova propriedades rurais diretamente no Oracle, mantendo a base principal do sistema atualizada para o restante das telas."
    >
      <FazendasManager />
    </PageFrame>
  );
}
