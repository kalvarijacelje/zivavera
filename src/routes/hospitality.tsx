import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";

export const Route = createFileRoute("/hospitality")({
  head: () => ({
    meta: [
      { title: "Politika gostoljubnosti — ŽIVA VERA" },
      {
        name: "description",
        content:
          "Politika gostoljubnosti in postrežbe kavarne ŽIVA VERA — vrednote, pravice in odgovornosti v našem neprofitnem prostoru.",
      },
      { property: "og:title", content: "Politika gostoljubnosti — ŽIVA VERA" },
      {
        property: "og:description",
        content:
          "Kako razumemo gostoljubnost, postrežbo in prostovoljne prispevke v kavarni ŽIVA VERA.",
      },
    ],
  }),
  component: HospitalityPage,
});

function HospitalityPage() {
  return (
    <SiteShell>
      <StaticPageRenderer pageKey="hospitality" />
    </SiteShell>
  );
}
