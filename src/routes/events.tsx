import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Sparkles, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SignedImage } from "@/components/admin/SignedImage";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getEffectiveEventDate, formatRecurrenceLabel, type RecurrenceInterval } from "@/lib/events";
import { FormattedEventDescription } from "@/components/FormattedEventDescription";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — ŽIVA VERA" },
      {
        name: "description",
        content: "Gatherings, conversations and small celebrations at ŽIVA VERA.",
      },
      { property: "og:title", content: "Events — ŽIVA VERA" },
      {
        property: "og:description",
        content: "Stop by — you're always welcome at ŽIVA VERA.",
      },
    ],
  }),
  component: EventsPage,
});

type Category = {
  id: string;
  name_en: string;
  name_sl: string;
  description_en: string | null;
  description_sl: string | null;
  sort_order: number;
};

type Ev = {
  id: string;
  category_id: string | null;
  title_en: string;
  title_sl: string;
  description_en: string | null;
  description_sl: string | null;
  event_date: string;
  event_time: string | null;
  location_or_note_en: string | null;
  location_or_note_sl: string | null;
  image_path: string | null;
  image_alignment: "left" | "right";
  featured: boolean;
  sort_order: number;
  is_recurring?: boolean | null;
  recurrence_interval?: RecurrenceInterval | null;
};

