-- Migration: Create customers and cafe_visits tables
-- For tracking coffee shop visitors, orders, conversation notes, and donations

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  first_visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Create cafe_visits table
CREATE TABLE IF NOT EXISTS public.cafe_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  guest_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  donation_given BOOLEAN NOT NULL DEFAULT false,
  donation_amount NUMERIC(10, 2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card') OR payment_method IS NULL),
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email TEXT
);

-- Indexes for fast searches and sorting
CREATE INDEX IF NOT EXISTS customers_name_idx ON public.customers (name);
CREATE INDEX IF NOT EXISTS customers_last_visited_at_idx ON public.customers (last_visited_at DESC);
CREATE INDEX IF NOT EXISTS cafe_visits_visited_at_idx ON public.cafe_visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS cafe_visits_customer_id_idx ON public.cafe_visits (customer_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafe_visits TO authenticated;
GRANT ALL ON public.cafe_visits TO service_role;

-- Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_visits ENABLE ROW LEVEL SECURITY;

-- Policies for customers
CREATE POLICY "Admins can view customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies for cafe_visits
CREATE POLICY "Admins can view cafe visits"
  ON public.cafe_visits FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert cafe visits"
  ON public.cafe_visits FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cafe visits"
  ON public.cafe_visits FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cafe visits"
  ON public.cafe_visits FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for customers updated_at
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to update customer visit stats when a new visit is logged
CREATE OR REPLACE FUNCTION public.sync_customer_visit_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.customer_id IS NOT NULL THEN
      UPDATE public.customers
      SET visit_count = (SELECT count(*) FROM public.cafe_visits WHERE customer_id = OLD.customer_id),
          last_visited_at = COALESCE((SELECT max(visited_at) FROM public.cafe_visits WHERE customer_id = OLD.customer_id), first_visited_at),
          updated_at = now()
      WHERE id = OLD.customer_id;
    END IF;
    RETURN OLD;
  ELSE
    IF NEW.customer_id IS NOT NULL THEN
      UPDATE public.customers
      SET last_visited_at = NEW.visited_at,
          visit_count = (SELECT count(*) FROM public.cafe_visits WHERE customer_id = NEW.customer_id),
          updated_at = now()
      WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS cafe_visits_sync_customer ON public.cafe_visits;
CREATE TRIGGER cafe_visits_sync_customer
  AFTER INSERT OR UPDATE OR DELETE ON public.cafe_visits
  FOR EACH ROW EXECUTE FUNCTION public.sync_customer_visit_stats();
