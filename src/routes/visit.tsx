import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, MapPin, ExternalLink, Mail, Sparkles, Navigation } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/i18n/I18nProvider";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  evaluateCafeStatus,
  DEFAULT_SCHEDULE,
  DAYS_ORDER,
  getLjubljanaTime,
  type WeeklySchedule,
  type CafeStatusRecord,
} from "@/lib/cafe-schedule";

const MAPS_QUERY = "Be%C5%BEigrajska+cesta+7%2C+Celje";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit & Contribute — ŽIVA VERA" },
      {
        name: "description",
        content:
          "Opening hours, location and how to contribute to ŽIVA VERA — there is no price list.",
      },
      { property: "og:title", content: "Visit & Contribute — ŽIVA VERA" },
      {
        property: "og:description",
        content: "Plan your visit and learn how to support our mission.",
      },
    ],
  }),
  component: VisitPage,
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

function VisitPage() {
  return (
    <SiteShell>
      <StaticPageRenderer
        pageKey="visit"
        before={
          <div className="space-y-8">
            <OperationalCards />
            <EmbeddedMap />
          </div>
        }
      />
    </SiteShell>
  );
}

function EmbeddedMap() {
  const { locale } = useI18n();
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
      <div className="aspect-[16/9] w-full md:aspect-[21/9]">
        <iframe
          title="ŽIVA VERA location"
          src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span>Bežigrajska cesta 7, 3000 Celje (Stavba Tripex)</span>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <Navigation className="size-3.5" />
          {locale === "sl" ? "Navodila za pot" : "Get Directions"}
        </a>
      </div>
    </div>
  );
}

function OperationalCards() {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<CafeStatusRecord | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      supabase
        .from("cafe_status")
        .select("is_open,mode,schedule,override_until,note_en,note_sl")
        .maybeSingle()
        .then(({ data }) => {
          if (alive && data) setStatus(data as unknown as CafeStatusRecord);
        });

    load();

    const channel = supabase
      .channel("cafe_status_visit_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cafe_status" },
        () => load(),
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const evaluated = evaluateCafeStatus(status);
  const isOpen = evaluated.isOpen;
  const schedule: WeeklySchedule = evaluated.effectiveSchedule || DEFAULT_SCHEDULE;
  const { currentDayKey } = getLjubljanaTime();

  const note = locale === "sl" ? status?.note_sl ?? status?.note_en : status?.note_en ?? status?.note_sl;
  const scheduleSub = locale === "sl" ? evaluated.statusTextSl : evaluated.statusTextEn;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Dynamic Automated Opening Hours Card */}
      <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock className="size-5" />
            </div>

            {/* Live status badge */}
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5",
                isOpen
                  ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-border bg-muted/60 text-muted-foreground"
              )}
            >
              <span className={cn("size-2 rounded-full", isOpen ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/60")} />
              <span>{isOpen ? (locale === "sl" ? "ODPRTO" : "OPEN") : (locale === "sl" ? "ZAPRTO" : "CLOSED")}</span>
              {scheduleSub && <span className="opacity-80">· {scheduleSub}</span>}
            </Badge>
          </div>

          <h2 className="mt-4 font-display text-xl font-semibold">{t("visit.hours.title")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "sl" ? "Odpiralni čas kavarne ŽIVA VERA v Celju:" : "Opening hours for ŽIVA VERA café in Celje:"}
          </p>

          {/* Dynamic Schedule List */}
          <div className="mt-4 divide-y divide-border/60 text-sm">
            {DAYS_ORDER.map((d) => {
              const isToday = d.key === currentDayKey;
              const daySched = schedule?.[d.key] || DEFAULT_SCHEDULE[d.key] || { enabled: false, open: "08:00", close: "14:00" };
              const isEnabled = !!daySched?.enabled;
              const noteText = locale === "sl" ? d.noteSl : d.noteEn;

              return (
                <div
                  key={d.key}
                  className={cn(
                    "flex items-center justify-between py-2 transition-colors",
                    isToday && "font-semibold text-primary bg-primary/[0.04] -mx-2 px-2 rounded-lg"
                  )}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(!isEnabled && "text-muted-foreground")}>
                      {locale === "sl" ? d.nameSl : d.nameEn}
                    </span>
                    {noteText && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {noteText}
                      </span>
                    )}
                    {isToday && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {locale === "sl" ? "Danes" : "Today"}
                      </span>
                    )}
                  </div>

                  <span className={cn("font-medium shrink-0 ml-2", !isEnabled && "text-muted-foreground text-xs italic font-normal")}>
                    {isEnabled ? `${daySched.open || "08:00"} – ${daySched.close || "14:00"}` : (locale === "sl" ? "Zaprto" : "Closed")}
                  </span>
                </div>
              );
            })}
          </div>

          {note && (
            <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs italic text-foreground/85">
              <span className="font-semibold not-italic block mb-0.5 text-muted-foreground">
                {locale === "sl" ? "Obvestilo:" : "Note:"}
              </span>
              {note}
            </div>
          )}
        </div>
      </div>

      {/* 2. Find Us & Location Card */}
      <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </div>

          <h2 className="mt-4 font-display text-xl font-semibold">{t("visit.location.title")}</h2>
          
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-foreground text-base hover:text-primary transition-colors underline underline-offset-4"
              >
                {t("visit.location.address")}
                <ExternalLink className="size-4 text-primary" />
              </a>
            </p>
            <p className="text-foreground/80">
              {t("visit.location.body")}
            </p>
            <p className="text-xs text-muted-foreground">
              {locale === "sl"
                ? "Brezplačno parkirišče je na voljo neposredno pred stavbo."
                : "Free parking is available directly in front of the building."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("visit.contact.title")}
            </h3>
            <p className="mt-2 text-sm text-foreground flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <a href="mailto:info@kalvarija.si" className="text-primary hover:underline font-medium">
                info@kalvarija.si
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" className="w-full gap-2 font-medium">
              <Navigation className="size-4 text-primary" />
              {locale === "sl" ? "Odpri v Google Maps" : "Open in Google Maps"}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
