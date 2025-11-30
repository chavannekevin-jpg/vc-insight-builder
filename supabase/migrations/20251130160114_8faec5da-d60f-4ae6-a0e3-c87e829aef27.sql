-- Optimize questionnaire for launch: reduce friction, merge redundant sections
-- Phase 1: Make strategic questions OPTIONAL
-- Phase 2: Shorten placeholder text to ~50 words
-- Phase 3: Merge USP into Competition section

-- ============================================
-- PHASE 1: Make questions optional
-- ============================================

-- Make market_size OPTIONAL (AI will auto-deduce)
UPDATE questionnaire_questions
SET is_required = false,
    placeholder = 'e.g., 28M small businesses × $5K/year = $140B TAM. We''ll help estimate this based on your ICP.',
    question = 'What is your total addressable market (TAM)? Provide your estimate if you have one. (Our AI will also estimate this based on your target customer)'
WHERE question_key = 'market_size';

-- Make market_timing OPTIONAL (AI will auto-deduce from context)
UPDATE questionnaire_questions
SET is_required = false,
    placeholder = 'e.g., Remote work boom, new regulations, rising costs. Our AI will analyze market timing from your context.',
    question = 'Why is now the right time for your solution? (Optional - our AI will identify key market drivers)'
WHERE question_key = 'market_timing';

-- Make unit_economics OPTIONAL for pre-revenue startups
UPDATE questionnaire_questions
SET is_required = false,
    placeholder = 'e.g., CAC $500, LTV $3,600, 72% margin. If pre-revenue, provide estimates or skip.',
    title = 'The Math (Optional)'
WHERE question_key = 'unit_economics';

-- ============================================
-- PHASE 2: Shorten placeholder text (~50 words max)
-- ============================================

-- Problem section
UPDATE questionnaire_questions
SET placeholder = 'e.g., Small businesses lose 30% revenue to manual invoice errors, spend 8 hours/week on data entry.'
WHERE question_key = 'problem_description';

UPDATE questionnaire_questions
SET placeholder = 'e.g., 50+ interviews with SMB owners. 80% cited invoicing as top-3 pain, averaging 8 hours/week manual work.'
WHERE question_key = 'problem_validation';

-- Solution section
UPDATE questionnaire_questions
SET placeholder = 'e.g., AI extracts data from invoices, categorizes with 95% accuracy using ML trained on 10M invoices, syncs to QuickBooks. 10 seconds vs 5 minutes manually.'
WHERE question_key = 'solution_description';

UPDATE questionnaire_questions
SET placeholder = 'e.g., MVP live 3 months, processing 1,000 invoices/month for 5 beta customers. 92% accuracy, saves 10 hours/week.'
WHERE question_key = 'solution_demo';

-- Market section  
UPDATE questionnaire_questions
SET placeholder = 'e.g., Small business owners (5-50 employees) in service industries. $500K-$5M revenue. Currently using spreadsheets. Pain: 10+ hours/week on invoicing. Budget: $100-300/month.'
WHERE question_key = 'target_customer';

-- Team section
UPDATE questionnaire_questions
SET placeholder = 'e.g., CEO: 10 years as CFO, managed $50M in invoices. Previously Finance Director at 200-person consulting firm. Built prototype after spending 15 hours/week on invoices.'
WHERE question_key = 'founder_background';

UPDATE questionnaire_questions
SET placeholder = 'e.g., CTO: Ex-Google engineer, 15 years ML. COO: Scaled fintech 0→1M users. Advisor: Former CFO of Intuit.'
WHERE question_key = 'team_composition';

-- Business Model section
UPDATE questionnaire_questions
SET placeholder = 'e.g., SaaS subscription: $99/mo (1K invoices), $299/mo (5K invoices), $799/mo (unlimited). Avg customer $150/mo, 82% gross margin.'
WHERE question_key = 'revenue_model';

-- Traction section
UPDATE questionnaire_questions
SET placeholder = 'e.g., Launched Jan 2024. Now: 50 customers, $5K MRR, 20% MoM growth. 15K invoices processed, 92% accuracy. CAC $300, 85% 6-month retention.'
WHERE question_key = 'current_traction';

UPDATE questionnaire_questions
SET placeholder = 'e.g., Reach $50K MRR by Q2, expand to 3 verticals, close $3M Series A by Q4.'
WHERE question_key = 'key_milestones';

-- ============================================
-- PHASE 3: Merge USP section into Competition
-- ============================================

-- Update Competition section questions to encompass USP content
UPDATE questionnaire_questions
SET placeholder = 'e.g., Direct: QuickBooks, FreshBooks. Indirect: Excel, manual bookkeepers. Their weaknesses: poor UX, slow, expensive setup.'
WHERE question_key = 'competitors';

UPDATE questionnaire_questions
SET 
    title = 'Your Competitive Edge & Defensibility',
    question = 'What gives you an unfair advantage? Why will you win? What prevents competitors from copying you? Include: unique technology, distribution, team expertise, network effects, proprietary data, patents, or other defensibility moats.',
    placeholder = 'e.g., Only solution for service businesses with 60+ industry templates. 10x faster setup (2 min vs 20 min). Proprietary ML trained on 10M transactions = 95% accuracy. Network effects: each customer improves AI. Switching costs: 2-month integration. 12 months ahead in AI accuracy.'
WHERE question_key = 'competitive_advantage';

-- Deactivate USP section questions (merged into Competition)
UPDATE questionnaire_questions
SET is_active = false
WHERE question_key IN ('unique_value', 'moat');

-- Deactivate USP section itself
UPDATE questionnaire_sections
SET is_active = false
WHERE name = 'USP';

-- Add helpful AI insight text to target_customer
UPDATE questionnaire_questions
SET question = 'Describe your target customer in detail. Who are they? What do they do? Why do they need your solution? (💡 Our AI will estimate your TAM and analyze "Why Now?" based on this)'
WHERE question_key = 'target_customer';