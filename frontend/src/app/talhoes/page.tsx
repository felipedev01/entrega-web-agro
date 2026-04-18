import { TalhoesManager } from "@/components/talhoes-manager";
import { PageFrame } from "@/components/ui";

export default function TalhoesPage() {
  return (
    <PageFrame
      title="Cadastro operacional de talhoes"
      description="Associe cada talhao a uma fazenda, registre codigo, area e localizacao, e deixe a malha produtiva pronta para receber fechamentos de colheita."
    >
      <TalhoesManager />
    </PageFrame>
  );
}
