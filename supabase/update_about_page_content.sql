-- ====================================================================
-- ŽIVA VERA: ABOUT US PAGE ("Spoznajte nas") ENRICHED DESIGN & CONTENT
-- Run this in your Supabase SQL Editor to transform /about with warm photos and layouts
-- ====================================================================

-- 1. ENSURE 'about' PAGE RECORD EXISTS IN static_pages
INSERT INTO public.static_pages (
  page_key,
  is_built_in,
  internal_label,
  title_sl,
  title_en,
  show_in_navigation,
  nav_order,
  published
)
VALUES (
  'about',
  true,
  'About Us',
  'Spoznajte nas',
  'Get to know us',
  true,
  10,
  true
)
ON CONFLICT (page_key) DO UPDATE SET 
  title_sl = 'Spoznajte nas',
  title_en = 'Get to know us',
  published = true;

-- 2. DELETE OLD SECTIONS FOR 'about' PAGE
DELETE FROM public.static_page_sections 
WHERE page_id = (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1);

-- 3. INSERT ENRICHED SECTIONS WITH DYNAMIC page_id
INSERT INTO public.static_page_sections (
  page_id,
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
  layout_variant,
  button_text_sl,
  button_text_en,
  button_link
)
VALUES
  -- 1. TOP HERO BANNER WITH COVER IMAGE
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'hero',
    'About Hero Banner',
    10,
    true,
    'Zgodba in poslanstvo',
    'Our Story & Mission',
    'Kavarna, ki jo poganjata vera in ljubezen do ljudi',
    'A café powered by faith and love for people',
    'Spoznajte zgodbo in srce ŽIVE VERE — neprofitnega prostora v Celju, kjer se odlična kava Barcaffè prepleta z iskrenimi pogovori, toplim sprejemom in dobrodelnostjo za otroke v Etiopiji.',
    'Discover the story behind ŽIVA VERA — a welcoming haven in Celje where exceptional Barcaffè coffee meets heartfelt conversations, open hospitality, and direct support for children in need.',
    null,
    null,
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1600&q=80',
    'left',
    'Oglejte si našo ponudbo',
    'See our menu',
    '/menu'
  ),

  -- 2. WELCOME & STORY (TEXT WITH IMAGE - LEFT)
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'text_with_image',
    'Welcome Section',
    20,
    true,
    'Naša zgodba',
    'Our Story',
    'Dobrodošli v Živi veri',
    'Welcome to ŽIVA VERA',
    null,
    null,
    'Dobrodošli v kavarni ŽIVA VERA – prostoru, kjer se dobra kava in iskreno gostoljubje prepletata z ljubeznijo do ljudi. Smo poslanstvo v prostorih Krščanske cerkve Kalvarija v Celju.

Naš cilj ni ustvarjanje dobička, temveč ustvarjanje toplega zavetja, kjer se vsak obiskovalec počuti sprejetega, slišanega in spoštovanega, ne glede na svojo življenjsko pot.',
    'Welcome to ŽIVA VERA — a space where great coffee and honest hospitality intertwine with genuine care for people. We operate as an outreach mission within Calvary Chapel Celje.

Our aim is never profit, but creating a welcoming haven where everyone feels valued, heard, and respected regardless of their background.',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80',
    'left',
    null,
    null,
    null
  ),

  -- 3. FAITH HIGHLIGHT CARD
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'quote_or_highlight',
    'Faith Mission Highlight',
    30,
    true,
    null,
    null,
    'Kaj pomeni, da delujemo »po veri«?',
    'What does it mean to run "on faith"?',
    null,
    null,
    'ŽIVA VERA je neprofitna kavarna. Nimamo klasičnega cenika in ne prodajamo — vsak obiskovalec prispeva prostovoljni prispevek po svoji presoji. Verjamemo, da Bog skozi odprtost in velikodušnost ljudi poskrbi za vse stroške kave, mleka in delovanja prostora.',
    'ŽIVA VERA is a non-profit café. We have no fixed price list and make no commercial sales — visitors give freely according to their heart, or simply enjoy our hospitality. We believe that God provides for every operational need through generous, willing hearts.',
    null,
    'left',
    null,
    null,
    null
  ),

  -- 4. COMMUNITY GATHERING (TEXT WITH IMAGE - RIGHT)
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'text_with_image',
    'Community Section',
    40,
    true,
    'Povezovanje & Mir',
    'Connection & Peace',
    'Več kot le kavarna — prostor za skupnost',
    'More than a café — a space for community',
    null,
    null,
    'Verjamemo, da se najlepši pogovori pogosto začnejo ob skodelici kave. ŽIVA VERA je prostor za druženje, študij, branje, iskrene pogovore o veri in življenju ter kotiček miru sredi vsakodnevnega hitenja.

Vsak je dobrodošel, da se usede, sprosti in si vzame čas zase.',
    'We believe meaningful conversations often start over a good cup of coffee. ŽIVA VERA is a place for fellowship, reading, studying, heartfelt conversations about faith, and quiet peace in the middle of a busy day.

Everyone is welcome to sit, relax, and take time for themselves.',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    'right',
    null,
    null,
    null
  ),

  -- 5. EBENEZER ORPHANAGE (TEXT WITH IMAGE - LEFT)
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'text_with_image',
    'Ebenezer Section',
    50,
    true,
    'Dobrodelnost z namenom',
    'Outreach with Purpose',
    'Skupaj pomagamo: Sirotišnica Ebenezer',
    'Helping Together: Ebenezer Orphanage',
    null,
    null,
    'Z vsako popito skodelico kave pomagate otrokom v stiski. 10 % vseh zbranih prostovoljnih prispevkov neposredno namenjamo sirotišnici Ebenezer v Hawassi (Etiopija), ki jo naša skupnost osebno podpira že od leta 2007.',
    'With every cup of coffee you help vulnerable children. 10% of all voluntary contributions directly support the Ebenezer Children''s Home in Hawassa (Ethiopia), which our fellowship has personally supported since 2007.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    'left',
    'Preberite več o Ebenezerju',
    'Learn more about Ebenezer',
    '/p/ebenezer'
  ),

  -- 6. INVITING CALL TO ACTION
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'call_to_action',
    'Visit Us CTA',
    60,
    true,
    null,
    null,
    'Veselimo se vašega obiska',
    'We look forward to welcoming you',
    'Pridite sami ali v družbi prijateljev — vrata so vedno odprta.',
    'Come alone or with friends — our doors are always open.',
    'Pridite na skodelico sveže kave ali toplega čaja, spoznajte našo ekipo prostovoljcev in doživite pristno gostoljubje.',
    'Come for a cup of fresh coffee or warm tea, meet our volunteer team, and experience genuine hospitality.',
    null,
    'left',
    'Obiščite nas',
    'Plan your visit',
    '/visit'
  );
