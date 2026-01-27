-- Create profile_enrichment_queue table to capture user inputs from various sources
CREATE TABLE public.profile_enrichment_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_tool TEXT,
  input_data JSONB NOT NULL,
  target_section_hint TEXT,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_hash TEXT GENERATED ALWAYS AS (md5(input_data::text)) STORED
);

-- Create index for efficient querying
CREATE INDEX idx_enrichment_queue_company_unprocessed 
  ON public.profile_enrichment_queue(company_id, processed) 
  WHERE processed = false;

CREATE INDEX idx_enrichment_queue_data_hash 
  ON public.profile_enrichment_queue(company_id, source_type, data_hash);

-- Enable Row Level Security
ALTER TABLE public.profile_enrichment_queue ENABLE ROW LEVEL SECURITY;

-- Founders can insert enrichments for their own companies
CREATE POLICY "Founders can insert enrichments for their companies"
  ON public.profile_enrichment_queue
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = profile_enrichment_queue.company_id
        AND companies.founder_id = auth.uid()
    )
  );

-- Founders can view enrichments for their own companies
CREATE POLICY "Founders can view their company enrichments"
  ON public.profile_enrichment_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = profile_enrichment_queue.company_id
        AND companies.founder_id = auth.uid()
    )
  );

-- Founders can update their company enrichments (for marking as processed)
CREATE POLICY "Founders can update their company enrichments"
  ON public.profile_enrichment_queue
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = profile_enrichment_queue.company_id
        AND companies.founder_id = auth.uid()
    )
  );

-- Admins can manage all enrichments
CREATE POLICY "Admins can manage all enrichments"
  ON public.profile_enrichment_queue
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage enrichments (for edge functions)
CREATE POLICY "Service role can manage enrichments"
  ON public.profile_enrichment_queue
  FOR ALL
  USING (true)
  WITH CHECK (true);