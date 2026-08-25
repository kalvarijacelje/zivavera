-- ====================================================================
-- ŽIVA VERA: FULL SLOVENIAN CAFÉ MENU & IMAGES
-- Run this script in your Supabase SQL Editor to populate the full menu
-- ====================================================================

-- 1. CLEAN EXISTING DEFAULT SAMPLE MENU ITEMS
DELETE FROM public.menu_items;
DELETE FROM public.menu_categories;

-- 2. INSERT CATEGORIES
INSERT INTO public.menu_categories (id, name_sl, name_en, description_sl, description_en, sort_order, published)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Kave', 'Coffee', 'Vrhunska kava Barcaffè, pripravljena po tradicionalnih slovenskih in italijanskih receptih.', 'Premium Barcaffè coffee prepared according to classic Slovenian and Italian traditions.', 1, true),
  ('c2000000-0000-0000-0000-000000000002', 'Čaji & Zeliščni napitki', 'Teas & Herbal Infusions', 'Skrbno izbrani zeliščni, sadni in tradicionalni čaji za vsak trenutek dneva.', 'Hand-picked herbal, fruit, and classic teas for relaxation and wellness.', 2, true),
  ('c3000000-0000-0000-0000-000000000003', 'Topli napitki', 'Warm Specialties', 'Goste vroče čokolade in domači kakav za prijetne trenutke.', 'Rich hot chocolates and comforting warm cocoa for sweet moments.', 3, true),
  ('c4000000-0000-0000-0000-000000000004', 'Osvežilne pijače', 'Cold Drinks', 'Sveže iztisnjeni sokovi, domača limonada in naravne brezalkoholne pijače.', 'Freshly squeezed juices, artisan lemonades, and natural cold refreshments.', 4, true);

-- 3. INSERT COFFEE ITEMS (KAVE)
INSERT INTO public.menu_items (id, category_id, name_sl, name_en, description_sl, description_en, image_path, featured, available, sort_order, published)
VALUES
  (
    'm1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Espresso (Kratka kava)',
    'Espresso',
    'Čist in poln okus enojnega espresso napitka iz sveže mletih zrn Barcaffè z zlato kremo.',
    'A rich, classic single espresso shot pulled from fresh Barcaffè beans with golden crema.',
    'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
    true, true, 10, true
  ),
  (
    'm1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Dvojni espresso (Doppio)',
    'Double Espresso (Doppio)',
    'Dvojni odmerek espressa za tiste, ki potrebujejo dodatno mero energije in globine okusa.',
    'A double shot of espresso for extra intensity, richness, and depth of flavor.',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    false, true, 20, true
  ),
  (
    'm1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'Macchiato (Kava z mlekom)',
    'Macchiato',
    'Espresso z nekaj kapljicami toplega ali hladnega mleka in nežno kremasto penico.',
    'Espresso marked with a dash of warm or cold milk and delicate foam.',
    'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80',
    true, true, 30, true
  ),
  (
    'm1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    'Kava s smetano',
    'Espresso with Cream',
    'Priljubljena slovenska kavarniška klasika — dišeč espresso z bogato stepeno sladko smetano.',
    'A beloved traditional favorite — aromatic espresso topped with fresh whipped cream.',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    true, true, 40, true
  ),
  (
    'm1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001',
    'Cappuccino (Kapučin)',
    'Cappuccino',
    'Harmonična kombinacija espressa, toplega mleka in goste svilnate mlečne pene.',
    'Espresso balanced with velvety steamed milk and a rich, creamy crown of foam.',
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    true, true, 50, true
  ),
  (
    'm1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000001',
    'Bela kava (Caffè Latte)',
    'White Coffee (Caffè Latte)',
    'Blaga in prijetna kava z obilico toplega mleka, postrežena v večji skodelici.',
    'A gentle, comforting cup with smooth espresso and plenty of warm silky milk.',
    'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    false, true, 60, true
  ),
  (
    'm1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000001',
    'Ledena kava (Iced Coffee)',
    'Iced Coffee',
    'Hladen espresso z mlekom, kockami ledu in po želji kepico sladoleda ali smetano.',
    'Chilled espresso poured over ice with cold milk, topped with optional cream.',
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    false, true, 70, true
  ),
  (
    'm1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000001',
    'Brezkofeinska kava',
    'Decaf Coffee',
    'Poln okus in prijetna aroma prave kave, a povsem brez kofeina. Pripravimo jo po vaši želji.',
    'Full-bodied flavor and authentic aroma, naturally decaffeinated and prepared to your liking.',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    false, true, 80, true
  );

