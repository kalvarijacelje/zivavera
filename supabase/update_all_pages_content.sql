-- ====================================================================
-- ŽIVA VERA: UNIFIED CONTENT & SECTIONS FOR ALL 5 STATIC PAGES
-- 100% Complete Original Text + Full-Bleed Ambient Hero Headers
-- ====================================================================

-- 1. ENSURE ALL 5 STATIC PAGES EXIST
INSERT INTO public.static_pages (page_key, internal_label, title_sl, title_en, show_in_navigation, nav_order, published)
VALUES
  ('about', 'About Us', 'Spoznajte nas', 'Get to know us', true, 10, true),
  ('ebenezer', 'Ebenezer Grace', 'Ebenezer Grace', 'Ebenezer Grace', true, 20, true),
  ('hospitality', 'Hospitality Policy', 'Politika gostoljubnosti', 'Hospitality Policy', true, 30, true),
  ('visit', 'Visit & Contribute', 'Obisk in prispevek', 'Visit & Contribution', true, 40, true),
  ('prayer', 'Prayer & Reflection', 'Molitev in razmišljanje', 'Prayer & Reflection', true, 50, true)
ON CONFLICT (page_key) DO UPDATE SET
  title_sl = EXCLUDED.title_sl,
  title_en = EXCLUDED.title_en,
  published = true;

-- 2. CLEAR PREVIOUS SECTIONS FOR THESE 5 PAGES
DELETE FROM public.static_page_sections 
WHERE page_id IN (
  SELECT id FROM public.static_pages 
  WHERE page_key IN ('about', 'ebenezer', 'hospitality', 'visit', 'prayer')
);

-- ====================================================================
-- 3. ABOUT US SECTIONS (/about)
-- ====================================================================
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  body_sl, body_en, image_path, layout_variant, button_text_sl, button_text_en, button_link, bullets, items
) VALUES
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'hero', 'About Hero', 10, true,
    $$Zgodba in poslanstvo$$, $$Our Story & Mission$$,
    $$Kavarna, ki jo poganjata vera in ljubezen do ljudi$$, $$A café powered by faith and love for people$$,
    $$Spoznajte zgodbo in srce ŽIVE VERE — neprofitnega prostora v Celju, kjer se odlična kava Barcaffè prepleta z iskrenimi pogovori, toplim sprejemom in dobrodelnostjo za otroke v Etiopiji.$$,
    $$Discover the story behind ŽIVA VERA — a welcoming haven in Celje where exceptional Barcaffè coffee meets heartfelt conversations, open hospitality, and direct support for children in need.$$,
    null, null,
    $$https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80$$,
    'left',
    $$Oglejte si našo ponudbo →$$, $$See our menu →$$, '/menu',
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'text_with_image', 'Welcome Section', 20, true,
    $$Naša zgodba$$, $$Our Story$$,
    $$Dobrodošli v Živi veri$$, $$Welcome to ŽIVA VERA$$,
    null, null,
    $$Dobrodošli v kavarni ŽIVA VERA – prostoru, kjer se dobra kava in iskreno gostoljubje prepletata z ljubeznijo do ljudi. Smo poslanstvo v prostorih Krščanske cerkve Kalvarija v Celju.

Naš cilj ni ustvarjanje dobička, temveč ustvarjanje toplega zavetja, kjer se vsak obiskovalec počuti sprejetega, slišanega in spoštovanega, ne glede na svojo življenjsko pot.$$,
    $$Welcome to ŽIVA VERA — a space where great coffee and honest hospitality intertwine with genuine care for people. We operate as an outreach mission within Calvary Chapel Celje.

Our aim is never profit, but creating a welcoming haven where everyone feels valued, heard, and respected regardless of their background.$$,
    $$https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80$$,
    'left', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'quote_or_highlight', 'Faith Mission Highlight', 30, true,
    null, null,
    $$Kaj pomeni, da delujemo »po veri«?$$, $$What does it mean to run on faith?$$,
    null, null,
    $$ŽIVA VERA je neprofitna kavarna. Nimamo klasičnega cenika in ne prodajamo — vsak obiskovalec prispeva prostovoljni prispevek po svoji presoji. Verjamemo, da Bog skozi odprtost in velikodušnost ljudi poskrbi za vse stroške kave, mleka in delovanja prostora.$$,
    $$ŽIVA VERA is a non-profit café. We have no fixed price list and make no commercial sales — visitors give freely according to their heart, or simply enjoy our hospitality. We believe that God provides for every operational need through generous, willing hearts.$$,
    null, 'left', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'text_with_image', 'Community Section', 40, true,
    $$Povezovanje & Mir$$, $$Connection & Peace$$,
    $$Več kot le kavarna — prostor za skupnost$$, $$More than a café — a space for community$$,
    null, null,
    $$Verjamemo, da se najlepši pogovori pogosto začnejo ob skodelici kave. ŽIVA VERA je prostor za druženje, študij, branje, iskrene pogovore o veri in življenju ter kotiček miru sredi vsakodnevnega hitenja.

