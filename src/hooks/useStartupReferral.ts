import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StartupInviteInfo {
  code: string;
  discountPercent: number;
  investorId: string;
  investorName: string | null;
  isValid: boolean;
}

export function useStartupReferral(inviteCode: string | null) {
  const [inviteInfo, setInviteInfo] = useState<StartupInviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setInviteInfo(null);
      return;
    }

    const validateCode = async () => {
      setIsLoading(true);
      try {
        // Fetch invite code details
        const { data: invite, error } = await supabase
          .from("startup_invites")
          .select("*")
          .eq("code", inviteCode)
          .eq("is_active", true)
          .single();

        if (error || !invite) {
          setInviteInfo(null);
          return;
        }

        // Check if expired
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
          setInviteInfo(null);
          return;
        }

        // Check if max uses reached
        if (invite.max_uses && invite.uses >= invite.max_uses) {
          setInviteInfo(null);
          return;
        }

        // Fetch investor name
        const { data: investor } = await supabase
          .from("investor_profiles")
          .select("full_name, organization_name")
          .eq("id", invite.investor_id)
          .single();

        const investorName = investor?.full_name || investor?.organization_name || null;

        setInviteInfo({
          code: invite.code,
          discountPercent: invite.discount_percent,
          investorId: invite.investor_id,
          investorName,
          isValid: true,
        });
      } catch (error) {
        console.error("Error validating startup invite:", error);
        setInviteInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateCode();
  }, [inviteCode]);

  return { inviteInfo, isLoading };
}

export async function processStartupReferral(
  companyId: string,
  inviteCode: string
): Promise<boolean> {
  try {
    // Get the invite details
    const { data: invite, error: inviteError } = await supabase
      .from("startup_invites")
      .select("*")
      .eq("code", inviteCode)
      .eq("is_active", true)
      .single();

    if (inviteError || !invite) {
      console.error("Invalid invite code");
      return false;
    }

    // Update company with referral info
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        referred_by_investor: invite.investor_id,
        referral_code: inviteCode,
      })
      .eq("id", companyId);

    if (companyError) {
      console.error("Failed to update company with referral:", companyError);
      return false;
    }

    // Add to investor's dealflow
    const { error: dealflowError } = await supabase
      .from("investor_dealflow")
      .insert({
        investor_id: invite.investor_id,
        company_id: companyId,
        source: "invite",
        invited_via_code: inviteCode,
        status: "reviewing",
      });

    if (dealflowError) {
      console.error("Failed to add to dealflow:", dealflowError);
      // Non-critical, continue
    }

    // Increment invite usage
    const { error: updateError } = await supabase
      .from("startup_invites")
      .update({ uses: invite.uses + 1 })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Failed to update invite usage:", updateError);
      // Non-critical
    }

    return true;
  } catch (error) {
    console.error("Error processing startup referral:", error);
    return false;
  }
}
