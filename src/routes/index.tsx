import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coffee,
  HandHeart,
  Users,
  CalendarDays,
  MapPin,
  Sparkles,
  Heart,
  Star,
  Sun,
  Leaf,
  Church,
  BookOpen,
  Cross,
  Smile,
  Music,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-cafe.jpg";
import communityImg from "@/assets/community.jpg";
import espressoImg from "@/assets/coffee-espresso.jpg";
import { SiteShell } from "@/components/SiteShell";
import { SignedImage } from "@/components/admin/SignedImage";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { getSignedMediaUrl } from "@/lib/admin/storage";
import { cn } from "@/lib/utils";
import { CafeStatusBanner } from "@/components/CafeStatusBanner";


export const Route = createFileRoute("/")({
  component: HomePage,
});

type SectionType =
  | "hero"
  | "text_with_image"
  | "call_to_action"
  | "simple_text_block"
  | "featured_menu"
  | "featured_events"
  | "values_grid";

type Section = {
  id: string;
  section_type: SectionType;
  sort_order: number;
  eyebrow_en: string | null;
  eyebrow_sl: string | null;
  title_en: string | null;
  title_sl: string | null;
  subtitle_en: string | null;
  subtitle_sl: string | null;
  body_en: string | null;
  body_sl: string | null;
  image_path: string | null;
  default_image_key: string | null;
  image_alignment: "left" | "right";
  button_text_en: string | null;
  button_text_sl: string | null;
  button_link: string | null;
  secondary_button_text_en: string | null;
  secondary_button_text_sl: string | null;
  secondary_button_link: string | null;
  featured_menu_item_ids: string[];
  featured_event_ids: string[];
  value_cards: ValueCard[] | null;
  updated_at?: string;
};

export type ValueCard = {
  icon: string;
  title_en: string;
  title_sl: string;
  body_en: string;
  body_sl: string;
};

export const VALUE_ICONS: Record<string, LucideIcon> = {
  Users,
  HandHeart,
  Coffee,
  Heart,
  Star,
  Sun,
  Leaf,
  Church,
  BookOpen,
  Cross,
  Smile,
  Music,
  Gift,
  Sparkles,
};


type MenuItem = {
  id: string;
  name_en: string;
  name_sl: string;
  description_en: string | null;
  description_sl: string | null;
  image_path: string | null;
};

type Event = {
  id: string;
  title_en: string;
  title_sl: string;
  description_en: string | null;
  description_sl: string | null;
  event_date: string;
  event_time: string | null;
  location_or_note_en: string | null;
  location_or_note_sl: string | null;
  image_path: string | null;
};

const DEFAULT_IMAGES: Record<string, string> = {
  hero: heroImg,
  community: communityImg,
  espresso: espressoImg,
};

