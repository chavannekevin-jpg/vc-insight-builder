-- Grant SELECT permission on accelerators table to anon and authenticated roles
-- RLS policies already control row-level access, but the role needs table-level SELECT permission first
GRANT SELECT ON public.accelerators TO anon, authenticated;