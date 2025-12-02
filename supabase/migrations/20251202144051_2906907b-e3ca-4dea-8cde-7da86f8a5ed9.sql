-- Allow admins to update all companies (for toggling premium access)
CREATE POLICY "Admins can update all companies"
ON public.companies
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));