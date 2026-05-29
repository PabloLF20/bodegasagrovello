-- Remove hardcoded booking_time validation so any time configured in schedule_config is accepted
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
  IF NEW.status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  IF NEW.visit_type NOT IN ('bodega_1_vino', 'bodega_2_vinos') THEN
    RAISE EXCEPTION 'invalid visit_type';
  END IF;
  RETURN NEW;
END;
$$;
