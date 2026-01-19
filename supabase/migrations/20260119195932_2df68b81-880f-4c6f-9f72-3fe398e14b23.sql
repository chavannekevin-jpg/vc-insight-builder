-- Add booking page customization columns to investor_profiles
ALTER TABLE public.investor_profiles
ADD COLUMN IF NOT EXISTS booking_page_theme TEXT DEFAULT 'dark' CHECK (booking_page_theme IN ('dark', 'light')),
ADD COLUMN IF NOT EXISTS booking_page_cover_url TEXT,
ADD COLUMN IF NOT EXISTS booking_page_headline TEXT,
ADD COLUMN IF NOT EXISTS booking_page_bio TEXT;

-- Create storage bucket for booking page covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-covers', 'booking-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for booking covers - anyone can view
CREATE POLICY "Booking covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'booking-covers');

-- RLS policy for booking covers - authenticated users can upload their own
CREATE POLICY "Users can upload their own booking covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'booking-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for booking covers - users can update their own
CREATE POLICY "Users can update their own booking covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'booking-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for booking covers - users can delete their own
CREATE POLICY "Users can delete their own booking covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'booking-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);