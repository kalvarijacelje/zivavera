
-- ============== TABLES ==============
CREATE TABLE public.static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  internal_label text NOT NULL,
  title_en text NOT NULL,
  title_sl text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.static_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.static_pages TO authenticated;
GRANT ALL ON public.static_pages TO service_role;

ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published static pages"
  ON public.static_pages FOR SELECT
  USING (published = true);

CREATE POLICY "Admins manage static pages"
  ON public.static_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_static_pages_updated_at
  BEFORE UPDATE ON public.static_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX static_pages_page_key_idx ON public.static_pages(page_key);
CREATE INDEX static_pages_published_idx ON public.static_pages(published);


CREATE TABLE public.static_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.static_pages(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  internal_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  eyebrow_en text, eyebrow_sl text,
  title_en text,   title_sl text,
  subtitle_en text, subtitle_sl text,
  body_en text,    body_sl text,
  image_path text,
  button_text_en text, button_text_sl text, button_link text,
  layout_variant text NOT NULL DEFAULT 'center',
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.static_page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.static_page_sections TO authenticated;
GRANT ALL ON public.static_page_sections TO service_role;

ALTER TABLE public.static_page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published sections of published pages"
  ON public.static_page_sections FOR SELECT
  USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.static_pages p
      WHERE p.id = page_id AND p.published = true
    )
  );

CREATE POLICY "Admins manage static page sections"
  ON public.static_page_sections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_static_page_sections_updated_at
  BEFORE UPDATE ON public.static_page_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX static_page_sections_page_sort_idx
  ON public.static_page_sections(page_id, sort_order);
CREATE INDEX static_page_sections_published_idx
  ON public.static_page_sections(published);


-- ============== SEED PAGES ==============
INSERT INTO public.static_pages (page_key, internal_label, title_en, title_sl) VALUES
  ('about',       'About',                  $t$A unique café that runs on faith$t$,        $t$Unikatna kavarna, ki deluje po veri$t$),
  ('visit',       'Visit / Contribution',   $t$Visit & Contribute$t$,                       $t$Obisk in prispevek$t$),
  ('hospitality', 'Hospitality Policy',     $t$Hospitality and Service Policy$t$,           $t$Politika gostoljubnosti in postrežbe$t$);


