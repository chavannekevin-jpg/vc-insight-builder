-- Add fields for contact intelligence/research metadata
ALTER TABLE public.global_contacts
ADD COLUMN IF NOT EXISTS focus_last_researched_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS focus_confidence TEXT CHECK (focus_confidence IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS focus_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS thesis_keywords JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notable_investments JSONB DEFAULT '[]'::jsonb;

-- Add index for filtering by research status
CREATE INDEX IF NOT EXISTS idx_global_contacts_focus_researched 
ON public.global_contacts (focus_last_researched_at);

COMMENT ON COLUMN public.global_contacts.focus_last_researched_at IS 'When the contact investment focus was last researched via AI';
COMMENT ON COLUMN public.global_contacts.focus_confidence IS 'Confidence level of the researched data: high, medium, low';
COMMENT ON COLUMN public.global_contacts.focus_source IS 'Source of focus data: ai_research, manual, imported';
COMMENT ON COLUMN public.global_contacts.thesis_keywords IS 'Investment thesis keywords for matching';
COMMENT ON COLUMN public.global_contacts.notable_investments IS 'Notable portfolio companies or investments';