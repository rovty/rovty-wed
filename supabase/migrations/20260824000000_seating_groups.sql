-- RPC to fetch seating info for multiple tables (used by group/corporate links)
CREATE OR REPLACE FUNCTION public.get_seating_by_tables(_table_numbers int[])
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _published boolean;
  _tables json;
BEGIN
  SELECT published INTO _published FROM public.seating_config WHERE id = 1;
  IF NOT _published THEN
    RETURN NULL;
  END IF;

  SELECT json_agg(json_build_object(
    'table_number', st.table_number,
    'table_name', st.table_name,
    'map_x', st.map_x,
    'map_y', st.map_y,
    'guests', (
      SELECT COALESCE(json_agg(json_build_object('name', g.name) ORDER BY g.name), '[]'::json)
      FROM public.seating_assignments sa
      JOIN public.guests g ON g.code = sa.guest_code
      WHERE sa.table_id = st.id
    )
  ) ORDER BY st.table_number)
  INTO _tables
  FROM public.seating_tables st
  WHERE st.table_number = ANY(_table_numbers) AND st.is_active;

  RETURN COALESCE(_tables, '[]'::json);
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_seating_by_tables(int[]) TO anon, authenticated;
