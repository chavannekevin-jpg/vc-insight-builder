-- Create workshop_nps_responses table
CREATE TABLE public.workshop_nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  accelerator_invite_id UUID REFERENCES public.accelerator_invites(id),
  
  -- Slider scores (0-100)
  recommend_lecture INTEGER CHECK (recommend_lecture >= 0 AND recommend_lecture <= 100),
  investor_understanding INTEGER CHECK (investor_understanding >= 0 AND investor_understanding <= 100),
  strengths_weaknesses INTEGER CHECK (strengths_weaknesses >= 0 AND strengths_weaknesses <= 100),
  actionable_confidence INTEGER CHECK (actionable_confidence >= 0 AND actionable_confidence <= 100),
  mini_memo_usefulness INTEGER CHECK (mini_memo_usefulness >= 0 AND mini_memo_usefulness <= 100),
  mentoring_usefulness INTEGER CHECK (mentoring_usefulness >= 0 AND mentoring_usefulness <= 100),
  
  -- Free text
  additional_feedback TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id)
);

-- Enable Row Level Security
ALTER TABLE public.workshop_nps_responses ENABLE ROW LEVEL SECURITY;

-- Founders can manage their own NPS responses
CREATE POLICY "Founders can manage their NPS responses"
  ON public.workshop_nps_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = workshop_nps_responses.company_id 
    AND companies.founder_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = workshop_nps_responses.company_id 
    AND companies.founder_id = auth.uid()
  ));

-- Accelerator members can view NPS responses for their portfolio companies
CREATE POLICY "Accelerator members can view portfolio NPS responses"
  ON public.workshop_nps_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companies c
    JOIN public.accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN public.accelerator_members am ON ai.linked_accelerator_id = am.accelerator_id
    WHERE c.id = workshop_nps_responses.company_id
    AND am.user_id = auth.uid()
    AND am.joined_at IS NOT NULL
  ));

-- Admins can view all NPS responses
CREATE POLICY "Admins can view all NPS responses"
  ON public.workshop_nps_responses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));