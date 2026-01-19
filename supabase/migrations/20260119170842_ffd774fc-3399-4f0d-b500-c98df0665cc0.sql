-- Create a new table for linked calendars (supporting multiple per investor)
CREATE TABLE public.linked_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  calendar_name TEXT NOT NULL DEFAULT 'Primary Calendar',
  calendar_email TEXT,
  is_primary BOOLEAN DEFAULT false,
  include_in_availability BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#4285f4',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(investor_id, calendar_id)
);

-- Enable RLS
ALTER TABLE public.linked_calendars ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Investors can view their own calendars"
ON public.linked_calendars FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can insert their own calendars"
ON public.linked_calendars FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own calendars"
ON public.linked_calendars FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own calendars"
ON public.linked_calendars FOR DELETE
USING (investor_id = auth.uid());

-- Migrate existing tokens to new table
INSERT INTO public.linked_calendars (
  investor_id, 
  access_token, 
  refresh_token, 
  expires_at, 
  calendar_id, 
  calendar_name,
  is_primary,
  include_in_availability,
  connected_at
)
SELECT 
  investor_id,
  access_token,
  refresh_token,
  expires_at,
  COALESCE(calendar_id, 'primary'),
  'Primary Calendar',
  true,
  true,
  COALESCE(connected_at, now())
FROM public.google_calendar_tokens
ON CONFLICT (investor_id, calendar_id) DO NOTHING;