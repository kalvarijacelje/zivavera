-- ====================================================================
-- ŽIVA VERA: EBENEZER GRACE PAGE ENRICHED CONTENT & PHOTOS
-- Complete Slovenian diacritics (Š, Č, Ž, š, č, ž) & clean SQL
-- ====================================================================

-- 1. ENSURE 'ebenezer' PAGE RECORD EXISTS IN static_pages
INSERT INTO public.static_pages (
  page_key,
  internal_label,
  title_sl,
  title_en,
  show_in_navigation,
  nav_order,
  published
)
VALUES (
  'ebenezer',
  'Ebenezer Grace',
  'Ebenezer Grace',
  'Ebenezer Grace',
  true,
  30,
  true
)
ON CONFLICT (page_key) DO UPDATE SET 
  title_sl = 'Ebenezer Grace',
  title_en = 'Ebenezer Grace',
  published = true;

-- 2. DELETE OLD SECTIONS FOR 'ebenezer' PAGE
DELETE FROM public.static_page_sections 
WHERE page_id = (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1);

-- 3. INSERT SECTION 1: HERO BANNER
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  image_path, layout_variant, button_text_sl, button_text_en, button_link, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'hero',
  'Ebenezer Hero Banner',
  10,
  true,
  'Partnerstvo s srcem',
  'A Heartfelt Partnership',
  'Ebenezer Grace & ŽIVA VERA',
  'Ebenezer Grace & ŽIVA VERA',
  'Iskreno prijateljstvo in misijonsko partnerstvo med Celjem in otroškim domom v Havasi v Etiopiji, ki neprekinjeno traja že od leta 2007.',
  'A deep friendship and mission partnership between Celje and the children home in Hawassa, Ethiopia, that has flourished continuously since 2007.',
  'https://esmafrica.org/site/assets/files/1/banner.jpg',
  'left',
  'Obiščite uradno stran esmafrica.org',
  'Visit official site esmafrica.org',
  'https://esmafrica.org',
  '[]'::jsonb
);

-- 4. INSERT SECTION 2: 4-CHAPTER STORYLINE
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  title_sl, title_en, layout_variant, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'alternating_content',
  'Storyline 2007 to Present',
  20,
  true,
  'Zgodba partnerstva, ki se je začela s prijateljstvom',
  'A partnership story that began with a friendship',
  'default',
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
);

-- 5. INSERT SECTION 3: FOUR RELATIONSHIP PILLARS
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  title_sl, title_en, body_sl, body_en, layout_variant, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'card_grid',
  'How we walk together',
  30,
  true,
  'Kako hodimo skupaj',
  'How we walk together',
  'Naše partnerstvo z Ebenezer Grace ni formalnost, temveč iskreno, vsakdanje prijateljstvo, ki se izraža na 4 načine.',
  'Our partnership with Ebenezer Grace is not a formality, but a living friendship expressed in 4 simple ways.',
  '4',
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
);

-- 6. INSERT SECTION 4: HAWASSA PHOTO GALLERY
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  title_sl, title_en, body_sl, body_en, layout_variant, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'image_gallery',
  'Moments Gallery',
  40,
  true,
  'Trenutki iz Havase v Etiopiji',
  'Moments from Hawassa, Ethiopia',
  'Utrinki iz vsakdanjega življenja v otroškem domu Ebenezer Grace – otroci, skrbniki in naša skupna pot.',
  'Glimpses into daily life at Ebenezer Grace – children, caregivers, and our shared journey.',
  'default',
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
);

-- 7. INSERT SECTION 5: TESTIMONIALS
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  title_sl, title_en, layout_variant, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'testimonial',
  'Partner Testimonials',
  50,
  true,
  'Zgodbe iz partnerstva',
  'Stories from the Partnership',
  'default',
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
);

-- 8. INSERT SECTION 6: FAQ ACCORDION
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  title_sl, title_en, layout_variant, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'faq',
  'Ebenezer FAQ',
  60,
  true,
  'Pogosta vprašanja o Ebenezer Grace',
  'Common Questions about Ebenezer Grace',
  'default',
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
);

-- 9. INSERT SECTION 7: DIRECT CALL TO ACTION
INSERT INTO public.static_page_sections (
  page_id, section_type, internal_label, sort_order, published,
  eyebrow_sl, eyebrow_en, title_sl, title_en, subtitle_sl, subtitle_en,
  body_sl, body_en, layout_variant, button_text_sl, button_text_en, button_link, items
) VALUES (
  (SELECT id FROM public.static_pages WHERE page_key = 'ebenezer' LIMIT 1),
  'call_to_action',
  'Direct Support CTA',
  70,
  true,
  'Neposredna pomoč',
  'Direct Support',
  'Želite podpreti delo v Etiopiji?',
  'Would you like to support the work in Ethiopia?',
  'Uradna spletna stran organizacije: esmafrica.org',
  'Official ministry website: esmafrica.org',
  'Vsak obisk kavarne ŽIVA VERA že podpira Ebenezer Grace. Če želite postati neposredni boter otroku ali prebrati njihova najnovejša misijonska pisma, obiščite uradno spletno stran ESMAfrica.',
  'Every visit to ŽIVA VERA already supports Ebenezer Grace. If you would like to sponsor a child directly or read their latest newsletters, visit the official ESMAfrica website.',
  'center',
  'Obiščite esmafrica.org →',
  'Visit esmafrica.org →',
  'https://esmafrica.org',
  '[]'::jsonb
);
