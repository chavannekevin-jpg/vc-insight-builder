-- Create a helper function to check if user has a premium company
CREATE OR REPLACE FUNCTION public.has_premium_company(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies
    WHERE founder_id = _user_id
      AND has_premium = true
  )
$$;

-- Allow premium startup users to read global_contacts (fund data only - no personal info exposed via view)
CREATE POLICY "Premium startups can view fund contacts"
ON public.global_contacts
FOR SELECT
TO authenticated
USING (
  public.has_premium_company(auth.uid())
  OR 
  -- Keep existing investor access working
  EXISTS (
    SELECT 1 FROM public.investor_profiles ip
    WHERE ip.id = auth.uid()
  )
);

-- Allow premium startup users to read investor_profiles (public fund info)
CREATE POLICY "Premium startups can view investor profiles"
ON public.investor_profiles
FOR SELECT
TO authenticated
USING (
  public.has_premium_company(auth.uid())
  OR 
  -- Keep existing access working
  id = auth.uid()
  OR
  onboarding_completed = true
);