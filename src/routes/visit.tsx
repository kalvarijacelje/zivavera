import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/i18n/I18nProvider";
import { StaticPageRenderer } from "@/components/StaticPageRenderer";

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
});

function VisitPage() {
  return (
    <SiteShell>
      <StaticPageRenderer
        pageKey="visit"
       
        after={
          <>
            <OperationalCards />
            <div className="mt-12">
              <EmbeddedMap />
            </div>
          </>
        }
      />
    </SiteShell>
  );
}

function EmbeddedMap() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
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
    </div>
  );
}

function OperationalCards() {
  const { t } = useI18n();
  const rows: Array<[string, string]> = [
    [t("visit.hours.weekdays"), t("visit.hours.weekdaysTime")],
    [t("visit.hours.saturday"), t("visit.hours.saturdayTime")],
    [t("visit.hours.sunday"), t("visit.hours.sundayTime")],
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Clock className="size-5" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold">{t("visit.hours.title")}</h2>
        <dl className="mt-5 divide-y divide-border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MapPin className="size-5" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold">{t("visit.location.title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            {t("visit.location.address")}
            <ExternalLink className="size-3.5" />
          </a>
          <span className="ml-1">— {t("visit.location.body")}</span>
        </p>
        <h3 className="mt-6 text-sm font-semibold">{t("visit.contact.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          <a href="mailto:info@kalvarija.si" className="text-primary hover:underline">
            info@kalvarija.si
          </a>
        </p>
      </div>

    </div>
  );
}
