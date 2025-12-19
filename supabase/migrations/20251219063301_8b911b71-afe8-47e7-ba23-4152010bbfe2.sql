CREATE POLICY "Admins can view all memos"
ON public.memos
FOR SELECT
TO public
USING (public.has_role(auth.uid(), 'admin'));