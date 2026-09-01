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
import { Fragment, useEffect, useState } from "react";
import heroImg from "@/assets/hero-cafe.jpg";
import communityImg from "@/assets/community.jpg";
import espressoImg from "@/assets/coffee-espresso.jpg";
import { SiteShell } from "@/components/SiteShell";
import { SignedImage } from "@/components/admin/SignedImage";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import { getSignedMediaUrl, resolveMediaUrl } from "@/lib/admin/storage";
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
const HOMEPAGE_SECTIONS_CACHE_KEY = "ziva-vera.homepage-sections.v4";

const DEFAULT_HOMEPAGE_SECTIONS: Section[] = [
  {
    id: "f5968898-8caf-4977-8f33-7ca715fc51bd",
    section_type: "hero",
    sort_order: 10,
    eyebrow_sl: "Prva krščanska neprofitna kavarna v Sloveniji",
    eyebrow_en: "First Christian non-profit café in Slovenia",
    title_sl: "Dobra kava. Pristen pogovor. Iskrena gostoljubnost.",
    title_en: "Good coffee. Real conversation. Honest hospitality.",
    subtitle_sl: "Kavarna, ki deluje po veri in brez cenika. Pridite na skodelico odlične kave Barcaffè, vzemite si čas in prispevajte po svojem srcu.",
    subtitle_en: "A café that operates on faith and without a price list. Come for a cup of excellent Barcaffè coffee, take your time, and contribute from your heart.",
    body_sl: null,
    body_en: null,
    image_path: "events/1cd49084-200f-4854-85db-d04bccf2355a.webp",
    default_image_key: "hero",
    image_alignment: "left",
    button_text_sl: "Oglejte si ponudbo",
    button_text_en: "See the menu",
    button_link: "/menu",
    secondary_button_text_sl: "Načrtujte obisk",
    secondary_button_text_en: "Plan your visit",
    secondary_button_link: "/visit",
    featured_menu_item_ids: [],
    featured_event_ids: [],
    value_cards: null,
  },
  {
    id: "c4f603ef-9406-4850-a200-727a9c9ec014",
    section_type: "values_grid",
    sort_order: 20,
    eyebrow_sl: null,
    eyebrow_en: null,
    title_sl: "Kaj nas dela drugačne",
    title_en: "What makes us different",
    subtitle_sl: null,
    subtitle_en: null,
    body_sl: null,
    body_en: null,
    image_path: null,
    default_image_key: null,
    image_alignment: "left",
    button_text_sl: null,
    button_text_en: null,
    button_link: null,
    secondary_button_text_sl: null,
    secondary_button_text_en: null,
    secondary_button_link: null,
    featured_menu_item_ids: [],
    featured_event_ids: [],
    value_cards: null,
  },
  {
    id: "fee457cb-02b1-46db-acc2-61c01cf0a526",
    section_type: "text_with_image",
    sort_order: 30,
    eyebrow_sl: null,
    eyebrow_en: null,
    title_sl: "Z našega pulta",
    title_en: "From our counter",
    subtitle_sl: null,
    subtitle_en: null,
    body_sl: "Espresso napitki, čaji, vroča čokolada, sveži sokovi in nekaj sladkega — pripravljeno s skrbjo, postreženo z nasmehom.",
    body_en: "Espresso drinks, teas, hot chocolate, fresh juices and a few sweet things — prepared with care, served with a smile.",
    image_path: "events/8102ba8a-33ac-465f-811e-863ff4bbb054.webp",
    default_image_key: "espresso",
    image_alignment: "left",
    button_text_sl: "Poglejte celotno ponudbo",
    button_text_en: "Browse the full menu",
    button_link: "/menu",
    secondary_button_text_sl: null,
    secondary_button_text_en: null,
    secondary_button_link: null,
    featured_menu_item_ids: [],
    featured_event_ids: [],
    value_cards: null,
  },
  {
    id: "638e0e45-4df9-431e-bf33-4992772d01af",
    section_type: "call_to_action",
    sort_order: 40,
    eyebrow_sl: null,
    eyebrow_en: null,
    title_sl: "Več kot le kavarna — prostor za skupnost",
    title_en: "More than a café — space for community",
    subtitle_sl: null,
    subtitle_en: null,
    body_sl: "ŽIVA VERA je prostor za srečanje, pogovor in mirno preživet čas. Prostor, kjer ste dobrodošli točno takšni, kot ste.",
    body_en: "ŽIVA VERA is a place to meet, talk, and take your time. A place where you're welcome exactly as you are.",
    image_path: "events/31249b5b-e584-408e-b0e4-2a2486698c54.webp",
    default_image_key: "community",
    image_alignment: "right",
    button_text_sl: "Preberite našo zgodbo",
    button_text_en: "Read our story",
    button_link: "/about",
    secondary_button_text_sl: null,
    secondary_button_text_en: null,
    secondary_button_link: null,
    featured_menu_item_ids: [],
    featured_event_ids: [],
    value_cards: null,
  },
  {
    id: "99999999-0000-0000-0000-000000000005",
    section_type: "call_to_action",
    sort_order: 50,
    eyebrow_sl: "Pogovor & Podpora",
    eyebrow_en: "Conversation & Support",
    title_sl: "Potrebujete molitev ali miren pogovor?",
    title_en: "Need prayer or a quiet conversation?",
    subtitle_sl: null,
    subtitle_en: null,
    body_sl: "Naša ekipa je vedno pripravljena prisluhniti, moliti z vami ali vam ponuditi varen prostor za oddih.",
    body_en: "Our team is always ready to listen, pray with you, or offer a safe place to rest.",
    image_path: "events/a11aa3cf-b82b-4e14-9087-ed53146c315b.webp",
    default_image_key: "hero",
    image_alignment: "left",
    button_text_sl: "Zaupajte nam prošnjo",
    button_text_en: "Share a prayer request",
    button_link: "/prayer",
    secondary_button_text_sl: null,
    secondary_button_text_en: null,
    secondary_button_link: null,
    featured_menu_item_ids: [],
    featured_event_ids: [],
    value_cards: null,
  },
];

