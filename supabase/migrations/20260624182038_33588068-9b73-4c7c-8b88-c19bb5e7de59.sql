
-- Café sessions: one row per open→close cycle
CREATE TABLE public.cafe_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opened_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_by_email TEXT,
  closed_by_email TEXT,
  drinks_served INTEGER NOT NULL DEFAULT 0,
  people_served INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafe_sessions TO authenticated;
GRANT ALL ON public.cafe_sessions TO service_role;

ALTER TABLE public.cafe_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write sessions
CREATE POLICY "Admins can view cafe sessions"
  ON public.cafe_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert cafe sessions"
  ON public.cafe_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cafe sessions"
  ON public.cafe_sessions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cafe sessions"
  ON public.cafe_sessions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER cafe_sessions_set_updated_at
  BEFORE UPDATE ON public.cafe_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX cafe_sessions_opened_at_idx ON public.cafe_sessions (opened_at DESC);
CREATE INDEX cafe_sessions_open_idx ON public.cafe_sessions (closed_at) WHERE closed_at IS NULL;

-- Trigger on cafe_status: open a session on OPEN, finalize on CLOSED
CREATE OR REPLACE FUNCTION public.manage_cafe_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_was_open BOOLEAN;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.updated_by;

  IF TG_OP = 'INSERT' THEN
    v_was_open := false;
  ELSE
    v_was_open := COALESCE(OLD.is_open, false);
  END IF;

  -- Transition to OPEN: start a new session if none active
  IF NEW.is_open = true AND v_was_open = false THEN
    INSERT INTO public.cafe_sessions (opened_at, opened_by, opened_by_email)
    VALUES (now(), NEW.updated_by, v_email);
  END IF;

  -- Transition to CLOSED: finalize the most recent open session
  IF NEW.is_open = false AND v_was_open = true THEN
    UPDATE public.cafe_sessions
    SET closed_at = now(),
        closed_by = NEW.updated_by,
        closed_by_email = v_email
    WHERE id = (
      SELECT id FROM public.cafe_sessions
      WHERE closed_at IS NULL
      ORDER BY opened_at DESC
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER cafe_status_manage_session
  AFTER INSERT OR UPDATE OF is_open ON public.cafe_status
  FOR EACH ROW EXECUTE FUNCTION public.manage_cafe_session();

-- Backfill: if café is currently open and no active session, create one
INSERT INTO public.cafe_sessions (opened_at, opened_by, opened_by_email)
SELECT now(), s.updated_by, u.email
FROM public.cafe_status s
LEFT JOIN auth.users u ON u.id = s.updated_by
WHERE s.is_open = true
  AND NOT EXISTS (SELECT 1 FROM public.cafe_sessions WHERE closed_at IS NULL);
