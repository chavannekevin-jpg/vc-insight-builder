-- Add sign-in tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sign_in_count INTEGER DEFAULT 0;