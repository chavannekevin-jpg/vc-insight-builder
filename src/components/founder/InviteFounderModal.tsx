import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  Gift, 
  Users,
  ArrowRight,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InviteFounderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
}

export const InviteFounderModal = ({
  open,
  onOpenChange,
  companyId,
  companyName
}: InviteFounderModalProps) => {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open && companyId) {
      loadOrCreateReferralCode();
    }
  }, [open, companyId]);
  
  const loadOrCreateReferralCode = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Check for existing referral
      const { data: existing } = await supabase
        .from('founder_referrals')
        .select('code')
        .eq('referrer_company_id', companyId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (existing?.code) {
        setReferralCode(existing.code);
      } else {
        // Create new referral code
        const { data: newCode } = await supabase.rpc('generate_founder_referral_code');
        
        if (newCode) {
          await supabase.from('founder_referrals').insert({
            code: newCode,
            referrer_company_id: companyId,
            referrer_user_id: user.id,
            discount_percent: 20,
            credits_per_signup: 1
          });
          setReferralCode(newCode);
        }
      }
    } catch (err) {
      console.error('Failed to load referral code:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const referralLink = referralCode 
    ? `${window.location.origin}/invite?founder=${referralCode}`
    : '';
  
  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it with fellow founders." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card via-card to-primary/5 border-primary/30">
        <DialogHeader className="pb-4 border-b border-border/30">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Invite Fellow Founders
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          {/* Value Proposition */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold">Here's what you get:</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Free Regeneration Credit</p>
                  <p className="text-sm text-muted-foreground">
                    Earn 1 credit for every founder who signs up
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Upgrade Your Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    Use credits to regenerate and improve your score
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Unlock VC Intros</p>
                  <p className="text-sm text-muted-foreground">
                    Score 60+ to get free intros to VCs from our network
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* What they get */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
            <Users className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">They get 20% off</p>
              <p className="text-xs text-muted-foreground">
                Your friends receive a discount on their first analysis
              </p>
            </div>
          </div>
          
          {/* Referral Link */}
          {loading ? (
            <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating your link...</span>
            </div>
          ) : referralLink ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Your unique referral link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted/50 border rounded-lg px-3 py-2.5 text-sm truncate font-mono">
                  {referralLink}
                </div>
                <Button onClick={handleCopy} className="gradient-primary gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Failed to generate link. Please try again.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
