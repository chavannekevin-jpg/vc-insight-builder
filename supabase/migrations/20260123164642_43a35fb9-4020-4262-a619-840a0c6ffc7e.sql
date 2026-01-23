-- Add accelerator_invite_id to companies for permanent cohort tracking
ALTER TABLE public.companies 
ADD COLUMN accelerator_invite_id UUID REFERENCES public.accelerator_invites(id);

-- Add cohort_name to accelerator_invites for human-readable grouping
ALTER TABLE public.accelerator_invites 
ADD COLUMN cohort_name VARCHAR(100);

-- Index for fast cohort lookups
CREATE INDEX idx_companies_accelerator_invite ON public.companies(accelerator_invite_id);