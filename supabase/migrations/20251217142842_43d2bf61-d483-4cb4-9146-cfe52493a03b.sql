-- Add vc_verdict_json column to companies table
ALTER TABLE public.companies
ADD COLUMN vc_verdict_json jsonb DEFAULT NULL;

-- Add verdict_generated_at column
ALTER TABLE public.companies
ADD COLUMN verdict_generated_at timestamp with time zone DEFAULT NULL;