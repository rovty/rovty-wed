
-- Guests table
CREATE TABLE public.guests (
  code text PRIMARY KEY,
  name text NOT NULL,
  title text,
  seats int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage guests" ON public.guests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RSVPs table
CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_code text NOT NULL REFERENCES public.guests(code) ON DELETE CASCADE,
  attending boolean NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view rsvps" ON public.rsvps
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins delete rsvps" ON public.rsvps
  FOR DELETE TO authenticated USING (true);

-- Public RPC: lookup a guest by code (no auth required)
CREATE OR REPLACE FUNCTION public.get_guest_by_code(_code text)
RETURNS TABLE (code text, name text, title text, seats int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.code, g.name, g.title, g.seats
  FROM public.guests g
  WHERE g.code = upper(trim(_code))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_guest_by_code(text) TO anon, authenticated;

-- Public RPC: submit RSVP (no auth required; code must be valid)
CREATE OR REPLACE FUNCTION public.submit_rsvp(_code text, _attending boolean, _message text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _norm text := upper(trim(_code));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.guests WHERE code = _norm) THEN
    RAISE EXCEPTION 'Invalid invitation code';
  END IF;
  INSERT INTO public.rsvps (guest_code, attending, message)
  VALUES (_norm, _attending, NULLIF(trim(coalesce(_message, '')), ''))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(text, boolean, text) TO anon, authenticated;
