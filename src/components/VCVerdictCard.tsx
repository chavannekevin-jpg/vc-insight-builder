import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, AlertTriangle, TrendingUp, 
  Eye, CheckCircle2, Lock, Sparkles, 
  FileText, AlertCircle, Flame, Scale, Lightbulb, Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Concern {
  text: string;
  category: string;
  caseStudyReference?: string;
}

interface Strength {
  text: string;
  category: string;
}

interface VCVerdict {
  verdict: string;
  readinessLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  readinessRationale: string;
  concerns: Concern[];
  strengths: Strength[];
  marketInsight: string;
  vcFrameworkCheck: string;
}

interface LegacyVCVerdict {
  verdict_severity: 'HIGH_RISK' | 'MODERATE_RISK' | 'NEEDS_WORK' | 'PROMISING';
  harsh_observations: Array<{ text: string; severity: string; category: string }>;
  key_weakness: string;
  verdict_summary: string;
  blind_spots_count: number;
}

const convertLegacyVerdict = (legacy: LegacyVCVerdict): VCVerdict => {
  const severityToLevel: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
    'HIGH_RISK': 'LOW',
    'MODERATE_RISK': 'MEDIUM',
    'NEEDS_WORK': 'MEDIUM',
    'PROMISING': 'HIGH'
  };

  return {
    verdict: legacy.verdict_summary || "Strategic positioning needs refinement.",
    readinessLevel: severityToLevel[legacy.verdict_severity] || 'MEDIUM',
    readinessRationale: legacy.key_weakness || "Further analysis needed.",
    concerns: (legacy.harsh_observations || []).map(obs => ({
      text: obs.text,
      category: obs.category,
      caseStudyReference: undefined
    })),
    strengths: [
      { text: "Early stage positioning allows for strategic pivots.", category: "market" }
    ],
    marketInsight: "Market dynamics require careful positioning.",
    vcFrameworkCheck: "Complete profile for detailed framework analysis."
  };
};

const isLegacyVerdict = (verdict: any): verdict is LegacyVCVerdict => {
  return verdict && 'harsh_observations' in verdict;
};

interface VCVerdictCardProps {
  companyId: string;
  companyName: string;
  companyDescription?: string | null;
  companyStage: string;
  companyCategory?: string | null;
  responses: Array<{ question_key: string; answer: string | null }>;
  memoGenerated: boolean;
  hasPaid: boolean;
  deckParsed?: boolean;
  cachedVerdict?: VCVerdict | LegacyVCVerdict | null;
  onVerdictGenerated?: (verdict: VCVerdict) => void;
}

const readinessConfig = {
  LOW: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    label: "Not VC-Ready",
    emoji: "🔴"
  },
  MEDIUM: {
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    label: "Needs Work",
    emoji: "🟡"
  },
  HIGH: {
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    label: "Strong Position",
    emoji: "🟢"
  }
};

