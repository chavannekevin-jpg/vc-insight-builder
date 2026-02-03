
-- Drop existing views and recreate with correct schema
DROP VIEW IF EXISTS public.shareable_company_model CASCADE;
DROP VIEW IF EXISTS public.shareable_memo_responses CASCADE;

-- Create a shareable view for company model data (includes financial metrics for anchored assumptions)
CREATE VIEW public.shareable_company_model AS
SELECT 
  msl.token,
  msl.company_id,
  cm.model_data
FROM public.memo_share_links msl
JOIN public.companies c ON c.id = msl.company_id
LEFT JOIN public.company_models cm ON cm.company_id = msl.company_id
WHERE msl.is_active = true 
  AND (msl.expires_at IS NULL OR msl.expires_at > now());

-- Create a shareable view for memo responses (used for extracting pricing info)
CREATE VIEW public.shareable_memo_responses AS
SELECT 
  msl.token,
  msl.company_id,
  mr.question_key,
  mr.answer
FROM public.memo_share_links msl
JOIN public.companies c ON c.id = msl.company_id
JOIN public.memo_responses mr ON mr.company_id = msl.company_id
WHERE msl.is_active = true 
  AND (msl.expires_at IS NULL OR msl.expires_at > now())
  AND mr.question_key IN (
    'business_model', 'pricing', 'pricing_model', 'pricing_tiers',
    'traction', 'revenue', 'arr', 'mrr', 'acv', 'arpu', 'icp',
    'customers', 'growth_rate', 'customer_count'
  );

-- Grant access to these views for anonymous/authenticated users
GRANT SELECT ON public.shareable_company_model TO anon, authenticated;
GRANT SELECT ON public.shareable_memo_responses TO anon, authenticated;