-- 4. INSERT TEAS & HERBAL INFUSIONS (ČAJI)
INSERT INTO public.menu_items (id, category_id, name_sl, name_en, description_sl, description_en, image_path, featured, available, sort_order, published)
VALUES
  (
    'm2000000-0000-0000-0000-000000000001',
    'c2000000-0000-0000-0000-000000000002',
    'Planinski zeliščni čaj',
    'Mountain Herbal Tea',
    'Tradicionalna slovenska mešanica gorskih zelišč (materina dušica, rman, meta in melisa).',
    'Traditional Slovenian alpine herbal blend — fragrant, soothing, and deeply grounding.',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    true, true, 10, true
  ),
  (
    'm2000000-0000-0000-0000-000000000002',
    'c2000000-0000-0000-0000-000000000002',
    'Kamilica z medom',
    'Chamomile with Honey',
    'Nežni cvetovi kamilice za sprostitev in mirne trenutke, postreženi z domačim medom.',
    'Gentle chamomile blossoms offering a soothing, floral cup paired with natural honey.',
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
    false, true, 20, true
  ),
  (
    'm2000000-0000-0000-0000-000000000003',
    'c2000000-0000-0000-0000-000000000002',
    'Poprova meta',
    'Peppermint Infusion',
    'Osvežujoč in aromatičen poparek iz skrbno posušenih listov poprove mete.',
    'Crisp and invigorating peppermint infusion with a refreshing, clean herbal finish.',
    'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80',
    false, true, 30, true
  ),
  (
    'm2000000-0000-0000-0000-000000000004',
    'c2000000-0000-0000-0000-000000000002',
    'Ingver z limono',
    'Fresh Ginger & Lemon',
    'Sveže narezan koren ingverja z rezino sočne limone in žličko medu — topel in poživljajoč.',
    'Freshly sliced ginger root steeped with juicy lemon and pure honey — warming and energizing.',
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80',
    true, true, 40, true
  ),
  (
    'm2000000-0000-0000-0000-000000000005',
    'c2000000-0000-0000-0000-000000000002',
    'Gozdni sadeži',
    'Forest Berries Fruit Tea',
    'Bogat sadni čaj iz zrelih gozdnih jagod, malin, robidnic in hibiskusa.',
    'Rich and tangy fruit tea loaded with raspberries, blackberries, and hibiscus blossoms.',
    'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80',
    false, true, 50, true
  ),
  (
    'm2000000-0000-0000-0000-000000000006',
    'c2000000-0000-0000-0000-000000000002',
    'Zeleni čaj z jasminom',
    'Green Tea with Jasmine',
    'Kakovosten zeleni čaj z naravno aromo cvetov jasmina, bogat z antioksidanti.',
    'Fine whole-leaf green tea scented with sweet, fragrant jasmine blossoms.',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    false, true, 60, true
  ),
  (
    'm2000000-0000-0000-0000-000000000007',
    'c2000000-0000-0000-0000-000000000002',
    'Črni čaj Earl Grey',
    'Earl Grey Black Tea',
    'Elegantni črni čaj z naravnim oljem bergamotke. Odličen z rezino limone ali kapljico mleka.',
    'Classic full-bodied black tea infused with fragrant bergamot oil.',
    'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80',
    false, true, 70, true
  );

-- 5. INSERT WARM DRINKS (TOPLI NAPITKI)
INSERT INTO public.menu_items (id, category_id, name_sl, name_en, description_sl, description_en, image_path, featured, available, sort_order, published)
VALUES
  (
    'm3000000-0000-0000-0000-000000000001',
    'c3000000-0000-0000-0000-000000000003',
    'Gosta vroča čokolada',
    'Thick Hot Chocolate',
    'Prava gosta, kremasta vroča čokolada z bogatim okusom in puhasto stepeno smetano.',
    'Ultra-thick, comforting European hot chocolate topped with freshly whipped cream.',
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
    true, true, 10, true
  ),
  (
    'm3000000-0000-0000-0000-000000000002',
    'c3000000-0000-0000-0000-000000000003',
    'Domači kakav',
    'Warm Cocoa',
    'Topel domač kakav s svežim mlekom — mehak, sladkoben in tolažilen za vsak dan.',
    'Warm, velvety cocoa with steamed milk — pure comfort in a cup.',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    false, true, 20, true
  );

-- 6. INSERT COLD REFRESHMENTS (OSVEŽILNE PIJAČE)
INSERT INTO public.menu_items (id, category_id, name_sl, name_en, description_sl, description_en, image_path, featured, available, sort_order, published)
VALUES
  (
    'm4000000-0000-0000-0000-000000000001',
    'c4000000-0000-0000-0000-000000000004',
    'Sveže iztisnjen pomarančni sok',
    'Fresh Orange Juice',
    '100 % naraven, na mestu sveže iztisnjen pomarančni sok, poln vitaminov in sonca.',
    '100% natural, freshly squeezed orange juice bursting with sunshine and vitamins.',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    true, true, 10, true
  ),
  (
    'm4000000-0000-0000-0000-000000000002',
    'c4000000-0000-0000-0000-000000000004',
    'Domača limonada z meto',
    'Homemade Mint Lemonade',
    'Osvežilna limonada iz sveže stisnjenih limon, listov domače mete in kapljice medu.',
    'Handcrafted lemonade with fresh lemon juice, crushed garden mint, and a touch of honey.',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    false, true, 20, true
  );
