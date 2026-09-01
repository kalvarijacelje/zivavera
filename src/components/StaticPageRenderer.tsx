import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import {
  fetchStaticPageByKey,
  fieldByLocale,
  type StaticPage,
  type StaticPageSection,
} from "@/lib/static-pages";
import { SignedImage } from "@/components/admin/SignedImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/admin/storage";
import heroImg from "@/assets/hero-cafe.jpg";

type PageHeroConfig = {
  image: string;
  eyebrow_sl: string;
  eyebrow_en: string;
  title_sl?: string;
  title_en?: string;
  subtitle_sl?: string;
  subtitle_en?: string;
  button_text_sl?: string;
  button_text_en?: string;
  button_link?: string;
};

const DEFAULT_PAGE_HEROES: Record<string, PageHeroConfig> = {
  about: {
    image: resolveMediaUrl("pages/d72766e9-9574-454b-aa27-1735a30c45b3.webp") || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80",
    eyebrow_sl: "Zgodba in poslanstvo",
    eyebrow_en: "Our Story & Mission",
    title_sl: "Kavarna, ki jo poganjata vera in ljubezen do ljudi",
    title_en: "A café powered by faith and love for people",
    subtitle_sl: "Spoznajte zgodbo in srce ŽIVE VERE — neprofitnega prostora v Celju, kjer se odlična kava Barcaffè prepleta z iskrenimi pogovori, toplim sprejemom in dobrodelnostjo za otroke v Etiopiji.",
    subtitle_en: "Discover the story behind ŽIVA VERA — a welcoming haven in Celje where exceptional Barcaffè coffee meets heartfelt conversations, open hospitality, and direct support for children in need.",
    button_text_sl: "Oglejte si našo ponudbo →",
    button_text_en: "See our menu →",
    button_link: "/menu",
  },
  ebenezer: {
    image: "https://esmafrica.org/site/assets/files/1/banner.jpg",
    eyebrow_sl: "Partnerstvo s srcem že od leta 2007",
    eyebrow_en: "A heartfelt partnership since 2007",
    title_sl: "Ebenezer Grace & ŽIVA VERA",
    title_en: "Ebenezer Grace & ŽIVA VERA",
    subtitle_sl: "Iskreno prijateljstvo in misijonsko partnerstvo med Celjem in otroškim domom v Havasi v Etiopiji, ki neprekinjeno traja že od leta 2007.",
    subtitle_en: "A deep friendship and mission partnership between Celje and the children's home in Hawassa, Ethiopia, that has flourished continuously since 2007.",
    button_text_sl: "Obiščite uradno stran esmafrica.org →",
    button_text_en: "Visit official site esmafrica.org →",
    button_link: "https://esmafrica.org",
  },
  hospitality: {
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1920&q=80",
    eyebrow_sl: "Naše gostoljubje",
    eyebrow_en: "Our Hospitality",
    title_sl: "Naše gostoljubje",
    title_en: "Our Hospitality",
    subtitle_sl: "ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Calvary Chapel Celje. Naše delo temelji na prostovoljstvu, prostovoljnih prispevkih naših obiskovalcev ter želji po ustvarjanju toplega, varnega in spoštljivega prostora za vsakogar.",
    subtitle_en: "ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje. Our work is built on volunteer effort, the voluntary contributions of our guests, and the desire to create a warm, safe and respectful space for everyone.",
  },
  visit: {
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80",
    eyebrow_sl: "Dobrodošli v Celju",
    eyebrow_en: "Welcome to Celje",
    title_sl: "Obisk in prispevek",
    title_en: "Visit & Contribution",
    subtitle_sl: "Veseli bomo vašega obiska. Pridite na kavo, ostanite na pogovoru in prispevajte po svoji presoji — cenika ni.",
    subtitle_en: "We would love to welcome you. Stop by for coffee, stay for conversation, and contribute what feels right — there is no price list.",
  },
  prayer: {
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1920&q=80",
    eyebrow_sl: "Kotiček miru in upanja",
    eyebrow_en: "A corner of peace and hope",
    title_sl: "Molitev in razmišljanje",
    title_en: "Prayer & Reflection",
    subtitle_sl: "Vsak dan si lahko vzamete trenutek za oddih, preberete spodbudno misel ali zaupate svojo molitveno prošnjo naši pastoralni ekipi.",
    subtitle_en: "Take a quiet moment of rest, read an encouraging thought, or share your prayer request with our pastoral team.",
  },
};

