-- Allow admins to delete memo_responses
CREATE POLICY "Admins can delete memo responses"
ON memo_responses FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete memos
CREATE POLICY "Admins can delete memos"
ON memos FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete memo_analyses
CREATE POLICY "Admins can delete memo analyses"
ON memo_analyses FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete companies
CREATE POLICY "Admins can delete companies"
ON companies FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS and add admin policies for memo_purchases
ALTER TABLE memo_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage memo purchases"
ON memo_purchases FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete waitlist_signups
CREATE POLICY "Admins can delete waitlist signups"
ON waitlist_signups FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));