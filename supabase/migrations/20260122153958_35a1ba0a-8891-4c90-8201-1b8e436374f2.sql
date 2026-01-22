-- Add section_relevance field to kb_frameworks for section-specific routing
ALTER TABLE public.kb_frameworks 
ADD COLUMN IF NOT EXISTS section_relevance jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.kb_frameworks.section_relevance IS 'Array of section names this framework is relevant to (e.g., ["Problem", "Competition"]). Empty array means applicable to all sections.';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_kb_frameworks_section_relevance ON public.kb_frameworks USING GIN (section_relevance);