-- Add unique constraint for memo_responses upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS memo_responses_company_question_unique 
ON public.memo_responses (company_id, question_key);