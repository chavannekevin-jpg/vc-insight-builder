-- Migration: Map legacy question answers to new question keys
-- This ensures existing users who completed the old 13-question questionnaire
-- have their answers correctly mapped to the new 8-question structure

-- Define the mapping from old keys to new keys
-- Old keys that map to problem_core
INSERT INTO memo_responses (company_id, question_key, answer, source, created_at, updated_at)
SELECT 
  mr.company_id,
  'problem_core' as question_key,
  mr.answer,
  'migrated_from_' || mr.question_key as source,
  mr.created_at,
  now() as updated_at
FROM memo_responses mr
WHERE mr.question_key IN ('problem_description', 'problem_validation')
  AND mr.answer IS NOT NULL
  AND mr.answer != ''
  AND NOT EXISTS (
    SELECT 1 FROM memo_responses existing 
    WHERE existing.company_id = mr.company_id 
    AND existing.question_key = 'problem_core'
    AND existing.answer IS NOT NULL
    AND existing.answer != ''
  )
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Old keys that map to solution_core
INSERT INTO memo_responses (company_id, question_key, answer, source, created_at, updated_at)
SELECT 
  mr.company_id,
  'solution_core' as question_key,
  mr.answer,
  'migrated_from_' || mr.question_key as source,
  mr.created_at,
  now() as updated_at
FROM memo_responses mr
WHERE mr.question_key IN ('solution_description', 'solution_demo')
  AND mr.answer IS NOT NULL
  AND mr.answer != ''
  AND NOT EXISTS (
    SELECT 1 FROM memo_responses existing 
    WHERE existing.company_id = mr.company_id 
    AND existing.question_key = 'solution_core'
    AND existing.answer IS NOT NULL
    AND existing.answer != ''
  )
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Old keys that map to competitive_moat
INSERT INTO memo_responses (company_id, question_key, answer, source, created_at, updated_at)
SELECT 
  mr.company_id,
  'competitive_moat' as question_key,
  mr.answer,
  'migrated_from_' || mr.question_key as source,
  mr.created_at,
  now() as updated_at
FROM memo_responses mr
WHERE mr.question_key IN ('competitive_advantage', 'competitors', 'moat')
  AND mr.answer IS NOT NULL
  AND mr.answer != ''
  AND NOT EXISTS (
    SELECT 1 FROM memo_responses existing 
    WHERE existing.company_id = mr.company_id 
    AND existing.question_key = 'competitive_moat'
    AND existing.answer IS NOT NULL
    AND existing.answer != ''
  )
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Old keys that map to traction_proof
INSERT INTO memo_responses (company_id, question_key, answer, source, created_at, updated_at)
SELECT 
  mr.company_id,
  'traction_proof' as question_key,
  mr.answer,
  'migrated_from_' || mr.question_key as source,
  mr.created_at,
  now() as updated_at
FROM memo_responses mr
WHERE mr.question_key = 'current_traction'
  AND mr.answer IS NOT NULL
  AND mr.answer != ''
  AND NOT EXISTS (
    SELECT 1 FROM memo_responses existing 
    WHERE existing.company_id = mr.company_id 
    AND existing.question_key = 'traction_proof'
    AND existing.answer IS NOT NULL
    AND existing.answer != ''
  )
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Old keys that map to team_story
INSERT INTO memo_responses (company_id, question_key, answer, source, created_at, updated_at)
SELECT 
  mr.company_id,
  'team_story' as question_key,
  mr.answer,
  'migrated_from_' || mr.question_key as source,
  mr.created_at,
  now() as updated_at
FROM memo_responses mr
WHERE mr.question_key IN ('founder_background', 'team_composition')
  AND mr.answer IS NOT NULL
  AND mr.answer != ''
  AND NOT EXISTS (
    SELECT 1 FROM memo_responses existing 
    WHERE existing.company_id = mr.company_id 
    AND existing.question_key = 'team_story'
    AND existing.answer IS NOT NULL
    AND existing.answer != ''
  )
ON CONFLICT (company_id, question_key) DO NOTHING;

-- Old keys that map to vision_ask
INSERT INTO memo_responses (company_id, question_key, answer, source, created_at, updated_at)
SELECT 
  mr.company_id,
  'vision_ask' as question_key,
  mr.answer,
  'migrated_from_' || mr.question_key as source,
  mr.created_at,
  now() as updated_at
FROM memo_responses mr
WHERE mr.question_key = 'key_milestones'
  AND mr.answer IS NOT NULL
  AND mr.answer != ''
  AND NOT EXISTS (
    SELECT 1 FROM memo_responses existing 
    WHERE existing.company_id = mr.company_id 
    AND existing.question_key = 'vision_ask'
    AND existing.answer IS NOT NULL
    AND existing.answer != ''
  )
ON CONFLICT (company_id, question_key) DO NOTHING;