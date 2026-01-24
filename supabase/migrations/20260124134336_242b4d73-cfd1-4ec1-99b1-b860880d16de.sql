-- Add anonymous SELECT policy for shareable company previews
-- This allows unauthenticated users to view basic company info via share links
CREATE POLICY "Anyone can view company basic info for shareable preview"
  ON public.companies
  FOR SELECT
  USING (true);

-- Also add anonymous access to memo_tool_data for section scores
CREATE POLICY "Anyone can view section scores for shareable preview"
  ON public.memo_tool_data
  FOR SELECT
  USING (tool_name = 'sectionScore');

-- Add anonymous access to memos for structured content
CREATE POLICY "Anyone can view published memo content"
  ON public.memos
  FOR SELECT
  USING (true);

-- Add anonymous access to memo_responses for traction/business model data
CREATE POLICY "Anyone can view memo responses for shareable preview"
  ON public.memo_responses
  FOR SELECT
  USING (true);