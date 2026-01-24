-- Allow public (anon) read access to active accelerators for join links
-- This is needed so that when users visit /join/:slug they can see basic accelerator info

CREATE POLICY "Public can view active accelerators for join links"
ON public.accelerators
FOR SELECT
TO anon, authenticated
USING (is_active = true);