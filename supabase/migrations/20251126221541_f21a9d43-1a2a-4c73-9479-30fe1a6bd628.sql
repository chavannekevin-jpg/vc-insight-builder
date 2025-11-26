-- Add policy to allow admins to view all companies
CREATE POLICY "Admins can view all companies"
ON public.companies
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy to allow admins to view all memo responses
CREATE POLICY "Admins can view all memo responses"
ON public.memo_responses
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));