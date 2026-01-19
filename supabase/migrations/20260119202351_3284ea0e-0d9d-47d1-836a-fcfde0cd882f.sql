-- Add additional organizations column to store multiple affiliations
ALTER TABLE public.investor_profiles 
ADD COLUMN IF NOT EXISTS additional_organizations JSONB DEFAULT '[]'::jsonb;