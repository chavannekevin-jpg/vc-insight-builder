-- Add cover image position column to investor_profiles
ALTER TABLE public.investor_profiles
ADD COLUMN IF NOT EXISTS booking_page_cover_position TEXT DEFAULT '50% 50%';