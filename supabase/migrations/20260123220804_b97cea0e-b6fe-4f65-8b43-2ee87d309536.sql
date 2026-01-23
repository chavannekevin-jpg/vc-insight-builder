-- Phase 1: Accelerator Platform Database Architecture

-- 1. Add 'accelerator' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accelerator';

-- 2. Create accelerators table (the ecosystem entity)
CREATE TABLE public.accelerators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  ecosystem_head_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  -- Onboarding questionnaire responses
  program_length_weeks INTEGER,
  focus_areas TEXT[],
  cohort_size_target INTEGER,
  demo_day_date DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  -- Payment tracking
  stripe_payment_id TEXT,
  paid_at TIMESTAMPTZ
);

-- 3. Create accelerator_members table (team access)
CREATE TABLE public.accelerator_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accelerator_id UUID REFERENCES public.accelerators(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('head', 'admin', 'member', 'mentor')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  invited_by UUID,
  invite_email VARCHAR(255),
  invite_token VARCHAR(100),
  UNIQUE(accelerator_id, user_id)
);

-- 4. Create accelerator_cohorts table (batch management)
CREATE TABLE public.accelerator_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accelerator_id UUID REFERENCES public.accelerators(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  invite_id UUID REFERENCES public.accelerator_invites(id),
  start_date DATE,
  end_date DATE,
  demo_day_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add accelerator_id to accelerator_invites table
ALTER TABLE public.accelerator_invites 
ADD COLUMN IF NOT EXISTS linked_accelerator_id UUID REFERENCES public.accelerators(id);

-- 6. Enable RLS on new tables
ALTER TABLE public.accelerators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accelerator_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accelerator_cohorts ENABLE ROW LEVEL SECURITY;

-- 7. Create helper function to check accelerator membership
CREATE OR REPLACE FUNCTION public.is_accelerator_member(_user_id UUID, _accelerator_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.accelerator_members
    WHERE user_id = _user_id
      AND accelerator_id = _accelerator_id
      AND joined_at IS NOT NULL
  )
$$;

-- 8. Create helper function to check if user is ecosystem head
CREATE OR REPLACE FUNCTION public.is_ecosystem_head(_user_id UUID, _accelerator_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.accelerators
    WHERE id = _accelerator_id
      AND ecosystem_head_id = _user_id
  )
$$;

-- 9. RLS Policies for accelerators table
CREATE POLICY "Ecosystem heads can view their accelerators"
ON public.accelerators FOR SELECT
USING (ecosystem_head_id = auth.uid());

CREATE POLICY "Accelerator members can view their accelerator"
ON public.accelerators FOR SELECT
USING (is_accelerator_member(auth.uid(), id));

CREATE POLICY "Admins can view all accelerators"
ON public.accelerators FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create accelerators"
ON public.accelerators FOR INSERT
WITH CHECK (auth.uid() = ecosystem_head_id);

CREATE POLICY "Ecosystem heads can update their accelerators"
ON public.accelerators FOR UPDATE
USING (ecosystem_head_id = auth.uid());

CREATE POLICY "Admins can manage all accelerators"
ON public.accelerators FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 10. RLS Policies for accelerator_members table
CREATE POLICY "Members can view their accelerator's team"
ON public.accelerator_members FOR SELECT
USING (
  accelerator_id IN (
    SELECT accelerator_id FROM public.accelerator_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Ecosystem heads can manage members"
ON public.accelerator_members FOR ALL
USING (
  is_ecosystem_head(auth.uid(), accelerator_id)
);

CREATE POLICY "Users can join via invite token"
ON public.accelerator_members FOR UPDATE
USING (user_id = auth.uid() AND joined_at IS NULL);

CREATE POLICY "Admins can manage all members"
ON public.accelerator_members FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 11. RLS Policies for accelerator_cohorts table
CREATE POLICY "Members can view their accelerator's cohorts"
ON public.accelerator_cohorts FOR SELECT
USING (is_accelerator_member(auth.uid(), accelerator_id) OR is_ecosystem_head(auth.uid(), accelerator_id));

CREATE POLICY "Ecosystem heads and admins can manage cohorts"
ON public.accelerator_cohorts FOR ALL
USING (
  is_ecosystem_head(auth.uid(), accelerator_id) OR 
  EXISTS (
    SELECT 1 FROM public.accelerator_members 
    WHERE accelerator_id = accelerator_cohorts.accelerator_id 
    AND user_id = auth.uid() 
    AND role IN ('head', 'admin')
  )
);

CREATE POLICY "Admins can manage all cohorts"
ON public.accelerator_cohorts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 12. Policy for accelerator members to view companies in their cohorts
CREATE POLICY "Accelerator members can view cohort companies"
ON public.companies FOR SELECT
USING (
  accelerator_invite_id IN (
    SELECT ai.id 
    FROM public.accelerator_invites ai
    JOIN public.accelerator_cohorts ac ON ac.invite_id = ai.id
    JOIN public.accelerator_members am ON am.accelerator_id = ac.accelerator_id
    WHERE am.user_id = auth.uid() AND am.joined_at IS NOT NULL
  )
);

-- 13. Policy for accelerator members to view memo responses for cohort companies
CREATE POLICY "Accelerator members can view cohort memo responses"
ON public.memo_responses FOR SELECT
USING (
  company_id IN (
    SELECT c.id 
    FROM public.companies c
    JOIN public.accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN public.accelerator_cohorts ac ON ac.invite_id = ai.id
    JOIN public.accelerator_members am ON am.accelerator_id = ac.accelerator_id
    WHERE am.user_id = auth.uid() AND am.joined_at IS NOT NULL
  )
);

-- 14. Create updated_at trigger for new tables
CREATE TRIGGER update_accelerators_updated_at
BEFORE UPDATE ON public.accelerators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accelerator_cohorts_updated_at
BEFORE UPDATE ON public.accelerator_cohorts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Generate slug function for accelerators
CREATE OR REPLACE FUNCTION public.generate_accelerator_slug(acc_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(regexp_replace(acc_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'accelerator';
    END IF;
    
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.accelerators WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;