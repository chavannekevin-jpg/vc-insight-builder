import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FounderReferralInfo {
  code: string;
  discountPercent: number;
  referrerCompanyId: string;
  referrerCompanyName: string | null;
  isValid: boolean;
}

export const useFounderReferral = (referralCode: string | null) => {
  const [referralInfo, setReferralInfo] = useState<FounderReferralInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateCode = async () => {
      if (!referralCode || !referralCode.startsWith('FND-')) {
        setReferralInfo(null);
        setIsLoading(false);
        return;
      }

      try {
        // Validate the founder referral code
        const { data: referral, error } = await (supabase
          .from("founder_referrals") as any)
          .select("id, code, discount_percent, referrer_company_id, is_active")
          .eq("code", referralCode)
          .eq("is_active", true)
          .maybeSingle();

        if (error || !referral) {
          setReferralInfo(null);
          setIsLoading(false);
          return;
        }

        // Get the referrer's company name
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", referral.referrer_company_id)
          .maybeSingle();

        setReferralInfo({
          code: referral.code,
          discountPercent: referral.discount_percent,
          referrerCompanyId: referral.referrer_company_id,
          referrerCompanyName: company?.name || null,
          isValid: true,
        });
      } catch (err) {
        console.error("Error validating founder referral:", err);
        setReferralInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateCode();
  }, [referralCode]);

  return { referralInfo, isLoading };
};

// Function to process founder referral after signup
export const processFounderReferral = async (
  companyId: string,
  referralCode: string
): Promise<boolean> => {
  try {
    // Call the database function to award credit
    const { data, error } = await supabase.rpc("award_founder_referral_credit", {
      p_referral_code: referralCode,
      p_referred_company_id: companyId,
    });

    if (error) {
      console.error("Error processing founder referral:", error);
      return false;
    }

    // Update the referred company with the referral info
    const { data: referral } = await (supabase
      .from("founder_referrals") as any)
      .select("referrer_company_id")
      .eq("code", referralCode)
      .maybeSingle();

    if (referral) {
      await supabase
        .from("companies")
        .update({
          referred_by_company_id: referral.referrer_company_id,
          referred_by_founder_code: referralCode,
        })
        .eq("id", companyId);
    }

    return data === true;
  } catch (err) {
    console.error("Error in processFounderReferral:", err);
    return false;
  }
};

// Hook to manage founder's own referral code
export const useMyFounderReferral = (companyId: string | null) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<{
    uses: number;
    creditsEarned: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrCreateCode = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check for existing referral code
      const { data: existing } = await (supabase
        .from("founder_referrals") as any)
        .select("code, uses")
        .eq("referrer_company_id", companyId)
        .eq("is_active", true)
        .maybeSingle();

      if (existing) {
        setReferralCode(existing.code);
        setReferralStats({
          uses: existing.uses,
          creditsEarned: existing.uses, // 1 credit per signup
        });
        setIsLoading(false);
        return;
      }

      // Generate new code
      const { data: newCode } = await supabase.rpc("generate_founder_referral_code");

      if (!newCode) {
        setIsLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Create the referral record
      const { data: created, error } = await (supabase
        .from("founder_referrals") as any)
        .insert({
          referrer_company_id: companyId,
          referrer_user_id: user.id,
          code: newCode,
          discount_percent: 20,
          credits_per_signup: 1,
        })
        .select("code, uses")
        .single();

      if (!error && created) {
        setReferralCode(created.code);
        setReferralStats({ uses: 0, creditsEarned: 0 });
      }
    } catch (err) {
      console.error("Error fetching/creating founder referral:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateCode();
  }, [companyId]);

  return { referralCode, referralStats, isLoading, refetch: fetchOrCreateCode };
};
