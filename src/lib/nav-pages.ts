import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavPage = {
  page_key: string;
  title_en: string;
  title_sl: string;
  nav_order: number;
  is_built_in: boolean;
};

export const BUILT_IN_PAGE_KEYS = new Set(["about", "visit", "hospitality", "prayer"]);

export function publicHrefForPage(page_key: string) {
  return BUILT_IN_PAGE_KEYS.has(page_key) ? `/${page_key}` : `/p/${page_key}`;
}

/**
 * Fetches the ordered list of static pages that should appear in public
 * header/footer navigation. Both menus consume this same source so they
 * stay aligned by default.
 */
export async function fetchNavPages(): Promise<NavPage[]> {
  const { data, error } = await supabase
    .from("static_pages")
    .select("page_key, title_en, title_sl, nav_order")
    .eq("published", true)
    .eq("show_in_navigation", true)
    .order("nav_order")
    .order("title_en");
  if (error || !data) return [];
  return data.map((p) => ({
    page_key: p.page_key,
    title_en: p.title_en,
    title_sl: p.title_sl,
    nav_order: p.nav_order ?? 0,
    is_built_in: BUILT_IN_PAGE_KEYS.has(p.page_key),
  }));
}

export function useNavPages() {
  const [pages, setPages] = useState<NavPage[]>([]);
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
