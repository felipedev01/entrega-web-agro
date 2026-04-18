import { RelatoriosDashboard } from "@/components/relatorios-dashboard";
import { PageFrame } from "@/components/ui";

export default function RelatoriosPage() {
  return (
    <PageFrame
      title="Relatorios e exportacoes"
      description="Consulte consolidacoes por safra, fazenda e talhao, identifique focos de perda e gere saidas em JSON e TXT a partir dos dados reais do Oracle."
    >
      <RelatoriosDashboard />
    </PageFrame>
  );
}
