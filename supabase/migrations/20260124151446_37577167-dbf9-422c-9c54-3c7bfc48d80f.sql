-- Allow public read access to active team invites for validation (limited fields)
CREATE POLICY "Public can validate team invites"
ON public.accelerator_team_invites
FOR SELECT
USING (is_active = true);