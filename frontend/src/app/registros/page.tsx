import { RegistrosManager } from "@/components/registros-manager";
import { PageFrame } from "@/components/ui";

export default function RegistrosPage() {
  return (
    <PageFrame
      title="Fechamento de colheita por safra"
      description="Registre a producao prevista e realizada de cada talhao, calcule automaticamente a perda e mantenha o historico da safra consultavel pela aplicacao web."
    >
      <RegistrosManager />
    </PageFrame>
  );
}
