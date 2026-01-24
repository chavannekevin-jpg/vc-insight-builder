import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Plus, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InviteStartupDialog } from "../InviteStartupDialog";

interface Invite {
  id: string;
  code: string;
  accelerator_name: string;
  cohort_name: string | null;
  custom_message: string | null;
  discount_percent: number;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface AcceleratorInvitesProps {
  acceleratorId: string;
  acceleratorName: string;
  acceleratorSlug: string;
}

// Premium auth-style glass card
const FluidGlassCard = ({ 
  children, 
  className = "",
  delay = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={cn("relative group", className)}
  >
    {/* Animated border glow on hover */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 rounded-3xl opacity-40" />
    
    {/* Glass card */}
    <div className="relative bg-card/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
      {/* Top highlight */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/8 to-transparent rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-secondary/8 to-transparent rounded-br-3xl" />
      
      <div className="relative z-10">{children}</div>
    </div>
  </motion.div>
);

export function AcceleratorInvites({ acceleratorId, acceleratorName, acceleratorSlug }: AcceleratorInvitesProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, [acceleratorId]);

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("accelerator_invites")
        .select("*")
        .eq("linked_accelerator_id", acceleratorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const copyInviteLink = (invite: Invite) => {
    const link = `${window.location.origin}/invite/${invite.code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Invite link copied!");
  };

  const toggleInviteActive = async (inviteId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("accelerator_invites")
        .update({ is_active: !currentStatus })
        .eq("id", inviteId);

      if (error) throw error;
      toast.success(currentStatus ? "Invite deactivated" : "Invite activated");
      fetchInvites();
    } catch (error) {
      toast.error("Failed to update invite");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Invites</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Invite Codes</h1>
          <p className="text-muted-foreground/70 mt-2">Create and manage startup invite codes</p>
        </div>
        <InviteStartupDialog accelerator={{ id: acceleratorId, name: acceleratorName, slug: acceleratorSlug }}>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.2)]"
          >
            <Plus className="w-4 h-4" />
            Invite Startups
          </Button>
        </InviteStartupDialog>
      </motion.div>

      {invites.length === 0 ? (
        <FluidGlassCard delay={0.15} className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-2">No invite codes yet</h3>
          <p className="text-muted-foreground/70 mb-6 max-w-sm mx-auto">
            Create invite codes for startups to join your accelerator ecosystem.
          </p>
          <InviteStartupDialog accelerator={{ id: acceleratorId, name: acceleratorName, slug: acceleratorSlug }}>
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Invite Startups
            </Button>
          </InviteStartupDialog>
        </FluidGlassCard>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite, i) => (
            <FluidGlassCard key={invite.id} delay={0.1 + i * 0.05}>
              <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary font-mono font-bold border border-primary/20">
                      {invite.code}
                    </code>
                    {invite.is_active ? (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-success/15 text-success border border-success/30">Active</span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-muted/30 text-muted-foreground/60 border border-border/30">Inactive</span>
                    )}
                    {invite.discount_percent === 100 && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-warning/15 text-warning border border-warning/30">Free Access</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/70">
                    {invite.cohort_name && <span>Cohort: {invite.cohort_name}</span>}
                    <span>{invite.uses} / {invite.max_uses || "∞"} uses</span>
                    {invite.discount_percent < 100 && (
                      <span>{invite.discount_percent}% discount</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(invite)}
                    className="gap-2 bg-muted/20 border-border/50 hover:bg-muted/40 hover:border-border"
                  >
                    {copiedId === invite.id ? (
                      <>
                        <Check className="w-4 h-4 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleInviteActive(invite.id, invite.is_active)}
                    className="hover:bg-muted/30"
                  >
                    {invite.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
              {invite.custom_message && (
                <p className="mt-4 text-sm text-muted-foreground/60 border-t border-border/30 pt-4 italic">
                  "{invite.custom_message}"
                </p>
              )}
              </div>
            </FluidGlassCard>
          ))}
        </div>
      )}

    </div>
  );
}
