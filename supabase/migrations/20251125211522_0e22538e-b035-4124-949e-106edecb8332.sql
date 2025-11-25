-- Allow public access to demo company and its memo for sample memo page

-- Policy to allow anyone to view the demo company
CREATE POLICY "Anyone can view demo company"
ON companies
FOR SELECT
USING (id = '00000000-0000-0000-0000-000000000001');

-- Policy to allow anyone to view demo company memo
CREATE POLICY "Anyone can view demo memo"
ON memos
FOR SELECT
USING (company_id = '00000000-0000-0000-0000-000000000001');

-- Policy to allow anyone to view demo company responses
CREATE POLICY "Anyone can view demo responses"
ON memo_responses
FOR SELECT
USING (company_id = '00000000-0000-0000-0000-000000000001');