const DEFAULT_STATIC_SECTIONS: Record<string, Partial<StaticPageSection>[]> = {
  about: [
    {
      id: "a-1",
      section_type: "text_with_image",
      eyebrow_sl: "Naša zgodba",
      eyebrow_en: "Our Story",
      title_sl: "Dobrodošli v Živi veri",
      title_en: "Welcome to ŽIVA VERA",
      body_sl: "Dobrodošli v kavarni ŽIVA VERA – prostoru, kjer se dobra kava in iskreno gostoljubje prepletata z ljubeznijo do ljudi. Smo poslanstvo v prostorih Krščanske cerkve Kalvarija v Celju.\n\nNaš cilj ni ustvarjanje dobička, temveč ustvarjanje toplega zavetja, kjer se vsak obiskovalec počuti sprejetega, slišanega in spoštovanega, ne glede na svojo življenjsko pot.",
      body_en: "Welcome to ŽIVA VERA — a space where great coffee and honest hospitality intertwine with genuine care for people. We operate as an outreach mission within Calvary Chapel Celje.\n\nOur aim is never profit, but creating a welcoming haven where everyone feels valued, heard, and respected regardless of their background.",
      image_path: resolveMediaUrl("pages/1572774b-d673-488e-984c-e2e0ac3a3730.webp") || "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80",
      layout_variant: "left",
    },
    {
      id: "a-2",
      section_type: "quote_or_highlight",
      title_sl: "Kaj pomeni, da delujemo »po veri«?",
      title_en: "What does it mean to run on faith?",
      body_sl: "ŽIVA VERA je neprofitna kavarna. Nimamo klasičnega cenika in ne prodajamo — vsak obiskovalec prispeva prostovoljni prispevek po svoji presoji. Verjamemo, da Bog skozi odprtost in velikodušnost ljudi poskrbi za vse stroške kave, mleka in delovanja prostora.",
      body_en: "ŽIVA VERA is a non-profit café. We have no fixed price list and make no commercial sales — visitors give freely according to their heart, or simply enjoy our hospitality. We believe that God provides for every operational need through generous, willing hearts.",
    },
    {
      id: "a-3",
      section_type: "text_with_image",
      eyebrow_sl: "Povezovanje & Mir",
      eyebrow_en: "Connection & Peace",
      title_sl: "Več kot le kavarna — prostor za skupnost",
      title_en: "More than a café — a space for community",
      body_sl: "Verjamemo, da se najlepši pogovori pogosto začnejo ob skodelici kave. ŽIVA VERA je prostor za druženje, študij, branje, iskrene pogovore o veri in življenju ter kotiček miru sredi vsakodnevnega hitenja.\n\nVsak je dobrodošel, da se usede, sprosti in si vzame čas zase.",
      body_en: "We believe meaningful conversations often start over a good cup of coffee. ŽIVA VERA is a place for fellowship, reading, studying, heartfelt conversations about faith, and quiet peace in the middle of a busy day.\n\nEveryone is welcome to sit, relax, and take time for themselves.",
      image_path: resolveMediaUrl("pages/ec7f18e0-dd02-45b1-a693-da1162f6a1a6.webp") || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      layout_variant: "right",
    },
    {
      id: "a-4",
      section_type: "text_with_image",
      eyebrow_sl: "Dobrodelnost z namenom",
      eyebrow_en: "Outreach with Purpose",
      title_sl: "Skupaj pomagamo: Sirotišnica Ebenezer",
      title_en: "Helping Together: Ebenezer Orphanage",
      body_sl: "Z vsako popito skodelico kave pomagate otrokom v stiski. 10 % vseh zbranih prostovoljnih prispevkov neposredno namenjamo sirotišnici Ebenezer v Hawassi (Etiopija), ki jo naša skupnost osebno podpira že od leta 2007.",
      body_en: "With every cup of coffee you help vulnerable children. 10% of all voluntary contributions directly support the Ebenezer Children's Home in Hawassa (Ethiopia), which our fellowship has personally supported since 2007.",
      image_path: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
      layout_variant: "left",
      button_text_sl: "Preberite več o Ebenezerju →",
      button_text_en: "Learn more about Ebenezer →",
      button_link: "/p/ebenezer",
    },
    {
      id: "a-5",
      section_type: "call_to_action",
      title_sl: "Veselimo se vašega obiska",
      title_en: "We look forward to welcoming you",
      subtitle_sl: "Pridite sami ali v družbi prijateljev — vrata so vedno odprta.",
      subtitle_en: "Come alone or with friends — our doors are always open.",
      body_sl: "Pridite na skodelico sveže kave ali toplega čaja, spoznajte našo ekipo prostovoljcev in doživite pristno gostoljubje.",
      body_en: "Come for a cup of fresh coffee or warm tea, meet our volunteer team, and experience genuine hospitality.",
      button_text_sl: "Obiščite nas",
      button_text_en: "Plan your visit",
      button_link: "/visit",
    },
  ],
  hospitality: [
    {
      id: "h-1",
      section_type: "simple_text_block",
      body_sl: "Vsakega obiskovalca želimo sprejeti z odprtostjo, prijaznostjo in gostoljubnostjo. Verjamemo, da lahko že preprosta skodelica kave in iskren pogovor prispevata k boljši skupnosti ter ustvarjata prostor, kjer se ljudje počutijo sprejete in spoštovane.",
      body_en: "We want to welcome every guest with openness, kindness and hospitality. We believe that even a simple cup of coffee and a sincere conversation can strengthen our community and create a place where people feel accepted and respected.",
    },
    {
      id: "h-2",
      section_type: "simple_text_block",
      body_sl: "Ker naše delovanje ne temelji na običajnem komercialnem gostinstvu, temveč na neprofitnem poslanstvu in prostovoljni podpori skupnosti, postrežba napitkov in drugih storitev ne predstavlja pravice posameznika do storitve, temveč izraz naše gostoljubnosti in služenja skupnosti.",
      body_en: "Because our work is not a typical commercial hospitality business, but a non-profit mission supported by the community, serving drinks and other offerings is not an individual right to service — it is an expression of our hospitality and service to the community.",
    },
    {
      id: "h-3",
      section_type: "simple_text_block",
      body_sl: "Zaradi odgovornosti do naših prostovoljcev, obiskovalcev, donatorjev in samega poslanstva si pridržujemo pravico, da po lastni presoji zavrnemo, omejimo ali prekinemo postrežbo posamezniku, kadar ocenimo, da njegovo ravnanje ni skladno z namenom, vrednotami ali dobrim delovanjem naše kavarne.",
      body_en: "Out of responsibility to our volunteers, guests, donors and to the mission itself, we reserve the right, at our own discretion, to refuse, limit or stop service to any individual whose behavior is, in our judgment, not in line with the purpose, values and healthy operation of our café.",
    },
    {
      id: "h-4",
      section_type: "policy_section",
      body_sl: "Takšni primeri lahko med drugim vključujejo:",
      body_en: "Such situations may include, among others:",
      bullets: [
        { text_sl: "nespoštljivo, žaljivo ali agresivno komunikacijo;", text_en: "disrespectful, offensive or aggressive communication;" },
        { text_sl: "nadlegovanje prostovoljcev, obiskovalcev ali drugih oseb;", text_en: "harassment of volunteers, guests or other people;" },
        { text_sl: "moteče vedenje, ki negativno vpliva na vzdušje v prostoru;", text_en: "disruptive behavior that negatively affects the atmosphere of the space;" },
        { text_sl: "namerno izkoriščanje sistema prostovoljnih prispevkov;", text_en: "deliberate exploitation of the voluntary contribution system;" },
        { text_sl: "ponavljajoče ravnanje, ki kaže na nespoštovanje do prostovoljnega značaja našega delovanja;", text_en: "repeated behavior that shows disregard for the voluntary nature of our work;" },
        { text_sl: "druga dejanja, ki po razumni presoji vodstva ali prostovoljcev škodujejo skupnosti, ugledu ali poslanstvu kavarne.", text_en: "any other actions that, in the reasonable judgment of the team or volunteers, harm the community, reputation or mission of the café." }
      ],
    },
    {
      id: "h-5",
      section_type: "simple_text_block",
      body_sl: "Posebej želimo poudariti, da je sistem prostovoljnih prispevkov zasnovan na medsebojnem zaupanju, spoštovanju in odgovornosti. Namenjen je temu, da omogoča dostopen in odprt prostor za vse, ne pa temu, da bi ga posamezniki namerno izkoriščali v svojo korist. Če ugotovimo, da nekdo sistem zavestno in ponavljajoče zlorablja, si pridržujemo pravico, da mu nadaljnje postrežbe ne omogočimo.",
      body_en: "We especially want to emphasize that the voluntary contribution system is built on mutual trust, respect and responsibility. It exists to keep this space open and accessible to everyone — not to be deliberately taken advantage of. If we find that someone is knowingly and repeatedly abusing the system, we reserve the right to no longer offer them service.",
    },
    {
      id: "h-6",
      section_type: "simple_text_block",
      body_sl: "Pri vseh odločitvah si prizadevamo ravnati pošteno, spoštljivo in brez diskriminacije. Naše odločitve niso povezane z narodnostjo, spolom, starostjo, socialnim položajem, verskim prepričanjem ali drugimi osebnimi okoliščinami posameznika, temveč izključno z njegovim vedenjem in odnosom do drugih ljudi, prostovoljcev ter samega poslanstva kavarne.",
      body_en: "In every decision we strive to act fairly, respectfully and without discrimination. Our decisions are never connected to nationality, gender, age, social status, religious belief or any other personal circumstance — only to behavior and to how a person treats other guests, volunteers and the mission of the café.",
    },
    {
      id: "h-7",
      section_type: "simple_text_block",
      body_sl: "Naš cilj ni izključevanje ljudi, temveč varovanje prostora, v katerem se lahko obiskovalci in prostovoljci počutijo dobrodošle, spoštovane in varne. Verjamemo, da je takšno okolje mogoče ohranjati le ob medsebojnem spoštovanju in odgovornem odnosu vseh, ki soustvarjamo to skupnost.",
      body_en: "Our goal is not to exclude people, but to protect a space in which guests and volunteers can feel welcome, respected and safe. We believe such an environment can only be preserved through mutual respect and a responsible attitude from everyone who shapes this community.",
    },
    {
      id: "h-8",
      section_type: "quote_or_highlight",
      body_sl: "Zahvaljujemo se vam za razumevanje, podporo in spoštovanje vrednot, na katerih temelji delovanje kavarne ŽIVA VERA.",
      body_en: "Thank you for your understanding, your support and your respect for the values on which ŽIVA VERA is built.",
    },
  ],
};

