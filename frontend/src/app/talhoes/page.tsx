import { TalhoesManager } from "@/components/talhoes-manager";
import { PageFrame } from "@/components/ui";
import { pageContent } from "@/lib/content";

export default function TalhoesPage() {
  const content = pageContent.talhoes;

  return (
    <PageFrame eyebrow={content.eyebrow} title={content.title} description={content.description}>
      <TalhoesManager />
    </PageFrame>
  );
}
