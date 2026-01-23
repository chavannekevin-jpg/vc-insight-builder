-- Allow authenticated users to insert their own memo purchases
CREATE POLICY "Users can insert their own memo purchases"
ON public.memo_purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own purchases
CREATE POLICY "Users can view their own memo purchases"
ON public.memo_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);