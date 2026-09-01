import { supabase } from "@/integrations/supabase/client";

export type SectionType =
  | "hero"
  | "simple_text_block"
  | "text_with_image"
  | "quote_or_highlight"
  | "call_to_action"
  | "image_block"
  | "policy_section"
  | "image_gallery"
  | "card_grid"
  | "faq"
  | "video"
  | "alternating_content"
  | "testimonial";

export const SECTION_TYPES: { value: SectionType; label: string; hint: string }[] = [
  { value: "hero", label: "Hero", hint: "Eyebrow + title + subtitle, optional background image" },
  { value: "simple_text_block", label: "Simple text block", hint: "Title + body, centered" },
  { value: "text_with_image", label: "Text with image", hint: "Two-column block with image and text" },
  { value: "quote_or_highlight", label: "Quote / highlight", hint: "Large pulled quote or highlight card" },
  { value: "call_to_action", label: "Call to action", hint: "Title + body + button, optional small note" },
  { value: "image_block", label: "Image block", hint: "Standalone image with optional caption" },
  { value: "policy_section", label: "Policy section", hint: "Intro body + bullet list + closing body" },
  { value: "image_gallery", label: "Image gallery", hint: "Responsive grid of images with optional captions" },
  { value: "card_grid", label: "Card grid", hint: "Repeatable cards: image/icon, title, body, optional link" },
  { value: "faq", label: "FAQ / accordion", hint: "Collapsible questions and answers" },
  { value: "video", label: "Video", hint: "YouTube/Vimeo embed with optional title and caption" },
  { value: "alternating_content", label: "Alternating content", hint: "Multiple text+image rows that flip sides" },
  { value: "testimonial", label: "Testimonials / stories", hint: "Quotes from people, with name and role" },
];

export type Bullet = { text_en: string; text_sl: string };

/** Generic repeatable item. Different block types use different subsets of these fields. */
export type SectionItem = {
  // Common bilingual text
  title_en?: string;
  title_sl?: string;
  body_en?: string;
  body_sl?: string;
  // Media
  image_path?: string | null;
  // Card / gallery extras
  caption_en?: string;
  caption_sl?: string;
  link?: string;
  icon?: string;
  // FAQ
  q_en?: string;
  q_sl?: string;
  a_en?: string;
  a_sl?: string;
  // Testimonial
  quote_en?: string;
  quote_sl?: string;
  name?: string;
  role_en?: string;
  role_sl?: string;
  // Alternating row variant
  variant?: "left" | "right";
};

export type StaticPageSection = {
  id: string;
  page_id: string;
  section_type: SectionType;
  internal_label: string;
  sort_order: number;
  published: boolean;
  eyebrow_en: string | null;
  eyebrow_sl: string | null;
  title_en: string | null;
  title_sl: string | null;
  subtitle_en: string | null;
  subtitle_sl: string | null;
  body_en: string | null;
  body_sl: string | null;
  image_path: string | null;
  button_text_en: string | null;
  button_text_sl: string | null;
  button_link: string | null;
  layout_variant: string;
  bullets: Bullet[];
  items: SectionItem[];
};

export type StaticPage = {
  id: string;
  page_key: string;
  internal_label: string;
  title_en: string;
  title_sl: string;
  published: boolean;
  show_in_navigation: boolean;
  nav_order: number;
};

