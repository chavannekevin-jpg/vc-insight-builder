-- Phase 1: Founder Referral System & Scoreboard Database Schema

-- 1. Create founder_referrals table for tracking referral codes
CREATE TABLE founder_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL,
  code VARCHAR(12) UNIQUE NOT NULL,
  discount_percent INTEGER DEFAULT 20,
  credits_per_signup INTEGER DEFAULT 1,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create founder_referral_signups table to track credit awards
CREATE TABLE founder_referral_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES founder_referrals(id) ON DELETE CASCADE,
  referred_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  credit_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referral_id, referred_company_id)
);

-- 3. Add scoreboard and referral columns to companies table
ALTER TABLE companies ADD COLUMN referred_by_company_id UUID REFERENCES companies(id);
ALTER TABLE companies ADD COLUMN referred_by_founder_code VARCHAR(12);
ALTER TABLE companies ADD COLUMN scoreboard_opt_in BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN scoreboard_anonymous BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN public_score INTEGER;

-- 4. Enable RLS on new tables
ALTER TABLE founder_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_referral_signups ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for founder_referrals

-- Founders can view their own referral codes
CREATE POLICY "Founders can view their own referrals"
ON founder_referrals FOR SELECT
USING (referrer_user_id = auth.uid());

-- Founders can create referral codes for their companies
CREATE POLICY "Founders can create referrals for their companies"
ON founder_referrals FOR INSERT
WITH CHECK (
  referrer_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = referrer_company_id
    AND companies.founder_id = auth.uid()
  )
);

-- Founders can update their own referral codes
CREATE POLICY "Founders can update their own referrals"
ON founder_referrals FOR UPDATE
USING (referrer_user_id = auth.uid());

-- Anyone can view active referral codes for validation
CREATE POLICY "Anyone can validate referral codes"
ON founder_referrals FOR SELECT
USING (is_active = true);

-- Service role can update referral usage counts
CREATE POLICY "Service role can manage referrals"
ON founder_referrals FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can manage all referrals
CREATE POLICY "Admins can manage all referrals"
ON founder_referrals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. RLS Policies for founder_referral_signups

-- Referrers can view signups from their referrals
CREATE POLICY "Referrers can view their referral signups"
ON founder_referral_signups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM founder_referrals
    WHERE founder_referrals.id = referral_id
    AND founder_referrals.referrer_user_id = auth.uid()
  )
);

-- Service role can insert signups (used during registration)
CREATE POLICY "Service role can manage signups"
ON founder_referral_signups FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can manage all signups
CREATE POLICY "Admins can manage all referral signups"
ON founder_referral_signups FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. RLS Policy for investors to view scoreboard-opted companies
CREATE POLICY "Investors can view scoreboard companies"
ON companies FOR SELECT
USING (
  scoreboard_opt_in = true 
  AND public_score >= 60
  AND memo_content_generated = true
  AND EXISTS (SELECT 1 FROM investor_profiles WHERE id = auth.uid())
);

-- 8. Function to generate unique founder referral code
CREATE OR REPLACE FUNCTION generate_founder_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: FND- prefix + 6 random alphanumeric chars
    new_code := 'FND-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM founder_referrals WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 9. Function to award referral credit
CREATE OR REPLACE FUNCTION award_founder_referral_credit(
  p_referral_code VARCHAR(12),
  p_referred_company_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referral_id UUID;
  v_referrer_company_id UUID;
  v_credits_per_signup INTEGER;
BEGIN
  -- Find the referral
  SELECT id, referrer_company_id, credits_per_signup
  INTO v_referral_id, v_referrer_company_id, v_credits_per_signup
  FROM founder_referrals
  WHERE code = p_referral_code AND is_active = true;
  
  IF v_referral_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if already awarded
  IF EXISTS (
    SELECT 1 FROM founder_referral_signups
    WHERE referral_id = v_referral_id
    AND referred_company_id = p_referred_company_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Record the signup
  INSERT INTO founder_referral_signups (referral_id, referred_company_id, credit_awarded)
  VALUES (v_referral_id, p_referred_company_id, true);
  
  -- Increment referral usage
  UPDATE founder_referrals
  SET uses = uses + 1
  WHERE id = v_referral_id;
  
  -- Award credit to referrer's company
  UPDATE companies
  SET generations_available = generations_available + v_credits_per_signup
  WHERE id = v_referrer_company_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;