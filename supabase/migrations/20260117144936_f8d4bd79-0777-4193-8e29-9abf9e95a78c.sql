-- Fix the RLS policy for global_contacts to allow users with investor profiles to insert
-- (not just users with the 'investor' role in user_roles)

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Investors can insert global contacts" ON public.global_contacts;

-- Create a new policy that allows any authenticated user with an investor_profile to insert
CREATE POLICY "Users with investor profile can insert global contacts"
ON public.global_contacts
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.investor_profiles
    WHERE id = auth.uid()
  )
);

-- Also update the update policy to be consistent
DROP POLICY IF EXISTS "Investors can update global contacts" ON public.global_contacts;

CREATE POLICY "Users with investor profile can update global contacts"
ON public.global_contacts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.investor_profiles
    WHERE id = auth.uid()
  )
);