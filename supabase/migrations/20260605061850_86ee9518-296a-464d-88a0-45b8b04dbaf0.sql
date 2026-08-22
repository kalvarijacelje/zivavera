
-- Homepage sections: structured, ordered, bilingual blocks rendered on /
CREATE TABLE public.homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL CHECK (section_type IN (
    'hero','text_with_image','call_to_action','simple_text_block',
    'featured_menu','featured_events','values_grid'
  )),
  internal_label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
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
  default_image_key text, -- 'hero' | 'community' | 'espresso' for built-in fallback
  image_alignment text NOT NULL DEFAULT 'left' CHECK (image_alignment IN ('left','right')),

  button_text_en text,
  button_text_sl text,
  button_link text,
  secondary_button_text_en text,
  secondary_button_text_sl text,
  secondary_button_link text,

  featured_menu_item_ids uuid[] NOT NULL DEFAULT '{}',
  featured_event_ids uuid[] NOT NULL DEFAULT '{}',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.homepage_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sections TO authenticated;
GRANT ALL ON public.homepage_sections TO service_role;

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published homepage sections"
  ON public.homepage_sections FOR SELECT
  USING (published = true);

CREATE POLICY "Admins manage homepage sections"
  ON public.homepage_sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER homepage_sections_set_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the four existing homepage sections so the public page keeps its current design.
INSERT INTO public.homepage_sections
  (section_type, internal_label, sort_order, published,
   eyebrow_en, eyebrow_sl, title_en, title_sl, subtitle_en, subtitle_sl,
   default_image_key,
   button_text_en, button_text_sl, button_link,
   secondary_button_text_en, secondary_button_text_sl, secondary_button_link)
VALUES (
  'hero', 'Hero', 10, true,
  'A unique café that runs on faith',
  'Edinstvena kavarna, ki deluje na veri',
  'Good coffee, real conversation, honest hospitality.',
  'Dobra kava, pristen pogovor, iskrena gostoljubnost.',
  'Welcome to ŽIVA VERA — Slovenia''s first Christian non-profit coffee shop. There is no price list. Stay, share, and contribute what feels right.',
  'Dobrodošli v ŽIVI VERI — prvi krščanski neprofitni kavarni v Sloveniji. Cenika ni. Ostanite, delite in prispevajte, kolikor čutite.',
  'hero',
  'See the menu','Oglejte si meni','/menu',
  'Plan your visit','Načrtujte obisk','/visit'
);

INSERT INTO public.homepage_sections
  (section_type, internal_label, sort_order, published, title_en, title_sl)
VALUES (
  'values_grid', 'What makes us different', 20, true,
  'What makes us different',
  'Kaj nas dela drugačne'
);

INSERT INTO public.homepage_sections
  (section_type, internal_label, sort_order, published,
   eyebrow_en, eyebrow_sl, title_en, title_sl, body_en, body_sl,
   default_image_key, image_alignment,
   button_text_en, button_text_sl, button_link)
VALUES (
  'text_with_image', 'Menu teaser', 30, true,
  'Coffee by Barcaffè','Kava Barcaffè',
  'From our counter','Z našega pulta',
  'Espresso drinks, teas, hot chocolate, fresh juices and a few sweet things — prepared with care, served with a smile.',
  'Espresso napitki, čaji, vroča čokolada, sveži sokovi in nekaj sladkih dobrot — pripravljeno s skrbjo, postreženo z nasmehom.',
  'espresso','left',
  'Browse the full menu','Oglejte si celoten meni','/menu'
);

INSERT INTO public.homepage_sections
  (section_type, internal_label, sort_order, published,
   title_en, title_sl, body_en, body_sl,
   default_image_key,
   button_text_en, button_text_sl, button_link)
VALUES (
  'call_to_action', 'Community', 40, true,
  'More than a café','Več kot kavarna',
  'ŽIVA VERA is a place to meet, talk, and take your time. A place where you''re welcome exactly as you are.',
  'ŽIVA VERA je prostor za srečanja, pogovore in mirne trenutke. Prostor, kjer ste dobrodošli točno takšni, kot ste.',
  'community',
  'Read our story','Preberite našo zgodbo','/about'
);
