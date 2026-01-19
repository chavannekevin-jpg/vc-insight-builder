-- Add sharing columns to investor_dealflow
ALTER TABLE public.investor_dealflow 
ADD COLUMN shared_by_investor_id UUID REFERENCES investor_profiles(id),
ADD COLUMN shared_at TIMESTAMPTZ;

-- Create dealflow_shares table for tracking shares
CREATE TABLE public.dealflow_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_investor_id UUID NOT NULL REFERENCES investor_profiles(id),
  to_investor_id UUID NOT NULL REFERENCES investor_profiles(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate shares
CREATE UNIQUE INDEX idx_dealflow_shares_unique 
ON dealflow_shares(from_investor_id, to_investor_id, company_id);

-- Enable RLS
ALTER TABLE public.dealflow_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dealflow_shares
CREATE POLICY "Investors can share their deals"
ON public.dealflow_shares
FOR INSERT
WITH CHECK (from_investor_id = auth.uid());

CREATE POLICY "Investors can view shares they sent or received"
ON public.dealflow_shares
FOR SELECT
USING (from_investor_id = auth.uid() OR to_investor_id = auth.uid());

CREATE POLICY "Recipients can update share read status"
ON public.dealflow_shares
FOR UPDATE
USING (to_investor_id = auth.uid());

CREATE POLICY "Admins can manage all shares"
ON public.dealflow_shares
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow investors to view memo_responses for companies in their dealflow
CREATE POLICY "Investors can view memo responses for dealflow companies"
ON public.memo_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investor_dealflow
    WHERE investor_dealflow.company_id = memo_responses.company_id
    AND investor_dealflow.investor_id = auth.uid()
  )
);