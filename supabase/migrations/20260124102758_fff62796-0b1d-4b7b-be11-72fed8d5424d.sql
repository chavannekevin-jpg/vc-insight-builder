-- Add default discount percent to accelerators table
ALTER TABLE public.accelerators 
ADD COLUMN IF NOT EXISTS default_discount_percent integer DEFAULT 100;

-- Create startup claim codes table for admin-generated codes to claim specific startups
CREATE TABLE IF NOT EXISTS public.startup_claim_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(20) NOT NULL UNIQUE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  accelerator_id uuid REFERENCES public.accelerators(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  claimed_at timestamp with time zone,
  claimed_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.startup_claim_codes ENABLE ROW LEVEL SECURITY;

-- Admin can do everything (using user_roles table)
CREATE POLICY "Admins can manage claim codes"
ON public.startup_claim_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Accelerator ecosystem heads can view and claim codes for their accelerator
CREATE POLICY "Accelerator heads can view codes for their accelerator"
ON public.startup_claim_codes
FOR SELECT
TO authenticated
USING (
  accelerator_id IS NULL 
  OR EXISTS (
    SELECT 1 FROM public.accelerators 
    WHERE id = startup_claim_codes.accelerator_id 
    AND ecosystem_head_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_startup_claim_codes_code ON public.startup_claim_codes(code);
CREATE INDEX IF NOT EXISTS idx_startup_claim_codes_company ON public.startup_claim_codes(company_id);
CREATE INDEX IF NOT EXISTS idx_startup_claim_codes_accelerator ON public.startup_claim_codes(accelerator_id);