function HomePage() {
  const [sections, setSections] = useState<Section[] | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [events, setEvents] = useState<Record<string, Event>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (!alive) return;
      const list = (data as Section[]) ?? [];
      setSections(list);

      const menuIds = Array.from(new Set(list.flatMap((s) => s.featured_menu_item_ids ?? [])));
      const eventIds = Array.from(new Set(list.flatMap((s) => s.featured_event_ids ?? [])));

      if (menuIds.length > 0) {
        const { data: mi } = await supabase
          .from("menu_items")
          .select("id,name_en,name_sl,description_en,description_sl,image_path")
          .in("id", menuIds)
          .eq("published", true);
        if (alive && mi) {
          setMenuItems(Object.fromEntries((mi as MenuItem[]).map((m) => [m.id, m])));
        }
      }
      if (eventIds.length > 0) {
        const { data: ev } = await supabase
          .from("events")
          .select(
            "id,title_en,title_sl,description_en,description_sl,event_date,event_time,location_or_note_en,location_or_note_sl,image_path",
          )
          .in("id", eventIds)
          .eq("published", true);
        if (alive && ev) {
          setEvents(Object.fromEntries((ev as Event[]).map((e) => [e.id, e])));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SiteShell>
      {(sections ?? []).map((s, i) => (
        <>
          <SectionRenderer key={s.id} section={s} menuItems={menuItems} events={events} />
          {i === 0 && <CafeStatusBanner key={`status-${s.id}`} />}
        </>
      ))}
      {sections && sections.length === 0 && <CafeStatusBanner />}
    </SiteShell>
  );
}

function SectionRenderer({
  section,
  menuItems,
  events,
}: {
  section: Section;
  menuItems: Record<string, MenuItem>;
  events: Record<string, Event>;
}) {
  switch (section.section_type) {
    case "hero":
      return <HeroSection s={section} />;
    case "values_grid":
      return <ValuesSection s={section} />;
    case "text_with_image":
      return <TextWithImageSection s={section} />;
    case "call_to_action":
      return <CallToActionSection s={section} />;
    case "simple_text_block":
      return <SimpleTextSection s={section} />;
    case "featured_menu":
      return <FeaturedMenuSection s={section} menuItems={menuItems} />;
    case "featured_events":
      return <FeaturedEventsSection s={section} events={events} />;
    default:
      return null;
  }
}

function usePick() {
  const { locale } = useI18n();
  return <T,>(en: T, sl: T) => (locale === "sl" ? (sl ?? en) : (en ?? sl));
}

function useSectionImage(section: Section) {
  const [url, setUrl] = useState<string | null>(
    section.image_path ? null : DEFAULT_IMAGES[section.default_image_key ?? ""] ?? null,
  );
  useEffect(() => {
    let active = true;
    if (section.image_path) {
      getSignedMediaUrl(section.image_path).then((u) => active && setUrl(u));
    } else {
      setUrl(DEFAULT_IMAGES[section.default_image_key ?? ""] ?? null);
    }
    return () => {
      active = false;
    };
  }, [section.image_path, section.default_image_key]);
  return url;
}

function HeroSection({ s }: { s: Section }) {
  const pick = usePick();
  const img = useSectionImage(s);
  const title = pick(s.title_en, s.title_sl);
  const subtitle = pick(s.subtitle_en, s.subtitle_sl);
  const eyebrow = pick(s.eyebrow_en, s.eyebrow_sl);
  const btn1 = pick(s.button_text_en, s.button_text_sl);
  const btn2 = pick(s.secondary_button_text_en, s.secondary_button_text_sl);
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 z-0">
        {img && <img key={img} src={img} alt="" width={1920} height={1280} className="size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pb-32 md:pt-28 py-[30px] pb-[50px]">
        {eyebrow && (
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </p>
        )}
        {title && (
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-balance text-foreground sm:text-5xl md:text-6xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base text-pretty font-semibold text-foreground sm:text-lg">
            {subtitle}
          </p>
        )}
        {(btn1 || btn2) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {btn1 && s.button_link && (
              <SectionLink
                to={s.button_link}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
              >
                {btn1} <ArrowRight className="size-4" />
              </SectionLink>
            )}
            {btn2 && s.secondary_button_link && (
              <SectionLink
                to={s.secondary_button_link}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur hover:bg-card"
              >
                {btn2}
              </SectionLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

const DEFAULT_VALUE_CARDS: { icon: string; tk: string }[] = [
  { icon: "Users", tk: "welcome" },
  { icon: "HandHeart", tk: "faith" },
  { icon: "Coffee", tk: "purpose" },
];

function ValuesSection({ s }: { s: Section }) {
  const pick = usePick();
  const { t } = useI18n();
  const title = pick(s.title_en, s.title_sl);

  const customCards = Array.isArray(s.value_cards) ? s.value_cards : [];
  const cards =
    customCards.length > 0
      ? customCards.map((c) => ({
          icon: VALUE_ICONS[c.icon] ?? Sparkles,
          title: pick(c.title_en, c.title_sl),
          body: pick(c.body_en, c.body_sl),
        }))
      : DEFAULT_VALUE_CARDS.map((c) => ({
          icon: VALUE_ICONS[c.icon] ?? Sparkles,
          title: t(`home.values.${c.tk}.title`),
          body: t(`home.values.${c.tk}.body`),
        }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      {title && (
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      )}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <article
              key={i}
              className="group rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}


function TextWithImageSection({ s }: { s: Section }) {
  const pick = usePick();
  const img = useSectionImage(s);
  const title = pick(s.title_en, s.title_sl);
  const body = pick(s.body_en, s.body_sl);
  const eyebrow = pick(s.eyebrow_en, s.eyebrow_sl);
  const btn = pick(s.button_text_en, s.button_text_sl);
  const reverse = s.image_alignment === "right";
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <div className={cn("grid items-center gap-10 md:grid-cols-2", reverse && "md:[&>*:first-child]:order-2")}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl md:aspect-square">
          {img ? (
            <img src={img} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-muted" />
          )}
        </div>
        <div>
          {title && (
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {body && <p className="mt-4 max-w-md text-pretty text-muted-foreground">{body}</p>}
          {eyebrow && (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          )}
          {btn && s.button_link && (
            <SectionLink
              to={s.button_link}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-foreground/90"
            >
              {btn} <ArrowRight className="size-4" />
            </SectionLink>
          )}
        </div>
      </div>
    </section>
  );
}

function CallToActionSection({ s }: { s: Section }) {
  const pick = usePick();
  const img = useSectionImage(s);
  const title = pick(s.title_en, s.title_sl);
  const body = pick(s.body_en, s.body_sl);
  const btn = pick(s.button_text_en, s.button_text_sl);
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <div className="relative overflow-hidden rounded-3xl">
        {img && <img src={img} alt="" loading="lazy" className="size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-bean/85 via-bean/55 to-transparent" />
        <div className="relative max-w-xl px-6 py-12 text-cream sm:px-10 md:py-20">
          {title && (
            <h2 className="font-display text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
              {title}
            </h2>
          )}
          {body && <p className="mt-4 text-pretty text-cream/90">{body}</p>}
          {btn && s.button_link && (
            <SectionLink
              to={s.button_link}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {btn} <ArrowRight className="size-4" />
            </SectionLink>
          )}
        </div>
      </div>
    </section>
  );
}

function SimpleTextSection({ s }: { s: Section }) {
  const pick = usePick();
  const title = pick(s.title_en, s.title_sl);
  const body = pick(s.body_en, s.body_sl);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20 text-center">
      {title && (
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      )}
      {body && (
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{body}</p>
      )}
    </section>
  );
}

function FeaturedMenuSection({
  s,
  menuItems,
}: {
  s: Section;
  menuItems: Record<string, MenuItem>;
}) {
  const pick = usePick();
  const { t } = useI18n();
  const title = pick(s.title_en, s.title_sl);
  const body = pick(s.body_en, s.body_sl);
  const items = (s.featured_menu_item_ids ?? []).map((id) => menuItems[id]).filter(Boolean);
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      {title && (
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      )}
      {body && <p className="mt-3 max-w-2xl text-muted-foreground">{body}</p>}
      {items.length > 0 && (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const name = pick(item.name_en, item.name_sl);
            const desc = pick(item.description_en, item.description_sl);
            return (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SignedImage path={item.image_path} alt={name ?? ""} className="size-full rounded-none" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{name}</h3>
                  {desc && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {s.button_link && pick(s.button_text_en, s.button_text_sl) && (
        <div className="mt-8">
          <SectionLink
            to={s.button_link}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            {pick(s.button_text_en, s.button_text_sl)} <ArrowRight className="size-4" />
          </SectionLink>
        </div>
      )}
      <p className="sr-only">{t("menu.featured")}</p>
    </section>
  );
}

function FeaturedEventsSection({
  s,
  events,
}: {
  s: Section;
  events: Record<string, Event>;
}) {
  const pick = usePick();
  const { locale } = useI18n();
  const title = pick(s.title_en, s.title_sl);
  const body = pick(s.body_en, s.body_sl);
  const list = (s.featured_event_ids ?? []).map((id) => events[id]).filter(Boolean);

  const dateFmt = new Intl.DateTimeFormat(locale === "sl" ? "sl-SI" : "en-GB", {
    dateStyle: "full",
  });
  const timeFmt = new Intl.DateTimeFormat(locale === "sl" ? "sl-SI" : "en-GB", {
    timeStyle: "short",
  });
  const formatWhen = (dateStr: string, timeStr: string | null) => {
    const d = new Date(`${dateStr}T${timeStr ?? "00:00:00"}`);
    if (isNaN(d.getTime())) return dateStr;
    return timeStr ? `${dateFmt.format(d)} · ${timeFmt.format(d)}` : dateFmt.format(d);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20">
      {title && (
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      )}
      {body && <p className="mt-3 max-w-2xl text-muted-foreground">{body}</p>}
      {list.length > 0 && (
        <ol className="mt-8 space-y-6">
          {list.map((ev) => {
            const t2 = pick(ev.title_en, ev.title_sl);
            const desc = pick(ev.description_en, ev.description_sl);
            const place = pick(ev.location_or_note_en, ev.location_or_note_sl);
            const hasImage = !!ev.image_path;
            return (
              <li
                key={ev.id}
                className="overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-md"
              >
                <div className="grid gap-0 md:grid-cols-5">
                  {hasImage && (
                    <div className="md:col-span-2">
                      <div className="relative aspect-[4/3] md:h-full md:aspect-auto">
                        <SignedImage path={ev.image_path} alt={t2 ?? ""} className="size-full rounded-none" />
                      </div>
                    </div>
                  )}
                  <div className={cn("flex flex-col justify-center p-6 sm:p-8", hasImage ? "md:col-span-3" : "md:col-span-5")}>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">{t2}</h3>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-primary" />
                        {formatWhen(ev.event_date, ev.event_time)}
                      </span>
                      {place && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 text-primary" />
                          {place}
                        </span>
                      )}
                    </div>
                    {desc && <p className="mt-4 leading-relaxed text-foreground/80">{desc}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {s.button_link && pick(s.button_text_en, s.button_text_sl) && (
        <div className="mt-8">
          <SectionLink
            to={s.button_link}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {pick(s.button_text_en, s.button_text_sl)} <ArrowRight className="size-4" />
          </SectionLink>
        </div>
      )}
      <Sparkles className="sr-only" />
    </section>
  );
}

/**
 * Internal links use TanStack Link (typed routes), external (http/https/mailto) use <a>.
 */
function SectionLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isExternal = /^(https?:|mailto:|tel:)/i.test(to);
  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to as "/"} className={className}>
      {children}
    </Link>
  );
}
