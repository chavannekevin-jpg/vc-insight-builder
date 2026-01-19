import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Link, Rocket, Users, Gift, Loader2, Check, Sparkles, ArrowRight } from "lucide-react";

interface StartupInvite {
  id: string;
  code: string;
  discount_percent: number;
  uses: number;
  max_uses: number | null;
  is_active: boolean;
}

interface InviteStartupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const InviteStartupModal = ({ open, onOpenChange, userId }: InviteStartupModalProps) => {
  const [activeCode, setActiveCode] = useState<StartupInvite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stats, setStats] = useState({ invited: 0, inDealflow: 0 });

  useEffect(() => {
    if (open) {
      fetchInviteCode();
      fetchStats();
    }
  }, [open, userId]);

  const fetchInviteCode = async () => {
    try {
      const { data, error } = await supabase
        .from("startup_invites")
        .select("*")
        .eq("investor_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setActiveCode(data as StartupInvite);
      }
    } catch (error) {
      console.error("Error fetching invite code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total invited
      const { data: invites } = await supabase
        .from("startup_invites")
        .select("uses")
        .eq("investor_id", userId);
      
      const totalInvited = invites?.reduce((acc, i) => acc + (i.uses || 0), 0) || 0;

      // Get dealflow count
      const { count: dealflowCount } = await supabase
        .from("investor_dealflow")
        .select("*", { count: "exact", head: true })
        .eq("investor_id", userId);

      setStats({ invited: totalInvited, inDealflow: dealflowCount || 0 });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "INV-";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const { data, error } = await supabase
        .from("startup_invites")
        .insert({
          code,
          investor_id: userId,
          discount_percent: 20,
          max_uses: 10,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveCode(data as StartupInvite);
      toast({
        title: "Invite link created!",
        description: "Share this link with startups to add them to your dealflow.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate invite link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getInviteLink = () => {
    if (!activeCode) return "";
    return `${window.location.origin}/auth?startup_invite=${activeCode.code}`;
  };

  const copyInviteLink = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(getInviteLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({ title: "Invite link copied!", description: "Share it with startups to grow your dealflow." });
  };

  const benefits = [
    { icon: Gift, text: "Startups get 20% discount on their analysis" },
    { icon: ArrowRight, text: "They're auto-added to your dealflow pipeline" },
    { icon: Sparkles, text: "Access their pitch summary & verdict score" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Invite a Startup</DialogTitle>
              <DialogDescription>
                Grow your dealflow with quality leads
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Benefits */}
          <div className="space-y-2.5">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <benefit.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeCode ? (
            <div className="space-y-4">
              {/* Invite link display */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Your shareable invite link</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={getInviteLink()}
                    readOnly
                    className="text-sm h-11 bg-muted/50 text-muted-foreground"
                  />
                  <Button
                    variant="default"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={copyInviteLink}
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Large copy button */}
              <Button
                variant="default"
                className="w-full gap-2 h-12 text-base"
                onClick={copyInviteLink}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Link className="w-5 h-5" />
                    Copy Invite Link
                  </>
                )}
              </Button>

              {/* Usage stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  {activeCode.discount_percent}% discount for startups
                </span>
                <span>
                  {activeCode.uses}/{activeCode.max_uses || "∞"} invites used
                </span>
              </div>
            </div>
          ) : (
            <Button
              className="w-full gap-2 h-11"
              onClick={generateCode}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Generate Invite Link
                </>
              )}
            </Button>
          )}

          {/* Stats footer */}
          {(stats.invited > 0 || stats.inDealflow > 0) && (
            <div className="flex items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="font-medium text-foreground">{stats.invited}</span> invited
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4" />
                <span className="font-medium text-foreground">{stats.inDealflow}</span> in dealflow
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteStartupModal;