function HomePage() {
  const [sections, setSections] = useState<Section[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(HOMEPAGE_SECTIONS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_HOMEPAGE_SECTIONS;
  });
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [events, setEvents] = useState<Record<string, Event>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("homepage_sections")
        .select("id, section_type, sort_order, eyebrow_en, eyebrow_sl, title_en, title_sl, subtitle_en, subtitle_sl, body_en, body_sl, image_path, default_image_key, image_alignment, button_text_en, button_text_sl, button_link, secondary_button_text_en, secondary_button_text_sl, secondary_button_link, featured_menu_item_ids, featured_event_ids, value_cards")
        .eq("published", true)
        .order("sort_order")
        .limit(20);
      if (!alive) return;
      if (data && data.length > 0) {
        const list = data as Section[];
        setSections(list);
        try {
          localStorage.setItem(HOMEPAGE_SECTIONS_CACHE_KEY, JSON.stringify(list));
        } catch {}
      }

      const list = (data as Section[]) ?? [];
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
      {(sections ?? []).map((s) => (
        <Fragment key={s.id}>
          <SectionRenderer section={s} menuItems={menuItems} events={events} />
        </Fragment>
      ))}
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
  const resolved = resolveMediaUrl(section.image_path);
  const defaultImg =
    DEFAULT_IMAGES[section.default_image_key ?? ""] ??
    (section.section_type === "hero"
      ? heroImg
      : section.section_type === "call_to_action"
        ? communityImg
        : section.section_type === "text_with_image"
          ? espressoImg
          : null);

  const [url, setUrl] = useState<string | null>(() => resolved || defaultImg);

  useEffect(() => {
    const direct = resolveMediaUrl(section.image_path);
    if (direct) {
      setUrl(direct);
      return;
    }
    if (!section.image_path) {
      setUrl(defaultImg);
      return;
    }
    let active = true;
    getSignedMediaUrl(section.image_path).then((u) => {
      if (active && u) {
        setUrl(u);
      }
    });
    return () => {
      active = false;
    };
  }, [section.image_path, section.default_image_key, defaultImg]);
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
    <section className="relative isolate overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center">
      <div className="absolute inset-0 z-0">
        {img && (
          <img
            src={img}
            alt=""
            width={1920}
            height={1280}
            className="size-full object-cover scale-105 transition-transform duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/65 to-background" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-18 sm:pb-10 w-full flex flex-col justify-between">
        <div>
          {eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-sm shadow-xs">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {eyebrow}
            </p>
          )}
          {title && (
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-balance text-foreground sm:text-5xl md:text-6xl tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty font-normal text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
          {(btn1 || btn2) && (
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              {btn1 && s.button_link && (
                <SectionLink
                  to={s.button_link}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
                >
                  {btn1} <ArrowRight className="size-4" />
                </SectionLink>
              )}
              {btn2 && s.secondary_button_link && (
                <SectionLink
                  to={s.secondary_button_link}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary hover:shadow-xs"
                >
                  {btn2}
                </SectionLink>
              )}
            </div>
          )}
        </div>

        {/* Compact Floating Glass Status Bar Integrated into Hero */}
        <div className="mt-8 sm:mt-10">
          <CafeStatusBanner />
        </div>
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
      <div
        className={cn(
          "mt-10 grid gap-5",
          cards.length === 4
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-2 md:grid-cols-3",
        )}
      >
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <article
              key={i}
              className="group flex flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
                {card.body}
              </p>
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
