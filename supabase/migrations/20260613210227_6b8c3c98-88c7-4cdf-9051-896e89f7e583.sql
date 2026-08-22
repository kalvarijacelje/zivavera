
ALTER TABLE public.prayer_requests
  ADD COLUMN IF NOT EXISTS submitter_ip_hash text;

CREATE INDEX IF NOT EXISTS prayer_requests_ip_hash_created_idx
  ON public.prayer_requests (submitter_ip_hash, created_at DESC);
