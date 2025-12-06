-- Create table to track roast questions history for variety
CREATE TABLE public.roast_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  category TEXT,
  asked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying by company
CREATE INDEX idx_roast_question_history_company ON public.roast_question_history(company_id, asked_at DESC);

-- Enable RLS
ALTER TABLE public.roast_question_history ENABLE ROW LEVEL SECURITY;

-- Founders can view their company's question history
CREATE POLICY "Founders can view their company question history"
ON public.roast_question_history
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM companies
  WHERE companies.id = roast_question_history.company_id
  AND companies.founder_id = auth.uid()
));

-- Founders can insert question history for their companies
CREATE POLICY "Founders can insert question history"
ON public.roast_question_history
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM companies
  WHERE companies.id = roast_question_history.company_id
  AND companies.founder_id = auth.uid()
));

-- Service role can manage all (for edge functions)
CREATE POLICY "Service role can manage all question history"
ON public.roast_question_history
FOR ALL
USING (true)
WITH CHECK (true);