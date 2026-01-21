import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { 
  Copy, 
  Check, 
  Zap, 
  Shield,
  Twitter,
  Linkedin,
  Gift,
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { buildHolisticScorecard, type SectionVerdict } from "@/lib/holisticVerdictGenerator";

interface ShareScorecardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  companyDescription?: string;
  stage: string;
  category?: string;
  sectionTools: Record<string, { sectionScore?: { score: number; vcBenchmark: number } }>;
  referralCode?: string;
}

const STATUS_ICONS = {
  critical: XCircle,
  weak: AlertTriangle,
  passing: CheckCircle2,
  strong: TrendingUp
};

const STATUS_COLORS = {
  critical: 'text-destructive',
  weak: 'text-warning',
  passing: 'text-success',
  strong: 'text-success'
};

const READINESS_CONFIG = {
  'NOT_READY': { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Not Ready' },
  'CONDITIONAL': { color: 'text-warning', bg: 'bg-warning/10', label: 'Conditional' },
  'READY': { color: 'text-success', bg: 'bg-success/10', label: 'Ready' }
};

export const ShareScorecardModal = ({
  open,
  onOpenChange,
  companyId,
  companyName,
  companyDescription,
  stage,
  category,
  sectionTools,
  referralCode
}: ShareScorecardModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const scorecard = useMemo(() =>
    buildHolisticScorecard(sectionTools, companyName, stage, category),
    [sectionTools, companyName, stage, category]
  );
  
  const radarData = useMemo(() => 
    scorecard.sections.map(s => ({
      section: s.section.substring(0, 3).toUpperCase(),
      score: s.score,
      benchmark: s.benchmark,
      fullMark: 100
    })),
    [scorecard]
  );
  
  const shareUrl = `${window.location.origin}/scorecard?id=${companyId}${referralCode ? `&ref=${referralCode}` : ''}`;
  
  const readinessConfig = READINESS_CONFIG[scorecard.investmentReadiness];
  const isEligibleForIntro = scorecard.overallScore >= 60;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share your scorecard with others." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };
  
  const shareToTwitter = () => {
    const text = `Just scored ${scorecard.overallScore}/100 on my investment readiness! 🚀 Check out my startup's scorecard:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };
  
  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-br from-card via-card to-primary/5 border-primary/30">
        <DialogHeader className="pb-3 border-b border-border/30">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Share Your Scorecard
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share your investment readiness score and earn free regeneration credits
          </DialogDescription>
        </DialogHeader>
        
        {/* Compact Scorecard Preview */}
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-4">
          {/* Company Header */}
          <div className="relative z-10 mb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-foreground truncate">{companyName}</h3>
                {companyDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {companyDescription}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{stage}</Badge>
                {category && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{category}</Badge>}
              </div>
            </div>
          </div>
          
          {/* Score + Radar */}
          <div className="relative z-10 grid grid-cols-2 gap-3 items-center">
            {/* Score Circle */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-card to-muted border-2",
                scorecard.overallScore >= 65 ? "border-success shadow-[0_0_20px_rgba(34,197,94,0.3)]" :
                scorecard.overallScore >= 50 ? "border-warning shadow-[0_0_20px_rgba(234,179,8,0.3)]" :
                "border-destructive shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              )}>
                <div className="text-center">
                  <span className="text-xl font-bold text-foreground">{scorecard.overallScore}</span>
                  <span className="text-[10px] text-muted-foreground block -mt-0.5">/100</span>
                </div>
              </div>
              <div className={cn(
                "mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                readinessConfig.bg, readinessConfig.color
              )}>
                <Shield className="w-2.5 h-2.5" />
                {readinessConfig.label}
              </div>
            </div>
            
            {/* Radar Chart */}
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <PolarAngleAxis 
                    dataKey="section" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 7, fontWeight: 500 }}
                  />
                  <Radar
                    dataKey="benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="transparent"
                  />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Compact Section Grid */}
          <div className="relative z-10 mt-3 grid grid-cols-4 gap-1">
            {scorecard.sections.slice(0, 8).map((section) => {
              const Icon = STATUS_ICONS[section.status];
              return (
                <div 
                  key={section.section}
                  className="flex items-center justify-between px-1.5 py-1 rounded bg-muted/30 text-[10px]"
                >
                  <span className="truncate text-foreground">{section.section.substring(0, 3)}</span>
                  <span className={cn(
                    "font-bold tabular-nums",
                    section.score >= section.benchmark ? "text-success" : 
                    section.score >= section.benchmark - 15 ? "text-warning" : "text-destructive"
                  )}>
                    {section.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Share Link */}
        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <div className="flex-1 bg-muted/50 border rounded-lg px-2.5 py-1.5 text-xs truncate font-mono">
              {shareUrl}
            </div>
            <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5 h-8">
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          
          {/* Social Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-8 text-xs" onClick={shareToTwitter}>
              <Twitter className="w-3.5 h-3.5" />
              Share on X
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-8 text-xs" onClick={shareToLinkedIn}>
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn
            </Button>
          </div>
        </div>
        
        {/* VC Intro Eligibility */}
        {isEligibleForIntro ? (
          <div className="p-2.5 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <div>
              <p className="font-semibold text-success text-xs">You're eligible for a free VC intro!</p>
              <p className="text-[10px] text-muted-foreground">
                Score {scorecard.overallScore} qualifies you for an intro to a VC from our network.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Score 60+ to unlock VC intros</p>
              <p className="text-[10px] text-muted-foreground">
                You're {60 - scorecard.overallScore} points away from a free intro.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
