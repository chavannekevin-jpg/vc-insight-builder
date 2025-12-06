-- Fix 1: Add RLS policies to discount_codes table
-- Only admins can view, create, update, and delete discount codes
CREATE POLICY "Only admins can view discount codes"
ON public.discount_codes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can create discount codes"
ON public.discount_codes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update discount codes"
ON public.discount_codes
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete discount codes"
ON public.discount_codes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Drop the company_responses_view as it's not used and exposes sensitive data
DROP VIEW IF EXISTS public.company_responses_view;