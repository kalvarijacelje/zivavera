ALTER TABLE public.static_pages
  ADD COLUMN IF NOT EXISTS show_in_navigation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nav_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS static_pages_nav_idx
  ON public.static_pages (show_in_navigation, nav_order);

-- Seed built-in pages into navigation so behavior matches existing header/footer
UPDATE public.static_pages SET show_in_navigation = true, nav_order = 10 WHERE page_key = 'about';
UPDATE public.static_pages SET show_in_navigation = true, nav_order = 20 WHERE page_key = 'visit';
UPDATE public.static_pages SET show_in_navigation = true, nav_order = 30 WHERE page_key = 'hospitality';