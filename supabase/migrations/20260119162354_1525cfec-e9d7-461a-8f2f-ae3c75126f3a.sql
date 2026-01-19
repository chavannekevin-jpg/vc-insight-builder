-- =============================================
-- CALENDAR BOOKING SYSTEM TABLES
-- =============================================

-- 1. Event Types - Different meeting types investors can offer
CREATE TABLE public.booking_event_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  max_bookings_per_day INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Weekly Availability - Recurring schedule
CREATE TABLE public.booking_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 3. Slot Overrides - Custom dates (holidays, special hours)
CREATE TABLE public.booking_slot_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(investor_id, date)
);

-- 4. Bookings - Actual booked meetings
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES public.booking_event_types(id) ON DELETE CASCADE,
  booker_name TEXT NOT NULL,
  booker_email TEXT NOT NULL,
  booker_company TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  google_event_id TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Google Calendar Tokens - OAuth tokens for calendar sync
CREATE TABLE public.google_calendar_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  calendar_id TEXT DEFAULT 'primary',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.booking_event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slot_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - booking_event_types
-- =============================================

CREATE POLICY "Investors can view their own event types"
ON public.booking_event_types FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can create their own event types"
ON public.booking_event_types FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own event types"
ON public.booking_event_types FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own event types"
ON public.booking_event_types FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Public can view active event types for booking"
ON public.booking_event_types FOR SELECT
USING (is_active = true);

-- =============================================
-- RLS POLICIES - booking_availability
-- =============================================

CREATE POLICY "Investors can view their own availability"
ON public.booking_availability FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can create their own availability"
ON public.booking_availability FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own availability"
ON public.booking_availability FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own availability"
ON public.booking_availability FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Public can view active availability for booking"
ON public.booking_availability FOR SELECT
USING (is_active = true);

-- =============================================
-- RLS POLICIES - booking_slot_overrides
-- =============================================

CREATE POLICY "Investors can view their own overrides"
ON public.booking_slot_overrides FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can create their own overrides"
ON public.booking_slot_overrides FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own overrides"
ON public.booking_slot_overrides FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own overrides"
ON public.booking_slot_overrides FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Public can view overrides for booking calculations"
ON public.booking_slot_overrides FOR SELECT
USING (true);

-- =============================================
-- RLS POLICIES - bookings
-- =============================================

CREATE POLICY "Investors can view their bookings"
ON public.bookings FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can update their bookings"
ON public.bookings FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Anyone can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Bookers can view their own bookings by email"
ON public.bookings FOR SELECT
USING (true);

-- =============================================
-- RLS POLICIES - google_calendar_tokens
-- =============================================

CREATE POLICY "Investors can view their own tokens"
ON public.google_calendar_tokens FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can insert their own tokens"
ON public.google_calendar_tokens FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own tokens"
ON public.google_calendar_tokens FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own tokens"
ON public.google_calendar_tokens FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Service role can manage tokens"
ON public.google_calendar_tokens FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_booking_event_types_updated_at
BEFORE UPDATE ON public.booking_event_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_availability_updated_at
BEFORE UPDATE ON public.booking_availability
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_slot_overrides_updated_at
BEFORE UPDATE ON public.booking_slot_overrides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_calendar_tokens_updated_at
BEFORE UPDATE ON public.google_calendar_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_booking_event_types_investor ON public.booking_event_types(investor_id);
CREATE INDEX idx_booking_availability_investor ON public.booking_availability(investor_id);
CREATE INDEX idx_booking_slot_overrides_investor_date ON public.booking_slot_overrides(investor_id, date);
CREATE INDEX idx_bookings_investor ON public.bookings(investor_id);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_google_calendar_tokens_investor ON public.google_calendar_tokens(investor_id);