-- Allow anyone to read accelerator_members rows by invite_token for claim validation
-- This only exposes rows that have a non-null invite_token (pending claims)
CREATE POLICY "Anyone can validate claim tokens"
ON public.accelerator_members
FOR SELECT
USING (invite_token IS NOT NULL);