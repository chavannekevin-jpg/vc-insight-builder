import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Copy, 
  Check, 
  Gift, 
  Users, 
  Sparkles,
  Twitter,
  Linkedin,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMyFounderReferral } from "@/hooks/useFounderReferral";

interface ShareScoreCardProps {
  companyId: string;
  companyName: string;
  score: number;
  hasGeneratedMemo: boolean;
}

const ShareScoreCard = ({ 
  companyId, 
  companyName, 
  score, 
  hasGeneratedMemo 
}: ShareScoreCardProps) => {
  const [copied, setCopied] = useState(false);
  const { referralCode, referralStats, isLoading } = useMyFounderReferral(companyId);

  if (!hasGeneratedMemo || !referralCode) {
    return null;
  }

  const referralLink = `${window.location.origin}/invite?founder=${referralCode}`;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ 
        title: "Failed to copy", 
        description: "Please copy the link manually",
        variant: "destructive" 
      });
    }
  };

  const shareToTwitter = () => {
    const text = `I just scored ${score}/100 on my startup investment readiness with @UglyBabyVC! 🚀\n\nGet 20% off your analysis:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share & Earn Credits
          </CardTitle>
          {referralStats && referralStats.creditsEarned > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Gift className="w-3 h-3 mr-1" />
              {referralStats.creditsEarned} credits earned
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${getScoreBgColor(score)}`}>
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{companyName}</p>
            <p className="text-sm text-muted-foreground">Investment Readiness Score</p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-background/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">How it works:</span>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            <li className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              Share your referral link with fellow founders
            </li>
            <li className="flex items-center gap-2">
              <Gift className="w-3 h-3" />
              Earn 1 free regeneration credit per signup
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3 h-3" />
              They get 20% off their first analysis
            </li>
          </ul>
        </div>

        {/* Referral Link */}
        <div className="flex gap-2">
          <div className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm truncate font-mono">
            {referralLink}
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Social Share Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={shareToTwitter}
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={shareToLinkedIn}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
        </div>

        {/* Stats */}
        {referralStats && referralStats.uses > 0 && (
          <div className="flex items-center justify-center gap-4 pt-2 border-t text-sm text-muted-foreground">
            <span>{referralStats.uses} founder{referralStats.uses !== 1 ? 's' : ''} referred</span>
            <span>•</span>
            <span>{referralStats.creditsEarned} credit{referralStats.creditsEarned !== 1 ? 's' : ''} earned</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareScoreCard;
