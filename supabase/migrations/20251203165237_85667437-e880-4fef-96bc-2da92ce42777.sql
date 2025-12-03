-- Create storage bucket for pitch decks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-decks', 
  'pitch-decks', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg', 'image/webp']
);

-- Storage policies for pitch-decks bucket
CREATE POLICY "Users can upload their own decks"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pitch-decks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own decks"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pitch-decks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own decks"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pitch-decks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add deck tracking columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS deck_url TEXT,
ADD COLUMN IF NOT EXISTS deck_parsed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deck_confidence_scores JSONB;

-- Add source tracking to memo_responses
ALTER TABLE public.memo_responses 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);