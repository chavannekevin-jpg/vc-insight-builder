-- Add max_discounted_startups column to accelerators table
-- This caps how many startups can join at a discount before they must pay full price
ALTER TABLE public.accelerators 
ADD COLUMN IF NOT EXISTS max_discounted_startups INTEGER DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.accelerators.max_discounted_startups IS 'Maximum number of startups that can join at a discount. NULL means unlimited.';