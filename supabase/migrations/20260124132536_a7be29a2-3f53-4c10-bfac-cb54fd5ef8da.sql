-- Create a view for public shareable preview data (no sensitive info)
-- This allows unauthenticated access to limited company data for sharing

CREATE OR REPLACE VIEW public.shareable_company_preview
WITH (security_invoker = false) AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.category,
  c.stage,
  c.public_score,
  c.created_at,
  c.vc_verdict_json
FROM public.companies c
WHERE c.public_score IS NOT NULL;

-- Allow public access to the shareable preview view
GRANT SELECT ON public.shareable_company_preview TO anon;
GRANT SELECT ON public.shareable_company_preview TO authenticated;

-- Create view for public memo data (limited)
CREATE OR REPLACE VIEW public.shareable_memo_preview
WITH (security_invoker = false) AS
SELECT 
  m.id,
  m.company_id,
  m.structured_content,
  m.created_at
FROM public.memos m
INNER JOIN public.companies c ON c.id = m.company_id
WHERE c.public_score IS NOT NULL;

GRANT SELECT ON public.shareable_memo_preview TO anon;
GRANT SELECT ON public.shareable_memo_preview TO authenticated;

-- Create view for public section scores
CREATE OR REPLACE VIEW public.shareable_section_scores
WITH (security_invoker = false) AS
SELECT 
  mtd.company_id,
  mtd.section_name,
  mtd.ai_generated_data,
  mtd.user_overrides
FROM public.memo_tool_data mtd
INNER JOIN public.companies c ON c.id = mtd.company_id
WHERE mtd.tool_name = 'sectionScore'
AND c.public_score IS NOT NULL;

GRANT SELECT ON public.shareable_section_scores TO anon;
GRANT SELECT ON public.shareable_section_scores TO authenticated;

-- Create view for public memo responses (traction/business model only)
CREATE OR REPLACE VIEW public.shareable_memo_responses
WITH (security_invoker = false) AS
SELECT 
  mr.company_id,
  mr.question_key,
  mr.answer
FROM public.memo_responses mr
INNER JOIN public.companies c ON c.id = mr.company_id
WHERE c.public_score IS NOT NULL
AND mr.question_key IN ('traction', 'traction_metrics', 'revenue_model', 'business_model', 'monetization');