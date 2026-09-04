import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavPage = {
  page_key: string;
  title_en: string;
  title_sl: string;
  nav_order: number;
  is_built_in: boolean;
};

export const BUILT_IN_PAGE_KEYS = new Set(["about", "visit", "hospitality", "prayer", "events"]);

export function publicHrefForPage(page_key: string) {
  return BUILT_IN_PAGE_KEYS.has(page_key) ? `/${page_key}` : `/p/${page_key}`;
}

const DEFAULT_NAV_PAGES: NavPage[] = [
  { page_key: "about", title_en: "Get to know us", title_sl: "Spoznajte nas", nav_order: 10, is_built_in: true },
  { page_key: "ebenezer", title_en: "Ebenezer Grace", title_sl: "Ebenezer Grace", nav_order: 20, is_built_in: false },
  { page_key: "hospitality", title_en: "Our Hospitality", title_sl: "Naše gostoljubje", nav_order: 30, is_built_in: true },
];

let cachedNavPagesPromise: Promise<NavPage[]> | null = null;
let lastFetchTime = 0;
const NAV_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the ordered list of static pages that should appear in public
 * header/footer navigation. Both menus consume this same source so they
 * stay aligned by default. Uses 5-minute memory cache to prevent duplicate egress.
 */
export async function fetchNavPages(forceFresh = false): Promise<NavPage[]> {
  const now = Date.now();
  if (!forceFresh && cachedNavPagesPromise && (now - lastFetchTime < NAV_CACHE_TTL)) {
    return cachedNavPagesPromise;
  }
  lastFetchTime = now;
  cachedNavPagesPromise = (async () => {
    const { data, error } = await supabase
      .from("static_pages")
      .select("page_key, title_en, title_sl, nav_order")
      .eq("published", true)
      .eq("show_in_navigation", true)
      .order("nav_order")
      .order("title_en")
      .limit(30);
    if (error || !data || data.length === 0) return DEFAULT_NAV_PAGES;
    return data.map((p) => {
      let title_en = p.title_en;
      let title_sl = p.title_sl;
      if (
        p.page_key === "about" &&
        (!p.title_en || p.title_en.toLowerCase() === "about us" || p.title_en.toLowerCase() === "about")
      ) {
        title_en = "Get to know us";
      }
      if (p.page_key === "hospitality") {
        const isLegacyEn =
          !title_en ||
          title_en === "Hospitality Policy" ||
          title_en === "Hospitality and Service Policy" ||
          title_en === "Our Commitment to Community" ||
          title_en.toLowerCase() === "hospitality";
        const isLegacySl =
          !title_sl ||
          title_sl === "Politika gostoljubnosti" ||
          title_sl === "Politika gostoljubnosti in postrežbe" ||
          title_sl === "Naša zaveza skupnosti" ||
          title_sl === "Gostoljubnost";
        if (isLegacyEn) title_en = "Our Hospitality";
        if (isLegacySl) title_sl = "Naše gostoljubje";
      }
      return {
        page_key: p.page_key,
        title_en,
        title_sl,
        nav_order: p.nav_order ?? 0,
        is_built_in: BUILT_IN_PAGE_KEYS.has(p.page_key),
      };
    });
  })();
  return cachedNavPagesPromise;
}

export function useNavPages() {
  const [pages, setPages] = useState<NavPage[]>(DEFAULT_NAV_PAGES);
  useEffect(() => {
    let mounted = true;
    fetchNavPages().then((p) => {
      if (mounted) setPages(p);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return pages;
}
