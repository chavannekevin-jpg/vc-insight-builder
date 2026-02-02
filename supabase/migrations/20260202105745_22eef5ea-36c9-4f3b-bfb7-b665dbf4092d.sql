-- Add regeneration_count column to workshop_completions
ALTER TABLE public.workshop_completions 
ADD COLUMN IF NOT EXISTS regeneration_count integer NOT NULL DEFAULT 0;

-- Add a comment for documentation
COMMENT ON COLUMN public.workshop_completions.regeneration_count IS 'Tracks number of times the mini-memo has been regenerated. Max 5 allowed.';