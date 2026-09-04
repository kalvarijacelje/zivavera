-- Migration: Add recurring events support to public.events
-- Date: 2026-09-04

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_interval text NOT NULL DEFAULT 'weekly';

-- Documentation comments
COMMENT ON COLUMN public.events.is_recurring IS 'Whether this event automatically repeats on a schedule';
COMMENT ON COLUMN public.events.recurrence_interval IS 'Recurrence cadence: weekly, biweekly, monthly';

-- Update the Youth hangout event to be recurring weekly
UPDATE public.events
SET is_recurring = true,
    recurrence_interval = 'weekly'
WHERE title_en ILIKE '%youth%' OR title_sl ILIKE '%mlade%';
