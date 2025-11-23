-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Add UPDATE policy for memos table
CREATE POLICY "Founders can update their company memos"
ON public.memos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = memos.company_id
    AND companies.founder_id = auth.uid()
  )
);