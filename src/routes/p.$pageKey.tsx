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

function DynamicStaticPage() {
  const { pageKey } = Route.useParams();
  return (
    <SiteShell>
      <StaticPageRenderer pageKey={pageKey} />
    </SiteShell>
  );
}
