-- Table to cache AI-generated section improvement recommendations for accelerators
CREATE TABLE public.accelerator_section_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  suggestions JSONB NOT NULL,
  key_insight TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, section_name)
);

-- Enable RLS
ALTER TABLE public.accelerator_section_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Accelerator members can view recommendations for their portfolio companies
CREATE POLICY "Accelerator members can view recommendations"
ON public.accelerator_section_recommendations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM companies c
    JOIN accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN accelerator_members am ON ai.linked_accelerator_id = am.accelerator_id
    WHERE c.id = accelerator_section_recommendations.company_id
    AND am.user_id = auth.uid()
    AND am.joined_at IS NOT NULL
  )
);

-- Policy: Accelerator members can insert recommendations for their portfolio companies
CREATE POLICY "Accelerator members can insert recommendations"
ON public.accelerator_section_recommendations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies c
    JOIN accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN accelerator_members am ON ai.linked_accelerator_id = am.accelerator_id
    WHERE c.id = accelerator_section_recommendations.company_id
    AND am.user_id = auth.uid()
    AND am.joined_at IS NOT NULL
  )
);

-- Policy: Accelerator members can update recommendations for their portfolio companies
CREATE POLICY "Accelerator members can update recommendations"
ON public.accelerator_section_recommendations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM companies c
    JOIN accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN accelerator_members am ON ai.linked_accelerator_id = am.accelerator_id
    WHERE c.id = accelerator_section_recommendations.company_id
    AND am.user_id = auth.uid()
    AND am.joined_at IS NOT NULL
  )
);

-- Index for fast lookups
CREATE INDEX idx_accelerator_section_recommendations_company 
ON public.accelerator_section_recommendations(company_id);

CREATE INDEX idx_accelerator_section_recommendations_section 
ON public.accelerator_section_recommendations(company_id, section_name);