Vsak je dobrodošel, da se usede, sprosti in si vzame čas zase.$$,
    $$We believe meaningful conversations often start over a good cup of coffee. ŽIVA VERA is a place for fellowship, reading, studying, heartfelt conversations about faith, and quiet peace in the middle of a busy day.

Everyone is welcome to sit, relax, and take time for themselves.$$,
    $$https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80$$,
    'right', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'text_with_image', 'Ebenezer Section', 50, true,
    $$Dobrodelnost z namenom$$, $$Outreach with Purpose$$,
    $$Skupaj pomagamo: Sirotišnica Ebenezer$$, $$Helping Together: Ebenezer Orphanage$$,
    null, null,
    $$Z vsako popito skodelico kave pomagate otrokom v stiski. 10 % vseh zbranih prostovoljnih prispevkov neposredno namenjamo sirotišnici Ebenezer v Hawassi (Etiopija), ki jo naša skupnost osebno podpira že od leta 2007.$$,
    $$With every cup of coffee you help vulnerable children. 10% of all voluntary contributions directly support the Ebenezer Children's Home in Hawassa (Ethiopia), which our fellowship has personally supported since 2007.$$,
    $$https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80$$,
    'left', $$Preberite več o Ebenezerju →$$, $$Learn more about Ebenezer →$$, '/p/ebenezer',
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'about' LIMIT 1),
    'call_to_action', 'Visit Us CTA', 60, true,
    null, null,
    $$Veselimo se vašega obiska$$, $$We look forward to welcoming you$$,
    $$Pridite sami ali v družbi prijateljev — vrata so vedno odprta.$$, $$Come alone or with friends — our doors are always open.$$,
    $$Pridite na skodelico sveže kave ali toplega čaja, spoznajte našo ekipo prostovoljcev in doživite pristno gostoljubje.$$,
    $$Come for a cup of fresh coffee or warm tea, meet our volunteer team, and experience genuine hospitality.$$,
    null, 'left', $$Obiščite nas$$, $$Plan your visit$$, '/visit',
    '[]'::jsonb, '[]'::jsonb
  );

