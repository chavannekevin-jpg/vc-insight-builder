-- Add member_name column to accelerator_members table
ALTER TABLE public.accelerator_members
ADD COLUMN member_name TEXT;

-- Update the RPC function to accept and store the member name
CREATE OR REPLACE FUNCTION public.add_accelerator_member_with_invite(
  p_user_id UUID,
  p_invite_code TEXT,
  p_member_name TEXT DEFAULT NULL
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
    invited_by,
    member_name
  )
  VALUES (
    v_invite.accelerator_id,
    p_user_id,
    v_invite.role,
    NOW(),
    v_invite.inviter_id,
    p_member_name
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