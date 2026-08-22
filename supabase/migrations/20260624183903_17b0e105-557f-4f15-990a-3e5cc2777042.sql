ALTER TABLE public.cafe_sessions
  ADD COLUMN IF NOT EXISTS hot_drinks_served INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cold_drinks_served INTEGER NOT NULL DEFAULT 0;

UPDATE public.cafe_sessions
SET hot_drinks_served = COALESCE(drinks_served, 0)
WHERE drinks_served IS NOT NULL AND hot_drinks_served = 0;

ALTER TABLE public.cafe_sessions DROP COLUMN IF EXISTS drinks_served;