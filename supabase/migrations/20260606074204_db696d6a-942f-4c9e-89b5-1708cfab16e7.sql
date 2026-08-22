
ALTER TABLE public.homepage_sections
  ADD COLUMN IF NOT EXISTS value_cards jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill existing values_grid sections with the current 3 preset cards
UPDATE public.homepage_sections
SET value_cards = '[
  {
    "icon": "Users",
    "title_en": "All are welcome",
    "title_sl": "Vsi so dobrodošli",
    "body_en": "A safe, calm space — no pressure, no judgment. Come exactly as you are.",
    "body_sl": "Varen, miren prostor — brez pritiska, brez obsojanja. Pridite točno takšni, kot ste."
  },
  {
    "icon": "HandHeart",
    "title_en": "Rooted in faith",
    "title_sl": "Ukoreninjeni v veri",
    "body_en": "We are an outreach of the Christian Church Kalvarija. Quietly, in everything we do.",
    "body_sl": "Smo poslanstvo Krščanske cerkve Kalvarija. Tiho, v vsem, kar počnemo."
  },
  {
    "icon": "Coffee",
    "title_en": "Coffee with a purpose",
    "title_sl": "Kava z namenom",
    "body_en": "No price list. No sales. Enjoy your drink and contribute what feels right.",
    "body_sl": "Brez cenika, brez prodaje. Uživajte v pijači in prispevajte, kolikor čutite."
  }
]'::jsonb
WHERE section_type = 'values_grid' AND (value_cards IS NULL OR jsonb_array_length(value_cards) = 0);
