-- Add profile picture column
ALTER TABLE public.investor_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;