-- ====================================================================
-- 4. EBENEZER GRACE SECTIONS (/p/ebenezer)
-- ====================================================================
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  body_sl, body_en, image_path, layout_variant, button_text_sl, button_text_en, button_link, bullets, items
) VALUES
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'hero', 'Ebenezer Hero', 10, true,
    $$Partnerstvo s srcem že od leta 2007$$, $$A heartfelt partnership since 2007$$,
    $$Ebenezer Grace & ŽIVA VERA$$, $$Ebenezer Grace & ŽIVA VERA$$,
    $$Iskreno prijateljstvo in misijonsko partnerstvo med Celjem in otroškim domom v Havasi v Etiopiji, ki neprekinjeno traja že od leta 2007.$$,
    $$A deep friendship and mission partnership between Celje and the children's home in Hawassa, Ethiopia, that has flourished continuously since 2007.$$,
    null, null,
    $$https://esmafrica.org/site/assets/files/1/banner.jpg$$,
    'left',
    $$Obiščite uradno stran esmafrica.org →$$, $$Visit official site esmafrica.org →$$, 'https://esmafrica.org',
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'alternating_content', 'Storyline', 20, true,
    null, null,
    $$Zgodba partnerstva, ki se je začela s prijateljstvom$$, $$A partnership story that began with a friendship$$,
    null, null, null, null, null, 'default', null, null, null,
    '[]'::jsonb,
    '[
      {
        "variant": "left",
        "title_sl": "Madžarska, 2005–2007: Kjer se je vse začelo",
        "title_en": "Hungary, 2005-2007: Where it all began",
        "body_sl": "Naša pastorja Aleš in Whitney Lajlar sta Argawa in Rachel Ayele prvič spoznala leta 2005 na biblijski šoli Calvary Chapel Bible College Europe na Madžarskem. Skupaj so študirali, molili in se spraševali, kam jih bo Bog peljal naprej. Ko sta se Argaw in Rachel leta 2007 preselila v Etiopijo, so tisti nočni pogovori prerasli v trajno, zavezniško prijateljstvo na dveh celinah.",
        "body_en": "Our pastors Ales and Whitney Lajlar first met Argaw and Rachel Ayele in 2005 at Calvary Chapel Bible College Europe in Hungary. They studied, prayed, and discerned the calling of God together. When Argaw and Rachel moved to Ethiopia in 2007, those late-night conversations blossomed into a lifelong partnership spanning two continents.",
        "image_path": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
      },
      {
        "variant": "right",
        "title_sl": "Etiopija, 2010: Ustanovitev doma Ebenezer Grace",
        "title_en": "Ethiopia, 2010: Ebenezer Grace is Founded",
        "body_sl": "Januarja 2010 sta Argaw in Rachel v mestu Havasa odprla vrata otroškega doma Ebenezer Grace in sprejela prvo novorojenko Lantu. Iz enega doma za majhno skupino zapuščenih dojenčkov je zrasla obsežna služba (ESMA / ESDA) – oskrba za ranljive otroke, dom za otroke s posebnimi potrebami (Lantu Home) in podpora lokalnim družinam.",
        "body_en": "In January 2010, Argaw and Rachel opened the Ebenezer Grace Children Home in Hawassa, welcoming their first baby girl, Lantu. What began as a refuge for abandoned infants grew into a broad ministry (ESMA / ESDA) caring for vulnerable youth, children with special needs (Lantu Home), and struggling families.",
        "image_path": "https://esmafrica.org/site/assets/files/1668/june.800x600.jpg"
      },
      {
        "variant": "left",
        "title_sl": "Skupaj že od leta 2007: Osebna prisotnost in služenje",
        "title_en": "Walking Together Since 2007: Presence and Service",
        "body_sl": "Zaradi osebnega odnosa je naša cerkev del te zgodbe že od vsega začetka leta 2007. Skozi leta smo v Havaso pošiljali misijonske ekipe, redno molili za vsakega otroka ter ostali blizu družini Ayele. Član naše cerkve Erik Čižič je pol leta živel pri družini v Havasi in zvesto služil v otroškem domu.",
        "body_en": "Because of this close bond, our fellowship in Celje has walked alongside Ebenezer since the beginning in 2007. Over the years we have sent mission teams, upheld them in prayer, and stayed deeply connected. Church member Erik Cizic lived with the Ayele family in Hawassa for six months, serving daily at the home.",
        "image_path": "https://esmafrica.org/site/assets/files/1014/sponsormodule18.800x600.jpg"
      },
      {
        "variant": "right",
        "title_sl": "ŽIVA VERA: Kava s skupnim namenom (10 % za otroke)",
        "title_en": "ŽIVA VERA: Coffee with a Purpose (10% for Children)",
        "body_sl": "Kavarna ŽIVA VERA to zavezo nadaljuje vsak dan. Deset odstotkov vseh prostovoljnih prispevkov neposredno potuje v Havaso za prehrano, šolanje in zdravstveno oskrbo otrok. Vsaka skodelica kave v Celju je tiha vez ljubezni z otrokom na drugem koncu sveta.",
        "body_en": "ŽIVA VERA puts this commitment into practice every single day. Ten percent of all voluntary contributions goes directly to Hawassa to fund food, education, and medical care. Every cup of coffee enjoyed in Celje is a quiet act of love for a child on the other side of the world.",
        "image_path": "https://esmafrica.org/site/assets/files/1137/videos19module.800x600.jpg"
      }
    ]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'card_grid', 'How we walk together', 30, true,
    null, null,
    $$Kako hodimo skupaj$$, $$How we walk together$$,
    null, null,
    $$Naše partnerstvo z Ebenezer Grace ni formalnost, temveč iskreno, vsakdanje prijateljstvo, ki se izraža na 4 načine.$$,
    $$Our partnership with Ebenezer Grace is not a formality, but a living friendship expressed in 4 simple ways.$$,
    null, '4', null, null, null,
    '[]'::jsonb,
    '[
      {
        "icon": "🤝",
        "title_sl": "Osebni odnos od 2007",
        "title_en": "Personal Relationship Since 2007",
        "body_sl": "Argawa in Rachel poznamo že skoraj dve desetletji. To je družinska služba in pristno prijateljstvo."
      },
      {
        "icon": "🙏",
        "title_sl": "Zvesta molitev",
        "title_en": "Faithful Prayer",
        "body_sl": "Redno molimo za otroke, skrbnike in družino Ayele po imenih – na cerkvenih srečanjih in doma."
      },
      {
        "icon": "✈️",
        "title_sl": "Osebna prisotnost",
        "title_en": "Personal Presence",
        "body_sl": "Misijonski obiski in daljša bivanja (kot 6 mesecev Erika Čižiča) ohranjajo vez živo in resnično."
      },
      {
        "icon": "☕",
        "title_sl": "10 % vseh prispevkov",
        "title_en": "10% of Proceeds",
        "body_sl": "ŽIVA VERA namenja 10 % svojih prihodkov za Ebenezer Grace, poleg stalne podpore cerkve."
      }
    ]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'image_gallery', 'Moments Gallery', 40, true,
    null, null,
    $$Trenutki iz Havase v Etiopiji$$, $$Moments from Hawassa, Ethiopia$$,
    null, null,
    $$Utrinki iz vsakdanjega življenja v otroškem domu Ebenezer Grace – otroci, skrbniki in naša skupna pot.$$,
    $$Glimpses into daily life at Ebenezer Grace – children, caregivers, and our shared journey.$$,
    null, 'default', null, null, null,
    '[]'::jsonb,
    '[
      {
        "caption_sl": "Otroški dom Ebenezer Grace v Havasi.",
        "caption_en": "The Ebenezer Grace Children Home in Hawassa.",
        "image_path": "https://esmafrica.org/site/assets/files/1/banner.jpg"
      },
      {
        "caption_sl": "Otroci pri skupnih obrokih in učenju.",
        "caption_en": "Children enjoying meals and daily learning.",
        "image_path": "https://esmafrica.org/site/assets/files/1668/june.800x600.jpg"
      },
      {
        "caption_sl": "Skrbniki in prostovoljci, ki delo nosijo iz dneva v dan.",
        "caption_en": "Caregivers and staff carrying the daily work with love.",
        "image_path": "https://esmafrica.org/site/assets/files/1137/videos19module.800x600.jpg"
      },
      {
        "caption_sl": "Program botrstva in podpora otrokom.",
        "caption_en": "Child sponsorship and family empowerment.",
        "image_path": "https://esmafrica.org/site/assets/files/1014/sponsormodule18.800x600.jpg"
      },
      {
        "caption_sl": "Deklica v oskrbi doma Ebenezer Grace.",
        "caption_en": "Little girl cared for at Ebenezer Grace.",
        "image_path": "https://esmafrica.org/site/assets/files/23491/img_8673.300x400.jpg"
      },
      {
        "caption_sl": "Mesto Havasa – skupnost, ki jo nosimo v srcu.",
        "caption_en": "Hawassa – the community we hold in our hearts.",
        "image_path": "https://esmafrica.org/site/assets/files/1/footer8.jpg"
      }
    ]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'testimonial', 'Partner Testimonials', 50, true,
    null, null,
    $$Zgodbe iz partnerstva$$, $$Stories from the Partnership$$,
    null, null, null, null, null, 'default', null, null, null,
    '[]'::jsonb,
    '[
      {
        "name": "Aleš in Whitney Lajlar",
        "role_sl": "Pastorja, ŽIVA VERA in KCK Celje",
        "role_en": "Pastors, ŽIVA VERA and Calvary Chapel Celje",
        "quote_sl": "Začelo se je kot prijateljstvo na biblijski šoli leta 2005. Leta 2007 sta Argaw in Rachel odšla v Etiopijo, danes pa skoraj 20 let pozneje se vedno zvesto hodimo skupaj – med Celjem in Havaso.",
        "quote_en": "It started as a friendship at Bible college in 2005. In 2007 Argaw and Rachel left for Ethiopia, and today, almost twenty years later, we are still walking together between Celje and Hawassa."
      },
      {
        "name": "Erik Čižič",
        "role_sl": "Član cerkve, 6 mesecev živel v Havasi",
        "role_en": "Church member, lived in Hawassa for 6 months",
        "quote_sl": "Šest mesecev bivanja pri družini Ayele v Havasi je spremenilo moj pogled na misijon. Gre za to, da si prisoten, zvest v majhnem in pustiš, da te vsakdan uči Božje ljubezni.",
        "quote_en": "Living with the Ayele family in Hawassa for six months transformed my understanding of mission. It is about presence, being faithful in the small things, and witnessing the love of God every day."
      }
    ]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'faq', 'Ebenezer FAQ', 60, true,
    null, null,
    $$Pogosta vprašanja o Ebenezer Grace$$, $$Common Questions about Ebenezer Grace$$,
    null, null, null, null, null, 'default', null, null, null,
    '[]'::jsonb,
    '[
      {
        "q_sl": "Kaj je Ebenezer Grace?",
        "q_en": "What is Ebenezer Grace?",
        "a_sl": "Ebenezer Grace je otroški dom in krščanska neprofitna služba v Havasi (Etiopija), ki sta jo leta 2010 ustanovila Argaw in Rachel Ayele. Skrbi za sirote, zapuščene otroke in otroke s posebnimi potrebami pod okriljem organizacije ESMA / ESDA.",
        "a_en": "Ebenezer Grace is a children home and Christian non-profit ministry in Hawassa, Ethiopia, founded in 2010 by Argaw and Rachel Ayele. It provides care, housing, education, and love for orphans and special needs children under ESMA / ESDA."
      },
      {
        "q_sl": "Kako sta ŽIVA VERA in naša cerkev povezani z domom?",
        "q_en": "How are ŽIVA VERA and our church connected?",
        "a_sl": "Naša pastorja Aleš in Whitney Lajlar sta prijatelja z ustanoviteljema že od leta 2005. Cerkev Kalvarija Celje podpira dom vse od leta 2007 skozi molitve, obiske in donacije, ŽIVA VERA pa to zavezo nadaljuje z vsakodnevno kavo.",
        "a_en": "Our pastors Ales and Whitney Lajlar have been friends with the founders since 2005. Calvary Chapel Celje has supported the home since 2007 through prayer, visits, and funding, and ŽIVA VERA continues this through daily coffee."
      },
      {
        "q_sl": "Zakaj kavarna namenja ravno 10 % prihodkov?",
        "q_en": "Why does the cafe give 10% of proceeds?",
        "a_sl": "Ker verjamemo v svetopisemsko načelo desetine in velikodušnosti. Vsak obiskovalec v naši kavarni tako nehote postane del nečesa večjega – skrbi za otroke v stiski.",
        "a_en": "Because we believe in the biblical principle of tithing and generous stewardship. Every guest in our cafe quietly takes part in something bigger - caring for vulnerable children."
      },
      {
        "q_sl": "Ali lahko postanem boter otroku?",
        "q_en": "Can I sponsor a child directly?",
        "a_sl": "Da! Na uradni spletni strani esmafrica.org lahko postanete mesečni boter posameznemu otroku ali celotni družini ter prejemate njihova redna pisma in poročila.",
        "a_en": "Yes! On the official website esmafrica.org you can become a monthly sponsor for an individual child or family and receive updates and letters."
      }
    ]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
    'call_to_action', 'Direct Support CTA', 70, true,
    $$Neposredna pomoč$$, $$Direct Support$$,
    $$Želite podpreti delo v Etiopiji?$$, $$Would you like to support the work in Ethiopia?$$,
    $$Uradna spletna stran organizacije: esmafrica.org$$, $$Official ministry website: esmafrica.org$$,
    $$Vsak obisk kavarne ŽIVA VERA že podpira Ebenezer Grace. Če želite postati neposredni boter otroku ali prebrati njihova najnovejša misijonska pisma, obiščite uradno spletno stran ESMAfrica.$$,
    $$Every visit to ŽIVA VERA already supports Ebenezer Grace. If you would like to sponsor a child directly or read their latest newsletters, visit the official ESMAfrica website.$$,
    null, 'center',
    $$Obiščite esmafrica.org →$$, $$Visit esmafrica.org →$$, 'https://esmafrica.org',
    '[]'::jsonb, '[]'::jsonb
  );

