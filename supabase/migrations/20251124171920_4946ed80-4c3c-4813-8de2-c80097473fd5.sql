-- Create a view that provides an easier way to query company responses
-- This view flattens the data for easier Excel-style viewing
CREATE OR REPLACE VIEW public.company_responses_view AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.stage as company_stage,
  c.created_at as company_created_at,
  p.email as founder_email,
  mr.question_key,
  mr.answer,
  mr.updated_at as response_updated_at
FROM companies c
LEFT JOIN profiles p ON c.founder_id = p.id
LEFT JOIN memo_responses mr ON c.id = mr.company_id
ORDER BY c.name, mr.question_key;

-- Grant access to authenticated users (admins will access via RLS)
GRANT SELECT ON public.company_responses_view TO authenticated;