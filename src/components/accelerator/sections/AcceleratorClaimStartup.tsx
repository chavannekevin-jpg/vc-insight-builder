import { useState } from "react";
import { Search, UserPlus, Loader2, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AcceleratorClaimStartupProps {
  acceleratorId: string;
  acceleratorName: string;
  onClaim?: () => void;
}

interface FoundCompany {
  id: string;
  name: string;
  stage: string;
  category: string | null;
  referral_code: string | null;
}

export function AcceleratorClaimStartup({ 
  acceleratorId, 
  acceleratorName,
  onClaim 
}: AcceleratorClaimStartupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [foundCompany, setFoundCompany] = useState<FoundCompany | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }

    setIsSearching(true);
    setError(null);
    setFoundCompany(null);

    try {
      // First, try to find a startup claim code (admin-generated)
      const { data: claimCode } = await supabase
        .from("startup_claim_codes")
        .select("company_id, is_active, claimed_at, expires_at")
        .eq("code", code.toUpperCase().trim())
        .maybeSingle();

      if (claimCode) {
        if (!claimCode.is_active) {
          setError("This claim code has been deactivated");
          return;
        }
        if (claimCode.claimed_at) {
          setError("This claim code has already been used");
          return;
        }
        if (claimCode.expires_at && new Date(claimCode.expires_at) < new Date()) {
          setError("This claim code has expired");
          return;
        }

        // Fetch the company
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id, name, stage, category, referral_code")
          .eq("id", claimCode.company_id)
          .single();

        if (companyError || !company) {
          setError("Could not find the startup associated with this code");
          return;
        }

        setFoundCompany(company);
        return;
      }

      // Try to find by company referral code (FND-XXXXXX)
      const { data: companyByReferral } = await supabase
        .from("companies")
        .select("id, name, stage, category, referral_code")
        .eq("referral_code", code.toUpperCase().trim())
        .maybeSingle();

      if (companyByReferral) {
        setFoundCompany(companyByReferral);
        return;
      }

      setError("No startup found with this code. Check the code and try again.");
    } catch (err: any) {
      console.error("Search error:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClaim = async () => {
    if (!foundCompany) return;

    setIsClaiming(true);
    try {
      // Get or create an invite for this accelerator to link the company
      let { data: invite } = await supabase
        .from("accelerator_invites")
        .select("id")
        .eq("linked_accelerator_id", acceleratorId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      // If no invite exists, create one
      if (!invite) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const newCode = Array.from({ length: 8 }, () => 
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        const { data: newInvite, error: inviteError } = await supabase
          .from("accelerator_invites")
          .insert({
            code: newCode,
            accelerator_name: acceleratorName,
            accelerator_slug: acceleratorName.toLowerCase().replace(/\s+/g, "-"),
            linked_accelerator_id: acceleratorId,
            discount_percent: 0,
            is_active: true,
            custom_message: "Claimed via admin code",
          })
          .select("id")
          .single();

        if (inviteError) throw inviteError;
        invite = newInvite;
      }

      // Link the company to this accelerator's invite
      const { error: updateError } = await supabase
        .from("companies")
        .update({ accelerator_invite_id: invite.id })
        .eq("id", foundCompany.id);

      if (updateError) throw updateError;

      // Mark the claim code as claimed (if it was an admin code)
      await supabase
        .from("startup_claim_codes")
        .update({ 
          claimed_at: new Date().toISOString(),
          accelerator_id: acceleratorId 
        })
        .eq("code", code.toUpperCase().trim());

      toast.success(`${foundCompany.name} has been added to your ecosystem!`);
      setIsOpen(false);
      setCode("");
      setFoundCompany(null);
      onClaim?.();
    } catch (err: any) {
      console.error("Claim error:", err);
      toast.error(err.message || "Failed to claim startup");
    } finally {
      setIsClaiming(false);
    }
  };

  const resetState = () => {
    setCode("");
    setFoundCompany(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Claim Startup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim a Startup</DialogTitle>
          <DialogDescription>
            Enter a startup's claim code or referral code to add them to your ecosystem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Claim Code or Referral Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., CLAIM-XXXXX or FND-XXXXXX"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                  setFoundCompany(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !code.trim()}
                variant="secondary"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {foundCompany && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{foundCompany.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {foundCompany.stage} • {foundCompany.category || "No category"}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-success ml-auto" />
              </div>

              <Button 
                onClick={handleClaim} 
                disabled={isClaiming}
                className="w-full"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding to ecosystem...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add to {acceleratorName}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
