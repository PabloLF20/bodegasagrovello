ALTER TABLE public.bookings ADD COLUMN visit_type text NOT NULL DEFAULT 'bodega_1_vino';

CREATE OR REPLACE FUNCTION public.validate_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.guests < 1 OR NEW.guests > 2 THEN
    RAISE EXCEPTION 'guests must be between 1 and 2';
  END IF;
  IF NEW.booking_time NOT IN ('10:00', '17:00') THEN
    RAISE EXCEPTION 'booking_time must be 10:00 or 17:00';
  END IF;
  IF NEW.status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  IF NEW.visit_type NOT IN ('bodega_1_vino', 'bodega_2_vinos') THEN
    RAISE EXCEPTION 'invalid visit_type';
  END IF;
  RETURN NEW;
END;
$function$;