export async function fetchStaticPageByKey(pageKey: string) {
  const { data: page, error: pErr } = await supabase
    .from("static_pages")
    .select("id, page_key, internal_label, title_en, title_sl, published, show_in_navigation, nav_order")
    .eq("page_key", pageKey)
    .eq("published", true)
    .maybeSingle();
  if (pErr || !page) return { page: null as StaticPage | null, sections: [] as StaticPageSection[] };

  // Sync English title in DB if it was still legacy "About us"
  if (page.page_key === "about" && (!page.title_en || page.title_en.toLowerCase() === "about us" || page.title_en.toLowerCase() === "about")) {
    page.title_en = "Get to know us";
    supabase.from("static_pages").update({ title_en: "Get to know us" }).eq("id", page.id).then();
  }

  if (page.page_key === "hospitality") {
    const isLegacyHospitalityPage =
      page.title_sl === "Politika gostoljubnosti" ||
      page.title_sl === "Politika gostoljubnosti in postrežbe" ||
      page.title_en === "Hospitality Policy" ||
      page.title_en === "Hospitality and Service Policy";
    if (isLegacyHospitalityPage) {
      page.title_sl = "Naša zaveza skupnosti";
      page.title_en = "Our Commitment to Community";
      supabase
        .from("static_pages")
        .update({ title_sl: "Naša zaveza skupnosti", title_en: "Our Commitment to Community" })
        .eq("id", page.id)
        .then();
    }
  }

  const { data: sections } = await supabase
    .from("static_page_sections")
    .select("id, page_id, section_type, internal_label, sort_order, published, eyebrow_en, eyebrow_sl, title_en, title_sl, subtitle_en, subtitle_sl, body_en, body_sl, image_path, button_text_en, button_text_sl, button_link, layout_variant, bullets, items")
    .eq("page_id", page.id)
    .eq("published", true)
    .order("sort_order")
    .limit(50);

  const mappedSections: StaticPageSection[] = ((sections ?? []) as unknown as StaticPageSection[]).map((s) => {
    // If the about page has a legacy duplicate homepage hero, update it to the new unique copy
    if (s.section_type === "hero" && page.page_key === "about") {
      const isLegacyDuplicate =
        s.title_sl === "Dobra kava, pristen pogovor in iskreno gostoljubje" ||
        s.title_sl === "Dobra kava, pristen pogovor, iskreno gostoljubje." ||
        s.eyebrow_sl === "Prva krščanska neprofitna kavarna v Sloveniji" ||
        s.eyebrow_sl === "Unikatna kavarna, ki deluje po veri";

      if (isLegacyDuplicate) {
        s.title_sl = "Kavarna, ki jo poganjata vera in ljubezen do ljudi";
        s.title_en = "A café powered by faith and love for people";
        s.eyebrow_sl = "Zgodba in poslanstvo";
        s.eyebrow_en = "Our Story & Mission";
        s.subtitle_sl = "Spoznajte zgodbo in srce ŽIVE VERE — neprofitnega prostora v Celju, kjer se odlična kava Barcaffè prepleta z iskrenimi pogovori, toplim sprejemom in dobrodelnostjo za otroke v Etiopiji.";
        s.subtitle_en = "Discover the story behind ŽIVA VERA — a welcoming haven in Celje where exceptional Barcaffè coffee meets heartfelt conversations, open hospitality, and direct support for children in need.";

        // Persist update into Supabase database
        supabase
          .from("static_page_sections")
          .update({
            title_sl: s.title_sl,
            title_en: s.title_en,
            eyebrow_sl: s.eyebrow_sl,
            eyebrow_en: s.eyebrow_en,
            subtitle_sl: s.subtitle_sl,
            subtitle_en: s.subtitle_en,
          })
          .eq("id", s.id)
          .then();
      }
    }

    // If the hospitality page has a legacy hero section, normalize to the new copy
    if (s.section_type === "hero" && page.page_key === "hospitality") {
      const isLegacyHospitalityHero =
        s.title_sl === "Politika gostoljubnosti" ||
        s.title_sl === "Politika gostoljubnosti in postrežbe" ||
        s.title_en === "Hospitality Policy" ||
        s.title_en === "Hospitality and Service Policy" ||
        s.eyebrow_sl === "Naša zaveza gostom in skupnosti" ||
        s.eyebrow_en === "Our commitment to guests and community" ||
        (s.subtitle_sl && s.subtitle_sl.includes("Krščanske cerkve Kalvarija"));

      if (isLegacyHospitalityHero) {
        s.title_sl = "Naša zaveza skupnosti";
        s.title_en = "Our Commitment to Community";
        s.eyebrow_sl = "Naše gostoljubje";
        s.eyebrow_en = "Our Hospitality";
        s.subtitle_sl = "ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Calvary Chapel Celje. Naše delo temelji na prostovoljstvu, prostovoljnih prispevkih naših obiskovalcev ter želji po ustvarjanju toplega, varnega in spoštljivega prostora za vsakogar.";
        s.subtitle_en = "ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje. Our work is built on volunteer effort, the voluntary contributions of our guests, and the desire to create a warm, safe and respectful space for everyone.";

        // Persist update into Supabase database
        supabase
          .from("static_page_sections")
          .update({
            title_sl: s.title_sl,
            title_en: s.title_en,
            eyebrow_sl: s.eyebrow_sl,
            eyebrow_en: s.eyebrow_en,
            subtitle_sl: s.subtitle_sl,
            subtitle_en: s.subtitle_en,
          })
          .eq("id", s.id)
          .then();
      }
    }

    return {
      ...s,
      bullets: Array.isArray(s.bullets) ? (s.bullets as Bullet[]) : [],
      items: Array.isArray((s as unknown as { items?: unknown }).items)
        ? ((s as unknown as { items: SectionItem[] }).items)
        : [],
    };
  });

  if (page.page_key === "visit") {
    mappedSections.sort((a, b) => {
      // Place Visitor Information card_grid before the contribution text block
      if (a.section_type === "card_grid" && b.section_type !== "card_grid") return -1;
      if (b.section_type === "card_grid" && a.section_type !== "card_grid") return 1;
      return a.sort_order - b.sort_order;
    });
  }

  return {
    page: page as unknown as StaticPage,
    sections: mappedSections,
  };
}

export function fieldByLocale<T>(en: T | null | undefined, sl: T | null | undefined, locale: string): T | null {
  if (locale === "sl") return sl ?? en ?? null;
  return en ?? sl ?? null;
}
