-- Allow authenticated users to create accelerator invites
-- This is needed for the join flow where invites are created after user authenticates
CREATE POLICY "Authenticated users can create accelerator invites"
ON public.accelerator_invites
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also allow reading invites they created or that are active
CREATE POLICY "Authenticated users can view accelerator invites"
ON public.accelerator_invites
FOR SELECT
TO authenticated
USING (is_active = true);