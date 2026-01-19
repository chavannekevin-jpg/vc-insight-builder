-- Add social links columns to investor_profiles
ALTER TABLE public.investor_profiles
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_website TEXT;