-- ====================================================================
-- 5. HOSPITALITY POLICY SECTIONS (/hospitality) - 100% COMPLETE ORIGINAL
-- ====================================================================
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  body_sl, body_en, image_path, layout_variant, button_text_sl, button_text_en, button_link, bullets, items
) VALUES
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'hero', 'Hospitality Hero', 10, true,
    $$Naša zaveza gostom in skupnosti$$, $$Our commitment to guests and community$$,
    $$Politika gostoljubnosti$$, $$Hospitality Policy$$,
    $$ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Krščanske cerkve Kalvarija. Naše delovanje temelji na prostovoljnem delu, prostovoljnih prispevkih obiskovalcev ter želji ustvarjati prijeten, varen in spoštljiv prostor za vse ljudi.$$,
    $$ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje. Our work is built on volunteer effort, the voluntary contributions of our guests, and the desire to create a warm, safe and respectful space for everyone.$$,
    null, null,
    $$https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1920&q=80$$,
    'left', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'simple_text_block', 'Welcome', 20, true,
    null, null, null, null, null, null,
    $$Vsakega obiskovalca želimo sprejeti z odprtostjo, prijaznostjo in gostoljubnostjo. Verjamemo, da lahko že preprosta skodelica kave in iskren pogovor prispevata k boljši skupnosti ter ustvarjata prostor, kjer se ljudje počutijo sprejete in spoštovane.$$,
    $$We want to welcome every guest with openness, kindness and hospitality. We believe that even a simple cup of coffee and a sincere conversation can strengthen our community and create a place where people feel accepted and respected.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'simple_text_block', 'Nature of our work', 30, true,
    null, null, null, null, null, null,
    $$Ker naše delovanje ne temelji na običajnem komercialnem gostinstvu, temveč na neprofitnem poslanstvu in prostovoljni podpori skupnosti, postrežba napitkov in drugih storitev ne predstavlja pravice posameznika do storitve, temveč izraz naše gostoljubnosti in služenja skupnosti.$$,
    $$Because our work is not a typical commercial hospitality business, but a non-profit mission supported by the community, serving drinks and other offerings is not an individual right to service — it is an expression of our hospitality and service to the community.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'simple_text_block', 'Discretion', 40, true,
    null, null, null, null, null, null,
    $$Zaradi odgovornosti do naših prostovoljcev, obiskovalcev, donatorjev in samega poslanstva si pridržujemo pravico, da po lastni presoji zavrnemo, omejimo ali prekinemo postrežbo posamezniku, kadar ocenimo, da njegovo ravnanje ni skladno z namenom, vrednotami ali dobrim delovanjem naše kavarne.$$,
    $$Out of responsibility to our volunteers, guests, donors and to the mission itself, we reserve the right, at our own discretion, to refuse, limit or stop service to any individual whose behavior is, in our judgment, not in line with the purpose, values and healthy operation of our café.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'policy_section', 'Behavior that may limit service', 50, true,
    null, null, null, null, null, null,
    $$Takšni primeri lahko med drugim vključujejo:$$,
    $$Such situations may include, among others:$$,
    null, 'default', null, null, null,
    '[
      {"text_sl": "nespoštljivo, žaljivo ali agresivno komunikacijo;", "text_en": "disrespectful, offensive or aggressive communication;"},
      {"text_sl": "nadlegovanje prostovoljcev, obiskovalcev ali drugih oseb;", "text_en": "harassment of volunteers, guests or other people;"},
      {"text_sl": "moteče vedenje, ki negativno vpliva na vzdušje v prostoru;", "text_en": "disruptive behavior that negatively affects the atmosphere of the space;"},
      {"text_sl": "namerno izkoriščanje sistema prostovoljnih prispevkov;", "text_en": "deliberate exploitation of the voluntary contribution system;"},
      {"text_sl": "ponavljajoče ravnanje, ki kaže na nespoštovanje do prostovoljnega značaja našega delovanja;", "text_en": "repeated behavior that shows disregard for the voluntary nature of our work;"},
      {"text_sl": "druga dejanja, ki po razumni presoji vodstva ali prostovoljcev škodujejo skupnosti, ugledu ali poslanstvu kavarne.", "text_en": "any other actions that, in the reasonable judgment of the team or volunteers, harm the community, reputation or mission of the café."}
    ]'::jsonb,
    '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'simple_text_block', 'After bullets', 60, true,
    null, null, null, null, null, null,
    $$Posebej želimo poudariti, da je sistem prostovoljnih prispevkov zasnovan na medsebojnem zaupanju, spoštovanju in odgovornosti. Namenjen je temu, da omogoča dostopen in odprt prostor za vse, ne pa temu, da bi ga posamezniki namerno izkoriščali v svojo korist. Če ugotovimo, da nekdo sistem zavestno in ponavljajoče zlorablja, si pridržujemo pravico, da mu nadaljnje postrežbe ne omogočimo.$$,
    $$We especially want to emphasize that the voluntary contribution system is built on mutual trust, respect and responsibility. It exists to keep this space open and accessible to everyone — not to be deliberately taken advantage of. If we find that someone is knowingly and repeatedly abusing the system, we reserve the right to no longer offer them service.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'simple_text_block', 'Trust & fairness', 70, true,
    null, null, null, null, null, null,
    $$Pri vseh odločitvah si prizadevamo ravnati pošteno, spoštljivo in brez diskriminacije. Naše odločitve niso povezane z narodnostjo, spolom, starostjo, socialnim položajem, verskim prepričanjem ali drugimi osebnimi okoliščinami posameznika, temveč izključno z njegovim vedenjem in odnosom do drugih ljudi, prostovoljcev ter samega poslanstva kavarne.$$,
    $$In every decision we strive to act fairly, respectfully and without discrimination. Our decisions are never connected to nationality, gender, age, social status, religious belief or any other personal circumstance — only to behavior and to how a person treats other guests, volunteers and the mission of the café.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'simple_text_block', 'Goal', 80, true,
    null, null, null, null, null, null,
    $$Naš cilj ni izključevanje ljudi, temveč varovanje prostora, v katerem se lahko obiskovalci in prostovoljci počutijo dobrodošle, spoštovane in varne. Verjamemo, da je takšno okolje mogoče ohranjati le ob medsebojnem spoštovanju in odgovornem odnosu vseh, ki soustvarjamo to skupnost.$$,
    $$Our goal is not to exclude people, but to protect a space in which guests and volunteers can feel welcome, respected and safe. We believe such an environment can only be preserved through mutual respect and a responsible attitude from everyone who shapes this community.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'hospitality' LIMIT 1),
    'quote_or_highlight', 'Thanks', 90, true,
    null, null, null, null, null, null,
    $$Zahvaljujemo se vam za razumevanje, podporo in spoštovanje vrednot, na katerih temelji delovanje kavarne ŽIVA VERA.$$,
    $$Thank you for your understanding, your support and your respect for the values on which ŽIVA VERA is built.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  );

