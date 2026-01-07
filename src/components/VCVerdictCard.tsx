import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRight, AlertTriangle, 
  Eye, CheckCircle2, Lock, Sparkles, 
  FileText, Scale, 
  MessageSquareX, Target,
  Rocket,
  RefreshCw, Briefcase, Code, GraduationCap, Building,
  ChevronRight, Pencil, Lightbulb,
  BookOpen, BarChart3, MessageSquare, Calendar, Wrench
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
  diagnosticSummary?: string;
  pathForward?: string;
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

// Founder profile options
const founderProfiles = [
  { value: 'serial_founder', label: 'Serial Founder', icon: Rocket, description: 'Previous exits or startups' },
  { value: 'technical_founder', label: 'Technical Founder', icon: Code, description: 'Engineering/research background' },
  { value: 'business_founder', label: 'Business Founder', icon: Briefcase, description: 'MBA/consulting/banking' },
  { value: 'domain_expert', label: 'Domain Expert', icon: Building, description: 'Industry veteran' },
  { value: 'first_time_founder', label: 'First-Time Founder', icon: GraduationCap, description: 'New to startups' },
];

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
  generationsAvailable?: number;
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
  onVerdictGenerated,
  generationsAvailable = 0
}: VCVerdictCardProps) => {
  const cachedVerdict = rawCachedVerdict 
    ? (isLegacyVerdict(rawCachedVerdict) ? convertLegacyVerdict(rawCachedVerdict) : rawCachedVerdict as VCVerdict)
    : null;
  const navigate = useNavigate();
  const [verdict, setVerdict] = useState<VCVerdict | null>(cachedVerdict || null);
  const [loading, setLoading] = useState(!cachedVerdict);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>(cachedVerdict?.founderProfile || 'first_time_founder');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const generateVerdict = useCallback(async (forceProfile?: string) => {
    if (memoGenerated && !forceProfile) {
      setLoading(false);
      return;
    }

    if (forceProfile) {
      setIsRegenerating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-vc-verdict', {
        body: {
          companyName,
          companyDescription,
          stage: companyStage,
          category: companyCategory,
          responses,
          deckParsed,
          forcedFounderProfile: forceProfile
        }
      });

      if (fnError) throw fnError;

      // Apply the forced profile if specified
      if (forceProfile) {
        data.founderProfile = forceProfile;
      }

      setVerdict(data);
      setSelectedProfile(data.founderProfile || forceProfile || 'first_time_founder');
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
      setIsRegenerating(false);
    }
  }, [companyId, companyName, companyDescription, companyStage, companyCategory, responses, deckParsed, memoGenerated, onVerdictGenerated]);

  useEffect(() => {
    if (!cachedVerdict && !memoGenerated) {
      generateVerdict();
    }
  }, [cachedVerdict, memoGenerated, generateVerdict]);

  // Update selected profile when verdict changes
  useEffect(() => {
    if (verdict?.founderProfile) {
      setSelectedProfile(verdict.founderProfile);
    }
  }, [verdict?.founderProfile]);

  const handleProfileChange = useCallback((newProfile: string) => {
    setSelectedProfile(newProfile);
    setIsEditingProfile(false);
    // Regenerate verdict with new profile
    generateVerdict(newProfile);
  }, [generateVerdict]);

  const navigateToPortal = useCallback(() => navigate("/portal"), [navigate]);
  const navigateToMemo = useCallback(() => navigate(`/analysis?companyId=${companyId}&view=full`), [navigate, companyId]);
  const navigateToCheckout = useCallback(() => navigate(`/checkout-analysis?companyId=${companyId}`), [navigate, companyId]);
  const navigateToRegenerate = useCallback(() => navigate(`/analysis/regenerate?companyId=${companyId}`), [navigate, companyId]);
  
  // Premium users with credits go to regenerate page, others go to checkout
  const handleFixAction = useCallback(() => {
    if (hasPaid && generationsAvailable > 0) {
      navigateToRegenerate();
    } else {
      navigateToCheckout();
    }
  }, [hasPaid, generationsAvailable, navigateToRegenerate, navigateToCheckout]);

  // Show simplified card only for PAID users with memo
  // Unpaid users should see the full verdict even if memo is generated
  if (memoGenerated && hasPaid) {
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
            <Button onClick={() => generateVerdict()} variant="outline" size="sm">Try Again</Button>
            <p className="text-xs text-muted-foreground">
              Persistent issues? Contact kev@vc-brain.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  const concerns = verdict.concerns || [];
  const totalHiddenIssues = verdict.hiddenIssuesCount || Math.max(concerns.length * 3, 8);
  const inevitabilityStatement = verdict.inevitabilityStatement || 
    "This pitch fails because the core logic doesn't survive partner scrutiny. It's not about timing—it's about structure.";
  const narrativeTransformation = verdict.narrativeTransformation || {
    currentNarrative: "Another pitch that doesn't clear the bar.",
    transformedNarrative: "A company that understands what VCs actually fund."
  };
  
  const currentProfile = founderProfiles.find(p => p.value === selectedProfile) || founderProfiles[4];
  const ProfileIcon = currentProfile.icon;

  // Content explanation items for "What Each Section Contains"
  const sectionContents = [
    { 
      icon: BookOpen, 
      title: 'Investment Memo Narrative', 
      description: 'Each section includes a VC-style narrative—like what partners write in their internal deal memos',
      color: 'text-primary' 
    },
    { 
      icon: BarChart3, 
      title: 'Scores + Benchmarks', 
      description: `See how your ${companyCategory || 'company'} scores against VC investment criteria and ${companyStage} stage averages`,
      color: 'text-warning' 
    },
    { 
      icon: MessageSquare, 
      title: 'Questions VCs Will Ask', 
      description: 'Specific questions investors will raise—with suggested responses',
      color: 'text-destructive' 
    },
    { 
      icon: Calendar, 
      title: '90-Day Action Plan', 
      description: 'Week-by-week priorities to strengthen each section before your next investor meeting',
      color: 'text-success' 
    },
    { 
      icon: Wrench, 
      title: 'Section-Specific Tools', 
      description: 'TAM calculator, moat durability analysis, team credibility gaps, exit narrative, and more',
      color: 'text-primary' 
    },
  ];

  return (
    <div className="relative animate-fade-in">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-destructive/40 via-primary/30 to-destructive/40 rounded-2xl blur-xl opacity-60" />
      
      {/* Regenerating overlay */}
      {isRegenerating && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Regenerating verdict for {currentProfile.label}...</p>
          </div>
        </div>
      )}
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        {/* Preview indicator */}
        <div className="px-6 py-3 bg-primary/10 border-b border-primary/20 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-semibold">
            Preview of the 9 page VC analysis
          </span>
        </div>

        {/* What We Analyzed - Company Context */}
        <div className="px-6 py-3 bg-muted/20 border-b border-border/30">
          <p className="text-sm text-muted-foreground">
            Analysis for a <strong className="text-foreground">{companyStage}</strong>
            {companyCategory && <> <strong className="text-foreground">{companyCategory}</strong></>} company
            {deckParsed && <span className="text-xs ml-2 text-primary">(+ pitch deck data)</span>}
          </p>
        </div>

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
            
            {/* Editable Founder Profile */}
            {isEditingProfile ? (
              <Select value={selectedProfile} onValueChange={handleProfileChange}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {founderProfiles.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      <div className="flex items-center gap-2">
                        <profile.icon className="w-3 h-3" />
                        <span>{profile.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 hover:bg-muted transition-colors"
              >
                <ProfileIcon className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{currentProfile.label}</span>
                <Pencil className="w-2.5 h-2.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>
            )}
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
            <div className="flex-1 p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">What VCs hear</p>
              <p className="text-xs text-muted-foreground leading-relaxed">"{narrativeTransformation.currentNarrative}"</p>
            </div>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">What they could hear</p>
              <p className="text-xs text-foreground leading-relaxed">"{narrativeTransformation.transformedNarrative}"</p>
            </div>
          </div>
        </div>

        {/* Questions VCs Will Ask */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Questions VCs Will Ask</h3>
          </div>
          
          <div className="space-y-3">
            {concerns.slice(0, 2).map((concern, i) => (
              <div key={i} className="group relative">
                <div className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-warning/30 transition-colors">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warning/20 text-warning text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{concern.text}</p>
                    {concern.vcQuote && (
                      <p className="text-xs text-muted-foreground mt-2 italic">"{concern.vcQuote}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The Good News - Constructive Path Forward */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">The Good News</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {verdict?.pathForward || "Every question above has a proven way to address it—the full analysis shows exactly how."}
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Every concern listed above <strong className="text-foreground">can be addressed</strong> with the right framing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>The full analysis gives you <strong className="text-foreground">word-for-word responses</strong> to these questions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Founders who prepare for these questions <strong className="text-foreground">close rounds faster</strong></span>
            </li>
          </ul>
        </div>

        {/* What Each Section Contains */}
        <div className="p-6 border-b border-border/50">
          <h4 className="text-sm font-semibold mb-4">What Each Section Contains</h4>
          
          <div className="space-y-4">
            {sectionContents.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Founders Use This */}
        <div className="px-6 py-4 border-b border-border/50 bg-muted/10">
          <h4 className="text-sm font-semibold mb-3">How Founders Use This</h4>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold">1.</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Before investor meetings</strong> — Know the questions coming and prepare answers
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold">2.</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Refining your pitch deck</strong> — Section-by-section gaps to address
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold">3.</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Prioritizing your roadmap</strong> — 90-day plan based on VC priorities
              </p>
            </div>
          </div>
        </div>

        {/* The Key Question */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 text-center">
            <p className="text-sm text-foreground">
              Would you rather discover these questions in your next VC meeting — 
              or <strong className="text-primary">walk in with answers already prepared</strong>?
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <Button 
            onClick={handleFixAction} 
            className="w-full h-12 text-sm font-semibold shadow-glow hover-neon-pulse" 
            size="lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            {hasPaid && generationsAvailable > 0 ? "Edit & Regenerate" : "Unlock the Full 9 Page Analysis"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            {hasPaid && generationsAvailable > 0 
              ? `You have ${generationsAvailable} generation credit${generationsAvailable !== 1 ? 's' : ''} available.`
              : "Problem · Solution · Market · Team · Traction · Business Model · Competition · Vision · Exit"}
          </p>
          <p className="text-[10px] text-center text-muted-foreground/60 mt-1">
            This is not advice. This is the room after the meeting.
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
