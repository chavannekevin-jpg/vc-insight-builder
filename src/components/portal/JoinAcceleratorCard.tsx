import { useState } from "react";
import { Building2, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JoinAcceleratorCardProps {
  companyId: string;
  currentAcceleratorName?: string | null;
  onJoin?: () => void;
}

interface AcceleratorInfo {
  id: string;
  name: string;
  slug: string;
  discountPercent: number;
  cohortName?: string | null;
  customMessage?: string | null;
  inviteId: string;
}

export function JoinAcceleratorCard({ 
  companyId, 
  currentAcceleratorName,
  onJoin 
}: JoinAcceleratorCardProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [acceleratorInfo, setAcceleratorInfo] = useState<AcceleratorInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateCode = async () => {
    if (!code.trim()) {
      setError("Please enter an accelerator invite code");
      return;
    }

    setIsValidating(true);
    setError(null);
    setAcceleratorInfo(null);

    try {
      const codeUpper = code.toUpperCase().trim();
      
      // First, try to find an invite code directly
      const { data: invite } = await supabase
        .from("accelerator_invites")
        .select("id, accelerator_name, accelerator_slug, discount_percent, cohort_name, custom_message, is_active, expires_at, max_uses, uses, linked_accelerator_id")
        .eq("code", codeUpper)
        .maybeSingle();

      if (invite) {
        if (!invite.is_active) {
          setError("This invite code is no longer active.");
          return;
        }
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
          setError("This invite code has expired.");
          return;
        }
        if (invite.max_uses && invite.uses >= invite.max_uses) {
          setError("This invite code has reached its maximum uses.");
          return;
        }
        setAcceleratorInfo({
          id: invite.linked_accelerator_id || "",
          name: invite.accelerator_name,
          slug: invite.accelerator_slug,
          discountPercent: invite.discount_percent,
          cohortName: invite.cohort_name,
          customMessage: invite.custom_message,
          inviteId: invite.id,
        });
        return;
      }

      // If no invite found, try to find by accelerator slug
      const { data: accelerator } = await supabase
        .from("accelerators")
        .select("id, name, slug, default_discount_percent, max_discounted_startups, is_active")
        .eq("slug", codeUpper.toLowerCase())
        .eq("is_active", true)
        .maybeSingle();

      if (!accelerator) {
        setError("Invalid invite code. Please check and try again.");
        return;
      }

      // Check if discount cap has been reached
      let effectiveDiscount = accelerator.default_discount_percent || 0;
      
      if (accelerator.max_discounted_startups !== null) {
        // First get all invite IDs for this accelerator
        const { data: invites } = await supabase
          .from("accelerator_invites")
          .select("id")
          .eq("linked_accelerator_id", accelerator.id);
        
        if (invites && invites.length > 0) {
          const inviteIds = invites.map(i => i.id);
          
          // Count companies linked to these invites
          const { count } = await supabase
            .from("companies")
            .select("id", { count: "exact", head: true })
            .in("accelerator_invite_id", inviteIds);
          
          // If cap reached, set discount to 0
          if (count !== null && count >= accelerator.max_discounted_startups) {
            effectiveDiscount = 0;
          }
        }
      }

      // Find or create an invite for this accelerator
      let { data: existingInvite } = await supabase
        .from("accelerator_invites")
        .select("id, accelerator_name, accelerator_slug, discount_percent, cohort_name, custom_message")
        .eq("linked_accelerator_id", accelerator.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!existingInvite) {
        // Create a new invite for this accelerator
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const newCode = Array.from({ length: 8 }, () => 
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        const { data: newInvite, error: createError } = await supabase
          .from("accelerator_invites")
          .insert({
            code: newCode,
            accelerator_name: accelerator.name,
            accelerator_slug: accelerator.slug,
            linked_accelerator_id: accelerator.id,
            discount_percent: effectiveDiscount,
            is_active: true,
          })
          .select("id, accelerator_name, accelerator_slug, discount_percent, cohort_name, custom_message")
          .single();

        if (createError || !newInvite) {
          setError("Failed to process. Please try again.");
          return;
        }
        existingInvite = newInvite;
      } else if (accelerator.max_discounted_startups !== null) {
        // If existing invite but cap applies, override the displayed discount
        existingInvite = { ...existingInvite, discount_percent: effectiveDiscount };
      }

      setAcceleratorInfo({
        id: accelerator.id,
        name: existingInvite.accelerator_name,
        slug: existingInvite.accelerator_slug,
        discountPercent: existingInvite.discount_percent,
        cohortName: existingInvite.cohort_name,
        customMessage: existingInvite.custom_message,
        inviteId: existingInvite.id,
      });
    } catch (err: any) {
      console.error("Validation error:", err);
      setError("Failed to validate code. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = async () => {
    if (!acceleratorInfo) return;

    setIsJoining(true);
    try {
      // Link the company to the accelerator invite
      const { error: updateError } = await supabase
        .from("companies")
        .update({ accelerator_invite_id: acceleratorInfo.inviteId })
        .eq("id", companyId);

      if (updateError) throw updateError;

      // Increment the invite usage manually
      const { data: currentInvite } = await supabase
        .from("accelerator_invites")
        .select("uses")
        .eq("id", acceleratorInfo.inviteId)
        .single();
      
      if (currentInvite) {
        await supabase
          .from("accelerator_invites")
          .update({ uses: (currentInvite.uses || 0) + 1 })
          .eq("id", acceleratorInfo.inviteId);
      }

      toast.success(`You've joined ${acceleratorInfo.name}!`);
      setCode("");
      setAcceleratorInfo(null);
      onJoin?.();
    } catch (err: any) {
      console.error("Join error:", err);
      toast.error(err.message || "Failed to join accelerator");
    } finally {
      setIsJoining(false);
    }
  };

  if (currentAcceleratorName) {
    return (
      <div className="p-4 rounded-xl bg-success/5 border border-success/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Part of accelerator</p>
            <p className="font-medium text-foreground">{currentAcceleratorName}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-success ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Join an Accelerator</p>
          <p className="text-sm text-muted-foreground">
            Enter your accelerator's invite code to join their ecosystem
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter invite code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
              setAcceleratorInfo(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && validateCode()}
            className="flex-1"
          />
          <Button 
            onClick={validateCode} 
            disabled={isValidating || !code.trim()}
            variant="secondary"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {acceleratorInfo && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{acceleratorInfo.name}</p>
                {acceleratorInfo.cohortName && (
                  <p className="text-sm text-muted-foreground">{acceleratorInfo.cohortName}</p>
                )}
              </div>
              {acceleratorInfo.discountPercent > 0 && (
                <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                  {acceleratorInfo.discountPercent}% discount
                </span>
              )}
            </div>

            {acceleratorInfo.customMessage && (
              <p className="text-sm text-muted-foreground italic">
                "{acceleratorInfo.customMessage}"
              </p>
            )}

            <Button 
              onClick={handleJoin} 
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join {acceleratorInfo.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
