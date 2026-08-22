
CREATE TABLE public.cafe_status (
  id boolean PRIMARY KEY DEFAULT true,
  is_open boolean NOT NULL DEFAULT false,
  note_en text,
  note_sl text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT cafe_status_singleton CHECK (id = true)
);
GRANT SELECT ON public.cafe_status TO anon;
GRANT SELECT, INSERT, UPDATE ON public.cafe_status TO authenticated;
GRANT ALL ON public.cafe_status TO service_role;
ALTER TABLE public.cafe_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cafe_status public read" ON public.cafe_status FOR SELECT USING (true);
CREATE POLICY "cafe_status admin write" ON public.cafe_status FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.cafe_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open boolean NOT NULL,
  note_en text,
  note_sl text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text
);
GRANT SELECT, INSERT ON public.cafe_status_history TO authenticated;
GRANT ALL ON public.cafe_status_history TO service_role;
ALTER TABLE public.cafe_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history admin read" ON public.cafe_status_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "history admin insert" ON public.cafe_status_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_cafe_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.updated_by;
  INSERT INTO public.cafe_status_history (is_open, note_en, note_sl, changed_by, changed_by_email)
  VALUES (NEW.is_open, NEW.note_en, NEW.note_sl, NEW.updated_by, v_email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER cafe_status_log
AFTER INSERT OR UPDATE ON public.cafe_status
FOR EACH ROW EXECUTE FUNCTION public.log_cafe_status_change();

INSERT INTO public.cafe_status (id, is_open) VALUES (true, false) ON CONFLICT DO NOTHING;