export function StaticPageRenderer({
  pageKey,
  before,
  after,
}: {
  pageKey: string;
  fallbackTitle?: string;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const { locale, t } = useI18n();
  const cacheKey = `ziva-vera.page-sections.${pageKey}.v3`;
  const [page, setPage] = useState<StaticPage | null>(null);
  const [sections, setSections] = useState<StaticPageSection[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return (DEFAULT_STATIC_SECTIONS[pageKey] ?? []) as StaticPageSection[];
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchStaticPageByKey(pageKey).then((res) => {
      if (!active) return;
      setPage(res.page);
      if (res.sections.length > 0) {
        setSections(res.sections);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(res.sections));
        } catch {}
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [pageKey, cacheKey]);

  const defaultHero = DEFAULT_PAGE_HEROES[pageKey];
  const firstSectionIsHero = sections.length > 0 && sections[0]?.section_type === "hero";
  const rawHeroSection = firstSectionIsHero ? sections[0] : null;

  // Guard against legacy database seed copy overwriting updated built-in pages (eliminates the flash)
  const isLegacyHero =
    rawHeroSection &&
    ((pageKey === "hospitality" &&
      (rawHeroSection.title_sl === "Politika gostoljubnosti" ||
        rawHeroSection.title_sl === "Politika gostoljubnosti in postrežbe" ||
        rawHeroSection.title_sl === "Naša zaveza skupnosti" ||
        rawHeroSection.title_en === "Hospitality Policy" ||
        rawHeroSection.title_en === "Hospitality and Service Policy" ||
        rawHeroSection.title_en === "Our Commitment to Community" ||
        rawHeroSection.eyebrow_sl === "Naša zaveza gostom in skupnosti" ||
        rawHeroSection.eyebrow_en === "Our commitment to guests and community" ||
        (rawHeroSection.subtitle_sl && rawHeroSection.subtitle_sl.includes("Krščanske cerkve Kalvarija")))) ||
      (pageKey === "about" &&
        (rawHeroSection.title_sl === "Dobra kava, pristen pogovor in iskreno gostoljubje" ||
          rawHeroSection.title_sl === "Dobra kava, pristen pogovor, iskreno gostoljubje." ||
          rawHeroSection.eyebrow_sl === "Prva krščanska neprofitna kavarna v Sloveniji" ||
          rawHeroSection.eyebrow_sl === "Unikatna kavarna, ki deluje po veri")));

  const heroSection = isLegacyHero ? null : rawHeroSection;

  const isLegacyPage =
    page &&
    pageKey === "hospitality" &&
    (page.title_sl === "Politika gostoljubnosti" ||
      page.title_sl === "Politika gostoljubnosti in postrežbe" ||
      page.title_sl === "Naša zaveza skupnosti" ||
      page.title_en === "Hospitality Policy" ||
      page.title_en === "Hospitality and Service Policy" ||
      page.title_en === "Our Commitment to Community");

  const pageTitle =
    isLegacyPage && defaultHero
      ? fieldByLocale(defaultHero.title_en, defaultHero.title_sl, locale)
      : page
        ? fieldByLocale(page.title_en, page.title_sl, locale)
        : "";

  // Resolve hero properties reliably
  const heroEyebrow =
    (heroSection ? fieldByLocale(heroSection.eyebrow_en, heroSection.eyebrow_sl, locale) : null) ||
    (defaultHero ? fieldByLocale(defaultHero.eyebrow_en, defaultHero.eyebrow_sl, locale) : "");

  const heroTitle =
    (heroSection ? fieldByLocale(heroSection.title_en, heroSection.title_sl, locale) : null) ||
    (defaultHero?.title_sl ? fieldByLocale(defaultHero.title_en, defaultHero.title_sl, locale) : "") ||
    pageTitle;

  const heroSubtitle =
    (heroSection ? fieldByLocale(heroSection.subtitle_en, heroSection.subtitle_sl, locale) : null) ||
    (defaultHero ? fieldByLocale(defaultHero.subtitle_en, defaultHero.subtitle_sl, locale) : "");

  const heroImage =
    (heroSection?.image_path && heroSection.image_path.startsWith("http"))
      ? heroSection.image_path
      : defaultHero?.image;

  const heroBtnText =
    (heroSection ? fieldByLocale(heroSection.button_text_en, heroSection.button_text_sl, locale) : null) ||
    (defaultHero?.button_text_sl ? fieldByLocale(defaultHero.button_text_en, defaultHero.button_text_sl, locale) : null);

  const heroBtnLink = heroSection?.button_link || defaultHero?.button_link;

  // Filter out any hero section from body sections, and also filter out any intro simple_text_block that duplicates the page hero
  const rawBodySections = firstSectionIsHero ? sections.slice(1) : sections;
  const filteredDbSections = rawBodySections.filter((s) => {
    if (s.section_type === "hero") return false;
    const sTitle = fieldByLocale(s.title_en, s.title_sl, locale);
    if (
      sTitle &&
      heroTitle &&
      (sTitle.trim().toLowerCase() === heroTitle.trim().toLowerCase() ||
        sTitle.trim().toLowerCase().startsWith(heroTitle.trim().toLowerCase()) ||
        heroTitle.trim().toLowerCase().startsWith(sTitle.trim().toLowerCase()))
    ) {
      // If it has identical text to hero subtitle, skip it completely
      const sBody = fieldByLocale(s.body_en, s.body_sl, locale);
      if (sBody && heroSubtitle && sBody.trim().startsWith(heroSubtitle.trim().slice(0, 30))) {
        return false;
      }
    }
    return true;
  });

  const fallbackSections = (DEFAULT_STATIC_SECTIONS[pageKey] ?? []) as StaticPageSection[];
  const finalSections = filteredDbSections.length > 0 ? filteredDbSections : fallbackSections;

  return (
    <div className="w-full">
      {/* Full-width Ambient Hero Banner matching homepage exactly */}
      <section className="relative isolate overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              width={1920}
              height={1280}
              className="size-full object-cover scale-105 transition-transform duration-1000"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/65 to-background" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24 w-full">
          {heroEyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-sm shadow-xs">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              {heroEyebrow}
            </p>
          )}
          {heroTitle && (
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-balance text-foreground sm:text-5xl md:text-6xl tracking-tight">
              {heroTitle}
            </h1>
          )}
          {heroSubtitle && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty font-normal text-muted-foreground sm:text-lg">
              {heroSubtitle}
            </p>
          )}
          {heroBtnText && heroBtnLink && (
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href={heroBtnLink}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                {heroBtnText}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Main Page Content Body */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
        {before && <div className="mb-12">{before}</div>}

        {finalSections.length > 0 && (
          <div className="space-y-12 sm:space-y-16">
            {finalSections.map((s, idx) => (
              <SectionRenderer
                key={s.id || idx}
                section={s}
                locale={locale}
                pageTitle={heroTitle}
                isFirstSection={idx === 0}
              />
            ))}
          </div>
        )}

        {after && <div className="mt-16">{after}</div>}
      </div>
    </div>
  );
}

function toEmbedUrl(url: string): { src: string; provider: "youtube" | "vimeo" | "other" } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { src: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { src: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return { src: `https://player.vimeo.com/video/${id}`, provider: "vimeo" };
    }
    return { src: url, provider: "other" };
  } catch {
    return null;
  }
}

function SectionRenderer({
  section,
  locale,
  pageTitle,
  isFirstSection,
}: {
  section: Partial<StaticPageSection>;
  locale: string;
  pageTitle: string | null;
  isFirstSection: boolean;
}) {
  const t = (en: string | null | undefined, sl: string | null | undefined) =>
    fieldByLocale(en, sl, locale) ?? "";

  const rawTitle = t(section.title_en, section.title_sl);
  const subtitle = t(section.subtitle_en, section.subtitle_sl);
  const body = t(section.body_en, section.body_sl);
  const eyebrow = t(section.eyebrow_en, section.eyebrow_sl);
  const btnText = t(section.button_text_en, section.button_text_sl);

  // Check if section title is redundant with page title or hero title
  const isDuplicateTitle =
    pageTitle &&
    rawTitle &&
    (rawTitle.trim().toLowerCase() === pageTitle.trim().toLowerCase() ||
      rawTitle.trim().toLowerCase().startsWith(pageTitle.trim().toLowerCase()) ||
      pageTitle.trim().toLowerCase().startsWith(rawTitle.trim().toLowerCase()));

  const title = isDuplicateTitle ? null : rawTitle;

  switch (section.section_type) {
    case "hero":
      return null; // Top hero is handled at page-level

    case "simple_text_block":
      return (
        <article className="max-w-3xl">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p
              className={cn(
                "text-pretty text-base sm:text-lg leading-relaxed text-foreground/85 whitespace-pre-line",
                title && "mt-4",
              )}
            >
              {body}
            </p>
          )}
        </article>
      );

    case "text_with_image": {
      const right = section.layout_variant === "right";
      return (
        <article className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
          {section.image_path && (
            <div className={cn("overflow-hidden rounded-3xl border border-border/70 shadow-xs", right && "md:order-2")}>
              <SignedImage
                path={section.image_path}
                alt=""
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
          <div className={cn(right && "md:order-1", !section.image_path && "md:col-span-2 max-w-3xl")}>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-2">{eyebrow}</p>
            )}
            {title && (
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
                {title}
              </h2>
            )}
            {body && (
              <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/85 whitespace-pre-line">{body}</p>
            )}
            {btnText && section.button_link && (
              <Button asChild className="mt-6 rounded-full px-6">
                <a href={section.button_link}>{btnText}</a>
              </Button>
            )}
          </div>
        </article>
      );
    }

    case "quote_or_highlight":
      return (
        <article className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-10 shadow-xs max-w-4xl">
          {title && (
            <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
          )}
          {body && (
            <blockquote
              className={cn(
                "text-pretty text-base sm:text-lg leading-relaxed text-foreground/90 font-medium",
                title && "mt-3",
              )}
            >
              {body}
            </blockquote>
          )}
          {subtitle && (
            <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</p>
          )}
        </article>
      );

    case "call_to_action":
      return (
        <article className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-xs max-w-4xl text-center">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          )}
          {body && (
            <p className="mt-4 max-w-2xl mx-auto leading-relaxed text-muted-foreground text-base">{body}</p>
          )}
          {btnText && section.button_link && (
            <Button asChild className="mt-6 rounded-full px-8 py-6 text-sm font-semibold shadow-md">
              <a href={section.button_link}>{btnText}</a>
            </Button>
          )}
          {subtitle && (
            <p className="mt-4 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </article>
      );

    case "image_block":
      return (
        <article>
          {section.image_path && (
            <SignedImage
              path={section.image_path}
              alt={title || ""}
              className="aspect-[16/9] w-full rounded-3xl"
            />
          )}
          {(title || body) && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {title} {body}
            </p>
          )}
        </article>
      );

    case "policy_section": {
      const bullets = (section.bullets ?? [])
        .map((b: any) => {
          if (typeof b === "string") return b;
          if (b && typeof b === "object") return fieldByLocale(b.text_en, b.text_sl, locale);
          return null;
        })
        .filter(Boolean) as string[];
      return (
        <article className="space-y-4 text-pretty leading-relaxed text-foreground/85 max-w-3xl">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {title}
            </h2>
          )}
          {body && <p className="font-medium text-foreground">{body}</p>}
          {bullets.length > 0 && (
            <ul className="list-disc space-y-2.5 pl-6 text-foreground/85">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </article>
      );
    }

    case "image_gallery": {
      const items = section.items ?? [];
      if (items.length === 0) return null;
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">{body}</p>
          )}
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", (title || body) && "mt-8")}>
            {items.map((it, i) => {
              const caption = fieldByLocale(it.caption_en, it.caption_sl, locale) ?? "";
              return (
                <figure key={i} className="overflow-hidden group rounded-3xl border border-border/80 bg-card p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/40">
                  {it.image_path && (
                    <div className="overflow-hidden rounded-2xl aspect-[4/3]">
                      <SignedImage
                        path={it.image_path}
                        alt={caption}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  {caption && (
                    <figcaption className="mt-3 px-1 pb-1 text-sm font-medium text-foreground/85 leading-snug">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </article>
      );
    }

    case "card_grid": {
      const items = section.items ?? [];
      const cols = section.layout_variant === "2" ? "sm:grid-cols-2" : section.layout_variant === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">{body}</p>
          )}
          <div className={cn("grid grid-cols-1 gap-5", cols, (title || body) && "mt-8")}>
            {items.map((it, i) => {
              const cTitle = fieldByLocale(it.title_en, it.title_sl, locale) ?? "";
              const cBody = fieldByLocale(it.body_en, it.body_sl, locale) ?? "";
              const Wrap: React.ElementType = it.link ? "a" : "div";
              return (
                <Wrap
                  key={i}
                  {...(it.link ? { href: it.link, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-1",
                  )}
                >
                  {it.image_path && (
                    <div className="overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                      <SignedImage
                        path={it.image_path}
                        alt={cTitle}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2">
                    {it.icon && !it.image_path && (
                      <span className="text-3xl mb-1">{it.icon}</span>
                    )}
                    {cTitle && (
                      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">{cTitle}</h3>
                    )}
                    {cBody && (
                      <p className="text-sm leading-relaxed text-muted-foreground">{cBody}</p>
                    )}
                  </div>
                </Wrap>
              );
            })}
          </div>
        </article>
      );
    }

    case "faq": {
      const items = section.items ?? [];
      return (
        <article className="max-w-3xl">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{body}</p>
          )}
          <Accordion type="single" collapsible className={cn((title || body) && "mt-6")}>
            {items.map((it, i) => {
              const q = fieldByLocale(it.q_en, it.q_sl, locale) ?? "";
              const a = fieldByLocale(it.a_en, it.a_sl, locale) ?? "";
              if (!q) return null;
              return (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium">{q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-foreground/80 whitespace-pre-line">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </article>
      );
    }

    case "video": {
      const embed = toEmbedUrl(section.button_link ?? "");
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{body}</p>
          )}
          {embed ? (
            <div className={cn("relative aspect-video w-full overflow-hidden rounded-3xl bg-black", (title || body) && "mt-6")}>
              <iframe
                src={embed.src}
                title={title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            </div>
          ) : section.image_path ? (
            <SignedImage
              path={section.image_path}
              alt={title || ""}
              className={cn("aspect-video w-full rounded-3xl", (title || body) && "mt-6")}
            />
          ) : null}
        </article>
      );
    }

    case "alternating_content": {
      const items = section.items ?? [];
      return (
        <article className="space-y-16">
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
              {title}
            </h2>
          )}
          {items.map((it, i) => {
            const right = (it.variant ?? (i % 2 === 0 ? "left" : "right")) === "right";
            const rTitle = fieldByLocale(it.title_en, it.title_sl, locale) ?? "";
            const rBody = fieldByLocale(it.body_en, it.body_sl, locale) ?? "";
            return (
              <div key={i} className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
                {it.image_path && (
                  <div className={cn("overflow-hidden rounded-3xl border border-border/70 shadow-xs", right && "md:order-2")}>
                    <SignedImage
                      path={it.image_path}
                      alt=""
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
                <div className={cn(right && "md:order-1", !it.image_path && "md:col-span-2 max-w-3xl")}>
                  {rTitle && (
                    <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl text-foreground">
                      {rTitle}
                    </h3>
                  )}
                  {rBody && (
                    <p className="mt-3.5 text-pretty text-base leading-relaxed text-foreground/85 whitespace-pre-line">
                      {rBody}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </article>
      );
    }

    case "testimonial": {
      const items = section.items ?? [];
      return (
        <article>
          {title && (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          )}
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", title && "mt-6")}>
            {items.map((it, i) => {
              const quote = fieldByLocale(it.quote_en, it.quote_sl, locale) ?? "";
              const role = fieldByLocale(it.role_en, it.role_sl, locale) ?? "";
              return (
                <figure
                  key={i}
                  className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6"
                >
                  <blockquote className="text-pretty leading-relaxed text-foreground/90">
                    “{quote}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 border-t border-border/60 pt-4">
                    {it.image_path && (
                      <SignedImage
                        path={it.image_path}
                        alt={it.name ?? ""}
                        className="size-10 rounded-full"
                      />
                    )}
                    <div className="text-sm">
                      {it.name && <p className="font-medium">{it.name}</p>}
                      {role && <p className="text-xs text-muted-foreground">{role}</p>}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </article>
      );
    }

    default:
      return null;
  }
}