-- ====================================================================
-- 6. VISIT & CONTRIBUTE SECTIONS (/visit)
-- ====================================================================
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  body_sl, body_en, image_path, layout_variant, button_text_sl, button_text_en, button_link, bullets, items
) VALUES
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'visit' LIMIT 1),
    'hero', 'Visit Hero', 10, true,
    $$Dobrodošli v Celju$$, $$Welcome to Celje$$,
    $$Obisk in prispevek$$, $$Visit & Contribution$$,
    $$Veseli bomo vašega obiska. Pridite na kavo, ostanite na pogovoru in prispevajte po svoji presoji — cenika ni.$$,
    $$We would love to welcome you. Stop by for coffee, stay for conversation, and contribute what feels right — there is no price list.$$,
    null, null,
    $$https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80$$,
    'left', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'visit' LIMIT 1),
    'simple_text_block', 'How to Contribute', 20, true,
    null, null,
    $$Kako prispevati za kavo in napitke?$$, $$How to Contribute for Coffee & Drinks?$$,
    null, null,
    $$Ker pijač ne prodajamo na običajen način, vam za postrežene napitke ne moremo izdati računa. Če vam je bilo pri nas prijetno in želite podpreti naše delovanje, vas vabimo k prostovoljnemu prispevku po lastni presoji.

