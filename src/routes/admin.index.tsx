import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Coffee, Plus, DoorOpen } from "lucide-react";
import { LogVisitDialog } from "@/components/admin/LogVisitDialog";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

type Stats = {
  menuCategories: number;
  menuItems: number;
  menuItemsPublished: number;
  eventCategories: number;
  events: number;
  eventsPublished: number;
  customers: number;
  visits: number;
};

function Dashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [logVisitOpen, setLogVisitOpen] = useState(false);

  const loadStats = async () => {
    const count = (q: { count: number | null }) => q.count ?? 0;
    const [mc, mi, miPub, ec, ev, evPub, cust, vis] = await Promise.all([
      supabase.from("menu_categories").select("*", { count: "exact", head: true }),
      supabase.from("menu_items").select("*", { count: "exact", head: true }),
      supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("published", true),
      supabase.from("event_categories").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true),
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("cafe_visits").select("*", { count: "exact", head: true }),
    ]);
    setStats({
      menuCategories: count(mc),
      menuItems: count(mi),
      menuItemsPublished: count(miPub),
      eventCategories: count(ec),
      events: count(ev),
      eventsPublished: count(evPub),
      customers: count(cust),
      visits: count(vis),
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const cards = stats
    ? [
        { label: t("admin.dash.totalVisits"), value: stats.visits, hint: t("admin.dash.totalVisitsHint"), to: "/admin/customers" },
        { label: t("admin.dash.savedCustomers"), value: stats.customers, hint: t("admin.dash.savedCustomersHint"), to: "/admin/customers" },
        { label: t("admin.dash.menuItems"), value: `${stats.menuItemsPublished} / ${stats.menuItems}`, hint: t("admin.dash.publishedTotal"), to: "/admin/menu-items" },
        { label: t("admin.dash.events"), value: `${stats.eventsPublished} / ${stats.events}`, hint: t("admin.dash.publishedTotal"), to: "/admin/events" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{t("admin.dash.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.dash.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setLogVisitOpen(true)} className="font-semibold shadow-xs">
            <Plus className="mr-1.5 size-4" /> {t("admin.dash.logVisit")}
          </Button>
          <Link to="/admin/customers">
            <Button variant="outline">
              <Users className="mr-1.5 size-4" /> {t("admin.nav.customers")}
            </Button>
          </Link>
          <Link to="/admin/cafe-status">
            <Button variant="secondary">
              <DoorOpen className="mr-1.5 size-4" /> {t("admin.nav.cafeStatus")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!stats &&
          [...Array(4)].map((_, i) => <Card key={i} className="h-24 animate-pulse bg-muted/40" />)}
        {cards.map((c) => (
          <Link key={c.label} to={c.to as any} className="block transition-transform hover:-translate-y-0.5">
            <Card className="p-4 hover:border-primary/50 transition-colors">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
              <div className="mt-2 font-display text-2xl font-semibold">{c.value}</div>
              {c.hint && <div className="text-[11px] text-muted-foreground">{c.hint}</div>}
            </Card>
          </Link>
        ))}
      </div>

      <LogVisitDialog
        open={logVisitOpen}
        onOpenChange={setLogVisitOpen}
        onSaved={loadStats}
      />
    </div>
  );
}