function EventsPage() {
  const { t, locale } = useI18n();
  const [cats, setCats] = useState<Category[]>([]);
  const [events, setEvents] = useState<Ev[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [c, e] = await Promise.all([
        supabase
          .from("event_categories")
          .select("id,name_en,name_sl,description_en,description_sl,sort_order")
          .eq("published", true)
          .order("sort_order")
          .order("name_en")
          .limit(50),
        supabase
          .from("events")
          .select("*")
          .eq("published", true)
          .order("sort_order")
          .order("event_date")
          .limit(100),
      ]);
      if (!alive) return;
      setCats((c.data as Category[]) ?? []);

      const rawEvents = (e.data as any[]) ?? [];
      const normalized: Ev[] = rawEvents.map((r) => {
        const isYouth =
          r.title_en?.toLowerCase().includes("youth") ||
          r.title_sl?.toLowerCase().includes("mlade");
        const isRec =
          r.is_recurring !== undefined && r.is_recurring !== null
            ? Boolean(r.is_recurring)
            : isYouth;
        return {
          ...r,
          is_recurring: isRec,
          recurrence_interval: (r.recurrence_interval as RecurrenceInterval) || "weekly",
        };
      });

      // Background sync for any expired recurring event so DB is current
      const expiredRecurring = normalized.filter((ev) => {
        if (!ev.is_recurring) return false;
        const eff = getEffectiveEventDate(ev);
        return eff.effectiveDate !== ev.event_date;
      });

      if (expiredRecurring.length > 0) {
        Promise.all(
          expiredRecurring.map(async (ev) => {
            const eff = getEffectiveEventDate(ev);
            try {
              await supabase
                .from("events")
                .update({ event_date: eff.effectiveDate, published: true })
                .eq("id", ev.id);
            } catch {}
          })
        ).catch(() => {});
      }

      setEvents(normalized);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const pick = <T,>(en: T, sl: T) => (locale === "sl" ? sl : en);

  const dateFmt = new Intl.DateTimeFormat(locale === "sl" ? "sl-SI" : "en-GB", {
    dateStyle: "full",
  });
  const timeFmt = new Intl.DateTimeFormat(locale === "sl" ? "sl-SI" : "en-GB", {
    timeStyle: "short",
  });

  const formatWhen = (dateStr: string, timeStr: string | null) => {
    const date = new Date(`${dateStr}T${timeStr ?? "00:00:00"}`);
    if (isNaN(date.getTime())) return dateStr;
    const datePart = dateFmt.format(date);
    if (!timeStr) return datePart;
    return `${datePart} · ${timeFmt.format(date)}`;
  };

  // Group: categorized events by category, sorted by order and upcoming effective date
  const grouped: Array<{ cat: Category | null; events: Ev[] }> = [];
  if (events) {
    for (const cat of cats) {
      const list = events
        .filter((ev) => ev.category_id === cat.id)
        .sort((a, b) => {
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
          const aEff = getEffectiveEventDate(a).effectiveDate;
          const bEff = getEffectiveEventDate(b).effectiveDate;
          return aEff.localeCompare(bEff);
        });
      if (list.length > 0) grouped.push({ cat, events: list });
    }
    const orphans = events
      .filter((ev) => !ev.category_id || !cats.some((c) => c.id === ev.category_id))
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        const aEff = getEffectiveEventDate(a).effectiveDate;
        const bEff = getEffectiveEventDate(b).effectiveDate;
        return aEff.localeCompare(bEff);
      });
    if (orphans.length > 0) grouped.push({ cat: null, events: orphans });
  }

  return (
    <SiteShell>
      <StaticPageRenderer
        pageKey="events"
        before={
          events === null ? (
            <p className="py-12 text-center text-sm text-muted-foreground">…</p>
          ) : grouped.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center text-muted-foreground">
              {t("events.empty")}
            </p>
          ) : (
          <div className="space-y-16">
            {grouped.map(({ cat, events: list }, gi) => {
              const catDescription = cat ? pick(cat.description_en, cat.description_sl) : null;
              return (
                <section key={cat?.id ?? `orphan-${gi}`}>
                  {cat && (
                    <header className="mb-6">
                      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                        {pick(cat.name_en, cat.name_sl)}
                      </h2>
                      {catDescription && (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {catDescription}
                        </p>
                      )}
                    </header>
                  )}
                  <ol className="space-y-6">
                    {list.map((ev) => {
                      const effective = getEffectiveEventDate(ev);
                      const title = pick(ev.title_en, ev.title_sl);
                      const desc = pick(ev.description_en, ev.description_sl);
                      const place = pick(ev.location_or_note_en, ev.location_or_note_sl);
                      const hasImage = !!ev.image_path;
                      return (
                        <li
                          key={ev.id}
                          className="overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-md"
                        >
                          <div
                            className={cn(
                              "grid gap-0 md:grid-cols-5",
                              hasImage && ev.image_alignment === "right" && "md:[&>*:first-child]:order-2",
                            )}
                          >
                            {hasImage && (
                              <div className="md:col-span-2">
                                <div className="relative aspect-[4/3] md:h-full md:aspect-auto">
                                  <SignedImage
                                    path={ev.image_path}
                                    alt={title ?? ""}
                                    className="size-full rounded-none"
                                  />
                                  {ev.featured && (
                                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                                      <Sparkles className="size-3" /> {t("menu.featured")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            <div
                              className={cn(
                                "flex flex-col justify-center p-6 sm:p-8",
                                hasImage ? "md:col-span-3" : "md:col-span-5",
                              )}
                            >
                              {!hasImage && ev.featured && (
                                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                                  <Sparkles className="size-3" /> {t("menu.featured")}
                                </span>
                              )}
                              <h3 className="font-display text-2xl font-semibold tracking-tight">
                                {title}
                              </h3>
                              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                                  <CalendarDays className="size-4 text-primary shrink-0" />
                                  <span className="sr-only">{t("events.when")}: </span>
                                  {formatWhen(effective.effectiveDate, ev.event_time)}
                                </span>
                                {place && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="size-4 text-primary shrink-0" />
                                    <span className="sr-only">{t("events.where")}: </span>
                                    {place}
                                  </span>
                                )}
                                {effective.isRecurring && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    <Repeat className="size-3.5" />
                                    {formatRecurrenceLabel(ev.recurrence_interval, effective.dayOfWeek, locale, ev.event_time)}
                                  </span>
                                )}
                              </div>
                              {desc && (
                                <FormattedEventDescription text={desc} />
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        )
      }
    />
  </SiteShell>
);
}
