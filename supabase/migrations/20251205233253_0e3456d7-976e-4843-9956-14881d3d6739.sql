-- Update team_story question with equity split guidance
UPDATE questionnaire_questions 
SET 
  question = 'Why is your team uniquely qualified to solve this problem? Include:
• Key team members, their roles, and backgrounds
• Equity split (e.g., CEO 50%, CTO 50%)
• Previous startup exits or relevant achievements
• Key hires you''ve made and still need',
  placeholder = 'Example: I''m CEO (55% equity), ex-Stripe payments lead (8 years). 
My co-founder is CTO (45% equity), built ML systems at Google for 5 years. 
We''ve hired a VP Sales from Salesforce. Still need a VP Engineering.
Together we''ve seen this problem from both sides and have the network to close enterprise deals...',
  updated_at = now()
WHERE question_key = 'team_story';

-- Create answer_quality_criteria table
CREATE TABLE public.answer_quality_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_key TEXT NOT NULL UNIQUE,
  required_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  nice_to_have JSONB NOT NULL DEFAULT '[]'::jsonb,
  example_good_answer TEXT,
  vc_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.answer_quality_criteria ENABLE ROW LEVEL SECURITY;

-- Anyone can read criteria (needed for the optimizer)
CREATE POLICY "Anyone can view answer criteria" 
ON public.answer_quality_criteria 
FOR SELECT 
USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage answer criteria" 
ON public.answer_quality_criteria 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert criteria for each question
INSERT INTO public.answer_quality_criteria (question_key, required_elements, nice_to_have, example_good_answer, vc_context) VALUES
('team_story', 
 '["team_roles", "equity_split", "relevant_backgrounds", "key_hires_needed"]'::jsonb,
 '["previous_exits", "advisors", "board_members", "investor_introductions"]'::jsonb,
 'I''m CEO (55% equity), ex-Stripe payments lead (8 years). My co-founder is CTO (45% equity), built ML systems at Google. We''ve hired a VP Sales from Salesforce. Still need VP Engineering.',
 'VCs evaluate founder-market fit, co-founder dynamics, and team completeness. Equity split signals commitment and fairness.'),

('problem_core',
 '["pain_quantification", "customer_segment", "evidence_source"]'::jsonb,
 '["customer_quotes", "workaround_costs", "urgency_drivers", "market_research"]'::jsonb,
 'Small business owners spend 10+ hours/week on manual bookkeeping. We interviewed 50 founders and 82% said it''s their #1 operational pain. They currently use spreadsheets or pay $500/mo for bookkeepers.',
 'VCs want evidence the problem is real, painful, and worth solving. Quantified pain and customer evidence builds conviction.'),

('solution_core',
 '["how_it_works", "key_differentiator", "current_state"]'::jsonb,
 '["demo_available", "user_feedback", "technical_innovation", "patent_pending"]'::jsonb,
 'Our AI-powered bookkeeping tool reduces 10 hours to 30 minutes. We have a working MVP with 15 beta users, NPS of 72. Key differentiator: real-time categorization with 98% accuracy.',
 'VCs evaluate product-market fit signals and technical defensibility. Working product with early feedback de-risks the investment.'),

('target_customer',
 '["specific_segment", "company_size_or_persona", "buying_behavior"]'::jsonb,
 '["budget_range", "decision_maker", "sales_cycle", "expansion_potential"]'::jsonb,
 'SMBs with 5-50 employees in professional services (agencies, consultants). They have $50-200K revenue, founder handles finances, and actively searching for solutions.',
 'VCs need to understand your ICP and market size. Specific segments show focus and make GTM credible.'),

('competitive_moat',
 '["competitors_named", "differentiation", "defensibility"]'::jsonb,
 '["switching_costs", "network_effects", "ip_patents", "exclusive_partnerships"]'::jsonb,
 'Main competitors: QuickBooks, Freshbooks, Bench. Our edge: 10x faster with AI, built by ex-Intuit engineers. Moat: proprietary ML model trained on 1M+ transactions, exclusive bank partnerships.',
 'VCs evaluate competitive dynamics and long-term defensibility. Naming competitors shows market awareness.'),

('business_model',
 '["revenue_model", "pricing", "unit_economics"]'::jsonb,
 '["cac", "ltv", "gross_margin", "payback_period", "churn_rate"]'::jsonb,
 'SaaS model at $49/mo (SMB) to $199/mo (Mid-market). CAC: $120, LTV: $2,400, payback: 2.5 months. 85% gross margin, 3% monthly churn.',
 'VCs evaluate business model scalability and capital efficiency. Unit economics prove the business can be profitable at scale.'),

('traction_proof',
 '["key_metrics", "growth_rate", "timeline"]'::jsonb,
 '["revenue_figures", "user_counts", "nps_score", "retention", "notable_customers"]'::jsonb,
 '$15K MRR, growing 25% month-over-month for 6 months. 200 paying customers, NPS 72. Notable: 3 YC companies as customers.',
 'VCs want proof of momentum and market pull. Growth rate matters more than absolute numbers at early stage.'),

('vision_ask',
 '["funding_amount", "use_of_funds", "key_milestones"]'::jsonb,
 '["runway_calculation", "hiring_plan", "revenue_targets", "product_roadmap"]'::jsonb,
 'Raising $1.5M seed. Use: 60% engineering (hire 3), 30% sales (hire 2), 10% ops. 18-month runway to $100K MRR and Series A.',
 'VCs evaluate capital efficiency and milestone clarity. Clear use of funds shows operational maturity.');