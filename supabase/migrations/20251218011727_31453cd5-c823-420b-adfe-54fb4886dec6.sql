-- Add flag to track when memo content is generated (even before payment)
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS memo_content_generated boolean DEFAULT false;