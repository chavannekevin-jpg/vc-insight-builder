-- Allow accelerator members to view workshop completions for their portfolio companies
CREATE POLICY "Accelerator members can view portfolio workshop completions"
ON public.workshop_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM companies c
    JOIN accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN accelerator_members am ON ai.linked_accelerator_id = am.accelerator_id
    WHERE c.id = workshop_completions.company_id
      AND am.user_id = auth.uid()
      AND am.joined_at IS NOT NULL
  )
);