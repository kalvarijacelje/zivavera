import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ŽIVA VERA" },
      {
        name: "description",
        content:
          "ŽIVA VERA is a Christian non-profit coffee shop. Read our story, mission and why we run on faith.",
      },
      { property: "og:title", content: "About — ŽIVA VERA" },
      {
        property: "og:description",
        content: "A unique café that runs on faith — our story and mission.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <StaticPageRenderer pageKey="about" />
    </SiteShell>
  );
}
