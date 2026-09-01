-- ====================================================================
-- ŽIVA VERA: COMPLETE DATABASE SETUP & SEED SCRIPT
-- Paste and Run this entire script in your Supabase SQL Editor
-- (Project: ptdvcobgplmngnhkjqag)
-- ====================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. USER ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'editor',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. CAFE STATUS & SESSIONS
CREATE TABLE IF NOT EXISTS public.cafe_status (
  id boolean PRIMARY KEY DEFAULT true,
  is_open boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto', 'manual_open', 'manual_closed')),
  schedule jsonb NOT NULL DEFAULT '{
    "mon": { "enabled": true, "open": "08:00", "close": "14:00" },
    "tue": { "enabled": true, "open": "08:00", "close": "14:00" },
    "wed": { "enabled": true, "open": "08:00", "close": "14:00" },
    "thu": { "enabled": true, "open": "08:00", "close": "14:00" },
    "fri": { "enabled": true, "open": "08:00", "close": "14:00" },
    "sat": { "enabled": false, "open": "09:00", "close": "13:00" },
    "sun": { "enabled": false, "open": "09:00", "close": "13:00" }
  }'::jsonb,
  override_until timestamptz,
  note_en text,
  note_sl text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.cafe_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read cafe status" ON public.cafe_status;
CREATE POLICY "Public can read cafe status" ON public.cafe_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update cafe status" ON public.cafe_status;
CREATE POLICY "Admins can update cafe status" ON public.cafe_status
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.cafe_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open boolean NOT NULL,
  note_en text,
  note_sl text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid,
  changed_by_email text
);

ALTER TABLE public.cafe_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read status history" ON public.cafe_status_history;
CREATE POLICY "Admins read status history" ON public.cafe_status_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.cafe_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  opened_by uuid,
  opened_by_email text,
  closed_by uuid,
  closed_by_email text,
  hot_drinks_served integer NOT NULL DEFAULT 0,
  cold_drinks_served integer NOT NULL DEFAULT 0,
  people_served integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cafe_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage cafe sessions" ON public.cafe_sessions;
CREATE POLICY "Admins manage cafe sessions" ON public.cafe_sessions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4b. CUSTOMERS & CAFE VISITS TRACKER
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  first_visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.cafe_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  guest_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  donation_given BOOLEAN NOT NULL DEFAULT false,
  donation_amount NUMERIC(10, 2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card') OR payment_method IS NULL),
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email TEXT
);

CREATE INDEX IF NOT EXISTS customers_name_idx ON public.customers (name);
CREATE INDEX IF NOT EXISTS customers_last_visited_at_idx ON public.customers (last_visited_at DESC);
CREATE INDEX IF NOT EXISTS cafe_visits_visited_at_idx ON public.cafe_visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS cafe_visits_customer_id_idx ON public.cafe_visits (customer_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafe_visits TO authenticated;
GRANT ALL ON public.cafe_visits TO service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage customers" ON public.customers;
CREATE POLICY "Admins manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage cafe visits" ON public.cafe_visits;
CREATE POLICY "Admins manage cafe visits" ON public.cafe_visits
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. MENU CATEGORIES & ITEMS
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_sl text NOT NULL,
  description_en text,
  description_sl text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published menu categories" ON public.menu_categories;
CREATE POLICY "Public read published menu categories" ON public.menu_categories
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins manage menu categories" ON public.menu_categories;
CREATE POLICY "Admins manage menu categories" ON public.menu_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name_en text NOT NULL,
  name_sl text NOT NULL,
  description_en text,
  description_sl text,
  image_path text,
  featured boolean NOT NULL DEFAULT false,
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published menu items" ON public.menu_items;
CREATE POLICY "Public read published menu items" ON public.menu_items
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins manage menu items" ON public.menu_items;
CREATE POLICY "Admins manage menu items" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. EVENT CATEGORIES & EVENTS
CREATE TABLE IF NOT EXISTS public.event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_sl text NOT NULL,
  description_en text,
  description_sl text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published event categories" ON public.event_categories;
CREATE POLICY "Public read published event categories" ON public.event_categories
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins manage event categories" ON public.event_categories;
CREATE POLICY "Admins manage event categories" ON public.event_categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.event_categories(id) ON DELETE SET NULL,
  title_en text NOT NULL,
  title_sl text NOT NULL,
  description_en text,
  description_sl text,
  event_date date NOT NULL,
  event_time time,
  location_or_note_en text,
  location_or_note_sl text,
  image_path text,
  image_alignment text NOT NULL DEFAULT 'right',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published events" ON public.events;
CREATE POLICY "Public read published events" ON public.events
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins manage events" ON public.events;
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. HOMEPAGE SECTIONS
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  internal_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  eyebrow_en text,
  eyebrow_sl text,
  title_en text,
  title_sl text,
  subtitle_en text,
  subtitle_sl text,
  body_en text,
  body_sl text,
  image_path text,
  default_image_key text,
  image_alignment text NOT NULL DEFAULT 'left',
  button_text_en text,
  button_text_sl text,
  button_link text,
  secondary_button_text_en text,
  secondary_button_text_sl text,
  secondary_button_link text,
  featured_menu_item_ids text[] NOT NULL DEFAULT '{}',
  featured_event_ids text[] NOT NULL DEFAULT '{}',
  value_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published homepage sections" ON public.homepage_sections;
CREATE POLICY "Public read published homepage sections" ON public.homepage_sections
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins manage homepage sections" ON public.homepage_sections;
CREATE POLICY "Admins manage homepage sections" ON public.homepage_sections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. STATIC PAGES & CMS SECTIONS
CREATE TABLE IF NOT EXISTS public.static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  internal_label text NOT NULL,
  title_en text NOT NULL,
  title_sl text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  show_in_navigation boolean NOT NULL DEFAULT true,
  nav_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published static pages" ON public.static_pages;
CREATE POLICY "Public read published static pages" ON public.static_pages
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins manage static pages" ON public.static_pages;
CREATE POLICY "Admins manage static pages" ON public.static_pages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.static_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.static_pages(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  internal_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  eyebrow_en text,
  eyebrow_sl text,
  title_en text,
  title_sl text,
  subtitle_en text,
  subtitle_sl text,
  body_en text,
  body_sl text,
  image_path text,
  button_text_en text,
  button_text_sl text,
  button_link text,
  layout_variant text NOT NULL DEFAULT 'center',
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.static_page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published sections" ON public.static_page_sections;
CREATE POLICY "Public read published sections" ON public.static_page_sections
  FOR SELECT USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.static_pages p
      WHERE p.id = page_id AND p.published = true
    )
  );

