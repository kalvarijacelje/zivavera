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
  errorComponent: ({ error, reset }) => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Nalaganje strani ni uspelo
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Prišlo je do nepričakovane napake pri nalaganju vsebine."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Poskusi znova
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Domov
          </a>
        </div>
      </div>
    </SiteShell>
  ),
});

function HospitalityPage() {
  return (
    <SiteShell>
      <StaticPageRenderer pageKey="hospitality" />
    </SiteShell>
  );
}
