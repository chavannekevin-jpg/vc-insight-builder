-- Add column to track earned referral discount for unpaid founders
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS earned_referral_discount integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.companies.earned_referral_discount IS 'Discount percentage earned from referring other founders (max 40%). Applied at checkout, then reset to 0.';

-- Update the award_founder_referral_credit function with context-aware rewards
CREATE OR REPLACE FUNCTION public.award_founder_referral_credit(
  p_referral_code character varying,
  p_referred_company_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referral_id UUID;
  v_referrer_company_id UUID;
  v_credits_per_signup INTEGER;
  v_referrer_has_premium BOOLEAN;
  v_current_discount INTEGER;
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
  
  -- Check if referrer has already paid (has_premium)
  SELECT has_premium, COALESCE(earned_referral_discount, 0)
  INTO v_referrer_has_premium, v_current_discount
  FROM companies
  WHERE id = v_referrer_company_id;
  
  IF v_referrer_has_premium = true THEN
    -- Already paid: award regeneration credits
    UPDATE companies
    SET generations_available = generations_available + v_credits_per_signup
    WHERE id = v_referrer_company_id;
  ELSE
    -- Not paid yet: award discount (capped at 40%)
    UPDATE companies
    SET earned_referral_discount = LEAST(v_current_discount + 20, 40)
    WHERE id = v_referrer_company_id;
  END IF;
  
  RETURN true;
END;
$function$;