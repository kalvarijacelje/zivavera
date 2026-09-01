import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  Calendar,
  CalendarRange,
  LogOut,
  Home,
  FileText,
  ExternalLink,
  HeartHandshake,
  DoorOpen,
  Users,
  Globe,
} from "lucide-react";
import { useSession, useIsAdmin } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { useI18n } from "@/i18n/I18nProvider";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/translations";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ŽIVA VERA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center bg-muted/30">
      <h1 className="font-display text-2xl font-semibold">Admin error</h1>
      <p className="max-w-md text-sm text-destructive font-mono">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild size="sm">
          <Link to="/admin">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  ),
});

function AdminLayout() {
  const navigate = useNavigate();
  const { session, fullName, loading } = useSession();
  const isAdmin = useIsAdmin(session?.user.id);
  const { locale, setLocale, t } = useI18n();

  const links = [
    { to: "/admin", label: t("admin.nav.dashboard"), icon: LayoutDashboard, exact: true },
    { to: "/admin/cafe-status", label: t("admin.nav.cafeStatus"), icon: DoorOpen },
    { to: "/admin/customers", label: t("admin.nav.customers"), icon: Users },
    { to: "/admin/homepage", label: t("admin.nav.homepage"), icon: Home },
    { to: "/admin/pages", label: t("admin.nav.pages"), icon: FileText },
    { to: "/admin/prayer-requests", label: t("admin.nav.prayerRequests"), icon: HeartHandshake },
    { to: "/admin/menu-categories", label: t("admin.nav.menuCategories"), icon: Tag },
    { to: "/admin/menu-items", label: t("admin.nav.menuItems"), icon: UtensilsCrossed },
    { to: "/admin/event-categories", label: t("admin.nav.eventCategories"), icon: CalendarRange },
    { to: "/admin/events", label: t("admin.nav.events"), icon: Calendar },
  ];

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
          To grant admin access, an existing admin must add a row to <code>user_roles</code> with <code>role='admin'</code> for this user.
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
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col md:min-h-screen">
          <div className="border-b border-border px-5 py-4 flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">ŽIVA VERA</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t("nav.admin")}
              </div>
            </div>
            {/* Sidebar Language Switcher */}
            <div
              className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-secondary/50 p-0.5 text-xs font-medium"
              role="group"
              aria-label={t("lang.switch")}
            >
              <Globe className="ml-1 size-3 text-muted-foreground" aria-hidden />
              {SUPPORTED_LOCALES.map((l: Locale) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all",
                    locale === l
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l === "sl" ? "SLO" : "ENG"}
                </button>
              ))}
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as "/admin"}
                activeOptions={{ exact: l.exact }}
                activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
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
              {t("admin.nav.viewSite")}
            </Link>
            <div className="mb-2 px-1">
              {fullName && <div className="text-xs font-bold text-foreground truncate">{fullName}</div>}
              <div className="text-[11px] text-muted-foreground truncate">{session.user.email}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 size-4" /> {t("admin.nav.signOut")}
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 flex flex-col">
          {/* Top Bar for Desktop & Mobile */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-foreground text-sm">
                ŽIVA VERA <span className="text-muted-foreground text-xs uppercase tracking-wider">· {t("nav.admin")}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Top Language Switcher */}
              <div
                className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/60 p-0.5 text-xs font-medium"
                role="group"
                aria-label={t("lang.switch")}
              >
                <Globe className="ml-1.5 size-3.5 text-muted-foreground" aria-hidden />
                {SUPPORTED_LOCALES.map((l: Locale) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-all",
                      locale === l
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={locale === l}
                  >
                    {l === "sl" ? "SLO" : "ENG"}
                  </button>
                ))}
              </div>

              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                <span>{t("admin.nav.viewSite")}</span>
              </Link>
            </div>
          </header>

          {/* Mobile Navigation Row */}
          <div className="border-b border-border bg-card px-4 py-2.5 md:hidden overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to as "/admin"}
                  activeOptions={{ exact: l.exact }}
                  activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
