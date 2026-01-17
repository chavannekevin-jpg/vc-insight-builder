-- Phase 1: Create enums and tables for Investor Ecosystem

-- 1.1 Create investor_type enum
CREATE TYPE public.investor_type AS ENUM (
  'vc',
  'family_office',
  'business_angel',
  'corporate_vc',
  'lp',
  'other'
);

-- 1.2 Create entity_type enum for global contacts
CREATE TYPE public.entity_type AS ENUM ('investor', 'fund');

-- 1.3 Create relationship_status enum
CREATE TYPE public.relationship_status AS ENUM (
  'prospect',
  'warm',
  'connected',
  'invested'
);

-- 1.4 Create investor_profiles table
CREATE TABLE public.investor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  investor_type public.investor_type NOT NULL,
  organization_name TEXT,
  city TEXT NOT NULL,
  city_lat NUMERIC(10, 7),
  city_lng NUMERIC(10, 7),
  ticket_size_min INTEGER,
  ticket_size_max INTEGER,
  preferred_stages JSONB DEFAULT '[]'::jsonb,
  geographic_focus JSONB DEFAULT '[]'::jsonb,
  primary_sectors JSONB DEFAULT '[]'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.5 Create global_contacts table (shared investor graph)
CREATE TABLE public.global_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.entity_type NOT NULL,
  name TEXT NOT NULL,
  organization_name TEXT,
  fund_size INTEGER,
  investment_focus JSONB DEFAULT '[]'::jsonb,
  stages JSONB DEFAULT '[]'::jsonb,
  ticket_size_min INTEGER,
  ticket_size_max INTEGER,
  city TEXT,
  city_lat NUMERIC(10, 7),
  city_lng NUMERIC(10, 7),
  country TEXT,
  linkedin_url TEXT,
  contributor_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.6 Create investor_contacts table (personal relationships)
CREATE TABLE public.investor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  global_contact_id UUID REFERENCES public.global_contacts(id) ON DELETE SET NULL,
  local_name TEXT,
  local_organization TEXT,
  local_notes TEXT,
  local_focus_override JSONB,
  relationship_status public.relationship_status DEFAULT 'prospect',
  last_contact_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.7 Create indexes for performance
CREATE INDEX idx_investor_profiles_city ON public.investor_profiles(city);
CREATE INDEX idx_global_contacts_city ON public.global_contacts(city);
CREATE INDEX idx_global_contacts_name ON public.global_contacts(name);
CREATE INDEX idx_global_contacts_organization ON public.global_contacts(organization_name);
CREATE INDEX idx_investor_contacts_investor_id ON public.investor_contacts(investor_id);
CREATE INDEX idx_investor_contacts_global_contact_id ON public.investor_contacts(global_contact_id);

-- 1.8 Enable RLS on all tables
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_contacts ENABLE ROW LEVEL SECURITY;

-- 1.9 RLS Policies for investor_profiles
CREATE POLICY "Users can view their own investor profile"
ON public.investor_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own investor profile"
ON public.investor_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own investor profile"
ON public.investor_profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all investor profiles"
ON public.investor_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.10 RLS Policies for global_contacts
CREATE POLICY "All investors can view global contacts"
ON public.global_contacts
FOR SELECT
USING (
  has_role(auth.uid(), 'investor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Investors can insert global contacts"
ON public.global_contacts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'investor'::app_role));

CREATE POLICY "Investors can update global contacts"
ON public.global_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'investor'::app_role));

CREATE POLICY "Admins can manage all global contacts"
ON public.global_contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.11 RLS Policies for investor_contacts
CREATE POLICY "Investors can view their own contacts"
ON public.investor_contacts
FOR SELECT
USING (investor_id = auth.uid());

CREATE POLICY "Investors can insert their own contacts"
ON public.investor_contacts
FOR INSERT
WITH CHECK (investor_id = auth.uid());

CREATE POLICY "Investors can update their own contacts"
ON public.investor_contacts
FOR UPDATE
USING (investor_id = auth.uid());

CREATE POLICY "Investors can delete their own contacts"
ON public.investor_contacts
FOR DELETE
USING (investor_id = auth.uid());

CREATE POLICY "Admins can manage all investor contacts"
ON public.investor_contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.12 Create triggers for updated_at
CREATE TRIGGER update_investor_profiles_updated_at
BEFORE UPDATE ON public.investor_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_contacts_updated_at
BEFORE UPDATE ON public.global_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_contacts_updated_at
BEFORE UPDATE ON public.investor_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();