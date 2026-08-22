import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, UtensilsCrossed, Tag, Calendar, CalendarRange, LogOut, Home, FileText, ExternalLink, HeartHandshake, DoorOpen } from "lucide-react";
import { useSession, useIsAdmin } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ŽIVA VERA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

const links: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/cafe-status", label: "Café status", icon: DoorOpen },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/prayer-requests", label: "Prayer requests", icon: HeartHandshake },
  { to: "/admin/menu-categories", label: "Menu categories", icon: Tag },
  { to: "/admin/menu-items", label: "Menu items", icon: UtensilsCrossed },
  { to: "/admin/event-categories", label: "Event categories", icon: CalendarRange },
  { to: "/admin/events", label: "Events", icon: Calendar },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const isAdmin = useIsAdmin(session?.user.id);

  if (loading || (session && isAdmin === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) {
    navigate({ to: "/login" });
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-2xl font-semibold">Not authorized</h1>
        <p className="text-sm text-muted-foreground">
          Your account ({session.user.email}) does not have admin access.
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          To grant admin access, an existing admin (or a Cloud operator) must add a row to <code>user_roles</code> with <code>role='admin'</code> for this user.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/login" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
          <div className="border-b border-border px-5 py-4">
            <div className="font-display text-lg font-semibold">ŽIVA VERA</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as "/admin"}
                activeOptions={{ exact: l.exact }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <l.icon className="size-4" />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <Link
              to="/"
              className="mb-2 inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ExternalLink className="size-4" />
              View site
            </Link>
            <div className="mb-2 px-1 text-xs text-muted-foreground">{session.user.email}</div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-border bg-card px-4 py-3 md:hidden">
            <nav className="flex flex-wrap gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to as "/admin"}
                  activeOptions={{ exact: l.exact }}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/"
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                View site
              </Link>
            </nav>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
