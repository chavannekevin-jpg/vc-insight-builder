-- Create business_opportunities table for general business CRM
CREATE TABLE public.business_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  value_estimate NUMERIC,
  status TEXT NOT NULL DEFAULT 'lead',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Investors can view their own opportunities"
ON public.business_opportunities
FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can create their own opportunities"
ON public.business_opportunities
FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own opportunities"
ON public.business_opportunities
FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own opportunities"
ON public.business_opportunities
FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Admins can manage all opportunities"
ON public.business_opportunities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_business_opportunities_updated_at
BEFORE UPDATE ON public.business_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();