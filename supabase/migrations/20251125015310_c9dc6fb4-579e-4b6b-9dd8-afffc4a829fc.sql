-- Create table to store memo AI analyses
CREATE TABLE public.memo_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memo_id UUID NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_memo FOREIGN KEY (memo_id) REFERENCES public.memos(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.memo_analyses ENABLE ROW LEVEL SECURITY;

-- Founders can view analyses for their company memos
CREATE POLICY "Founders can view their memo analyses"
ON public.memo_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.memos
    JOIN public.companies ON memos.company_id = companies.id
    WHERE memos.id = memo_analyses.memo_id
    AND companies.founder_id = auth.uid()
  )
);

-- Founders can insert analyses for their company memos
CREATE POLICY "Founders can create memo analyses"
ON public.memo_analyses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memos
    JOIN public.companies ON memos.company_id = companies.id
    WHERE memos.id = memo_analyses.memo_id
    AND companies.founder_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_memo_analyses_updated_at
  BEFORE UPDATE ON public.memo_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_memo_analyses_memo_id ON public.memo_analyses(memo_id);