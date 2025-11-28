-- Phase 1: Create questionnaire_sections table
CREATE TABLE public.questionnaire_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Circle',
  color TEXT NOT NULL DEFAULT 'text-gray-500',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaire_sections ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaire_sections
CREATE POLICY "Anyone can view active sections"
  ON public.questionnaire_sections
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage sections"
  ON public.questionnaire_sections
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create questionnaire_questions table
CREATE TABLE public.questionnaire_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.questionnaire_sections(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tldr TEXT,
  question TEXT NOT NULL,
  placeholder TEXT,
  icon TEXT DEFAULT 'Circle',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaire_questions
CREATE POLICY "Anyone can view active questions"
  ON public.questionnaire_questions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON public.questionnaire_questions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add section_id to memo_prompts
ALTER TABLE public.memo_prompts
ADD COLUMN section_id UUID REFERENCES public.questionnaire_sections(id) ON DELETE SET NULL;

-- Triggers for updated_at
CREATE TRIGGER update_questionnaire_sections_updated_at
  BEFORE UPDATE ON public.questionnaire_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionnaire_questions_updated_at
  BEFORE UPDATE ON public.questionnaire_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 2: Seed sections from existing Portal.tsx data
INSERT INTO public.questionnaire_sections (name, display_title, icon, color, sort_order) VALUES
  ('Problem', 'What Makes People Suffer?', 'AlertCircle', 'text-red-500', 1),
  ('Solution', 'Your Killer Solution', 'Lightbulb', 'text-yellow-500', 2),
  ('Market', 'Total Addressable Market', 'TrendingUp', 'text-blue-500', 3),
  ('Competition', 'Competitive Landscape', 'Users', 'text-purple-500', 4),
  ('Team', 'The Dream Team', 'Award', 'text-green-500', 5),
  ('USP', 'What Makes You Special', 'Sparkles', 'text-pink-500', 6),
  ('Business Model', 'Show Me The Money', 'DollarSign', 'text-emerald-500', 7),
  ('Traction', 'Proof of Life', 'Rocket', 'text-orange-500', 8);

-- Phase 3: Seed questions from existing Portal.tsx
-- Get section IDs for reference
DO $$
DECLARE
  problem_id UUID;
  solution_id UUID;
  market_id UUID;
  competition_id UUID;
  team_id UUID;
  usp_id UUID;
  business_id UUID;
  traction_id UUID;
BEGIN
  SELECT id INTO problem_id FROM public.questionnaire_sections WHERE name = 'Problem';
  SELECT id INTO solution_id FROM public.questionnaire_sections WHERE name = 'Solution';
  SELECT id INTO market_id FROM public.questionnaire_sections WHERE name = 'Market';
  SELECT id INTO competition_id FROM public.questionnaire_sections WHERE name = 'Competition';
  SELECT id INTO team_id FROM public.questionnaire_sections WHERE name = 'Team';
  SELECT id INTO usp_id FROM public.questionnaire_sections WHERE name = 'USP';
  SELECT id INTO business_id FROM public.questionnaire_sections WHERE name = 'Business Model';
  SELECT id INTO traction_id FROM public.questionnaire_sections WHERE name = 'Traction';

  -- Problem section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (problem_id, 'problem_description', 'What Makes People Suffer?', 'The pain point your startup addresses', 'Describe the core problem your target customers face. What keeps them up at night? Be specific about the pain and frustration they experience.', 'e.g., Small businesses lose 30% of revenue to manual invoice processing errors...', 'AlertCircle', 1),
    (problem_id, 'problem_validation', 'How Do You Know This Hurts?', 'Evidence that the problem exists and matters', 'What evidence do you have that this problem is real and urgent? Include customer interviews, market research, or personal experiences that validate the pain.', 'e.g., Conducted 50 interviews with small business owners, 80% cited this as a top-3 pain point...', 'CheckCircle', 2);

  -- Solution section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (solution_id, 'solution_description', 'Your Killer Solution', 'How your product solves the problem', 'Describe your solution in clear terms. How does it directly address the problem? Focus on the mechanism of how it works and why it''s effective.', 'e.g., AI-powered invoice processing that automatically categorizes and validates transactions...', 'Lightbulb', 1),
    (solution_id, 'solution_demo', 'Show, Don''t Tell', 'Demo or prototype that proves it works', 'Do you have a working demo, prototype, or MVP? Describe what it can do and any early user feedback you''ve received.', 'e.g., Built MVP in 3 months, currently processing 1,000 invoices/month for 5 beta customers...', 'Play', 2);

  -- Market section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (market_id, 'market_size', 'How Big Is This Thing?', 'Total addressable market analysis', 'What is the total addressable market (TAM)? Break it down: how many potential customers exist, and what is the economic value? Be realistic and show your math.', 'e.g., 28M small businesses in US, average spend $5K/year on accounting = $140B TAM...', 'TrendingUp', 1),
    (market_id, 'market_timing', 'Why Now?', 'Market timing and trends in your favor', 'Why is now the right time for your solution? What market shifts, technology advances, or regulatory changes make this the perfect moment?', 'e.g., Remote work boom increased demand for digital accounting tools by 300%...', 'Clock', 2),
    (market_id, 'target_customer', 'Who Pays You?', 'Your ideal customer profile', 'Describe your target customer in detail. Who are they? What do they do? Why do they need your solution more than anyone else?', 'e.g., Small business owners (5-50 employees) in service industries, currently using spreadsheets...', 'Target', 3);

  -- Competition section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (competition_id, 'competitors', 'Who Else Wants This?', 'Direct and indirect competitors', 'Who are your main competitors? Include both direct competitors (same solution) and indirect competitors (alternative ways customers solve this problem today).', 'e.g., Direct: QuickBooks, FreshBooks. Indirect: Excel spreadsheets, manual bookkeepers...', 'Users', 1),
    (competition_id, 'competitive_advantage', 'Why Will You Win?', 'Your unfair advantage', 'What gives you an edge? Technology? Distribution? Team expertise? Network effects? Be honest about what makes you different and defensible.', 'e.g., Only solution built specifically for service businesses, 10x faster setup than competitors...', 'Zap', 2);

  -- Team section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (team_id, 'founder_background', 'Why You?', 'Founder expertise and unfair advantages', 'Why is your team uniquely qualified to solve this problem? Include relevant experience, domain expertise, or personal connection to the problem.', 'e.g., Spent 10 years as CFO for small businesses, experienced the pain firsthand...', 'Award', 1),
    (team_id, 'team_composition', 'The Band', 'Key team members and their roles', 'Who are the key members of your team? What are their backgrounds and what do they bring to the table?', 'e.g., CTO: Former Google engineer, 15 years in ML. COO: Scaled fintech startup from 0 to 1M users...', 'Users', 2);

  -- USP section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (usp_id, 'unique_value', 'Your Secret Sauce', 'What makes you truly different', 'What is your unique value proposition? Why would someone choose you over every alternative? Be brutally honest and specific.', 'e.g., Only AI that learns from your specific business patterns, gets smarter over time...', 'Sparkles', 1),
    (usp_id, 'moat', 'Can They Copy You?', 'Your defensibility and moat', 'What prevents competitors from copying your solution? Network effects? Proprietary data? Patents? Explain your long-term defensibility.', 'e.g., Proprietary dataset of 10M transactions, each customer makes the AI smarter for everyone...', 'Shield', 2);

  -- Business Model section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (business_id, 'revenue_model', 'Show Me The Money', 'How you make money', 'How do you make money? What is your pricing model? Be specific about unit economics and average revenue per customer.', 'e.g., SaaS subscription: $99/month for up to 1,000 invoices, $0.10 per additional invoice...', 'DollarSign', 1),
    (business_id, 'unit_economics', 'The Math', 'Customer acquisition cost and lifetime value', 'What are your unit economics? CAC (customer acquisition cost), LTV (lifetime value), gross margins? If early-stage, provide estimates with reasoning.', 'e.g., CAC: $500 (mostly paid ads), LTV: $3,600 (average 3-year retention), 72% gross margin...', 'Calculator', 2);

  -- Traction section questions
  INSERT INTO public.questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order) VALUES
    (traction_id, 'current_traction', 'Proof of Life', 'Current metrics and momentum', 'What traction do you have? Users, revenue, growth rate, partnerships? Show momentum with specific numbers and dates.', 'e.g., 50 paying customers, $5K MRR, growing 20% MoM, signed partnership with Stripe...', 'Rocket', 1),
    (traction_id, 'key_milestones', 'What''s Next?', 'Upcoming milestones and goals', 'What are your key milestones for the next 12-18 months? What metrics will prove product-market fit?', 'e.g., Reach $50K MRR, expand to 3 new verticals, close Series A ($3M)...', 'Flag', 2);

  -- Phase 4: Link existing memo_prompts to sections
  UPDATE public.memo_prompts SET section_id = problem_id WHERE section_name = 'Problem';
  UPDATE public.memo_prompts SET section_id = solution_id WHERE section_name = 'Solution';
  UPDATE public.memo_prompts SET section_id = market_id WHERE section_name = 'Market';
  UPDATE public.memo_prompts SET section_id = competition_id WHERE section_name = 'Competition';
  UPDATE public.memo_prompts SET section_id = team_id WHERE section_name = 'Team';
  UPDATE public.memo_prompts SET section_id = usp_id WHERE section_name = 'USP';
  UPDATE public.memo_prompts SET section_id = business_id WHERE section_name = 'Business Model';
  UPDATE public.memo_prompts SET section_id = traction_id WHERE section_name = 'Traction';
END $$;