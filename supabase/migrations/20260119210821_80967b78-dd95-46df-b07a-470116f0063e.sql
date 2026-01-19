-- Allow public (unauthenticated) access to investor profiles for booking pages
-- This is needed so external users can view booking pages without logging in
CREATE POLICY "Public can view investor profiles for booking pages"
ON public.investor_profiles
FOR SELECT
USING (
  onboarding_completed = true
);