
-- Phase 1: Deactivate old questions (keep for backwards compatibility)
UPDATE questionnaire_questions SET is_active = false WHERE question_key IN (
  'problem_description', 'problem_validation', 
  'solution_description', 'solution_demo',
  'market_size', 'market_timing',
  'competitors', 'competitive_advantage',
  'founder_background', 'team_composition',
  'revenue_model', 'unit_economics',
  'current_traction', 'key_milestones'
);

-- Phase 2: Get section IDs for reference
-- Problem section
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'problem_core',
  'The Problem You''re Solving',
  'The pain point and evidence it matters',
  'Describe the core problem your target customers face. What keeps them up at night? Include any evidence you have that this problem is real and urgent (customer interviews, market research, personal experience).',
  'Example: Small business owners spend 10+ hours/week on manual bookkeeping. We interviewed 50 founders and 82% said it''s their #1 operational pain...',
  'AlertCircle',
  1,
  true,
  true
FROM questionnaire_sections WHERE name = 'problem';

-- Solution section
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'solution_core',
  'Your Solution',
  'How your product solves it',
  'Describe your solution and how it directly addresses the problem. If you have a working product, demo, or MVP, describe what it can do and any early feedback.',
  'Example: Our AI-powered bookkeeping tool reduces that 10 hours to 30 minutes. We have a working MVP that 15 beta users have tried, with NPS of 72...',
  'Lightbulb',
  1,
  true,
  true
FROM questionnaire_sections WHERE name = 'solution';

-- Market section - target_customer stays, update sort_order
UPDATE questionnaire_questions SET sort_order = 1, is_active = true WHERE question_key = 'target_customer';

-- Competition section - new merged question
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'competitive_moat',
  'Your Edge & Competition',
  'Who you''re up against and why you''ll win',
  'Who are your main competitors (direct and indirect)? What gives you an unfair advantage? What prevents competitors from copying you?',
  'Example: Main competitors are QuickBooks and Freshbooks. Our edge: we''re 10x faster using AI, built by ex-Intuit engineers, and have exclusive partnership with...',
  'Shield',
  1,
  true,
  true
FROM questionnaire_sections WHERE name = 'competition';

-- Team section - new merged question
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'team_story',
  'Your Team''s Unfair Advantage',
  'Why your team will win',
  'Why is your team uniquely qualified to solve this problem? Include key team members, their backgrounds, and what makes you the right people for this.',
  'Example: I spent 8 years at Stripe leading payments. My co-founder built ML systems at Google. Together we''ve seen this problem from both sides...',
  'Users',
  1,
  true,
  true
FROM questionnaire_sections WHERE name = 'team';

-- Business section - keep revenue_model as business_model
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'business_model',
  'How You Make Money',
  'Your revenue model and unit economics',
  'Explain your business model. How do you make money? What are your key pricing metrics? If you have early revenue data, share your unit economics.',
  'Example: SaaS model with $49/month per user. Current CAC is $120, LTV estimated at $588 (12-month avg retention). Gross margin 78%...',
  'DollarSign',
  1,
  true,
  true
FROM questionnaire_sections WHERE name = 'business';

-- Traction section - keep current_traction as traction_proof
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'traction_proof',
  'Proof of Progress',
  'Your traction and key metrics',
  'Share your current traction. Include users, revenue, growth rates, partnerships, or any other proof points that show momentum.',
  'Example: 500 active users, $15K MRR growing 25% month-over-month. Key partnerships with 3 enterprise clients in pilot...',
  'TrendingUp',
  1,
  true,
  true
FROM questionnaire_sections WHERE name = 'traction';

-- Create new Vision section
INSERT INTO questionnaire_sections (name, display_title, icon, color, sort_order, is_active)
VALUES ('vision', 'Vision & Ask', 'Rocket', 'text-purple-500', 8, true);

-- Vision section - new optional question
INSERT INTO questionnaire_questions (section_id, question_key, title, tldr, question, placeholder, icon, sort_order, is_required, is_active)
SELECT 
  id,
  'vision_ask',
  'Where You''re Going',
  'Next milestones and what you need',
  'What are your key milestones for the next 12-18 months? What do you need to get there (funding, team, partnerships)?',
  'Example: Milestone 1: Hit 1000 users by Q2. Milestone 2: Launch enterprise tier by Q3. Raising $1.5M to hire 3 engineers and scale marketing...',
  'Rocket',
  1,
  false,
  true
FROM questionnaire_sections WHERE name = 'vision';

-- Phase 3: Migrate existing responses to new question keys
-- Create a helper function to concatenate answers
CREATE OR REPLACE FUNCTION concat_answers(company_uuid uuid, key1 text, key2 text) 
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  answer1 text;
  answer2 text;
BEGIN
  SELECT answer INTO answer1 FROM memo_responses WHERE company_id = company_uuid AND question_key = key1;
  SELECT answer INTO answer2 FROM memo_responses WHERE company_id = company_uuid AND question_key = key2;
  
  IF answer1 IS NOT NULL AND answer2 IS NOT NULL THEN
    RETURN answer1 || E'\n\n' || answer2;
  ELSIF answer1 IS NOT NULL THEN
    RETURN answer1;
  ELSIF answer2 IS NOT NULL THEN
    RETURN answer2;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Migrate problem_description + problem_validation → problem_core
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT DISTINCT 
  company_id,
  'problem_core',
  concat_answers(company_id, 'problem_description', 'problem_validation'),
  'migrated'
FROM memo_responses 
WHERE question_key IN ('problem_description', 'problem_validation')
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'problem_core')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Migrate solution_description + solution_demo → solution_core
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT DISTINCT 
  company_id,
  'solution_core',
  concat_answers(company_id, 'solution_description', 'solution_demo'),
  'migrated'
FROM memo_responses 
WHERE question_key IN ('solution_description', 'solution_demo')
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'solution_core')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Migrate competitors + competitive_advantage → competitive_moat
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT DISTINCT 
  company_id,
  'competitive_moat',
  concat_answers(company_id, 'competitors', 'competitive_advantage'),
  'migrated'
FROM memo_responses 
WHERE question_key IN ('competitors', 'competitive_advantage')
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'competitive_moat')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Migrate founder_background + team_composition → team_story
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT DISTINCT 
  company_id,
  'team_story',
  concat_answers(company_id, 'founder_background', 'team_composition'),
  'migrated'
FROM memo_responses 
WHERE question_key IN ('founder_background', 'team_composition')
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'team_story')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Migrate revenue_model → business_model
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT 
  company_id,
  'business_model',
  answer,
  'migrated'
FROM memo_responses 
WHERE question_key = 'revenue_model'
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'business_model')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Migrate current_traction → traction_proof
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT 
  company_id,
  'traction_proof',
  answer,
  'migrated'
FROM memo_responses 
WHERE question_key = 'current_traction'
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'traction_proof')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Migrate key_milestones → vision_ask
INSERT INTO memo_responses (company_id, question_key, answer, source)
SELECT 
  company_id,
  'vision_ask',
  answer,
  'migrated'
FROM memo_responses 
WHERE question_key = 'key_milestones'
  AND company_id NOT IN (SELECT company_id FROM memo_responses WHERE question_key = 'vision_ask')
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Clean up helper function
DROP FUNCTION IF EXISTS concat_answers(uuid, text, text);
