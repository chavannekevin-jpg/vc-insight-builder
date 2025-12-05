
-- Fix: Insert new questions with correct section IDs

-- Problem section - problem_core
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
VALUES (
  '5f9a0b5d-c186-4156-98a2-0f77be18b090',
  'problem_core',
  'The Problem You''re Solving',
  'The pain point and evidence it matters',
  'Describe the core problem your target customers face. What keeps them up at night? Include any evidence you have that this problem is real and urgent (customer interviews, market research, personal experience).',
  'Example: Small business owners spend 10+ hours/week on manual bookkeeping. We interviewed 50 founders and 82% said it''s their #1 operational pain...',
  'AlertCircle',
  1,
  true,
  true
) ON CONFLICT (question_key) DO NOTHING;

-- Solution section - solution_core
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
VALUES (
  'b237a842-d87d-48c0-9b50-a8b219f74315',
  'solution_core',
  'Your Solution',
  'How your product solves it',
  'Describe your solution and how it directly addresses the problem. If you have a working product, demo, or MVP, describe what it can do and any early feedback.',
  'Example: Our AI-powered bookkeeping tool reduces that 10 hours to 30 minutes. We have a working MVP that 15 beta users have tried, with NPS of 72...',
  'Lightbulb',
  1,
  true,
  true
) ON CONFLICT (question_key) DO NOTHING;

-- Competition section - competitive_moat
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
VALUES (
  'efb5741c-70c4-4e1e-817e-f5fe58d031e0',
  'competitive_moat',
  'Your Edge & Competition',
  'Who you''re up against and why you''ll win',
  'Who are your main competitors (direct and indirect)? What gives you an unfair advantage? What prevents competitors from copying you?',
  'Example: Main competitors are QuickBooks and Freshbooks. Our edge: we''re 10x faster using AI, built by ex-Intuit engineers, and have exclusive partnership with...',
  'Shield',
  1,
  true,
  true
) ON CONFLICT (question_key) DO NOTHING;

-- Team section - team_story
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
VALUES (
  'a15be494-225d-4a79-b33b-7ee21fbb3097',
  'team_story',
  'Your Team''s Unfair Advantage',
  'Why your team will win',
  'Why is your team uniquely qualified to solve this problem? Include key team members, their backgrounds, and what makes you the right people for this.',
  'Example: I spent 8 years at Stripe leading payments. My co-founder built ML systems at Google. Together we''ve seen this problem from both sides...',
  'Users',
  1,
  true,
  true
) ON CONFLICT (question_key) DO NOTHING;

-- Business Model section - business_model
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
VALUES (
  '5a959159-bbee-449f-b96d-7794169b666d',
  'business_model',
  'How You Make Money',
  'Your revenue model and unit economics',
  'Explain your business model. How do you make money? What are your key pricing metrics? If you have early revenue data, share your unit economics.',
  'Example: SaaS model with $49/month per user. Current CAC is $120, LTV estimated at $588 (12-month avg retention). Gross margin 78%...',
  'DollarSign',
  1,
  true,
  true
) ON CONFLICT (question_key) DO NOTHING;

-- Traction section - traction_proof
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
VALUES (
  '87891cfc-27ca-4568-97d7-7d14daf68eb6',
  'traction_proof',
  'Proof of Progress',
  'Your traction and key metrics',
  'Share your current traction. Include users, revenue, growth rates, partnerships, or any other proof points that show momentum.',
  'Example: 500 active users, $15K MRR growing 25% month-over-month. Key partnerships with 3 enterprise clients in pilot...',
  'TrendingUp',
  1,
  true,
  true
) ON CONFLICT (question_key) DO NOTHING;

-- Update vision section name to be consistent (capitalized)
UPDATE questionnaire_sections SET name = 'Vision' WHERE name = 'vision';

-- Make vision_ask optional
UPDATE questionnaire_questions SET is_required = false WHERE question_key = 'vision_ask';
