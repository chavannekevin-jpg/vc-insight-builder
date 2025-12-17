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
  RefreshCw, Briefcase, Code, GraduationCap, Building,
  ChevronRight
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
const founderProfileConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  'serial_founder': { label: 'Serial', icon: <Rocket className="w-3 h-3" /> },
  'technical_founder': { label: 'Technical', icon: <Code className="w-3 h-3" /> },
  'business_founder': { label: 'Business', icon: <Briefcase className="w-3 h-3" /> },
  'domain_expert': { label: 'Domain Expert', icon: <Building className="w-3 h-3" /> },
  'first_time_founder': { label: 'First-Time', icon: <GraduationCap className="w-3 h-3" /> },
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
      <div className="relative group animate-fade-in">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
        <div className="relative bg-card border border-border/50 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge className={`mb-3 ${hasPaid ? 'bg-primary/20 text-primary border-primary/30' : 'bg-warning/20 text-warning border-warning/30'}`}>
                {hasPaid ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                {hasPaid ? 'Full Access' : 'Verdict Ready'}
              </Badge>
              <h2 className="text-2xl font-display font-bold mb-2">Your Investment Memo</h2>
              <p className="text-muted-foreground text-sm">
                {hasPaid ? 'Complete access unlocked' : 'Your VC verdict is ready'}
              </p>
            </div>
            {hasPaid ? <CheckCircle2 className="w-10 h-10 text-primary" /> : <FileText className="w-10 h-10 text-warning/50" />}
          </div>

          {hasPaid ? (
            <Button size="lg" className="w-full shadow-glow" onClick={navigateToMemo}>
              View Your Memo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={navigateToMemo}>
                <Lock className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={navigateToCheckout} className="shadow-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Unlock Full
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative animate-fade-in">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-50 animate-pulse" />
        <div className="relative bg-card border border-border/50 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-24 w-full mb-6 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="flex items-center justify-center gap-3 mt-8 text-muted-foreground">
            <Scale className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Simulating the room after you leave...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !verdict) {
    return (
      <div className="relative animate-fade-in">
        <div className="absolute -inset-0.5 bg-destructive/30 rounded-2xl blur opacity-50" />
        <div className="relative bg-card border border-destructive/30 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">{error || 'Unable to generate verdict'}</p>
            <Button onClick={generateVerdict} variant="outline" size="sm">Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const concerns = verdict.concerns || [];
  const totalHiddenIssues = verdict.hiddenIssuesCount || Math.max(concerns.length * 3, 8);
  const inevitabilityStatement = verdict.inevitabilityStatement || 
    "This pitch fails because the core logic doesn't survive partner scrutiny.";
  const narrativeTransformation = verdict.narrativeTransformation || {
    currentNarrative: "Another pitch that doesn't clear the bar.",
    transformedNarrative: "A company that understands what VCs actually fund."
  };
  const founderProfile = verdict.founderProfile || 'first_time_founder';
  const profileConfig = founderProfileConfig[founderProfile] || founderProfileConfig['first_time_founder'];

  const valueItems = [
    { icon: Flame, text: `+${totalHiddenIssues} hidden deal-breakers`, color: 'text-destructive' },
    { icon: Target, text: 'Section-by-section scores', color: 'text-primary' },
    { icon: Zap, text: '90-day fix playbook', color: 'text-warning' },
    { icon: Shield, text: 'Moat durability analysis', color: 'text-primary' },
    { icon: TrendingDown, text: 'Competitor moves', color: 'text-destructive' },
    { icon: DollarSign, text: 'Bottoms-up TAM', color: 'text-success' },
    { icon: Users, text: 'Team credibility gaps', color: 'text-primary' },
    { icon: FileText, text: 'IC objection responses', color: 'text-muted-foreground' },
  ];

  return (
    <div className="relative animate-fade-in">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-destructive/40 via-primary/30 to-destructive/40 rounded-2xl blur-xl opacity-60" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <MessageSquareX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">The Room After You Leave</h2>
                <p className="text-xs text-muted-foreground">What VCs say when you're not there</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs gap-1.5 border-border/50">
              {profileConfig.icon}
              {profileConfig.label}
            </Badge>
          </div>

          {/* The Verdict Quote */}
          <div className="relative">
            <div className="absolute -left-2 top-0 text-4xl text-primary/30 font-serif">"</div>
            <p className="text-lg text-foreground leading-relaxed pl-6 pr-4 italic">
              {verdict.verdict}
            </p>
            <div className="absolute -right-2 bottom-0 text-4xl text-primary/30 font-serif">"</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pl-6">— Monday IC meeting</p>
        </div>

        {/* Narrative Transformation */}
        <div className="px-6 py-4 bg-muted/20 border-b border-border/50">
          <div className="flex items-stretch gap-4">
            <div className="flex-1 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">Now</p>
              <p className="text-xs text-muted-foreground leading-relaxed">"{narrativeTransformation.currentNarrative}"</p>
            </div>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">After</p>
              <p className="text-xs text-foreground leading-relaxed">"{narrativeTransformation.transformedNarrative}"</p>
            </div>
          </div>
        </div>

        {/* Deal Killers */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <ShieldX className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">Why VCs Will Pass</h3>
          </div>
          
          <div className="space-y-3">
            {concerns.slice(0, 2).map((concern, i) => (
              <div key={i} className="group relative">
                <div className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-destructive/30 transition-colors">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{concern.text}</p>
                    {concern.vcQuote && (
                      <p className="text-xs text-destructive/80 mt-2 italic">"{concern.vcQuote}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Fails - Inevitability */}
        <div className="px-6 py-4 bg-gradient-to-r from-destructive/5 to-transparent border-b border-border/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {inevitabilityStatement}
            </p>
          </div>
        </div>

        {/* Value Props Grid */}
        <div className="p-6 border-b border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">In the full analysis</p>
          <div className="grid grid-cols-4 gap-2">
            {valueItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[10px] text-center text-muted-foreground leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <Button 
            onClick={navigateToPortal} 
            className="w-full h-12 text-sm font-semibold shadow-glow hover-neon-pulse" 
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Let me Fix this
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3">
            This is not advice. This is the room after the meeting.
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
