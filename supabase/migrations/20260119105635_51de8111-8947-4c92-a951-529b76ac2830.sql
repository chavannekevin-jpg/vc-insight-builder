-- Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage dealflow" ON public.investor_dealflow;

-- Create a more restrictive policy for auto-adding to dealflow via referral
-- This allows inserting when the company was referred by the investor
CREATE POLICY "Auto-add referred companies to dealflow"
ON public.investor_dealflow FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = company_id
    AND c.referred_by_investor = investor_id
  )
);