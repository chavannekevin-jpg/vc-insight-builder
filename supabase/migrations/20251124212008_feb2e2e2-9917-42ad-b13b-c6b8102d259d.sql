-- Add new columns to companies table for freemium intake
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS biggest_challenge TEXT;

-- Add comment to describe the new columns
COMMENT ON COLUMN public.companies.description IS 'One sentence description of what the startup does';
COMMENT ON COLUMN public.companies.category IS 'Startup category (SaaS, Fintech, Marketplace, Consumer, AI, etc.)';
COMMENT ON COLUMN public.companies.biggest_challenge IS 'Current biggest challenge facing the startup';