export const VCVerdictCard = memo(({
  companyId,
  companyName,
  companyDescription,
  companyStage,
  companyCategory,
  responses,
  memoGenerated,
  hasPaid,
  deckParsed = false,
  cachedVerdict: rawCachedVerdict,
  onVerdictGenerated
}: VCVerdictCardProps) => {
  const cachedVerdict = rawCachedVerdict 
    ? (isLegacyVerdict(rawCachedVerdict) ? convertLegacyVerdict(rawCachedVerdict) : rawCachedVerdict as VCVerdict)
    : null;
  const navigate = useNavigate();
  const [verdict, setVerdict] = useState<VCVerdict | null>(cachedVerdict || null);
  const [loading, setLoading] = useState(!cachedVerdict);
  const [error, setError] = useState<string | null>(null);

  const generateVerdict = useCallback(async () => {
    if (memoGenerated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-vc-verdict', {
        body: {
          companyName,
          companyDescription,
          stage: companyStage,
          category: companyCategory,
          responses,
          deckParsed
        }
      });

      if (fnError) throw fnError;

      setVerdict(data);
      onVerdictGenerated?.(data);

      await supabase
        .from('companies')
        .update({ 
          vc_verdict_json: data,
          verdict_generated_at: new Date().toISOString()
        })
        .eq('id', companyId);

    } catch (err) {
      console.error('Error generating verdict:', err);
      setError('Failed to generate verdict');
    } finally {
      setLoading(false);
    }
  }, [companyId, companyName, companyDescription, companyStage, companyCategory, responses, deckParsed, memoGenerated, onVerdictGenerated]);

  useEffect(() => {
    if (!cachedVerdict && !memoGenerated) {
      generateVerdict();
    }
  }, [cachedVerdict, memoGenerated, generateVerdict]);

  const navigateToPortal = useCallback(() => navigate("/portal"), [navigate]);
  const navigateToMemo = useCallback(() => navigate(`/memo?companyId=${companyId}`), [navigate, companyId]);
  const navigateToCheckout = useCallback(() => navigate(`/checkout-memo?companyId=${companyId}`), [navigate, companyId]);

  // Memo generated state
  if (memoGenerated) {
    return (
      <div className="relative bg-card border border-border/50 rounded-3xl p-8 shadow-lg animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10" />
        
        <div className="flex items-start justify-between mb-6">
          <div>
            <Badge className={`mb-3 ${hasPaid ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
              {hasPaid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {hasPaid ? 'Full Access' : 'Verdict Ready'}
            </Badge>
            <h2 className="text-2xl font-display font-bold mb-2">Your Investment Memo</h2>
            <p className="text-muted-foreground text-sm">
              {hasPaid ? 'Complete access unlocked' : 'Your VC verdict is ready'}
            </p>
          </div>
          {hasPaid ? <CheckCircle2 className="w-10 h-10 text-primary" /> : <FileText className="w-10 h-10 text-amber-500/50" />}
        </div>

        {hasPaid ? (
          <Button size="lg" className="w-full" onClick={navigateToMemo}>
            View Your Memo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={navigateToMemo}>
              <Lock className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={navigateToCheckout}>
              <Sparkles className="w-4 h-4 mr-2" />
              Unlock Full
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-card border border-border/50 rounded-3xl p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-16 w-full mb-4 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="text-center text-muted-foreground mt-4">
          <Scale className="w-5 h-5 animate-pulse mx-auto mb-2" />
          <span className="text-sm">Analyzing like a VC partner...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !verdict) {
    return (
      <div className="relative bg-card border border-destructive/30 rounded-3xl p-6 animate-fade-in">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-muted-foreground text-sm">{error || 'Unable to generate verdict'}</p>
          <Button onClick={generateVerdict} variant="outline" size="sm">Try Again</Button>
        </div>
      </div>
    );
  }

  const config = readinessConfig[verdict.readinessLevel] || readinessConfig.MEDIUM;
  const concerns = verdict.concerns || [];
  const strengths = verdict.strengths || [];
  const redFlagsCount = concerns.length;
  const hiddenRisksEstimate = Math.max(redFlagsCount * 2, 6);

  return (
    <div className="relative animate-fade-in">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-transparent to-primary/10 rounded-3xl blur-xl opacity-40" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold">VC Quick Take</h2>
                <p className="text-xs text-muted-foreground">Preliminary investment scan</p>
              </div>
            </div>
            <Badge className={`${config.bgColor} ${config.color} border ${config.borderColor} text-xs`}>
              {config.emoji} {config.label}
            </Badge>
          </div>

          {/* Main Verdict - Full insight */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30 mb-4">
            <p className="text-foreground/90 text-sm leading-relaxed italic">
              "{verdict.verdict}"
            </p>
          </div>

          {/* Readiness Rationale */}
          <div className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor} mb-4`}>
            <p className="text-sm text-foreground/80">
              <span className={`font-semibold ${config.color}`}>Key gap:</span> {verdict.readinessRationale}
            </p>
          </div>
        </div>

        {/* Red Flags Section */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-sm">{redFlagsCount} Red Flags Identified</span>
            </div>
            <span className="text-[10px] text-muted-foreground bg-destructive/10 px-2 py-0.5 rounded-full">
              +{hiddenRisksEstimate - redFlagsCount} more likely
            </span>
          </div>
          
          <div className="space-y-2">
            {concerns.slice(0, 3).map((concern, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/15">
                <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 leading-relaxed">{concern.text}</p>
                  {concern.caseStudyReference && (
                    <p className="text-[10px] text-muted-foreground mt-1 italic">{concern.caseStudyReference}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insight */}
        {verdict.marketInsight && (
          <div className="px-5 pb-4">
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground mb-1">Market Context</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{verdict.marketInsight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What Needs to Be Fixed */}
        {verdict.vcFrameworkCheck && (
          <div className="px-5 pb-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground mb-1">To Become VC-Ready</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{verdict.vcFrameworkCheck}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strengths Preview */}
        {strengths.length > 0 && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">{strengths.length} Strength{strengths.length > 1 ? 's' : ''} Noted</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.slice(0, 2).map((strength, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {strength.text.length > 50 ? strength.text.slice(0, 50) + '...' : strength.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="p-5 pt-2 border-t border-border/30">
          <Button onClick={navigateToPortal} className="w-full" size="lg">
            Get the Full Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Detailed frameworks, action plans & investor-ready positioning
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
