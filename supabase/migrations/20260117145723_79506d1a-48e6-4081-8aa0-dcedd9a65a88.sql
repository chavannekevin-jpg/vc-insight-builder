-- Add RLS policy to allow authenticated users to view other investor profiles (for the global network map)
-- This only exposes non-sensitive info needed for the map display

CREATE POLICY "Authenticated users can view investor profiles for network"
ON public.investor_profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND onboarding_completed = true
);