Vsak dar, ne glede na velikost, pomaga ohranjati prostor odprt za vse ter omogoča, da 10 % vseh zbranih sredstev neposredno podpre otroke v sirotišnici Ebenezer v Etiopiji.$$,
    $$Because we do not sell drinks commercially, we cannot issue standard sales receipts. If you enjoyed your time and wish to support our mission, you are invited to leave a voluntary contribution of your choice.

Every gift helps keep our doors open for everyone and allows 10% of all contributions to directly support vulnerable children at Ebenezer in Ethiopia.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'visit' LIMIT 1),
    'card_grid', 'Visit Details Cards', 30, true,
    null, null,
    $$Informacije za obisk$$, $$Visitor Information$$,
    null, null,
    $$Vse, kar morate vedeti pred vašim prihodom v ŽIVO VERO.$$,
    $$Everything you need to know before visiting ŽIVA VERA.$$,
    null, '3', null, null, null,
    '[]'::jsonb,
    '[
      {
        "icon": "📍",
        "title_sl": "Lokacija",
        "title_en": "Location",
        "body_sl": "Kavarna ŽIVA VERA se nahaja v prostorih Krščanske cerkve Kalvarija v Celju."
      },
      {
        "icon": "☕",
        "title_sl": "Brez cenika",
        "title_en": "No Price List",
        "body_sl": "Naročite po želji in prispevajte po svojem srcu ali preprosto uživajte v gostoljubju."
      },
      {
        "icon": "🌍",
        "title_sl": "10 % za Etiopijo",
        "title_en": "10% for Ethiopia",
        "body_sl": "Z vsakim obiskom neposredno podprete sirote in družine v Havasi."
      }
    ]'::jsonb
  );

