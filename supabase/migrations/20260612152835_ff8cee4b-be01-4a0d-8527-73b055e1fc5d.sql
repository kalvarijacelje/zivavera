
-- 1. Prayer requests table
CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text,
  contact text,
  message text NOT NULL CHECK (length(btrim(message)) BETWEEN 1 AND 4000),
  request_type text NOT NULL DEFAULT 'prayer' CHECK (request_type IN ('prayer','spiritual_question')),
  visibility_choice text NOT NULL DEFAULT 'private_staff' CHECK (visibility_choice IN ('private_staff','public_if_approved')),
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved_public','private_only','archived')),
  moderator_note text
);

-- Grants — anonymous + authenticated can submit; reads restricted via RLS to admins.
GRANT INSERT ON public.prayer_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.prayer_requests TO authenticated;
GRANT ALL ON public.prayer_requests TO service_role;

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Anyone may submit, but submissions must start in 'new' with no moderator note.
CREATE POLICY "Anyone can submit prayer requests"
  ON public.prayer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'new' AND moderator_note IS NULL);

-- Admins can read everything.
CREATE POLICY "Admins can read prayer requests"
  ON public.prayer_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can moderate (update / archive).
CREATE POLICY "Admins can update prayer requests"
  ON public.prayer_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prayer requests"
  ON public.prayer_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger (reuses existing function)
CREATE TRIGGER set_prayer_requests_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX prayer_requests_status_idx ON public.prayer_requests (status, created_at DESC);

-- 2. Safe public prayer wall function — exposes only approved, public rows
-- with anonymised names and no contact information.
CREATE OR REPLACE FUNCTION public.get_prayer_wall()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  message text,
  request_type text,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    created_at,
    message,
    request_type,
    CASE WHEN is_anonymous OR name IS NULL OR btrim(name) = '' THEN NULL
         ELSE split_part(btrim(name), ' ', 1)
    END AS display_name
  FROM public.prayer_requests
  WHERE status = 'approved_public'
    AND visibility_choice = 'public_if_approved'
  ORDER BY created_at DESC
  LIMIT 100;
$$;

REVOKE ALL ON FUNCTION public.get_prayer_wall() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_prayer_wall() TO anon, authenticated;

-- 3. Seed a "prayer" static page so admins can edit the editorial content
-- using the existing Static Pages builder. Hidden from navigation by default.
INSERT INTO public.static_pages (page_key, internal_label, title_en, title_sl, published, show_in_navigation, nav_order)
VALUES ('prayer', 'Prayer / Reflection', 'Prayer & Reflection', 'Molitev in razmišljanje', true, false, 50)
ON CONFLICT (page_key) DO NOTHING;
