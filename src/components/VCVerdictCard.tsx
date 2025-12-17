import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, AlertTriangle, TrendingUp, Target,
  Users, DollarSign, Zap, Eye, CheckCircle2, Lock, Sparkles, 
  FileText, Lightbulb, AlertCircle, Flame, Scale, ShieldCheck
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

// New verdict format
interface VCVerdict {
  verdict: string;
  readinessLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  readinessRationale: string;
  concerns: Concern[];
  strengths: Strength[];
  marketInsight: string;
  vcFrameworkCheck: string;
}

// Old verdict format for backward compatibility
interface LegacyVCVerdict {
  verdict_severity: 'HIGH_RISK' | 'MODERATE_RISK' | 'NEEDS_WORK' | 'PROMISING';
  harsh_observations: Array<{ text: string; severity: string; category: string }>;
  key_weakness: string;
  verdict_summary: string;
  blind_spots_count: number;
}

// Convert old format to new format
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

// Check if verdict is in legacy format
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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'traction': return Zap;
    case 'market': return TrendingUp;
    case 'team': return Users;
    case 'product': return Target;
    case 'business_model': return DollarSign;
    default: return AlertTriangle;
  }
};

const readinessConfig = {
  LOW: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    icon: AlertCircle,
    label: "Not Ready",
    sublabel: "Critical gaps identified"
  },
  MEDIUM: {
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: AlertTriangle,
    label: "Getting There",
    sublabel: "Key areas need work"
  },
  HIGH: {
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    icon: CheckCircle2,
    label: "Strong Position",
    sublabel: "Ready with minor refinements"
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
  // Convert cached verdict if it's in legacy format
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

      // Cache verdict in database
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

  // If memo is generated, show different states
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
              {hasPaid ? 'Complete access unlocked — now you know what VCs know' : 'Your VC verdict is ready. Unlock the full truth.'}
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
      <div className="relative bg-card border border-border/50 rounded-3xl p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-20 w-full mb-6 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Scale className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Analyzing through VC eyes...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !verdict) {
    return (
      <div className="relative bg-card border border-destructive/30 rounded-3xl p-8 animate-fade-in">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error || 'Unable to generate verdict'}</p>
          <Button onClick={generateVerdict} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  const config = readinessConfig[verdict.readinessLevel] || readinessConfig.MEDIUM;
  const ReadinessIcon = config.icon;
  const concerns = verdict.concerns || [];
  const strengths = verdict.strengths || [];

  return (
    <div className="relative animate-fade-in">
      {/* Gradient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 via-amber-500/15 to-primary/20 rounded-3xl blur-xl opacity-50" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <Scale className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">VC Quick Take</h2>
              <p className="text-muted-foreground text-sm">30-second investment assessment</p>
            </div>
          </div>

          {/* Main Verdict */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30 mb-5">
            <p className="text-foreground leading-relaxed font-medium italic">
              "{verdict.verdict}"
            </p>
          </div>

          {/* Readiness Level Badge */}
          <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} mb-5`}>
            <div className="flex items-center gap-3">
              <ReadinessIcon className={`w-6 h-6 ${config.color}`} />
              <div className="flex-1">
                <span className={`font-bold ${config.color}`}>{config.label}</span>
                <p className="text-sm text-muted-foreground mt-0.5">{verdict.readinessRationale}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Red Flags & Strengths Counts */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-bold text-destructive">{concerns.length} Red Flags</span>
            </div>
            <p className="text-xs text-muted-foreground">VCs will ask about these</p>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{strengths.length} Strengths</span>
            </div>
            <p className="text-xs text-muted-foreground">Your competitive edge</p>
          </div>
        </div>

        {/* Top Concerns & Strengths */}
        <div className="px-6 pb-4 grid md:grid-cols-2 gap-4">
          {/* Concerns */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Top Concerns</h3>
            </div>
            {concerns.slice(0, 2).map((concern, index) => {
              const Icon = getCategoryIcon(concern.category);
              return (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/15"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90 leading-relaxed">{concern.text}</p>
                    {concern.caseStudyReference && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{concern.caseStudyReference}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Top Strengths</h3>
            </div>
            {strengths.slice(0, 2).map((strength, index) => {
              const Icon = getCategoryIcon(strength.category);
              return (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{strength.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Insight */}
        {verdict.marketInsight && (
          <div className="px-6 pb-4">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm mb-1">Market Insight</p>
                  <p className="text-sm text-muted-foreground">{verdict.marketInsight}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VC Framework Check - What needs to be fixed */}
        {verdict.vcFrameworkCheck && (
          <div className="px-6 pb-4">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm mb-1">What Needs to Be Fixed to Be VC-Ready</p>
                  <p className="text-sm text-muted-foreground">{verdict.vcFrameworkCheck}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Ready to address these {concerns.length} red flags?
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Build your full investment case with detailed guidance.
                </p>
              </div>
              <Button onClick={navigateToPortal} size="sm" className="shrink-0 gap-1">
                Let's Fix This
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
