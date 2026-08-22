import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";

export const Route = createFileRoute("/p/$pageKey")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.pageKey} — ŽIVA VERA` },
      { property: "og:title", content: `${params.pageKey} — ŽIVA VERA` },
    ],
  }),
  component: DynamicStaticPage,
});

function DynamicStaticPage() {
  const { pageKey } = Route.useParams();
  return (
    <SiteShell>
      <StaticPageRenderer pageKey={pageKey} />
    </SiteShell>
  );
}
