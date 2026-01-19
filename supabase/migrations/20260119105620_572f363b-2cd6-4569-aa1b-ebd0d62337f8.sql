-- Create startup_invites table for investor-generated codes
CREATE TABLE public.startup_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(12) UNIQUE NOT NULL,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  discount_percent INTEGER DEFAULT 20,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create investor_dealflow table
CREATE TABLE public.investor_dealflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'reviewing' CHECK (status IN ('reviewing', 'due_diligence', 'term_sheet', 'closed', 'passed')),
  source TEXT DEFAULT 'invite' CHECK (source IN ('invite', 'deck_upload', 'manual')),
  invited_via_code VARCHAR(12),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(investor_id, company_id)
);

-- Add referral tracking columns to companies
ALTER TABLE public.companies 
ADD COLUMN referred_by_investor UUID REFERENCES public.investor_profiles(id),
ADD COLUMN referral_code VARCHAR(12),
ADD COLUMN referral_discount_applied BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.startup_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_dealflow ENABLE ROW LEVEL SECURITY;

-- RLS policies for startup_invites
CREATE POLICY "Investors can create their own startup invite codes"
ON public.startup_invites FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can view their own startup invite codes"
ON public.startup_invites FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can update their own startup invite codes"
ON public.startup_invites FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Anyone can validate startup invite codes"
ON public.startup_invites FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS policies for investor_dealflow
CREATE POLICY "Investors can view their own dealflow"
ON public.investor_dealflow FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can insert into their own dealflow"
ON public.investor_dealflow FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own dealflow"
ON public.investor_dealflow FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete from their own dealflow"
ON public.investor_dealflow FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Admins can manage all dealflow"
ON public.investor_dealflow FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert dealflow entries (for referral system)
CREATE POLICY "Service role can manage dealflow"
ON public.investor_dealflow FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_investor_dealflow_updated_at
BEFORE UPDATE ON public.investor_dealflow
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();