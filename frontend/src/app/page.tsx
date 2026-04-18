import { DashboardOverview } from "@/components/dashboard-overview";
import { PageFrame } from "@/components/ui";

export default function HomePage() {
  return (
    <PageFrame
      title="Painel de monitoramento para a colheita de cana"
      description="Visao geral da safra, estado da API Python, indicadores de perda e resumo por fazenda para acompanhar a operacao sem depender do terminal."
    >
      <DashboardOverview />
    </PageFrame>
  );
}
