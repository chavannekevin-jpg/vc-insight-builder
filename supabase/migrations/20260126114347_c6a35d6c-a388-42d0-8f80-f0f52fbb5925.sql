-- Workshop Feature Tables

-- 1. workshop_templates: Admin-configured benchmark models for each workshop section
CREATE TABLE public.workshop_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  section_title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  guidance_text text,
  prompt_question text,
  benchmark_example text,
  benchmark_tips jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. workshop_responses: Founder answers during the workshop flow
CREATE TABLE public.workshop_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  answer text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, section_key)
);

-- 3. workshop_completions: Tracks overall workshop completion and compiled mini-memo
CREATE TABLE public.workshop_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  completed_at timestamp with time zone,
  mini_memo_content text,
  mapped_to_profile boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workshop_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workshop_templates
-- Admins can manage templates
CREATE POLICY "Admins can manage workshop templates"
ON public.workshop_templates
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Anyone authenticated can read active templates
CREATE POLICY "Anyone can view active workshop templates"
ON public.workshop_templates
FOR SELECT
USING (is_active = true);

-- RLS Policies for workshop_responses
-- Founders can CRUD their own company's responses (only if company is in accelerator)
CREATE POLICY "Founders can manage their accelerator company workshop responses"
ON public.workshop_responses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = workshop_responses.company_id
    AND c.founder_id = auth.uid()
    AND c.accelerator_invite_id IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = workshop_responses.company_id
    AND c.founder_id = auth.uid()
    AND c.accelerator_invite_id IS NOT NULL
  )
);

-- Admins can manage all responses
CREATE POLICY "Admins can manage all workshop responses"
ON public.workshop_responses
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for workshop_completions
-- Founders can manage their own company's completion (only if company is in accelerator)
CREATE POLICY "Founders can manage their accelerator company workshop completions"
ON public.workshop_completions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = workshop_completions.company_id
    AND c.founder_id = auth.uid()
    AND c.accelerator_invite_id IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = workshop_completions.company_id
    AND c.founder_id = auth.uid()
    AND c.accelerator_invite_id IS NOT NULL
  )
);

-- Admins can manage all completions
CREATE POLICY "Admins can manage all workshop completions"
ON public.workshop_completions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_workshop_templates_updated_at
  BEFORE UPDATE ON public.workshop_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workshop_responses_updated_at
  BEFORE UPDATE ON public.workshop_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default template structure for 8 sections
INSERT INTO public.workshop_templates (section_key, section_title, sort_order, guidance_text, prompt_question, benchmark_example, benchmark_tips)
VALUES
  ('problem', 'The Problem', 1, 
   'Investors want to see that you deeply understand the pain point you''re solving. The best problems are urgent, frequent, and expensive to ignore.',
   'What specific problem does your startup solve, and why is it painful enough that customers will pay to fix it?',
   NULL,
   '["Quantify the problem with data", "Show urgency and frequency", "Demonstrate personal understanding"]'::jsonb),
  
  ('solution', 'The Solution', 2,
   'VCs evaluate solutions on clarity, differentiation, and defensibility. Your solution should directly address the problem with a unique approach.',
   'How does your product or service solve this problem, and what makes your approach different from existing alternatives?',
   NULL,
   '["Clear cause-and-effect connection", "Unique mechanism or insight", "Defensible advantage"]'::jsonb),
  
  ('market', 'The Market', 3,
   'Market size determines return potential. VCs want to see a large addressable market with clear segmentation and a credible path to capturing share.',
   'How large is your target market, and which specific segment are you focusing on first?',
   NULL,
   '["Specific TAM/SAM/SOM numbers", "Clear customer segmentation", "Bottom-up market sizing"]'::jsonb),
  
  ('business_model', 'Business Model', 4,
   'Investors assess unit economics and scalability. Show how you make money and why the model improves as you grow.',
   'How do you generate revenue, and what are your key unit economics?',
   NULL,
   '["Clear revenue streams", "Unit economics explained", "Path to profitability"]'::jsonb),
  
  ('gtm', 'Go-to-Market', 5,
   'A great product with poor distribution fails. VCs want to see a repeatable, scalable customer acquisition strategy.',
   'How do you acquire customers, and what channels have proven most effective?',
   NULL,
   '["Specific acquisition channels", "CAC and payback period", "Scalability of approach"]'::jsonb),
  
  ('team', 'The Team', 6,
   'VCs invest in people first. Demonstrate why your team is uniquely qualified to win this market.',
   'Why is your team the right one to build this company and capture this opportunity?',
   NULL,
   '["Relevant experience", "Unique insights or access", "Complementary skills"]'::jsonb),
  
  ('funding_strategy', 'Funding Strategy', 7,
   'Smart capital deployment signals operational maturity. Show how this raise fits into your growth trajectory.',
   'How much are you raising, and how will you deploy the capital to reach key milestones?',
   NULL,
   '["Clear use of funds", "Specific milestones", "Runway and next raise timing"]'::jsonb),
  
  ('investment_thesis', 'Investment Thesis', 8,
   'Synthesize everything into a compelling argument for why this is an exceptional investment opportunity.',
   'In 2-3 sentences, why should an investor back your company right now?',
   NULL,
   '["Clear value proposition", "Timing argument", "Return potential"]'::jsonb);