-- Add new columns to workshop_templates for pre-seed validation features
ALTER TABLE public.workshop_templates 
ADD COLUMN IF NOT EXISTS preseed_evidence_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS discovery_prompts jsonb DEFAULT '[]'::jsonb;

-- Add validation_report column to workshop_completions
ALTER TABLE public.workshop_completions 
ADD COLUMN IF NOT EXISTS validation_report jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.workshop_templates.preseed_evidence_items IS 'Array of evidence checklist items appropriate for pre-seed validation';
COMMENT ON COLUMN public.workshop_templates.discovery_prompts IS 'Mom Test style follow-up questions for discovery';
COMMENT ON COLUMN public.workshop_completions.validation_report IS 'AI-generated pre-seed validation analysis with grades and roadmap';