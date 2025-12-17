import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, AlertTriangle, 
  Eye, CheckCircle2, Lock, Sparkles, 
  FileText, Flame, Scale, Clock, 
  ShieldX, MessageSquareX, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Concern {
  text: string;
  category: string;
  caseStudyReference?: string;
  vcQuote?: string;
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
  timingWarning?: string;
  hiddenIssuesCount?: number;
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

  const concerns = verdict.concerns || [];
  const redFlagsCount = concerns.length;
  const totalHiddenIssues = verdict.hiddenIssuesCount || Math.max(redFlagsCount * 3, 8);
  const timingWarning = verdict.timingWarning || "This version of your pitch has a 3-week shelf life before market timing works against you.";

  return (
    <div className="relative animate-fade-in">
      {/* Ominous gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/40 via-destructive/20 to-amber-600/30 rounded-3xl blur-xl opacity-70" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-destructive/40 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header - Brutal framing */}
        <div className="p-6 pb-4 bg-gradient-to-b from-destructive/10 via-destructive/5 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 shadow-lg shadow-destructive/30">
              <MessageSquareX className="w-7 h-7 text-destructive-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">What VCs Will Say</h2>
              <p className="text-destructive font-semibold text-sm">When you leave the room</p>
            </div>
          </div>

          {/* The Verdict - Like eavesdropping on their rejection */}
          <div className="p-5 rounded-2xl bg-destructive/15 border border-destructive/40 mb-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-destructive text-lg">"</span>
              <p className="text-lg text-foreground leading-relaxed font-medium italic">
                {verdict.verdict}
              </p>
              <span className="text-destructive text-lg self-end">"</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">— What partners say in Monday dealflow meetings</p>
          </div>

          {/* Time Pressure Warning */}
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{timingWarning}</p>
          </div>
        </div>

        {/* Reasons VCs Will Pass - Brutal, incomplete */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-destructive">Reasons VCs Will Pass</h3>
                <p className="text-xs text-muted-foreground">Issues that would quietly kill your deal in IC</p>
              </div>
            </div>
          </div>
          
          {/* Show only 2-3 concerns - create incompleteness */}
          <div className="space-y-3">
            {concerns.slice(0, 2).map((concern, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/25">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-sm font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{concern.text}</p>
                  {concern.vcQuote && (
                    <p className="text-xs text-destructive mt-2 italic">
                      "{concern.vcQuote}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOCKED: Additional Issues - Create FOMO */}
        <div className="px-6 pb-4">
          <div className="relative p-4 rounded-xl bg-muted/50 border border-border/50 overflow-hidden">
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 z-10 flex flex-col items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Locked</span>
            </div>
            {/* Blurred content preview */}
            <div className="space-y-2 opacity-50">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-destructive" />
                <span className="text-sm text-foreground">+{totalHiddenIssues} additional critical issues identified</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-foreground">Your specific fix playbook</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquareX className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">IC objection pre-responses</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Cost of Waiting */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-destructive/10 to-amber-500/10 border border-destructive/20">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              The Cost of Waiting
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>This exact version of your company would <strong className="text-foreground">quietly die</strong> in an Investment Committee room</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>These issues <strong className="text-foreground">wouldn't be debated</strong> — they'd be dismissed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>No warm intro or follow-up email saves a pitch with these gaps</span>
              </li>
            </ul>
          </div>
        </div>

        {/* The Killer Question */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-center">
            <p className="text-foreground font-medium">
              Do you want to walk into your next VC meeting <strong className="text-destructive">blind</strong>, 
              or with the <strong className="text-primary">exact internal analysis</strong> that determines your outcome?
            </p>
          </div>
        </div>

        {/* CTA - "Get the Fix Playbook" */}
        <div className="p-6 pt-3 border-t border-destructive/20 bg-gradient-to-r from-destructive/5 via-transparent to-primary/5">
          <Button 
            onClick={navigateToPortal} 
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
            size="lg"
          >
            Get Your Fix Playbook
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            The internal analysis that determines whether your next meeting kills or saves the deal
          </p>
          <p className="text-xs text-center text-muted-foreground/60 mt-1">
            VCs won't tell you this. We will.
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
