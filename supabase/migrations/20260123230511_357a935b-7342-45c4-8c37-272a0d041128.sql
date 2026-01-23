-- Fix accelerator_members SELECT policy to avoid self-referential recursion
-- Root cause: the previous policy referenced accelerator_members inside its own USING clause,
-- which prevents members from seeing even their own membership row.

DROP POLICY IF EXISTS "Members can view their accelerator's team" ON public.accelerator_members;

CREATE POLICY "Members can view their accelerator's team"
ON public.accelerator_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR is_ecosystem_head(auth.uid(), accelerator_id)
  OR is_accelerator_member(auth.uid(), accelerator_id)
);
