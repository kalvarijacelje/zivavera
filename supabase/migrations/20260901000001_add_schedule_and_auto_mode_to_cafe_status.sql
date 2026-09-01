-- Migration: Add automation mode, schedule, and override to cafe_status
-- Date: 2026-09-01

ALTER TABLE public.cafe_status
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto', 'manual_open', 'manual_closed')),
  ADD COLUMN IF NOT EXISTS schedule jsonb NOT NULL DEFAULT '{
    "mon": { "enabled": true, "open": "08:00", "close": "14:00" },
    "tue": { "enabled": true, "open": "08:00", "close": "14:00" },
    "wed": { "enabled": true, "open": "08:00", "close": "14:00" },
    "thu": { "enabled": true, "open": "08:00", "close": "14:00" },
    "fri": { "enabled": true, "open": "08:00", "close": "14:00" },
    "sat": { "enabled": false, "open": "09:00", "close": "13:00" },
    "sun": { "enabled": false, "open": "09:00", "close": "13:00" }
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS override_until timestamptz;

-- Comment for documentation
COMMENT ON COLUMN public.cafe_status.mode IS 'Operating mode: auto (follows weekly schedule), manual_open (force open), manual_closed (force closed)';
COMMENT ON COLUMN public.cafe_status.schedule IS 'Configurable weekly operating hours per day (mon-sun)';
COMMENT ON COLUMN public.cafe_status.override_until IS 'Optional timestamp when a manual override expires and automatically reverts to auto mode';
