-- Add RLS policies for public SELECT on the shareable views
-- These allow unauthenticated users to view company data when a public_score exists

-- First, check if we need to add a policy to allow select on companies for anon users
-- via the shareable view. Since views bypass RLS with security_invoker=false, 
-- we need to ensure the base tables are accessible through the view grants we created.

-- Grant usage on public schema to anon (should already exist but ensure)
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select on shareable views to anon  
GRANT SELECT ON public.shareable_company_preview TO anon;
GRANT SELECT ON public.shareable_memo_preview TO anon;
GRANT SELECT ON public.shareable_section_scores TO anon;
GRANT SELECT ON public.shareable_memo_responses TO anon;