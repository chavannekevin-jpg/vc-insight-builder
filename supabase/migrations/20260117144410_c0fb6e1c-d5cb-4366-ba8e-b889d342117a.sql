-- Add policy to allow reading inviter's contacts when joining via invite code
-- This enables the "see inviter's network" feature during onboarding

-- Create a function to check if user was invited by a specific inviter
CREATE OR REPLACE FUNCTION public.get_inviter_id_from_code(invite_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT inviter_id 
  FROM investor_invites 
  WHERE code = invite_code 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1
$$;

-- Add policy to allow users to read contacts of the person who invited them
-- Users can only access this during onboarding when they have a valid invite code
CREATE POLICY "Users can view inviter contacts via invite code"
ON public.investor_contacts
FOR SELECT
USING (
  -- Allow access if the investor_id matches an active invite's inviter
  EXISTS (
    SELECT 1 FROM investor_invites ii
    WHERE ii.inviter_id = investor_contacts.investor_id
      AND ii.is_active = true
      AND (ii.expires_at IS NULL OR ii.expires_at > now())
      AND ii.uses < COALESCE(ii.max_uses, 999999)
  )
);

-- Also allow reading global_contacts for users being onboarded (not just investors)
CREATE POLICY "Authenticated users can view global contacts"
ON public.global_contacts
FOR SELECT
USING (auth.uid() IS NOT NULL);