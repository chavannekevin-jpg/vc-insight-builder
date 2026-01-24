-- Create accelerator_team_invites table for code-based team invitations
CREATE TABLE public.accelerator_team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accelerator_id UUID NOT NULL REFERENCES public.accelerators(id) ON DELETE CASCADE,
  code VARCHAR(12) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  inviter_id UUID NOT NULL,
  max_uses INTEGER DEFAULT 5,
  uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for code lookups
CREATE INDEX idx_accelerator_team_invites_code ON public.accelerator_team_invites(code);
CREATE INDEX idx_accelerator_team_invites_accelerator ON public.accelerator_team_invites(accelerator_id);

-- Enable RLS
ALTER TABLE public.accelerator_team_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view invites for their accelerator
CREATE POLICY "Members can view team invites"
ON public.accelerator_team_invites
FOR SELECT
TO authenticated
USING (
  public.is_accelerator_member(auth.uid(), accelerator_id) OR
  public.is_ecosystem_head(auth.uid(), accelerator_id)
);

-- Policy: Heads and admins can create invites
CREATE POLICY "Heads and admins can create team invites"
ON public.accelerator_team_invites
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_ecosystem_head(auth.uid(), accelerator_id) OR
  EXISTS (
    SELECT 1 FROM public.accelerator_members
    WHERE accelerator_id = accelerator_team_invites.accelerator_id
    AND user_id = auth.uid()
    AND role = 'admin'
    AND joined_at IS NOT NULL
  )
);

-- Policy: Heads and admins can update invites
CREATE POLICY "Heads and admins can update team invites"
ON public.accelerator_team_invites
FOR UPDATE
TO authenticated
USING (
  public.is_ecosystem_head(auth.uid(), accelerator_id) OR
  EXISTS (
    SELECT 1 FROM public.accelerator_members
    WHERE accelerator_id = accelerator_team_invites.accelerator_id
    AND user_id = auth.uid()
    AND role = 'admin'
    AND joined_at IS NOT NULL
  )
);

-- Create function to add accelerator team role with invite code
CREATE OR REPLACE FUNCTION public.add_accelerator_member_with_invite(
  p_user_id UUID,
  p_invite_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_existing_member RECORD;
  v_accelerator_name TEXT;
BEGIN
  -- Check if invite code exists and is valid
  SELECT * INTO v_invite
  FROM public.accelerator_team_invites
  WHERE code = UPPER(p_invite_code)
    AND is_active = true
    AND (max_uses IS NULL OR uses < max_uses)
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_invite IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invite code');
  END IF;
  
  -- Check if user is already a member of this accelerator
  SELECT * INTO v_existing_member
  FROM public.accelerator_members
  WHERE accelerator_id = v_invite.accelerator_id
    AND user_id = p_user_id
    AND joined_at IS NOT NULL;
  
  IF v_existing_member IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already a member', 'accelerator_id', v_invite.accelerator_id);
  END IF;
  
  -- Get accelerator name
  SELECT name INTO v_accelerator_name
  FROM public.accelerators
  WHERE id = v_invite.accelerator_id;
  
  -- Add the user as a member
  INSERT INTO public.accelerator_members (
    accelerator_id,
    user_id,
    role,
    joined_at,
    invited_by
  )
  VALUES (
    v_invite.accelerator_id,
    p_user_id,
    v_invite.role,
    NOW(),
    v_invite.inviter_id
  )
  ON CONFLICT DO NOTHING;
  
  -- Add accelerator role to user_roles if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'accelerator')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Increment the invite code usage
  UPDATE public.accelerator_team_invites
  SET uses = uses + 1
  WHERE id = v_invite.id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Member added successfully',
    'accelerator_id', v_invite.accelerator_id,
    'accelerator_name', v_accelerator_name,
    'role', v_invite.role
  );
END;
$$;