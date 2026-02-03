-- Drop existing views first to avoid column order conflicts
DROP VIEW IF EXISTS public.shareable_section_scores;
DROP VIEW IF EXISTS public.shareable_memo_responses;

-- Create view for shareable section tools/scores
-- This view exposes memo_tool_data for companies with active, non-expired share links
CREATE VIEW public.shareable_section_scores
WITH (security_invoker=on) AS
SELECT 
    mtd.company_id,
    mtd.section_name,
    mtd.tool_name,
    mtd.ai_generated_data,
    mtd.user_overrides,
    mtd.data_source
FROM public.memo_tool_data mtd
WHERE EXISTS (
    SELECT 1 FROM public.memo_share_links sl
    WHERE sl.company_id = mtd.company_id
    AND sl.is_active = true
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
);

-- Create view for shareable memo responses
-- This view exposes memo_responses for companies with active share links
CREATE VIEW public.shareable_memo_responses
WITH (security_invoker=on) AS
SELECT 
    mr.company_id,
    mr.question_key,
    mr.answer
FROM public.memo_responses mr
WHERE EXISTS (
    SELECT 1 FROM public.memo_share_links sl
    WHERE sl.company_id = mr.company_id
    AND sl.is_active = true
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
);

-- Grant anon access to allow public viewing via share tokens
GRANT SELECT ON public.shareable_section_scores TO anon;
GRANT SELECT ON public.shareable_memo_responses TO anon;