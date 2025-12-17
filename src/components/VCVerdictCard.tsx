import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, AlertTriangle, 
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
      {/* Gradient glow - more dramatic */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 via-destructive/15 to-amber-500/20 rounded-3xl blur-xl opacity-60" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-destructive/30 rounded-3xl overflow-hidden shadow-lg">
        {/* Header - More urgent */}
        <div className="p-6 pb-5 bg-gradient-to-b from-destructive/5 to-transparent">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-destructive/60 shadow-lg">
              <Scale className="w-7 h-7 text-destructive-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">VC Quick Take</h2>
              <p className="text-destructive font-medium text-sm">Issues that will cost you the deal</p>
            </div>
          </div>

          {/* Main Verdict Quote - More provocative */}
          <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/30 mb-5">
            <p className="text-lg text-foreground leading-relaxed font-medium">
              "{verdict.verdict}"
            </p>
          </div>

          {/* Readiness Level - Emphasize urgency */}
          <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{config.emoji}</span>
              <div>
                <span className={`font-bold text-lg ${config.color}`}>{config.label}</span>
                <p className="text-sm text-muted-foreground mt-0.5">{verdict.readinessRationale}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Red Flags Section - Primary focus (80% of attention) */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-destructive">{redFlagsCount} Deal-Breakers Identified</h3>
                <p className="text-xs text-muted-foreground">These will sink your raise if not fixed</p>
              </div>
            </div>
            <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full font-medium">
              +{hiddenRisksEstimate - redFlagsCount} hidden
            </span>
          </div>
          
          <div className="space-y-3">
            {concerns.slice(0, 3).map((concern, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-sm font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{concern.text}</p>
                  {concern.caseStudyReference && (
                    <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-destructive/30 pl-2">
                      {concern.caseStudyReference}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {redFlagsCount > 3 && (
            <p className="text-xs text-destructive mt-3 text-center font-medium">
              + {redFlagsCount - 3} more critical issues in full analysis
            </p>
          )}
        </div>

        {/* Market Warning */}
        {verdict.marketInsight && (
          <div className="px-6 pb-5">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Market Reality Check</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{verdict.marketInsight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not All Bad - The 20% hope (positioned as "we can fix this") */}
        <div className="px-6 pb-5">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/25">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Not a Dealbreaker Yet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {strengths.length > 0 
                    ? `${strengths[0]?.text || ''} — but you need to fix the red flags above before VCs will take you seriously.`
                    : `These issues are fixable with the right framework. Our deep-dive analysis shows you exactly how to address each one.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - "Let's fix this" */}
        <div className="p-6 pt-2 border-t border-destructive/20 bg-gradient-to-r from-destructive/5 via-transparent to-destructive/5">
          <Button onClick={navigateToPortal} className="w-full h-12 text-base bg-primary hover:bg-primary/90" size="lg">
            Let's Fix This
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Deep-dive questionnaire → Actionable fixes → VC-ready positioning
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
