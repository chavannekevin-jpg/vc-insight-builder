-- Create a function to add investor role via valid invite code
-- This uses SECURITY DEFINER to bypass RLS safely
CREATE OR REPLACE FUNCTION public.add_investor_role_with_invite(
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
  v_existing_role RECORD;
BEGIN
  -- Check if user already has investor role
  SELECT * INTO v_existing_role
  FROM public.user_roles
  WHERE user_id = p_user_id AND role = 'investor';
  
  IF v_existing_role IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already an investor');
  END IF;
  
  -- Validate the invite code
  SELECT * INTO v_invite
  FROM public.investor_invites
  WHERE code = UPPER(p_invite_code)
    AND is_active = true
    AND (max_uses IS NULL OR uses < max_uses)
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_invite IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invite code');
  END IF;
  
  -- Add the investor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'investor');
  
  -- Increment the invite code usage
  UPDATE public.investor_invites
  SET uses = uses + 1
  WHERE id = v_invite.id;
  
  -- Get inviter name for response
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Investor role added',
    'inviter_id', v_invite.inviter_id
  );
END;
$$;