-- ============== SEED SECTIONS: About ==============
WITH p AS (SELECT id FROM public.static_pages WHERE page_key='about')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, title_en, title_sl, body_en, body_sl)
SELECT p.id, 'simple_text_block', s.label, s.ord, s.t_en, s.t_sl, s.b_en, s.b_sl
FROM p, (VALUES
  (10, 'Welcome',
    $t$Welcome to ŽIVA VERA$t$,
    $t$Dobrodošli v Živi veri$t$,
    $t$Welcome to ŽIVA VERA — a place where good coffee, warm company and sincere relationships meet the values of faith, hope and service. We are the first and currently only Christian non-profit café in Slovenia, operating as a mission under the Christian Church Calvary. Our goal is not profit, but to create a welcoming space where anyone can feel at home, regardless of their story, beliefs or background. We believe that some of the most meaningful conversations begin over a cup of good coffee.$t$,
    $t$Dobrodošli v kavarni ŽIVA VERA – prostoru, kjer se dobra kava, prijetna družba in pristni odnosi srečajo z vrednotami vere, upanja in služenja. Smo prva in trenutno edina krščanska neprofitna kavarna v Sloveniji, ki deluje kot poslanstvo v prostorih Krščanske cerkve Kalvarija. Naš cilj ni ustvarjanje dobička, temveč ustvarjanje prijetnega okolja, kjer se vsak lahko počuti dobrodošlega, ne glede na svojo življenjsko zgodbo, prepričanja ali ozadje. Verjamemo, da se najlepši pogovori pogosto začnejo ob skodelici dobre kave.$t$),
  (20, 'On faith',
    $t$What does it mean to run "on faith"?$t$,
    $t$Kaj pomeni, da delujemo »po veri«?$t$,
    $t$ŽIVA VERA is a non-profit activity. Instead of a classic business model, we created a place where anyone can enjoy a coffee or another non-alcoholic drink and offer a voluntary contribution of their own choosing. That means we don't have a price list or sales in the usual sense. Our work is sustained by the voluntary contributions of our guests, which cover ingredients, drink preparation, maintenance of the space and other operating costs. This way of working reflects our trust in God and gives every guest the freedom to contribute as much as they wish and are able.$t$,
    $t$ŽIVA VERA je neprofitna dejavnost. Namesto klasičnega poslovnega modela smo ustvarili prostor, kjer lahko vsak uživa v kavi ali drugi brezalkoholni pijači ter za postrežbo prispeva prostovoljni prispevek po svoji presoji. To pomeni, da cenika in prodaje v običajnem pomenu besede nimamo. Naše delovanje temelji na prostovoljnih prispevkih obiskovalcev, s katerimi pokrivamo stroške nabave, priprave napitkov, vzdrževanja prostora in druge operativne stroške. Takšen način delovanja odraža naše zaupanje v Boga in hkrati daje vsakemu obiskovalcu svobodo, da prispeva toliko, kot sam želi in zmore.$t$),
  (30, 'How to contribute',
    $t$How can you contribute?$t$,
    $t$Kako lahko prispevate?$t$,
    $t$Because we don't sell drinks in the usual way, we cannot issue a receipt for the drinks served. If you enjoyed your time with us and would like to support our work, we invite you to leave a voluntary contribution. Every gift, no matter the size, helps keep this space open for everyone looking for good coffee, a kind conversation or simply a place to rest. We are grateful for every contribution — it allows this special mission to continue.$t$,
    $t$Ker pijač ne prodajamo na običajen način, vam za postrežene napitke ne moremo izdati računa. Če vam je bilo pri nas prijetno in želite podpreti naše delovanje, vas vabimo k prostovoljnemu prispevku. Vsak dar, ne glede na velikost, pomaga ohranjati prostor odprt za vse, ki iščejo dobro kavo, prijeten pogovor ali preprosto kraj za oddih. Hvaležni smo za vsak prispevek, saj nam omogoča nadaljnje delovanje tega posebnega poslanstva.$t$),
  (40, 'Helping others',
    $t$Together we help others too$t$,
    $t$Skupaj pomagamo tudi drugim$t$,
    $t$Part of the contributions we receive also goes to help people in need. We dedicate 10% of all donations to the Ebenezer orphanage in Ethiopia. We have been personally connected to the founders of the orphanage since 2007, regularly visit it, and closely follow its work with the children. In this way, every visit to our café indirectly supports those who need help the most.$t$,
    $t$Del prejetih prispevkov namenjamo tudi pomoči ljudem v stiski. 10 % vseh prejetih donacij namenjamo sirotišnici Ebenezer v Etiopiji. Z ustanovitelji sirotišnice smo osebno povezani že od leta 2007, sirotišnico redno obiskujemo in od blizu spremljamo njeno delo med otroki. Tako vsak obisk naše kavarne posredno prispeva tudi k podpori tistim, ki pomoč najbolj potrebujejo.$t$),
  (50, 'Name',
    $t$Why the name "ŽIVA VERA"?$t$,
    $t$Zakaj ime »ŽIVA VERA«?$t$,
    $t$The name ŽIVA VERA ("Living Faith") expresses something we want to live every day. We believe in Jesus Christ, who was crucified, died and rose from the dead. We don't see Him only as a historical figure, but as a living Saviour who still changes lives today. But ŽIVA VERA isn't just a name or a religious phrase. It's an invitation to genuine relationships, honesty, service and care for others — values that everyone serving in this café strives to live by.$t$,
    $t$Ime ŽIVA VERA izraža nekaj, kar želimo živeti vsak dan. Verujemo v Jezusa Kristusa, ki je bil križan, umrl in vstal od mrtvih. Zanj ne verjamemo le kot v zgodovinsko osebnost, ampak kot v živega Odrešenika, ki tudi danes spreminja življenja. Vendar ŽIVA VERA ni le ime ali verski izraz. Je povabilo k pristnim odnosom, iskrenosti, služenju in skrbi za druge. To so vrednote, ki jih želimo živeti vsi, ki strežemo v tej kavarni.$t$),
  (60, 'More than a café',
    $t$More than just a café$t$,
    $t$Več kot le kavarna$t$,
    $t$ŽIVA VERA is not only a place for coffee. It's a place to meet. A place to talk. A place to take your time. A place where you are welcome exactly as you are. We would be glad to see you and to serve you with a smile, a good coffee and sincere hospitality.$t$,
    $t$ŽIVA VERA ni le prostor za kavo. Je prostor srečevanja. Prostor pogovora. Prostor, kjer si lahko vzamete čas. Prostor, kjer ste dobrodošli točno takšni, kot ste. Veseli bomo vašega obiska in priložnosti, da vas postrežemo z nasmehom, dobro kavo in pristnim gostoljubjem.$t$)
) AS s(ord, label, t_en, t_sl, b_en, b_sl);


