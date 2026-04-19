import { RegistrosManager } from "@/components/registros-manager";
import { PageFrame } from "@/components/ui";
import { pageContent } from "@/lib/content";

export default function RegistrosPage() {
  const content = pageContent.registros;

  return (
    <PageFrame eyebrow={content.eyebrow} title={content.title} description={content.description}>
      <RegistrosManager />
    </PageFrame>
  );
}
