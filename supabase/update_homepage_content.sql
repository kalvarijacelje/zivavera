-- ====================================================================
-- ŽIVA VERA: HOMEPAGE REDESIGN CONTENT SCRIPT
-- Run this in your Supabase SQL Editor to populate the warm, faith-driven homepage
-- ====================================================================

-- 1. DELETE EXISTING HOMEPAGE SECTIONS
DELETE FROM public.homepage_sections;

-- 2. INSERT ENRICHED FAITH & COMMUNITY HOMEPAGE SECTIONS
INSERT INTO public.homepage_sections (
  id,
  section_type,
  internal_label,
  sort_order,
  published,
  eyebrow_sl,
  eyebrow_en,
  title_sl,
  title_en,
  subtitle_sl,
  subtitle_en,
  body_sl,
  body_en,
  image_path,
  default_image_key,
  image_alignment,
  button_text_sl,
  button_text_en,
  button_link,
  secondary_button_text_sl,
  secondary_button_text_en,
  secondary_button_link,
  featured_menu_item_ids,
  featured_event_ids,
  value_cards
)
VALUES
  -- 1. HERO BANNER
  (
    'f5968898-8caf-4977-8f33-7ca715fc51bd',
    'hero',
    'Hero Banner',
    10,
    true,
    'Prva krščanska neprofitna kavarna v Sloveniji',
    'Slovenia''s first Christian non-profit coffee shop',
    'Dobra kava. Pristen pogovor. Iskrena gostoljubnost.',
    'Good coffee. Real conversation. Honest hospitality.',
    'Kavarna, ki deluje po veri in brez cenika. Pridite na skodelico odlične kave Barcaffè, vzemite si čas in prispevajte po svojem srcu.',
    'A café that runs on faith and generosity — no price list. Enjoy exceptional Barcaffè coffee, take your time, and contribute what feels right.',
    null,
    null,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    'hero',
    'left',
    'Oglejte si ponudbo',
    'See the menu',
    '/menu',
    'Načrtujte obisk',
    'Plan your visit',
    '/visit',
    '{}',
    '{}',
    '[]'::jsonb
  ),

  -- 2. FOUR CORE VALUE PILLARS
  (
    'c4f603ef-9406-4850-a200-727a9c9ec014',
    'values_grid',
    'Four Core Pillars',
    20,
    true,
    null,
    null,
    'Kaj nas dela drugačne',
    'What makes us different',
    null,
    null,
    null,
    null,
    null,
    null,
    'left',
    null,
    null,
    null,
    null,
    null,
    null,
    '{}',
    '{}',
    '[
      {
        "icon": "Users",
        "title_sl": "Vsi so dobrodošli",
        "title_en": "All are welcome",
        "body_sl": "Ne glede na vašo zgodbo, prepričanja ali ozadje — pri nas ste vedno sprejeti točno takšni, kot ste, brez obsojanja.",
        "body_en": "Whatever your story, beliefs, or background — you are always welcomed here with warmth, safety, and no judgment."
      },
      {
        "icon": "Coffee",
        "title_sl": "Kava z namenom",
        "title_en": "Coffee with a purpose",
        "body_sl": "Cenika ni. Uživajte v vrhunski kavi Barcaffè in prispevajte prostovoljno, kolikor zmorete in želite.",
        "body_en": "No fixed prices. Savor exceptional coffee and contribute freely according to your heart and ability."
      },
      {
        "icon": "HandHeart",
        "title_sl": "Ukoreninjeni v veri",
        "title_en": "Rooted in faith",
        "body_sl": "Smo poslanstvo Krščanske cerkve Kalvarija Celje. Verujemo v živega Boga in Njegovo ljubezen delimo skozi vsakodnevno služenje.",
        "body_en": "An outreach of Calvary Chapel Celje. We believe in a living Saviour and share His love through selfless everyday hospitality."
      },
      {
        "icon": "Heart",
        "title_sl": "Skupaj pomagamo",
        "title_en": "Helping others",
        "body_sl": "Z vsako skodelico pomagate ranljivim otrokom — 10 % vseh prispevkov neposredno podpira sirotišnico Ebenezer v Etiopiji.",
        "body_en": "With every cup you support children in need — 10% of all contributions directly support the Ebenezer home in Ethiopia."
      }
    ]'::jsonb
  ),

  -- 3. MENU TEASER (TEXT WITH IMAGE)
  (
    'fee457cb-02b1-46db-acc2-61c01cf0a526',
    'text_with_image',
    'Menu Showcase',
    30,
    true,
    'Kava z ljubeznijo',
    'Coffee crafted with care',
    'Z našega pulta',
    'From our counter',
    null,
    null,
    'Sveže mleti espresso Barcaffè, bogat izbor domačih zeliščnih čajev, gosta vroča čokolada in naravni sokovi — pripravljeno s skrbjo, postreženo z nasmehom.',
    'Freshly pulled Barcaffè espresso, fragrant herbal teas, luxurious hot chocolate, and fresh juices — crafted with care, served with a warm smile.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'espresso',
    'left',
    'Oglejte si celoten meni',
    'Browse the full menu',
    '/menu',
    null,
    null,
    null,
    '{}',
    '{}',
    '[]'::jsonb
  ),

  -- 4. COMMUNITY STORY (CALL TO ACTION)
  (
    '638e0e45-4df9-431e-bf33-4992772d01af',
    'call_to_action',
    'Community Haven',
    40,
    true,
    null,
    null,
    'Več kot le kavarna — prostor za skupnost',
    'More than a café — a space for community',
    null,
    null,
    'ŽIVA VERA je miren prostor sredi mestnega vrveža. Kraj za pristne pogovore, nova prijateljstva, branje dobre knjige ali trenutek počitka.',
    'ŽIVA VERA is a peaceful haven in the city. A place for genuine conversations, new friendships, good books, or a quiet moment of reflection.',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    'community',
    'left',
    'Preberite našo zgodbo',
    'Read our story',
    '/about',
    null,
    null,
    null,
    '{}',
    '{}',
    '[]'::jsonb
  ),

  -- 5. PRAYER & SPIRITUAL CORNER (CALL TO ACTION)
  (
    '99999999-0000-0000-0000-000000000005',
    'call_to_action',
    'Prayer Corner',
    50,
    true,
    null,
    null,
    'Potrebujete molitev ali miren pogovor?',
    'Need prayer or a listening ear?',
    null,
    null,
    'Naša ekipa je tukaj za vas. Oddajte anonimno molitveno prošnjo, zastavite duhovno vprašanje ali nas obiščite osebno.',
    'Our pastoral team is here for you. Submit an anonymous prayer request, ask a spiritual question, or visit us in person.',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80',
    'hero',
    'left',
    'Oddajte molitveno prošnjo',
    'Submit a prayer request',
    '/prayer',
    null,
    null,
    null,
    '{}',
    '{}',
    '[]'::jsonb
  );
