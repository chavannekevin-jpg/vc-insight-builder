-- Add generation tracking columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS generations_available INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS generations_used INTEGER NOT NULL DEFAULT 0;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_companies_generations ON public.companies(generations_available, generations_used);