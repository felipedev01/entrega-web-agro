import { RelatoriosDashboard } from "@/components/relatorios-dashboard";
import { PageFrame } from "@/components/ui";
import { pageContent } from "@/lib/content";

export default function RelatoriosPage() {
  const content = pageContent.relatorios;

  return (
    <PageFrame eyebrow={content.eyebrow} title={content.title} description={content.description}>
      <RelatoriosDashboard />
    </PageFrame>
  );
}