-- ============== SEED SECTIONS: Visit ==============
-- Only the editorial intro and the contribute call-to-action live in the CMS.
-- Hours, location, contact remain hard-coded as operational data.
WITH p AS (SELECT id FROM public.static_pages WHERE page_key='visit')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, title_en, title_sl, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Intro', 10,
  $t$Visit & Contribute$t$,
  $t$Obisk in prispevek$t$,
  $t$We'd love to meet you. Stop in for a coffee, stay for a conversation, and contribute what feels right — there's no price list.$t$,
  $t$Veseli bomo vašega obiska. Pridite na kavo, ostanite na pogovoru in prispevajte po svoji presoji — cenika ni.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='visit')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, title_en, title_sl, body_en, body_sl, subtitle_en, subtitle_sl)
SELECT p.id, 'call_to_action', 'How to contribute', 20,
  $t$How to contribute$t$,
  $t$Kako prispevati$t$,
  $t$Since we don't sell drinks in the usual way, we can't issue receipts. If you'd like to support our mission, you can leave a voluntary contribution in person at the café, or contact us about other ways to give. 10% of all contributions go to the Ebenezer orphanage in Ethiopia.$t$,
  $t$Ker pijač ne prodajamo na običajen način, ne moremo izdati računov. Če želite podpreti naše poslanstvo, lahko prostovoljni prispevek pustite osebno v kavarni ali se obrnete na nas za druge možnosti. 10 % vseh prispevkov gre sirotišnici Ebenezer v Etiopiji.$t$,
  $t$This is informational only — no online payments at this time.$t$,
  $t$To je le informativno — spletnih plačil zaenkrat ne sprejemamo.$t$
FROM p;


-- ============== SEED SECTIONS: Hospitality ==============
WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, title_en, title_sl, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Intro', 10,
  $t$Hospitality and Service Policy$t$,
  $t$Politika gostoljubnosti in postrežbe$t$,
  $t$ŽIVA VERA is a non-profit café that operates as a mission of Calvary Chapel Celje. Our work is built on volunteer effort, the voluntary contributions of our guests, and the desire to create a warm, safe and respectful space for everyone.$t$,
  $t$ŽIVA VERA je neprofitna kavarna, ki deluje kot poslanstvo Krščanske cerkve Kalvarija. Naše delovanje temelji na prostovoljnem delu, prostovoljnih prispevkih obiskovalcev ter želji ustvarjati prijeten, varen in spoštljiv prostor za vse ljudi.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Welcome', 20,
  $t$We want to welcome every guest with openness, kindness and hospitality. We believe that even a simple cup of coffee and a sincere conversation can strengthen our community and create a place where people feel accepted and respected.$t$,
  $t$Vsakega obiskovalca želimo sprejeti z odprtostjo, prijaznostjo in gostoljubnostjo. Verjamemo, da lahko že preprosta skodelica kave in iskren pogovor prispevata k boljši skupnosti ter ustvarjata prostor, kjer se ljudje počutijo sprejete in spoštovane.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Nature of our work', 30,
  $t$Because our work is not a typical commercial hospitality business, but a non-profit mission supported by the community, serving drinks and other offerings is not an individual right to service — it is an expression of our hospitality and service to the community.$t$,
  $t$Ker naše delovanje ne temelji na običajnem komercialnem gostinstvu, temveč na neprofitnem poslanstvu in prostovoljni podpori skupnosti, postrežba napitkov in drugih storitev ne predstavlja pravice posameznika do storitve, temveč izraz naše gostoljubnosti in služenja skupnosti.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Discretion', 40,
  $t$Out of responsibility to our volunteers, guests, donors and to the mission itself, we reserve the right, at our own discretion, to refuse, limit or stop service to any individual whose behavior is, in our judgment, not in line with the purpose, values and healthy operation of our café.$t$,
  $t$Zaradi odgovornosti do naših prostovoljcev, obiskovalcev, donatorjev in samega poslanstva si pridržujemo pravico, da po lastni presoji zavrnemo, omejimo ali prekinemo postrežbo posamezniku, kadar ocenimo, da njegovo ravnanje ni skladno z namenom, vrednotami ali dobrim delovanjem naše kavarne.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, title_en, title_sl, body_en, body_sl, bullets)