DROP POLICY IF EXISTS "Admins manage static page sections" ON public.static_page_sections;
CREATE POLICY "Admins manage static page sections" ON public.static_page_sections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. PRAYER REQUESTS & RPC
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  contact text,
  request_type text NOT NULL,
  visibility_choice text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  moderator_note text,
  public_response text,
  public_response_at timestamptz,
  submitter_ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage prayer requests" ON public.prayer_requests;
CREATE POLICY "Admins manage prayer requests" ON public.prayer_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.get_prayer_wall();

CREATE OR REPLACE FUNCTION public.get_prayer_wall()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  request_type text,
  message text,
  display_name text,
  public_response text,
  public_response_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    pr.created_at,
    pr.request_type,
    pr.message,
    CASE
      WHEN pr.is_anonymous THEN 'Anonimno'
      WHEN pr.name IS NOT NULL AND trim(pr.name) <> '' THEN pr.name
      ELSE 'Anonimno'
    END AS display_name,
    pr.public_response,
    pr.public_response_at
  FROM public.prayer_requests pr
  WHERE pr.status = 'approved'
    AND pr.visibility_choice = 'public_if_approved'
  ORDER BY pr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. STORAGE BUCKET (media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public media read" ON storage.objects;
CREATE POLICY "Public media read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated media upload" ON storage.objects;
CREATE POLICY "Authenticated media upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated media update" ON storage.objects;
CREATE POLICY "Authenticated media update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated media delete" ON storage.objects;
CREATE POLICY "Authenticated media delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');


-- ====================================================================
-- 11. INSERT ALL LIVE CONTENT DATA
-- ====================================================================

-- CAFE STATUS
INSERT INTO public.cafe_status (id, is_open, note_en, note_sl)
VALUES (true, false, null, null)
ON CONFLICT (id) DO NOTHING;

-- MENU CATEGORIES
INSERT INTO public.menu_categories (id, name_en, name_sl, description_en, description_sl, sort_order, published)
VALUES
  ('ea446ec4-32dc-444f-b638-20c9cf6d66c5', 'Coffee', 'Kave', null, null, 0, true),
  ('81418421-d5cd-420b-b1a2-b7031912595b', 'Teas', 'Čaji', 'Hot water with FLAVOUR! LOL', 'Ja v večini kavarna, najbolj profitabilna pijača - 1 vrečka čaja 10centov - na meniju 1,5 €! \nWOW - 1500% zaslužek!', 1, true)
ON CONFLICT (id) DO NOTHING;

-- MENU ITEMS
INSERT INTO public.menu_items (id, category_id, name_en, name_sl, description_en, description_sl, image_path, featured, available, sort_order, published)
VALUES
  ('5d09749f-aaec-4b6c-80ab-b3e744fcd9bb', 'ea446ec4-32dc-444f-b638-20c9cf6d66c5', 'Espresso', 'Espresso', 'A clean, rich single shot — pulled from freshly ground Barcaffè beans.', 'Čist in poln okus enojnega espresso napitka — iz sveže mletih zrn Barcaffè.', 'menu/3ad2abc1-4ea1-46f5-8df5-62e01481af33.jpg', false, true, 0, true),
  ('2dab58d8-c22a-442f-9e29-f051dca0323d', '81418421-d5cd-420b-b1a2-b7031912595b', 'Good Tea', 'Najboljši čaj na svetu', 'Drink and be merry', 'Pa kaj druga rabiš kot vročo vodo z okusom!', 'menu/b91e23ec-62ea-4fa8-a2a0-c228d7074614.jpg', false, true, 0, true)
ON CONFLICT (id) DO NOTHING;

-- EVENT CATEGORIES
INSERT INTO public.event_categories (id, name_en, name_sl, description_en, description_sl, sort_order, published)
VALUES
  ('9bfb870f-47d1-4001-b20e-c300aca1c702', 'Youth Events', 'Dogodki za mlade', null, null, 0, true)
ON CONFLICT (id) DO NOTHING;

-- EVENTS
INSERT INTO public.events (id, category_id, title_en, title_sl, description_en, description_sl, event_date, event_time, location_or_note_en, location_or_note_sl, image_path, image_alignment, featured, sort_order, published)
VALUES
  ('3eb04e7d-e3dd-47d2-9f18-a1a425a04410', '9bfb870f-47d1-4001-b20e-c300aca1c702', 'Youth hangoout', 'Druženje za mlade', 'It will be fun', 'Super druženje', '2026-07-31', '17:30:00', 'Živa vera', 'Živa vera', 'events/aad8cac3-7f23-49a3-93c8-ad933fdca03d.jpg', 'right', true, 1, true)
ON CONFLICT (id) DO NOTHING;

-- HOMEPAGE SECTIONS
INSERT INTO public.homepage_sections (id, section_type, internal_label, sort_order, published, eyebrow_en, eyebrow_sl, title_en, title_sl, subtitle_en, subtitle_sl, body_en, body_sl, image_path, default_image_key, image_alignment, button_text_en, button_text_sl, button_link, secondary_button_text_en, secondary_button_text_sl, secondary_button_link, featured_menu_item_ids, featured_event_ids, value_cards)
VALUES
  ('f5968898-8caf-4977-8f33-7ca715fc51bd', 'hero', 'Hero', 10, true, 'A unique café that runs on faith', 'Edinstvena kavarna, ki deluje na veri', 'Good coffee, real conversation, honest hospitality.', 'Dobra kava, pristen pogovor, iskrena gostoljubnost.', 'Welcome to ŽIVA VERA — Slovenia''s first Christian non-profit coffee shop. There is no price list. Stay, share, and contribute what feels right.', 'Dobrodošli v ŽIVI VERI — prvi slovenski krščanski neprofitni kavarni. Cenika ni. Ostanite, delite in prispevajte, kolikor se vam zdi prav.', null, null, 'events/3dd3ac4c-c0df-4c2c-ae47-133a0bccb62f.jpg', 'hero', 'left', 'See the menu', 'Oglejte si meni', '/menu', 'Plan your visit', 'Načrtujte obisk', '/visit', '{}', '{}', '[]'::jsonb),
  ('c4f603ef-9406-4850-a200-727a9c9ec014', 'values_grid', 'What makes us different', 20, true, null, null, 'What makes us different', 'Kaj nas dela drugačne', null, null, null, null, null, null, 'left', null, null, null, null, null, null, '{}', '{}', '[{"icon": "Users", "body_en": "A safe, calm space — no pressure, no judgment. Come exactly as you are.", "body_sl": "Varen, miren prostor — brez pritiska, brez obsojanja. Pridite točno takšni, kot ste.", "title_en": "All are welcome", "title_sl": "Vsi so dobrodošli"}, {"icon": "HandHeart", "body_en": "We are an outreach of the Christian Church Kalvarija. Quietly, in everything we do.", "body_sl": "Smo poslanstvo Krščanske cerkve Kalvarija. Tiho, v vsem, kar počnemo.", "title_en": "Rooted in faith", "title_sl": "Ukoreninjeni v veri"}, {"icon": "Coffee", "body_en": "No price list. No sales. Enjoy your drink and contribute what feels right.", "body_sl": "Brez cenika, brez prodaje. Uživajte v pijači in prispevajte, kolikor čutite.", "title_en": "Coffee with a purpose", "title_sl": "Kava z namenom"}]'::jsonb),
  ('fee457cb-02b1-46db-acc2-61c01cf0a526', 'text_with_image', 'Menu teaser', 30, true, 'Coffee by Barcaffè', 'Kava Barcaffè', 'From our counter', 'Z našega pulta', null, null, 'Espresso drinks, teas, hot chocolate, fresh juices and a few sweet things — prepared with care, served with a smile.', 'Espresso napitki, čaji, vroča čokolada, sveži sokovi in nekaj sladkih dobrot — pripravljeno s skrbjo, postreženo z nasmehom.', 'events/8596455d-c0f6-429c-a6ef-c05c3a67624f.jpg', 'espresso', 'left', 'Browse the full menu', 'Oglejte si celoten meni', '/menu', null, null, null, '{}', '{}', '[]'::jsonb),
  ('638e0e45-4df9-431e-bf33-4992772d01af', 'call_to_action', 'Community', 40, true, null, null, 'More than a café', 'Več kot kavarna', null, null, 'ŽIVA VERA is a place to meet, talk, and take your time. A place where you''re welcome exactly as you are.', 'ŽIVA VERA je prostor za srečanja, pogovore in mirne trenutke. Prostor, kjer ste dobrodošli točno takšni, kot ste.', null, 'community', 'left', 'Read our story', 'Preberite našo zgodbo', '/about', null, null, null, '{}', '{}', '[]'::jsonb),
  ('1e14ecb6-8eed-4809-870e-5e7587d43d37', 'featured_events', 'events', 60, true, null, null, 'Events', 'Dogodki', null, null, 'Whats happeing', 'Kaj dogaja pri nas!?', null, null, 'left', null, null, null, null, null, null, '{}', '{"3eb04e7d-e3dd-47d2-9f18-a1a425a04410"}', '[]'::jsonb),
  ('3c216247-8a20-408d-a790-5196c56ad78d', 'featured_menu', 'menu items', 70, true, null, null, 'All the good things we offer!!!', 'Kaj vse je še na voljo', null, null, 'NJAM NJAM', 'Dobre stvari za popit in pojest', null, null, 'left', null, null, null, null, null, null, '{"5d09749f-aaec-4b6c-80ab-b3e744fcd9bb","2dab58d8-c22a-442f-9e29-f051dca0323d"}', '{}', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- STATIC PAGES
INSERT INTO public.static_pages (id, page_key, internal_label, title_en, title_sl, published, show_in_navigation, nav_order)
VALUES
  ('7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'about', 'About', 'Get to know us', 'Spoznajte nas', true, true, 10),
  ('b9f13a7f-2bc7-47c8-8a2b-c381f6493f2a', 'visit', 'Visit / Contribution', 'Visit & Contribute', 'Obisk in prispevek', true, true, 20),
  ('08745797-ac63-4772-b814-55efdb0b02dc', 'hospitality', 'Hospitality Policy', 'Hospitality and Service Policy', 'Politika gostoljubnosti', true, true, 30),
  ('5e99f6cf-e10d-4120-8a4b-773d396099a3', 'ebenezer', 'Ebenezer', 'Ebenezer Grace', 'Ebenezer Grace', true, true, 40),
  ('f5f6acaf-6cb8-4683-aa47-de3c61304ce6', 'prayer', 'Prayer / Reflection', 'Prayer & Reflection', 'Molitev in razmišljanje', true, true, 50)
ON CONFLICT (id) DO NOTHING;

-- STATIC PAGE SECTIONS
INSERT INTO public.static_page_sections (id, page_id, section_type, internal_label, sort_order, published, title_en, title_sl, body_en, body_sl, layout_variant, bullets, items)
VALUES
  ('e06d9b73-bdd8-4ae9-855c-a8553f2492a6', '7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'simple_text_block', 'Welcome', 10, true, 'Welcome to ŽIVA VERA', 'Dobrodošli v Živi veri', 'Welcome to ŽIVA VERA — a place where good coffee, warm company and sincere relationships meet the values of faith, hope and service. We are the first and currently only Christian non-profit café in Slovenia, operating as a mission under the Christian Church Calvary. Our goal is not profit, but to create a welcoming space where anyone can feel at home, regardless of their story, beliefs or background. We believe that some of the most meaningful conversations begin over a cup of good coffee.', 'Dobrodošli v kavarni ŽIVA VERA – prostoru, kjer se dobra kava, prijetna družba in pristni odnosi srečajo z vrednotami vere, upanja in služenja. Smo prva in trenutno edina krščanska neprofitna kavarna v Sloveniji, ki deluje kot poslanstvo v prostorih Krščanske cerkve Kalvarija. Naš cilj ni ustvarjanje dobička, temveč ustvarjanje prijetnega okolja, kjer se vsak lahko počuti dobrodošlega, ne glede na svojo življenjsko zgodbo, prepričanja ali ozadje. Verjamemo, da se najlepši pogovori pogosto začnejo ob skodelici dobre kave.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('cbd0362d-f5f8-4bb9-ac82-f6ee5e67c66c', '7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'simple_text_block', 'On faith', 20, true, 'What does it mean to run "on faith"?', 'Kaj pomeni, da delujemo »po veri«?', 'ŽIVA VERA is a non-profit activity. Instead of a classic business model, we created a place where anyone can enjoy a coffee or another non-alcoholic drink and offer a voluntary contribution of their own choosing. That means we don''t have a price list or sales in the usual sense. Our work is sustained by the voluntary contributions of our guests, which cover ingredients, drink preparation, maintenance of the space and other operating costs. This way of working reflects our trust in God and gives every guest the freedom to contribute as much as they wish and are able.', 'ŽIVA VERA je neprofitna dejavnost. Namesto klasičnega poslovnega modela smo ustvarili prostor, kjer lahko vsak uživa v kavi ali drugi brezalkoholni pijači ter za postrežbo prispeva prostovoljni prispevek po svoji presoji. To pomeni, da cenika in prodaje v običajnem pomenu besede nimamo. Naše delovanje temelji na prostovoljnih prispevkih obiskovalcev, s katerimi pokrivamo stroške nabave, priprave napitkov, vzdrževanja prostora in druge operativne stroške. Takšen način delovanja odraža naše zaupanje v Boga in hkrati daje vsakemu obiskovalcu svobodo, da prispeva toliko, kot sam želi in zmore.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('d5f6c418-b266-41bc-917b-b7f5767413cc', '7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'simple_text_block', 'How to contribute', 30, true, 'How can you contribute?', 'Kako lahko prispevate?', 'Because we don''t sell drinks in the usual way, we cannot issue a receipt for the drinks served. If you enjoyed your time with us and would like to support our work, we invite you to leave a voluntary contribution. Every gift, no matter the size, helps keep this space open for everyone looking for good coffee, a kind conversation or simply a place to rest. We are grateful for every contribution — it allows this special mission to continue.', 'Ker pijač ne prodajamo na običajen način, vam za postrežene napitke ne moremo izdati računa. Če vam je bilo pri nas prijetno in želite podpreti naše delovanje, vas vabimo k prostovoljnemu prispevku. Vsak dar, ne glede na velikost, pomaga ohranjati prostor odprt za vse, ki iščejo dobro kavo, prijeten pogovor ali preprosto kraj za oddih. Hvaležni smo za vsak prispevek, saj nam omogoča nadaljnje delovanje tega posebnega poslanstva.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('a485be65-ab18-4df5-a0d9-c3cfd9bd0da0', '7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'simple_text_block', 'Helping others', 40, true, 'Together we help others too', 'Skupaj pomagamo tudi drugim', 'Part of the contributions we receive also goes to help people in need. We dedicate 10% of all donations to the Ebenezer orphanage in Ethiopia. We have been personally connected to the founders of the orphanage since 2007, regularly visit it, and closely follow its work with the children. In this way, every visit to our café indirectly supports those who need help the most.', 'Del prejetih prispevkov namenjamo tudi pomoči ljudem v stiski. 10 % vseh prejetih donacij namenjamo sirotišnici Ebenezer v Etiopiji. Z ustanovitelji sirotišnice smo osebno povezani že od leta 2007, sirotišnico redno obiskujemo in od blizu spremljamo njeno delo med otroki. Tako vsak obisk naše kavarne posredno prispeva tudi k podpori tistim, ki pomoč najbolj potrebujejo.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('67771329-37ed-4a7b-a5e7-d73321b7de5f', '7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'simple_text_block', 'Name', 50, true, 'Why the name "ŽIVA VERA"?', 'Zakaj ime »ŽIVA VERA«?', 'The name ŽIVA VERA ("Living Faith") expresses something we want to live every day. We believe in Jesus Christ, who was crucified, died and rose from the dead. We don''t see Him only as a historical figure, but as a living Saviour who still changes lives today. But ŽIVA VERA isn''t just a name or a religious phrase. It''s an invitation to genuine relationships, honesty, service and care for others — values that everyone serving in this café strives to live by.', 'Ime ŽIVA VERA izraža nekaj, kar želimo živeti vsak dan. Verujemo v Jezusa Kristusa, ki je bil križan, umrl in vstal od mrtvih. Zanj ne verjamemo le kot v zgodovinsko osebnost, ampak kot v živega Odrešenika, ki tudi danes spreminja življenja. Vendar ŽIVA VERA ni le ime ali verski izraz. Je povabilo k pristnim odnosom, iskrenosti, služenju in skrbi za druge. To so vrednote, ki jih želimo živeti vsi, ki strežemo v tej kavarni.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('b7de30e0-c045-4716-91c2-6000da1b2a92', '7a8cebf8-7467-4ca3-bb04-2de0b05a0733', 'simple_text_block', 'More than a café', 60, true, 'More than just a café', 'Več kot le kavarna', 'ŽIVA VERA is not only a place for coffee. It''s a place to meet. A place to talk. A place to take your time. A place where you are welcome exactly as you are. We would be glad to see you and to serve you with a smile, a good coffee and sincere hospitality.', 'ŽIVA VERA ni le prostor za kavo. Je prostor srečevanja. Prostor pogovora. Prostor, kjer si lahko vzamete čas. Prostor, kjer ste dobrodošli točno takšni, kot ste. Veseli bomo vašega obiska in priložnosti, da vas postrežemo z nasmehom, dobro kavo in pristnim gostoljubjem.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('5a75bc5f-ac05-454b-9c37-39d30b51dc4f', 'b9f13a7f-2bc7-47c8-8a2b-c381f6493f2a', 'simple_text_block', 'Intro', 10, true, 'Visit & Contribute', 'Obisk in prispevek', 'We''d love to meet you. Stop in for a coffee, stay for a conversation, and contribute what feels right — there''s no price list.', 'Veseli bomo vašega obiska. Pridite na kavo, ostanite na pogovoru in prispevajte po svoji presoji — cenika ni.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('4931a8da-2d79-4d89-b1c5-97895396b51b', 'b9f13a7f-2bc7-47c8-8a2b-c381f6493f2a', 'call_to_action', 'How to contribute', 20, true, 'How to contribute', 'Kako prispevati', 'Since we don''t sell drinks in the usual way, we can''t issue receipts. If you''d like to support our mission, you can leave a voluntary contribution in person at the café, or contact us about other ways to give. 10% of all contributions go to the Ebenezer orphanage in Ethiopia.', 'Ker pijač ne prodajamo na običajen način, ne moremo izdati računov. Če želite podpreti naše poslanstvo, lahko prostovoljni prispevek pustite osebno v kavarni ali se obrnete na nas za druge možnosti. 10 % vseh prispevkov gre sirotišnici Ebenezer v Etiopiji.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('e37fd3c8-04a0-414b-9049-1fc82fe1cceb', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Intro', 10, true, 'Hospitality and Service Policy', 'Politika gostoljubnosti in postrežbe', 'ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje. Our work is built on volunteer effort, the voluntary contributions of our guests, and the desire to create a warm, safe and respectful space for everyone.', 'ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Krščanske cerkve Kalvarija. Naše delovanje temelji na prostovoljnem delu, prostovoljnih prispevkih obiskovalcev ter želji ustvarjati prijeten, varen in spoštljiv prostor za vse ljudi.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('3d503196-8c02-40bc-b774-467bc0a7c985', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Welcome', 20, true, null, null, 'We want to welcome every guest with openness, kindness and hospitality. We believe that even a simple cup of coffee and a sincere conversation can strengthen our community and create a place where people feel accepted and respected.', 'Vsakega obiskovalca želimo sprejeti z odprtostjo, prijaznostjo in gostoljubnostjo. Verjamemo, da lahko že preprosta skodelica kave in iskren pogovor prispevata k boljši skupnosti ter ustvarjata prostor, kjer se ljudje počutijo sprejete in spoštovane.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('992bb3ce-7827-44a1-9f71-c218df8741ce', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Nature of our work', 30, true, null, null, 'Because our work is not a typical commercial hospitality business, but a non-profit mission supported by the community, serving drinks and other offerings is not an individual right to service — it is an expression of our hospitality and service to the community.', 'Ker naše delovanje ne temelji na običajnem komercialnem gostinstvu, temveč na neprofitnem poslanstvu in prostovoljni podpori skupnosti, postrežba napitkov in drugih storitev ne predstavlja pravice posameznika do storitve, temveč izraz naše gostoljubnosti in služenja skupnosti.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('17caf0f7-887e-4731-84b8-e62f9f1dfe89', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Discretion', 40, true, null, null, 'Out of responsibility to our volunteers, guests, donors and to the mission itself, we reserve the right, at our own discretion, to refuse, limit or stop service to any individual whose behavior is, in our judgment, not in line with the purpose, values and healthy operation of our café.', 'Zaradi odgovornosti do naših prostovoljcev, obiskovalcev, donatorjev in samega poslanstva si pridržujemo pravico, da po lastni presoji zavrnemo, omejimo ali prekinemo postrežbo posamezniku, kadar ocenimo, da njegovo ravnanje ni skladno z namenom, vrednotami ali dobrim delovanjem naše kavarne.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('4bc41bd3-95ff-4de0-bcf7-f795e52aee5a', '08745797-ac63-4772-b814-55efdb0b02dc', 'policy_section', 'Behavior that may limit service', 50, true, null, null, 'Such situations may include, among others:', 'Takšni primeri lahko med drugim vključujejo:', 'center', '[{"text_en": "disrespectful, offensive or aggressive communication;", "text_sl": "nespoštljivo, žaljivo ali agresivno komunikacijo;"}, {"text_en": "harassment of volunteers, guests or other people;", "text_sl": "nadlegovanje prostovoljcev, obiskovalcev ali drugih oseb;"}, {"text_en": "disruptive behavior that negatively affects the atmosphere of the space;", "text_sl": "moteče vedenje, ki negativno vpliva na vzdušje v prostoru;"}, {"text_en": "deliberate exploitation of the voluntary contribution system;", "text_sl": "namerno izkoriščanje sistema prostovoljnih prispevkov;"}, {"text_en": "repeated behavior that shows disregard for the voluntary nature of our work;", "text_sl": "ponavljajoče ravnanje, ki kaže na nespoštovanje do prostovoljnega značaja našega delovanja;"}, {"text_en": "any other actions that, in the reasonable judgment of the team or volunteers, harm the community, reputation or mission of the café.", "text_sl": "druga dejanja, ki po razumni presoji vodstva ali prostovoljcev škodujejo skupnosti, ugledu ali poslanstvu kavarne."}]'::jsonb, '[]'::jsonb),
  ('dffdfeb0-ba6f-481a-8ba6-48ca91dd4f2e', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'After bullets', 60, true, null, null, 'We especially want to emphasize that the voluntary contribution system is built on mutual trust, respect and responsibility. It exists to keep this space open and accessible to everyone — not to be deliberately taken advantage of. If we find that someone is knowingly and repeatedly abusing the system, we reserve the right to no longer offer them service.', 'Posebej želimo poudariti, da je sistem prostovoljnih prispevkov zasnovan na medsebojnem zaupanju, spoštovanju in odgovornosti. Namenjen je temu, da omogoča dostopen in odprt prostor za vse, ne pa temu, da bi ga posamezniki namerno izkoriščali v svojo korist. Če ugotovimo, da nekdo sistem zavestno in ponavljajoče zlorablja, si pridržujemo pravico, da mu nadaljnje postrežbe ne omogočimo.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('f7817738-341f-4bb5-bd2c-520ff49ae286', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Trust & fairness', 70, true, null, null, 'In every decision we strive to act fairly, respectfully and without discrimination. Our decisions are never connected to nationality, gender, age, social status, religious belief or any other personal circumstance — only to behavior and to how a person treats other guests, volunteers and the mission of the café.', 'Pri vseh odločitvah si prizadevamo ravnati pošteno, spoštljivo in brez diskriminacije. Naše odločitve niso povezane z narodnostjo, spolom, starostjo, socialnim položajem, verskim prepričanjem ali drugimi osebnimi okoliščinami posameznika, temveč izključno z njegovim vedenjem in odnosom do drugih ljudi, prostovoljcev ter samega poslanstva kavarne.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('4760de9e-2d39-41f6-b751-4ca2319f5bdb', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Goal', 80, true, null, null, 'Our goal is not to exclude people, but to protect a space in which guests and volunteers can feel welcome, respected and safe. We believe such an environment can only be preserved through mutual respect and a responsible attitude from everyone who shapes this community.', 'Naš cilj ni izključevanje ljudi, temveč varovanje prostora, v katerem se lahko obiskovalci in prostovoljci počutijo dobrodošle, spoštovane in varne. Verjamemo, da je takšno okolje mogoče ohranjati le ob medsebojnem spoštovanju in odgovornem odnosu vseh, ki soustvarjamo to skupnost.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('e56443c1-121c-473e-87ff-4d0edb425c2f', '08745797-ac63-4772-b814-55efdb0b02dc', 'simple_text_block', 'Thanks', 90, true, null, null, 'Thank you for your understanding, your support and your respect for the values on which ŽIVA VERA is built.', 'Zahvaljujemo se vam za razumevanje, podporo in spoštovanje vrednot, na katerih temelji delovanje kavarne ŽIVA VERA.', 'center', '[]'::jsonb, '[]'::jsonb),
  ('fd94d3e5-131e-45b7-b669-bc9c1ebeb6b3', 'f5f6acaf-6cb8-4683-aa47-de3c61304ce6', 'quote_or_highlight', 'Reflection', 20, true, 'A short reflection', 'Kratka misel', '“Come to me, all you who are weary and burdened, and I will give you rest.” — Matthew 11:28', '»Pridite k meni vsi, ki ste utrujeni in obteženi, in jaz vam bom dal počitek.« — Matej 11,28', 'default', '[]'::jsonb, '[]'::jsonb),
  ('5f8e9af8-eda6-4c0a-8b73-94a716531f82', 'f5f6acaf-6cb8-4683-aa47-de3c61304ce6', 'policy_section', 'How it works', 30, true, 'How it works', 'Kako poteka', 'Submitting a prayer request is simple and safe:', 'Pošiljanje molitvene prošnje je preprosto in varno:', 'default', '[{"text_en": "Write your prayer request or spiritual question in the form below.", "text_sl": "V spodnji obrazec zapišite svojo molitveno prošnjo ali duhovno vprašanje."}, {"text_en": "Choose whether it stays private with our team or may be shared on the public prayer wall after review.", "text_sl": "Izberite, ali ostane zasebna samo za našo ekipo ali se lahko po pregledu deli na javnem molitvenem zidu."}, {"text_en": "Our pastoral team reads every request and prays for it personally.", "text_sl": "Naša pastoralna ekipa prebere vsako prošnjo in zanjo osebno moli."}]'::jsonb, '[]'::jsonb),
  ('58f52007-92de-4d23-b8a4-f0f5ef15adb7', 'f5f6acaf-6cb8-4683-aa47-de3c61304ce6', 'simple_text_block', 'Privacy', 40, true, 'Your privacy matters', 'Vaša zasebnost je pomembna', 'Nothing you submit is ever shared publicly without your explicit consent and review by our team. Private requests are only seen by trusted pastoral staff. You can submit anonymously at any time.', 'Nič od tega, kar pošljete, ni nikoli javno deljeno brez vašega izrecnega soglasja in pregleda naše ekipe. Zasebne prošnje vidi le zaupanja vredno pastoralno osebje. Kadar koli lahko pošljete anonimno.', 'default', '[]'::jsonb, '[]'::jsonb),
  ('3078974b-fc6c-4484-bd41-774398c0398c', '5e99f6cf-e10d-4120-8a4b-773d396099a3', 'alternating_content', 'Story', 10, true, 'A partnership that began with a friendship', 'Partnerstvo, ki se je začelo s prijateljstvom', null, null, 'default', '[]'::jsonb, '[{"body_en": "Our pastors Aleš and Whitney Lajlar first met Argaw and Rachel Ayele at Calvary Chapel Bible College Europe in Hungary in 2005. They were students together, praying through the same calling and dreaming about what God might do next. Years later, those late-night conversations are still bearing fruit on two continents.", "body_sl": "Naša pastorja Aleš in Whitney Lajlar sta Argawa in Rachel Ayele prvič srečala leta 2005 na biblijski šoli Calvary Chapel Bible College Europe na Madžarskem. Skupaj so študirali, molili in se spraševali, kam jih bo Bog peljal naprej. Tisti pogovori v poznih večernih urah danes še vedno rojevajo sad — na dveh celinah.", "variant": "left", "title_en": "Hungary, 2005 — where it began", "title_sl": "Madžarska, 2005 — kjer se je vse začelo"}, {"body_en": "Argaw and Rachel returned to Ethiopia as missionaries and, in January 2010, opened the Ebenezer Grace Children''s Home in Hawassa. What started as one home for a small group of children grew over the years into a wider ministry — caring for vulnerable children, supporting mothers, and walking with families in the surrounding community.", "body_sl": "Argaw in Rachel sta se kot misijonarja vrnila v Etiopijo in januarja 2010 v Havasi odprla otroški dom Ebenezer Grace. Iz enega doma za majhno skupino otrok je sčasoma zrasla širša služba — skrb za ranljive otroke, podpora mamam in spremljanje družin v okoliški skupnosti.", "variant": "right", "title_en": "Ethiopia, 2010 — Ebenezer Grace is founded", "title_sl": "Etiopija, 2010 — ustanovitev doma Ebenezer Grace"}, {"body_en": "Because of that friendship from Hungary, our church was part of the Ebenezer Grace story from day one. Over the years we have sent mission teams to Hawassa, supported the work in prayer and practical ways, and stayed close to the family. One of our members, Erik Čižič, lived with the Ayele family for six months, serving both the household and the children''s home.", "body_sl": "Zaradi tega prijateljstva z Madžarske je bila naša cerkev del zgodbe Ebenezer Grace že od prvega dne. Skozi leta smo v Havaso pošiljali misijonske ekipe, službo podpirali v molitvi in na praktične načine ter ostali blizu družini. Eden od naših članov, Erik Čižič, je šest mesecev živel pri družini Ayele in služil tako družini kot otroškemu domu.", "variant": "left", "title_en": "Our church walks with them — since the very beginning", "title_sl": "Naša cerkev hodi z njimi — od samega začetka"}, {"body_en": "ŽIVA VERA carries this partnership forward in a new way. Ten percent of everything the café receives goes directly to support the work of Ebenezer Grace and ESMA in Ethiopia. Every cup shared here is quietly connected to a child, a mother, a family on the other side of the world.", "body_sl": "ŽIVA VERA to partnerstvo nadaljuje na nov način. Deset odstotkov vsega, kar kavarna prejme, gre neposredno za podporo dela Ebenezer Grace in ESMA v Etiopiji. Vsaka skodelica, deljena tukaj, je tiho povezana z otrokom, mamo, družino na drugi strani sveta.", "variant": "right", "title_en": "ŽIVA VERA — coffee with a shared purpose", "title_sl": "ŽIVA VERA — kava s skupnim namenom"}]'::jsonb),
  ('eb9c6e84-ba08-43bb-993b-232bc7d5bc4d', '5e99f6cf-e10d-4120-8a4b-773d396099a3', 'card_grid', 'How we walk together', 20, true, 'How we walk together', 'Kako hodimo skupaj', 'Our partnership with Ebenezer Grace is not a transaction. It is a long, ordinary friendship that shows up in four simple ways.', 'Naše partnerstvo z Ebenezer Grace ni transakcija. Je dolgo, vsakdanje prijateljstvo, ki se kaže na štiri preproste načine.', '4', '[]'::jsonb, '[{"icon": "🤝", "body_en": "We have known Argaw and Rachel since 2005. This is family ministry, not a distant cause.", "body_sl": "Argawa in Rachel poznamo od leta 2005. To je družinska služba, ne oddaljena stvar.", "title_en": "Personal relationship", "title_sl": "Osebni odnos"}, {"icon": "🙏", "body_en": "We pray for the children, the staff, and the Ayele family regularly — by name, in our gatherings and at home.", "body_sl": "Redno molimo za otroke, sodelavce in družino Ayele — po imenih, na srečanjih in doma.", "title_en": "Prayer", "title_sl": "Molitev"}, {"icon": "✈️", "body_en": "Mission trips, longer stays, and visits keep the relationship real. Erik Čižič lived with the family in Hawassa for six months.", "body_sl": "Misijonska potovanja, daljša bivanja in obiski ohranjajo odnos resničen. Erik Čižič je šest mesecev živel pri družini v Havasi.", "title_en": "Presence", "title_sl": "Prisotnost"}, {"icon": "☕", "body_en": "ŽIVA VERA gives 10% of its proceeds to Ebenezer Grace and ESMA, alongside the ongoing support of our church.", "body_sl": "ŽIVA VERA namenja 10 % svojih prihodkov za Ebenezer Grace in ESMA, poleg stalne podpore naše cerkve.", "title_en": "Practical support", "title_sl": "Praktična podpora"}]'::jsonb),
  ('0e3aa5cb-f86c-4a8b-932c-f049672a0ba1', '5e99f6cf-e10d-4120-8a4b-773d396099a3', 'image_gallery', 'Moments from Ethiopia', 30, true, 'Moments from Hawassa', 'Trenutki iz Havase', 'A small window into the everyday life of Ebenezer Grace — children, caregivers, and friends we have come to know over the years.', 'Majhno okno v vsakdanje življenje Ebenezer Grace — otroci, skrbniki in prijatelji, ki smo jih skozi leta spoznali.', 'default', '[]'::jsonb, '[{"caption_en": "The Ebenezer Grace Children''s Home in Hawassa.", "caption_sl": "Otroški dom Ebenezer Grace v Havasi."}, {"caption_en": "Argaw and Rachel Ayele with members of their team.", "caption_sl": "Argaw in Rachel Ayele s sodelavci."}, {"caption_en": "A mission team from our church visiting Ethiopia.", "caption_sl": "Misijonska ekipa iz naše cerkve na obisku v Etiopiji."}, {"caption_en": "Everyday life at the home: meals, school, play.", "caption_sl": "Vsakdan v domu: obroki, šola, igra."}, {"caption_en": "Friends and caregivers who carry the work day by day.", "caption_sl": "Prijatelji in skrbniki, ki delo nosijo iz dneva v dan."}, {"caption_en": "Hawassa — the city we have come to love.", "caption_sl": "Havasa — mesto, ki smo ga vzljubili."}]'::jsonb),
  ('27b54204-532d-4183-9d4e-2f15d3ed75a4', '5e99f6cf-e10d-4120-8a4b-773d396099a3', 'testimonial', 'Voices', 50, true, 'Stories from the partnership', 'Zgodbe iz partnerstva', null, null, 'default', '[]'::jsonb, '[{"name": "Aleš & Whitney Lajlar", "role_en": "Pastors, ŽIVA VERA", "role_sl": "Pastorja, ŽIVA VERA", "quote_en": "It started as a friendship at Bible college in Hungary in 2005. None of us imagined then that twenty years later we would still be walking together — between Slovenia and Ethiopia, between a children''s home in Hawassa and a small café in our city.", "quote_sl": "Začelo se je kot prijateljstvo na biblijski šoli na Madžarskem leta 2005. Nihče od nas si takrat ni predstavljal, da bomo dvajset let pozneje še vedno hodili skupaj — med Slovenijo in Etiopijo, med otroškim domom v Havasi in majhno kavarno v našem mestu."}, {"name": "Erik Čižič", "role_en": "Church member, lived in Hawassa for six months", "role_sl": "Član cerkve, šest mesecev bival v Havasi", "quote_en": "Living with the Ayele family for six months changed how I understand mission. It is less about going somewhere impressive and more about being present, helping with what needs to be done, and letting a family''s daily life teach you what faithfulness looks like.", "quote_sl": "Šest mesecev pri družini Ayele je spremenilo, kako razumem misijon. Manj gre za to, da greš nekam impresivnega, in bolj za to, da si prisoten, pomagaš, kar je treba, in pustiš, da te vsakdan družine uči, kako izgleda zvestoba."}, {"name": "ŽIVA VERA", "role_en": "Our café and community", "role_sl": "Naša kavarna in skupnost", "quote_en": "For our community, Ebenezer Grace is not a project we support — it is people we know. That is why ten percent from every cup at ŽIVA VERA quietly travels to Ethiopia. It is one of the most natural things we do.", "quote_sl": "Za našo skupnost Ebenezer Grace ni projekt, ki ga podpiramo — so ljudje, ki jih poznamo. Zato deset odstotkov od vsake skodelice v ŽIVI VERI tiho potuje v Etiopijo. To je ena najbolj naravnih stvari, ki jih počnemo."}]'::jsonb),
  ('c798f8c0-b128-49f9-87a6-afc6fde0d7a5', '5e99f6cf-e10d-4120-8a4b-773d396099a3', 'faq', 'Common questions', 60, true, 'Common questions', 'Pogosta vprašanja', null, null, 'default', '[]'::jsonb, '[{"a_en": "Ebenezer Grace is a children''s home and ministry in Hawassa, Ethiopia, founded by Argaw and Rachel Ayele in January 2010. It cares for vulnerable children and has grown over the years into a wider work — including additional homes and family-focused care — under the umbrella of ESMA (Ethiopia).", "a_sl": "Ebenezer Grace je otroški dom in služba v Havasi v Etiopiji, ki sta jo januarja 2010 ustanovila Argaw in Rachel Ayele. Skrbi za ranljive otroke in se je skozi leta razrasla v širše delo — vključno z dodatnimi domovi in skrbjo za družine — v okviru organizacije ESMA (Etiopija).", "q_en": "What is Ebenezer Grace?", "q_sl": "Kaj je Ebenezer Grace?"}, {"a_en": "Our pastors Aleš and Whitney Lajlar have known Argaw and Rachel since 2005, when they studied together at Calvary Chapel Bible College Europe in Hungary. Our church has been part of the Ebenezer Grace story since it began in 2010, through prayer, mission trips, and ongoing relationship. ŽIVA VERA carries that connection into everyday life in our city.", "a_sl": "Naša pastorja Aleš in Whitney Lajlar Argawa in Rachel poznata od leta 2005, ko so skupaj študirali na biblijski šoli Calvary Chapel Bible College Europe na Madžarskem. Naša cerkev je del zgodbe Ebenezer Grace od njenih začetkov leta 2010 — skozi molitev, misijonska potovanja in nenehni odnos. ŽIVA VERA to povezavo prinaša v vsakdanje življenje v našem mestu.", "q_en": "How are ŽIVA VERA and our church connected to this ministry?", "q_sl": "Kako sta ŽIVA VERA in naša cerkev povezani s to službo?"}, {"a_en": "Because this partnership is part of who we are. ŽIVA VERA exists to be a place of welcome and faith here, and to quietly extend that welcome to children and families in Hawassa. Ten percent is a simple, honest commitment that lets every guest take part — even if they never hear about it.", "a_sl": "Ker je to partnerstvo del tega, kar smo. ŽIVA VERA obstaja, da je prostor dobrodošlice in vere tukaj, in da to dobrodošlico tiho razširi tudi na otroke in družine v Havasi. Deset odstotkov je preprosta, iskrena zaveza, ki omogoča, da je vsak gost del tega — tudi če za to nikoli ne sliši.", "q_en": "Why does the café give 10% of its proceeds?", "q_sl": "Zakaj kavarna namenja 10 % svojih prihodkov?"}, {"a_en": "Yes. The simplest way is to come to ŽIVA VERA — every visit already supports the work. You can also pray for the children, the staff, and the Ayele family, or talk to us about more direct ways to give or get involved.", "a_sl": "Da. Najpreprostejši način je, da prideš v ŽIVO VERO — vsak obisk že podpira delo. Lahko tudi moliš za otroke, sodelavce in družino Ayele ali se z nami pogovoriš o bolj neposrednih načinih darovanja in vključevanja.", "q_en": "Can I support this work through prayer or contribution?", "q_sl": "Ali lahko to delo podprem z molitvijo ali prispevkom?"}, {"a_en": "Since 2005 — twenty years of friendship, before the children''s home even existed. That is why this is more than support at a distance; it is a relationship we have been part of from the very first chapter.", "a_sl": "Od leta 2005 — dvajset let prijateljstva, še preden je obstajal otroški dom. Zato to ni le podpora na daljavo; je odnos, katerega del smo bili že od prvega poglavja.", "q_en": "How long have we known the family?", "q_sl": "Kako dolgo poznamo družino?"}]'::jsonb),
  ('54d38731-3e4c-4c83-8180-070c3e224c76', '5e99f6cf-e10d-4120-8a4b-773d396099a3', 'video', 'Coffee with purpose', 70, true, 'Meet Ebenezer Grace', 'Spoznaj Ebenezer Grace', 'A short look at the home, the team, and the work in Hawassa. To learn more, visit esmafrica.org.', 'Kratek pogled v dom, ekipo in delo v Havasi. Za več obišči esmafrica.org.', 'default', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
