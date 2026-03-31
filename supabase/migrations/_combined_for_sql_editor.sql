-- ============================================================
-- SCRIPT COMBINADO - Pegar en Supabase SQL Editor
-- Proyecto: sgighupbzsxgbzyurotl
-- ============================================================

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  visit_type TEXT NOT NULL DEFAULT 'bodega_2_vinos',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings (public form)
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read bookings
CREATE POLICY "Authenticated users can read bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update bookings
CREATE POLICY "Authenticated users can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can delete bookings
CREATE POLICY "Authenticated users can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (true);

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. get_availability function
CREATE OR REPLACE FUNCTION public.get_availability(target_date TEXT)
RETURNS TABLE(booking_time TEXT, total_guests BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.booking_time, SUM(b.guests)::BIGINT AS total_guests
  FROM public.bookings b
  WHERE b.booking_date = target_date
    AND b.status != 'cancelled'
  GROUP BY b.booking_time
$$;

-- 6. validate_booking trigger (with updated constraints: guests 1-10, new times)
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.guests < 1 OR NEW.guests > 10 THEN
    RAISE EXCEPTION 'guests must be between 1 and 10';
  END IF;
  IF NEW.booking_time NOT IN ('10:00', '17:00', '12:15', '13:15', '19:00') THEN
    RAISE EXCEPTION 'invalid booking_time';
  END IF;
  IF NEW.status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  IF NEW.visit_type NOT IN ('bodega_1_vino', 'bodega_2_vinos') THEN
    RAISE EXCEPTION 'invalid visit_type';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_booking
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- ============================================================
-- schedule_config: admin-configurable visit schedule rules
-- ============================================================
CREATE TABLE public.schedule_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  days_of_week integer[],
  times text[] NOT NULL,
  start_date date,
  end_date date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.schedule_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read schedule_config"
  ON public.schedule_config FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage schedule_config"
  ON public.schedule_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Initial schedule rules
INSERT INTO public.schedule_config (name, days_of_week, times, start_date, end_date, active) VALUES
  ('Semana Santa 2026', NULL, ARRAY['12:15','13:15','19:00'], '2026-04-01', '2026-04-05', true),
  ('Horario regular', ARRAY[0,6], ARRAY['12:15','13:15'], '2026-04-06', NULL, true);
