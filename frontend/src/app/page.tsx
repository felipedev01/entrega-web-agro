import { DashboardOverview } from "@/components/dashboard-overview";
import { PageFrame } from "@/components/ui";
import { pageContent } from "@/lib/content";

export default function HomePage() {
  const content = pageContent.home;

  return (
    <PageFrame eyebrow={content.eyebrow} title={content.title} description={content.description}>
      <DashboardOverview />
    </PageFrame>
  );
}
