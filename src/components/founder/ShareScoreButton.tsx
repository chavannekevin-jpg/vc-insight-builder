import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Twitter, Linkedin, Gift, ExternalLink, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ShareScoreButtonProps {
  companyId: string;
  companyName: string;
  score: number;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export default function ShareScoreButton({
  companyId,
  companyName,
  score,
  variant = "outline",
  size = "sm",
  className,
  showLabel = true,
}: ShareScoreButtonProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch or create referral code on mount
  useEffect(() => {
    const fetchOrCreateReferralCode = async () => {
      if (!companyId) return;

      try {
        // First check if a referral already exists
        const { data: existing, error: fetchError } = await supabase
          .from("founder_referrals")
          .select("code")
          .eq("referrer_company_id", companyId)
          .eq("is_active", true)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching referral:", fetchError);
          return;
        }

        if (existing?.code) {
          setReferralCode(existing.code);
          return;
        }

        // Create a new referral code
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) return;

        // Generate code using database function
        const { data: newCode, error: genError } = await supabase
          .rpc("generate_founder_referral_code");

        if (genError) {
          console.error("Error generating code:", genError);
          return;
        }

        // Insert the new referral
        const { error: insertError } = await supabase
          .from("founder_referrals")
          .insert({
            referrer_company_id: companyId,
            referrer_user_id: user.user.id,
            code: newCode,
            discount_percent: 20,
            credits_per_signup: 1,
          });

        if (!insertError) {
          setReferralCode(newCode);
        }
      } catch (err) {
        console.error("Error in referral code setup:", err);
      }
    };

    fetchOrCreateReferralCode();
  }, [companyId]);

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return referralCode 
      ? `${baseUrl}/invite?founder=${referralCode}`
      : `${baseUrl}/auth`;
  };

  const getShareMessage = () => {
    const scoreEmoji = score >= 70 ? "🚀" : score >= 50 ? "📈" : "🎯";
    return `${scoreEmoji} Just scored ${score}/100 on my investment readiness analysis with @UglyBaby! See how your startup stacks up: ${getShareUrl()}`;
  };

  const handleCopyLink = async () => {
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: referralCode 
          ? "Share with other founders to earn credits" 
          : "Share link copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterShare = () => {
    const text = getShareMessage();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleLinkedInShare = () => {
    const url = getShareUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
        >
          <Share2 className="w-4 h-4" />
          {showLabel && <span className="hidden sm:inline">Share Score</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Header with score */}
        <div className="px-3 py-2 border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {companyName}
            </span>
            <span className={cn(
              "text-sm font-bold",
              score >= 70 ? "text-success" :
              score >= 50 ? "text-warning" : "text-destructive"
            )}>
              {score}/100
            </span>
          </div>
        </div>

        {/* Share options */}
        <DropdownMenuItem 
          onClick={handleCopyLink}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-success" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy Share Link"}
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleTwitterShare}
          className="cursor-pointer"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleLinkedInShare}
          className="cursor-pointer"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>

        {/* Referral incentive */}
        {referralCode && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 bg-primary/5 rounded-b-lg">
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-foreground">Earn Free Credits</p>
                  <p className="text-muted-foreground">
                    Get 1 free regeneration for each founder who signs up using your link
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
