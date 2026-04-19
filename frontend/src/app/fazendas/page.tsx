import { FazendasManager } from "@/components/fazendas-manager";
import { PageFrame } from "@/components/ui";
import { pageContent } from "@/lib/content";

export default function FazendasPage() {
  const content = pageContent.fazendas;

  return (
    <PageFrame eyebrow={content.eyebrow} title={content.title} description={content.description}>
      <FazendasManager />
    </PageFrame>
  );
}