-- ====================================================================
-- 7. PRAYER & REFLECTION SECTIONS (/prayer)
-- ====================================================================
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  body_sl, body_en, image_path, layout_variant, button_text_sl, button_text_en, button_link, bullets, items
) VALUES
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'prayer' LIMIT 1),
    'hero', 'Prayer Hero', 10, true,
    $$Kotiček miru in upanja$$, $$A corner of peace and hope$$,
    $$Molitev in razmišljanje$$, $$Prayer & Reflection$$,
    $$Vsak dan si lahko vzamete trenutek za oddih, preberete spodbudno misel ali zaupate svojo molitveno prošnjo naši pastoralni ekipi.$$,
    $$Take a quiet moment of rest, read an encouraging thought, or share your prayer request with our pastoral team.$$,
    null, null,
    $$https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1920&q=80$$,
    'left', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'prayer' LIMIT 1),
    'quote_or_highlight', 'Reflection Verse', 20, true,
    null, null,
    $$Spodbudna misel za današnji dan$$, $$An Encouraging Thought for Today$$,
    null, null,
    $$»Pridite k meni vsi, ki ste utrujeni in obteženi, in jaz vam bom dal počitek.« — Matej 11,28$$,
    $$“Come to me, all you who are weary and burdened, and I will give you rest.” — Matthew 11:28$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'prayer' LIMIT 1),
    'policy_section', 'How Prayer Works', 30, true,
    null, null,
    $$Kako poteka pošiljanje molitvene prošnje?$$, $$How Prayer Requests Work$$,
    null, null,
    $$Zaupanje in varnost sta pri nas na prvem mestu:$$,
    $$Trust and safety are our highest priorities:$$,
    null, 'default', null, null, null,
    '[
      {"text_sl": "V spodnji obrazec zapišite svojo molitveno prošnjo, zahvalo ali duhovno vprašanje;", "text_en": "Write your prayer request, thanksgiving, or spiritual question in the form below;"},
      {"text_sl": "Izberite, ali naj prošnja ostane strogo zaupna ali jo lahko po pregledu objavimo na javnem molitvenem zidu;", "text_en": "Choose whether your request remains strictly private or can be shared on the public prayer wall;"},
      {"text_sl": "Naša pastoralna ekipa vsako prošnjo zvesto prebere in zanjo osebno moli.", "text_en": "Our pastoral team reads every request faithfully and prays for it personally."}
    ]'::jsonb,
    '[]'::jsonb
  ),
  (
    (SELECT id FROM public.static_pages WHERE page_key = 'prayer' LIMIT 1),
    'simple_text_block', 'Privacy Notice', 40, true,
    null, null,
    $$Vaša zasebnost je popolnoma varna$$, $$Your Privacy is Completely Protected$$,
    null, null,
    $$Nič od tega, kar nam zaupate, ni nikoli javno objavljeno brez vašega izrecnega soglasja. Zaupne prošnje vidi izključno odgovorno pastoralno osebje. Prošnjo lahko kadarkoli pošljete tudi povsem anonimno.$$,
    $$Nothing you submit is ever shared publicly without your explicit consent. Private requests are seen solely by trusted pastoral staff. You can also submit completely anonymously at any time.$$,
    null, 'default', null, null, null,
    '[]'::jsonb, '[]'::jsonb
  );
