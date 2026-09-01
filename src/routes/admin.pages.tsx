import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/pages")({
  component: AdminPagesLayout,
  errorComponent: ({ error, reset }) => (
    <div className="space-y-4 p-4 sm:p-6">
      <Button asChild size="sm" variant="ghost">
        <Link to="/admin/pages">
          <ArrowLeft className="mr-1.5 size-3.5" /> All pages
        </Link>
      </Button>
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-destructive">
        <h2 className="font-display text-lg font-semibold">Error in pages admin</h2>
        <p className="mt-1 text-sm opacity-90 font-mono">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  ),
});

function AdminPagesLayout() {
  return <Outlet />;
}
