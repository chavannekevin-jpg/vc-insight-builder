-- Create company_models table to store computed CompanyModel data
CREATE TABLE public.company_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  model_data JSONB NOT NULL,
  coherence_score INTEGER,
  discrepancy_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.company_models ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own company's model
CREATE POLICY "Users can view own company model"
  ON public.company_models
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE founder_id = auth.uid()
    )
  );

-- Policy: Service role can manage all models (for edge functions)
CREATE POLICY "Service role can manage all models"
  ON public.company_models
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_company_models_company_id ON public.company_models(company_id);

-- Add updated_at trigger
CREATE TRIGGER update_company_models_updated_at
  BEFORE UPDATE ON public.company_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();