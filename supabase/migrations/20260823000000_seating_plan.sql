-- Seating plan feature: tables, assignments, config, and public RPC.

-- Global seating config (single-row)
CREATE TABLE public.seating_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.seating_config (id, published) VALUES (1, false);
GRANT SELECT, UPDATE ON public.seating_config TO authenticated;
GRANT ALL ON public.seating_config TO service_role;
ALTER TABLE public.seating_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seating config" ON public.seating_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seating tables (physical tables in the venue)
CREATE TABLE public.seating_tables (
  id serial PRIMARY KEY,
  table_number int NOT NULL UNIQUE,
  table_name text,
  capacity int NOT NULL DEFAULT 10,
  map_x numeric(5,2) NOT NULL DEFAULT 50,
  map_y numeric(5,2) NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seating_tables TO authenticated;
GRANT ALL ON public.seating_tables TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seating_tables_id_seq TO authenticated;
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seating tables" ON public.seating_tables
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seating assignments (guest_code → table)
CREATE TABLE public.seating_assignments (
  id serial PRIMARY KEY,
  guest_code text NOT NULL REFERENCES public.guests(code) ON DELETE CASCADE,
  table_id int NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guest_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seating_assignments TO authenticated;
GRANT ALL ON public.seating_assignments TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seating_assignments_id_seq TO authenticated;
ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seating assignments" ON public.seating_assignments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public RPC: get seating info by invitation code.
-- Returns NULL if seating is unpublished or guest has no assignment.
CREATE OR REPLACE FUNCTION public.get_seating_by_code(_code text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _norm text := upper(trim(_code));
  _published boolean;
  _guest record;
  _assignment record;
  _tablemates json;
  _result json;
BEGIN
  -- Check if seating is published
  SELECT published INTO _published FROM public.seating_config WHERE id = 1;
  IF NOT _published THEN
    RETURN NULL;
  END IF;

  -- Find the guest
  SELECT code, name, title, seats INTO _guest
  FROM public.guests WHERE code = _norm;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Find their assignment
  SELECT sa.id, sa.table_id, st.table_number, st.table_name, st.map_x, st.map_y
  INTO _assignment
  FROM public.seating_assignments sa
  JOIN public.seating_tables st ON st.id = sa.table_id
  WHERE sa.guest_code = _norm AND st.is_active;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get tablemates (other guests at same table — only names)
  SELECT json_agg(json_build_object(
    'name', g.name,
    'is_current', g.code = _norm
  ) ORDER BY (g.code = _norm) DESC, g.name)
  INTO _tablemates
  FROM public.seating_assignments sa
  JOIN public.guests g ON g.code = sa.guest_code
  WHERE sa.table_id = _assignment.table_id;

  _result := json_build_object(
    'guest_name', _guest.name,
    'guest_code', _guest.code,
    'table_number', _assignment.table_number,
    'table_name', _assignment.table_name,
    'map_x', _assignment.map_x,
    'map_y', _assignment.map_y,
    'tablemates', COALESCE(_tablemates, '[]'::json)
  );

  RETURN _result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_seating_by_code(text) TO anon, authenticated;

-- Seed 27 reception tables with map coordinates
INSERT INTO public.seating_tables (table_number, capacity, map_x, map_y) VALUES
  ( 1, 10, 18.42, 32.00),
  ( 2, 10, 30.41, 32.10),
  ( 3, 10, 23.98, 22.13),
  ( 4, 10, 10.60, 11.50),
  ( 5, 10, 20.83, 11.50),
  ( 6, 10, 30.70, 11.39),
  ( 7, 10, 23.25, 57.48),
  ( 8, 10, 24.85, 72.89),
  ( 9, 10, 29.53, 86.66),
  (10, 10, 34.43, 57.59),
  (11, 10, 47.15, 63.34),
  (12, 10, 61.33, 59.00),
  (13, 10, 61.62, 73.10),
  (14, 10, 63.82, 88.50),
  (15, 10, 75.15, 88.61),
  (16, 10, 72.37, 73.10),
  (17, 10, 72.59, 58.46),
  (18, 10, 65.94, 37.64),
  (19, 10, 68.93, 11.61),
  (20, 10, 74.49, 25.92),
  (21, 10, 82.46, 58.79),
  (22, 10, 80.26, 36.77),
  (23, 10, 80.04, 11.50),
  (24, 10, 82.53, 72.99),
  (25, 10, 87.65, 88.61),
  (26, 10, 92.62, 63.12),
  (27, 10, 92.62, 40.78);
