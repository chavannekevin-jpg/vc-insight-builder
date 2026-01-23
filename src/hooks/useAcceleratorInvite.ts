import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AcceleratorInviteInfo {
  code: string;
  acceleratorName: string;
  acceleratorSlug: string;
  discountPercent: number;
  isValid: boolean;
  remainingUses: number | null;
}

export function useAcceleratorInvite(inviteCode: string | null) {
  const [inviteInfo, setInviteInfo] = useState<AcceleratorInviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setInviteInfo(null);
      return;
    }

    const validateCode = async () => {
      setIsLoading(true);
      try {
        const { data: invite, error } = await (supabase
          .from("accelerator_invites" as any)
          .select("*")
          .eq("code", inviteCode)
          .eq("is_active", true)
          .single() as any);

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

        const remainingUses = invite.max_uses ? invite.max_uses - invite.uses : null;

        setInviteInfo({
          code: invite.code,
          acceleratorName: invite.accelerator_name,
          acceleratorSlug: invite.accelerator_slug,
          discountPercent: invite.discount_percent,
          isValid: true,
          remainingUses,
        });
      } catch (error) {
        console.error("Error validating accelerator invite:", error);
        setInviteInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateCode();
  }, [inviteCode]);

  return { inviteInfo, isLoading };
}

export async function incrementAcceleratorInviteUsage(code: string): Promise<boolean> {
  try {
    const { data: invite, error: fetchError } = await (supabase
      .from("accelerator_invites" as any)
      .select("id, uses")
      .eq("code", code)
      .single() as any);

    if (fetchError || !invite) return false;

    const { error: updateError } = await (supabase
      .from("accelerator_invites" as any)
      .update({ uses: invite.uses + 1 })
      .eq("id", invite.id) as any);

    return !updateError;
  } catch (error) {
    console.error("Error incrementing accelerator invite usage:", error);
    return false;
  }
}
