import { memo, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  ChevronRight, ChevronDown, Pencil, Lightbulb, FileSearch,
  BookOpen, BarChart3, MessageSquare, Calendar, Wrench, Building2,
  Info, Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMatchingFundsCount } from "@/hooks/useMatchingFundsCount";
import { WHATS_INCLUDED_DATA } from "@/data/whatsIncludedData";
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
  preparationSummary?: string;
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

  // Get matching funds count for the preview
  const { matchingFunds } = useMatchingFundsCount(
    companyId,
    { stage: companyStage, category: companyCategory || undefined }
  );

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
              <Button onClick={() => {
                // hasPaid should already be true if premium, but check just in case
                if (hasPaid) {
                  navigateToMemo();
                } else {
                  navigateToCheckout();
                }
              }} className="shadow-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                {hasPaid ? "View Full" : "Unlock Full"}
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
      title: 'Complete VC Question Bank', 
      description: 'Every question investors will raise across all 9 sections—with suggested responses',
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
      
      {/* Investor Match Banner - Detached from card */}
      {!hasPaid && matchingFunds > 0 && (
        <div className="mb-4 px-6 py-4 bg-gradient-to-r from-success/10 via-success/5 to-transparent border border-success/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0 border border-success/30">
              <Building2 className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm font-semibold text-success">
              We identified {matchingFunds} investors in our network actively looking for companies like yours
            </p>
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

        {/* The Transformation - Conceptual Value */}
        <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <p className="text-sm text-foreground leading-relaxed mb-3">
            <strong className="text-primary">Stop guessing what VCs think.</strong> See your company the way investors see it — 
            then fix the gaps before they become rejections.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-start gap-1.5">
              <span className="text-primary">→</span>
              <span>Your story rewritten in VC language — <strong className="text-foreground">learn how investors frame deals</strong></span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-primary">→</span>
              <span>The Monday IC meeting simulation — <strong className="text-foreground">what partners say when you leave</strong></span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-primary">→</span>
              <span>Coherence check — <strong className="text-foreground">where your story doesn't add up</strong></span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-primary">→</span>
              <span>Stage reality check — <strong className="text-foreground">are you actually where you think you are?</strong></span>
            </div>
          </div>
        </div>

        {/* What's Included - Collapsible, collapsed by default */}
        <Collapsible>
          <div className="px-6 py-4 border-b border-border/50">
            <CollapsibleTrigger className="w-full flex items-center justify-between group">
              <h4 className="text-sm font-semibold">What's Included</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">38+ features</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <TooltipProvider delayDuration={100}>
                <div className="space-y-4">
                  {WHATS_INCLUDED_DATA.map((category) => (
                    <div key={category.key}>
                      <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-2">{category.title}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {category.items.map((item, i) => (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help group">
                                <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground text-[11px] group-hover:text-foreground transition-colors">{item.name}</span>
                                <Info className="w-2.5 h-2.5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[280px] text-xs">
                              <p>{item.tip}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Investor Insight CTA - Only for unpaid users with matches */}
        {!hasPaid && matchingFunds > 0 && (
          <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-warning/5 via-warning/3 to-transparent">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0 border border-warning/20">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  We identified {matchingFunds} investors who match your profile
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  VCs talk. A bad first impression travels fast. Build your analysis first so you walk in prepared — 
                  <strong className="text-foreground"> don't burn bridges you haven't even crossed yet.</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The Key Question - Only show if no matches or paid */}
        {(hasPaid || matchingFunds === 0) && (
          <div className="px-6 py-4 border-b border-border/50">
            <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 text-center">
              <p className="text-sm text-foreground">
                Would you rather discover these questions in your next VC meeting — 
                or <strong className="text-primary">walk in with answers already prepared</strong>?
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="p-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div className="space-y-3">
            <Button 
              onClick={handleFixAction} 
              className="w-full h-12 text-sm font-semibold shadow-glow hover-neon-pulse" 
              size="lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              {hasPaid && generationsAvailable > 0 
                ? "Edit & Regenerate" 
                : matchingFunds > 0 
                  ? "Prepare Before You Pitch" 
                  : "Unlock the Full 9 Page Analysis"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            {/* Demo Access Button - Only for unpaid users */}
            {!hasPaid && (
              <Button 
                onClick={() => navigate('/demo')} 
                variant="outline"
                className="w-full h-10 text-sm border-border/50 hover:bg-muted/50 backdrop-blur-sm" 
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                See Full Demo First
              </Button>
            )}
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            {hasPaid && generationsAvailable > 0 
              ? `You have ${generationsAvailable} generation credit${generationsAvailable !== 1 ? 's' : ''} available.`
              : matchingFunds > 0
                ? `Know exactly what ${matchingFunds} investors will ask — before they ask it`
                : "Problem · Solution · Market · Team · Traction · Business Model · Competition · Vision · Exit"}
          </p>
          <p className="text-[10px] text-center text-muted-foreground/60 mt-1">
            {matchingFunds > 0 && !hasPaid 
              ? "VCs talk. Don't burn bridges before you cross them."
              : "This is not advice. This is the room after the meeting."}
          </p>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
