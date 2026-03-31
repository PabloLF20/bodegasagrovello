
-- schedule_config: admin-configurable visit schedule rules
CREATE TABLE public.schedule_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  days_of_week integer[],   -- null/empty = any day; 0=Sun,1=Mon,...,6=Sat
  times text[] NOT NULL,
  start_date date,           -- null = no lower bound
  end_date date,             -- null = no upper bound
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.schedule_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for the public booking form)
CREATE POLICY "Anyone can read schedule_config"
  ON public.schedule_config FOR SELECT
  USING (true);

-- Only authenticated (admin) can manage
CREATE POLICY "Authenticated can manage schedule_config"
  ON public.schedule_config FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed initial rules
INSERT INTO public.schedule_config (name, days_of_week, times, start_date, end_date, active) VALUES
  ('Semana Santa 2026', NULL, ARRAY['12:15','13:15','19:00'], '2026-04-01', '2026-04-05', true),
  ('Horario regular', ARRAY[0,6], ARRAY['12:15','13:15'], '2026-04-06', NULL, true);
