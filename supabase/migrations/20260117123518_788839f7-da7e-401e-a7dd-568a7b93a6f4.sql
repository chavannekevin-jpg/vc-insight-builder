-- Create investor invite codes table
CREATE TABLE public.investor_invites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE,
    inviter_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
    uses INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Create table to track who invited whom
CREATE TABLE public.investor_referrals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
    invite_code VARCHAR(12) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(invitee_id) -- Each invitee can only be invited once
);

-- Enable RLS on both tables
ALTER TABLE public.investor_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_invites
CREATE POLICY "Investors can view their own invite codes"
ON public.investor_invites
FOR SELECT
USING (inviter_id = auth.uid());

CREATE POLICY "Investors can create their own invite codes"
ON public.investor_invites
FOR INSERT
WITH CHECK (inviter_id = auth.uid());

CREATE POLICY "Investors can update their own invite codes"
ON public.investor_invites
FOR UPDATE
USING (inviter_id = auth.uid());

-- Allow anyone to read invite codes for validation (by code)
CREATE POLICY "Anyone can validate invite codes"
ON public.investor_invites
FOR SELECT
USING (true);

-- RLS Policies for investor_referrals
CREATE POLICY "Investors can view their own referrals"
ON public.investor_referrals
FOR SELECT
USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Authenticated users can create referral records"
ON public.investor_referrals
FOR INSERT
WITH CHECK (invitee_id = auth.uid());

-- Function to generate a random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS VARCHAR(12)
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(12) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Add invited_by column to investor_profiles to track the inviter during signup
ALTER TABLE public.investor_profiles 
ADD COLUMN invited_by_code VARCHAR(12) DEFAULT NULL;