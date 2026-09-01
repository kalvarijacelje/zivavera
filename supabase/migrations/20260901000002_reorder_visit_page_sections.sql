-- Migration: Reorder visit page sections
-- Put "Visitor Information" (card_grid) before "How to Contribute" (simple_text_block / call_to_action)

UPDATE public.static_page_sections
SET sort_order = 20
WHERE page_id IN (SELECT id FROM public.static_pages WHERE page_key = 'visit')
  AND section_type = 'card_grid';

UPDATE public.static_page_sections
SET sort_order = 40
WHERE page_id IN (SELECT id FROM public.static_pages WHERE page_key = 'visit')
  AND (section_type = 'simple_text_block' OR section_type = 'call_to_action');
