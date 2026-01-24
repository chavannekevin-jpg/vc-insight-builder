import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Link2,
  Ticket,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InviteStartupDialogProps {
  accelerator: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: React.ReactNode;
}

export function InviteStartupDialog({ accelerator, children }: InviteStartupDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  const inviteLink = accelerator?.slug 
    ? `${window.location.origin}/join/${accelerator.slug}` 
    : "";

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Invite link copied!");
    }
  };

  const handleClaimStartup = async () => {
    if (!claimCode.trim() || !accelerator) return;
    
    setIsClaiming(true);
    try {
      // First, find the claim code
      const { data: claimData, error: claimError } = await supabase
        .from("startup_claim_codes")
        .select("id, company_id, is_active, claimed_at")
        .eq("code", claimCode.trim().toUpperCase())
        .maybeSingle();

      if (claimError) throw claimError;
      
      if (!claimData) {
        toast.error("Invalid code", { description: "This claim code doesn't exist." });
        return;
      }

      if (!claimData.is_active || claimData.claimed_at) {
        toast.error("Code already used", { description: "This claim code has already been used." });
        return;
      }

      // Get or create an invite for this accelerator
      const { data: existingInvite } = await supabase
        .from("accelerator_invites")
        .select("id")
        .eq("linked_accelerator_id", accelerator.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      let inviteId = existingInvite?.id;

      if (!inviteId) {
        // Create a default invite for claimed startups
        const { data: newInvite, error: inviteError } = await supabase
          .from("accelerator_invites")
          .insert({
            code: `CLAIMED-${Date.now()}`,
            accelerator_name: accelerator.name,
            accelerator_slug: accelerator.slug,
            linked_accelerator_id: accelerator.id,
            cohort_name: "Claimed Startups",
            is_active: true,
          })
          .select("id")
          .single();

        if (inviteError) throw inviteError;
        inviteId = newInvite.id;
      }

      // Link the company to the accelerator
      const { error: updateError } = await supabase
        .from("companies")
        .update({ accelerator_invite_id: inviteId })
        .eq("id", claimData.company_id);

      if (updateError) throw updateError;

      // Mark the claim code as used
      await supabase
        .from("startup_claim_codes")
        .update({ 
          is_active: false, 
          claimed_at: new Date().toISOString(),
          claimed_by: accelerator.id 
        })
        .eq("id", claimData.id);

      toast.success("Startup claimed!", { 
        description: "The startup has been added to your ecosystem." 
      });
      setClaimCode("");
      setOpen(false);
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error("Failed to claim startup", { description: error.message });
    } finally {
      setIsClaiming(false);
    }
  };

  const methods = [
    {
      number: 1,
      icon: UserPlus,
      title: "Startup Already on Platform",
      description: "If the startup already uses the platform, share your accelerator code. They can add it through their profile settings.",
      action: (
        <div className="flex items-center gap-2 mt-3">
          <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono truncate">
            {accelerator?.slug || "your-code"}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={copyInviteLink}
            className="shrink-0"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      ),
    },
    {
      number: 2,
      icon: Link2,
      title: "Share Invite Link",
      description: "New startups can use this link to join the platform with your accelerator's discount and be automatically added to your ecosystem.",
      action: (
        <Button
          onClick={copyInviteLink}
          className="w-full mt-3 gap-2"
          variant="default"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Invite Link
            </>
          )}
        </Button>
      ),
    },
    {
      number: 3,
      icon: Ticket,
      title: "Use Admin Claim Code",
      description: "Platform admins can provide you with a claim code for a specific startup. Enter it below to add them to your ecosystem.",
      action: (
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Enter claim code..."
            value={claimCode}
            onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
            className="font-mono"
          />
          <Button
            onClick={handleClaimStartup}
            disabled={!claimCode.trim() || isClaiming}
            className="shrink-0 gap-2"
          >
            {isClaiming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Claim
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-border/50 bg-card/95 backdrop-blur-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Invite Startups to Your Ecosystem
          </DialogTitle>
          <DialogDescription>
            There are three ways to bring startups into your accelerator ecosystem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {methods.map((method, index) => (
            <motion.div
              key={method.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Subtle hover glow */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl"
              >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <method.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Method {method.number}
                    </span>
                    <h4 className="font-semibold text-sm">{method.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {method.description}
                  </p>
                  {method.action}
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