SELECT p.id, 'policy_section', 'Behavior that may limit service', 50,
  NULL, NULL,
  $t$Such situations may include, among others:$t$,
  $t$Takšni primeri lahko med drugim vključujejo:$t$,
  $j$[
    {"text_en":"disrespectful, offensive or aggressive communication;","text_sl":"nespoštljivo, žaljivo ali agresivno komunikacijo;"},
    {"text_en":"harassment of volunteers, guests or other people;","text_sl":"nadlegovanje prostovoljcev, obiskovalcev ali drugih oseb;"},
    {"text_en":"disruptive behavior that negatively affects the atmosphere of the space;","text_sl":"moteče vedenje, ki negativno vpliva na vzdušje v prostoru;"},
    {"text_en":"deliberate exploitation of the voluntary contribution system;","text_sl":"namerno izkoriščanje sistema prostovoljnih prispevkov;"},
    {"text_en":"repeated behavior that shows disregard for the voluntary nature of our work;","text_sl":"ponavljajoče ravnanje, ki kaže na nespoštovanje do prostovoljnega značaja našega delovanja;"},
    {"text_en":"any other actions that, in the reasonable judgment of the team or volunteers, harm the community, reputation or mission of the café.","text_sl":"druga dejanja, ki po razumni presoji vodstva ali prostovoljcev škodujejo skupnosti, ugledu ali poslanstvu kavarne."}
  ]$j$::jsonb
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'After bullets', 60,
  $t$We especially want to emphasize that the voluntary contribution system is built on mutual trust, respect and responsibility. It exists to keep this space open and accessible to everyone — not to be deliberately taken advantage of. If we find that someone is knowingly and repeatedly abusing the system, we reserve the right to no longer offer them service.$t$,
  $t$Posebej želimo poudariti, da je sistem prostovoljnih prispevkov zasnovan na medsebojnem zaupanju, spoštovanju in odgovornosti. Namenjen je temu, da omogoča dostopen in odprt prostor za vse, ne pa temu, da bi ga posamezniki namerno izkoriščali v svojo korist. Če ugotovimo, da nekdo sistem zavestno in ponavljajoče zlorablja, si pridržujemo pravico, da mu nadaljnje postrežbe ne omogočimo.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Trust & fairness', 70,
  $t$In every decision we strive to act fairly, respectfully and without discrimination. Our decisions are never connected to nationality, gender, age, social status, religious belief or any other personal circumstance — only to behavior and to how a person treats other guests, volunteers and the mission of the café.$t$,
  $t$Pri vseh odločitvah si prizadevamo ravnati pošteno, spoštljivo in brez diskriminacije. Naše odločitve niso povezane z narodnostjo, spolom, starostjo, socialnim položajem, verskim prepričanjem ali drugimi osebnimi okoliščinami posameznika, temveč izključno z njegovim vedenjem in odnosom do drugih ljudi, prostovoljcev ter samega poslanstva kavarne.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Goal', 80,
  $t$Our goal is not to exclude people, but to protect a space in which guests and volunteers can feel welcome, respected and safe. We believe such an environment can only be preserved through mutual respect and a responsible attitude from everyone who shapes this community.$t$,
  $t$Naš cilj ni izključevanje ljudi, temveč varovanje prostora, v katerem se lahko obiskovalci in prostovoljci počutijo dobrodošle, spoštovane in varne. Verjamemo, da je takšno okolje mogoče ohranjati le ob medsebojnem spoštovanju in odgovornem odnosu vseh, ki soustvarjamo to skupnost.$t$
FROM p;

WITH p AS (SELECT id FROM public.static_pages WHERE page_key='hospitality')
INSERT INTO public.static_page_sections
  (page_id, section_type, internal_label, sort_order, body_en, body_sl)
SELECT p.id, 'simple_text_block', 'Thanks', 90,
  $t$Thank you for your understanding, your support and your respect for the values on which ŽIVA VERA is built.$t$,
  $t$Zahvaljujemo se vam za razumevanje, podporo in spoštovanje vrednot, na katerih temelji delovanje kavarne ŽIVA VERA.$t$
FROM p;
