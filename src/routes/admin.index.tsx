import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

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
};

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const count = (q: { count: number | null }) => q.count ?? 0;
      const [mc, mi, miPub, ec, ev, evPub] = await Promise.all([
        supabase.from("menu_categories").select("*", { count: "exact", head: true }),
        supabase.from("menu_items").select("*", { count: "exact", head: true }),
        supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("published", true),
        supabase.from("event_categories").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true),
      ]);
      setStats({
        menuCategories: count(mc),
        menuItems: count(mi),
        menuItemsPublished: count(miPub),
        eventCategories: count(ec),
        events: count(ev),
        eventsPublished: count(evPub),
      });
    })();
  }, []);

  const cards = stats
    ? [
        { label: "Menu categories", value: stats.menuCategories },
        { label: "Menu items", value: `${stats.menuItemsPublished} / ${stats.menuItems}`, hint: "published / total" },
        { label: "Event categories", value: stats.eventCategories },
        { label: "Events", value: `${stats.eventsPublished} / ${stats.events}`, hint: "published / total" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage menu and events from the sidebar. Only published rows are visible to the public.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {!stats &&
          [...Array(4)].map((_, i) => <Card key={i} className="h-24 animate-pulse bg-muted/40" />)}
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
            <div className="mt-2 font-display text-2xl font-semibold">{c.value}</div>
            {c.hint && <div className="text-[11px] text-muted-foreground">{c.hint}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}
