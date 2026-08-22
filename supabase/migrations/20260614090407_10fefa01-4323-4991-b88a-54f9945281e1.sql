
ALTER TABLE public.prayer_requests
  ADD COLUMN IF NOT EXISTS public_response text,
  ADD COLUMN IF NOT EXISTS public_response_at timestamptz;

DROP POLICY IF EXISTS "Anyone can submit prayer requests" ON public.prayer_requests;
CREATE POLICY "Anyone can submit prayer requests"
  ON public.prayer_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND moderator_note IS NULL
    AND public_response IS NULL
  );

DROP FUNCTION IF EXISTS public.get_prayer_wall();
CREATE FUNCTION public.get_prayer_wall()
RETURNS TABLE(
  id uuid,
  created_at timestamp with time zone,
  message text,
  request_type text,
  display_name text,
  public_response text,
  public_response_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    id,
    created_at,
    message,
    request_type,
    CASE WHEN is_anonymous OR name IS NULL OR btrim(name) = '' THEN NULL
         ELSE split_part(btrim(name), ' ', 1)
    END AS display_name,
    CASE WHEN request_type = 'spiritual_question' THEN public_response ELSE NULL END,
    CASE WHEN request_type = 'spiritual_question' THEN public_response_at ELSE NULL END
  FROM public.prayer_requests
  WHERE status = 'approved_public'
    AND visibility_choice = 'public_if_approved'
  ORDER BY created_at DESC
  LIMIT 100;
$$;
