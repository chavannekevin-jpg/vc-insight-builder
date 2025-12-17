import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, AlertTriangle, 
  Eye, CheckCircle2, Lock, Sparkles, 
  FileText, Flame, Scale, 
  ShieldX, MessageSquareX, Zap, Target,
  Shield, TrendingDown, DollarSign, Users, BarChart3, Rocket,
  RefreshCw, Briefcase, Code, GraduationCap, Building
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

interface NarrativeTransformation {
  currentNarrative: string;
  transformedNarrative: string;
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
  inevitabilityStatement?: string;
  narrativeTransformation?: NarrativeTransformation;
  founderProfile?: string;
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

// Founder profile display config
const founderProfileConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'serial_founder': { label: 'Serial Founder', icon: <Rocket className="w-3 h-3" />, color: 'text-primary' },
  'technical_founder': { label: 'Technical Founder', icon: <Code className="w-3 h-3" />, color: 'text-blue-500' },
  'business_founder': { label: 'Business Founder', icon: <Briefcase className="w-3 h-3" />, color: 'text-green-500' },
  'domain_expert': { label: 'Domain Expert', icon: <Building className="w-3 h-3" />, color: 'text-amber-500' },
  'first_time_founder': { label: 'First-Time Founder', icon: <GraduationCap className="w-3 h-3" />, color: 'text-muted-foreground' },
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
          <span className="text-sm">Simulating the room after you leave...</span>
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
  const inevitabilityStatement = verdict.inevitabilityStatement || 
    "This pitch fails because the core logic doesn't survive partner scrutiny. It's not about timing—it's about structure.";
  const narrativeTransformation = verdict.narrativeTransformation || {
    currentNarrative: "Another pitch that doesn't clear the bar.",
    transformedNarrative: "A company that understands what VCs actually fund."
  };
  const founderProfile = verdict.founderProfile || 'first_time_founder';
  const profileConfig = founderProfileConfig[founderProfile] || founderProfileConfig['first_time_founder'];

  return (
    <div className="relative animate-fade-in">
      {/* Ominous gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/40 via-destructive/20 to-amber-600/30 rounded-3xl blur-xl opacity-70" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-destructive/40 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header - Room Simulation Framing */}
        <div className="p-6 pb-4 bg-gradient-to-b from-destructive/10 via-destructive/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-destructive/70 shadow-lg shadow-destructive/30">
                <MessageSquareX className="w-7 h-7 text-destructive-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">What VCs Will Say</h2>
                <p className="text-destructive font-semibold text-sm">When you leave the room</p>
              </div>
            </div>
            {/* Founder Profile Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 ${profileConfig.color}`}>
              {profileConfig.icon}
              <span className="text-xs font-medium">{profileConfig.label}</span>
            </div>
          </div>

          {/* The Verdict - Eavesdropping on rejection */}
          <div className="p-5 rounded-2xl bg-destructive/15 border border-destructive/40 mb-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-destructive text-lg">"</span>
              <p className="text-lg text-foreground leading-relaxed font-medium italic">
                {verdict.verdict}
              </p>
              <span className="text-destructive text-lg self-end">"</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">— This is not advice. This is what partners say when you're not in the room.</p>
          </div>

          {/* Narrative Transformation Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-destructive font-semibold uppercase tracking-wide mb-1">Today's Narrative</p>
                <p className="text-sm text-muted-foreground italic">"{narrativeTransformation.currentNarrative}"</p>
              </div>
              <div className="border-l border-border/50 pl-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">After You Fix This</p>
                <p className="text-sm text-foreground italic">"{narrativeTransformation.transformedNarrative}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reasons VCs Will Pass - Structural */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-destructive">Reasons VCs Will Pass</h3>
                <p className="text-xs text-muted-foreground">Structural issues that end the conversation</p>
              </div>
            </div>
          </div>
          
          {/* Show only 2 concerns */}
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

        {/* What you'll uncover - Transformation framing */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">What you'll uncover in the full analysis:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                <span className="text-xs text-foreground">+{totalHiddenIssues} hidden deal-breakers</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">Section-by-section scores</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-xs text-foreground">90-day fix playbook</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">Moat durability analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                <span className="text-xs text-foreground">Competitor 12-month moves</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs text-foreground">Bottoms-up TAM model</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">Team credibility gaps</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-foreground">IC objection responses</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-xs text-foreground">Traction depth test</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-foreground">Exit narrative & acquirers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Narrative Fails - Inevitability framing */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-destructive/10 to-amber-500/10 border border-destructive/20">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Why This Narrative Fails
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {inevitabilityStatement}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>This version of your pitch <strong className="text-foreground">structurally fails</strong> in IC—not because of timing, but because the logic doesn't close</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>These issues <strong className="text-foreground">wouldn't be debated</strong>—they'd be dismissed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Every partner sees the same structural gaps. No warm intro changes that.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* The Transformation Question */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 text-center">
            <p className="text-foreground font-medium">
              Do you want to walk into your next VC meeting with a narrative that <strong className="text-destructive">fails under scrutiny</strong>, 
              or one that <strong className="text-primary">changes what they say about you</strong>?
            </p>
          </div>
        </div>

        {/* CTA - "Let me Fix this" */}
        <div className="p-6 pt-3 border-t border-destructive/20 bg-gradient-to-r from-destructive/5 via-transparent to-primary/5">
          <Button 
            onClick={navigateToPortal} 
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Let me Fix this
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Change the internal conversation. Transform how VCs talk about you.
          </p>
          <p className="text-xs text-center text-muted-foreground/60 mt-1">
            This is not advice. This is the room after the meeting.
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
