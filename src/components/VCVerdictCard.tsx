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
  Rocket,
  RefreshCw, Briefcase, Code, GraduationCap, Building,
  Pencil, Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMatchingFundsCount } from "@/hooks/useMatchingFundsCount";

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

  return (
    <div className="relative animate-fade-in space-y-4">
      {/* Investor Match Banner - Detached */}
      {!hasPaid && matchingFunds > 0 && (
        <div className="px-5 py-3 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <Building2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm font-medium text-green-400">
              {matchingFunds} investors in our network look for companies like yours
            </p>
          </div>
        </div>
      )}

      {/* Main Card - Streamlined */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-destructive/30 via-primary/20 to-destructive/30 rounded-2xl blur-lg opacity-50" />
        
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
          {/* Compact Header with Preview Badge */}
          <div className="px-5 py-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] px-2 py-0.5">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Badge>
                <span className="text-xs text-muted-foreground">9-Page VC Analysis</span>
              </div>
              
              {/* Editable Founder Profile - Compact */}
              {isEditingProfile ? (
                <Select value={selectedProfile} onValueChange={handleProfileChange}>
                  <SelectTrigger className="w-[160px] h-7 text-xs">
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
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <ProfileIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{currentProfile.label}</span>
                  <Pencil className="w-2 h-2 text-muted-foreground/50" />
                </button>
              )}
            </div>

            {/* The Verdict Quote */}
            <div className="relative pl-4 border-l-2 border-primary/30">
              <p className="text-sm text-foreground leading-relaxed italic">
                "{verdict.verdict}"
              </p>
              <p className="text-[10px] text-muted-foreground mt-1.5">— Monday IC meeting</p>
            </div>
          </div>

          {/* Narrative Transformation */}
          <div className="px-5 py-3 bg-muted/10 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">What VCs hear</p>
                <p className="text-xs text-muted-foreground line-clamp-2">"{narrativeTransformation.currentNarrative}"</p>
              </div>
              <div className="flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-[9px] uppercase tracking-wider text-primary/70 mb-0.5">What they could hear</p>
                <p className="text-xs text-foreground line-clamp-2">"{narrativeTransformation.transformedNarrative}"</p>
              </div>
            </div>
          </div>

          {/* 3 Value Props - Tight Bullets */}
          <div className="px-5 py-4 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Every question VCs will ask</strong> — with word-for-word responses
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">See how investors score your pitch</strong> — section by section
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">90-day roadmap</strong> — prioritized by what VCs actually care about
              </p>
            </div>
          </div>

          {/* CTA Section - Prominent */}
          <div className="px-5 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            {/* Urgency line for users with matches */}
            {!hasPaid && matchingFunds > 0 && (
              <p className="text-xs text-center text-amber-400 mb-3 font-medium">
                VCs talk. Prepare before you pitch to these {matchingFunds} investors.
              </p>
            )}
            
            <Button 
              onClick={handleFixAction} 
              className="w-full h-14 text-base font-bold shadow-glow hover-neon-pulse" 
              size="lg"
            >
              {hasPaid && generationsAvailable > 0 
                ? "Edit & Regenerate" 
                : matchingFunds > 0 
                  ? "Prepare Before You Pitch" 
                  : "Unlock Full Analysis"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-2.5">
              {hasPaid && generationsAvailable > 0 
                ? `${generationsAvailable} credit${generationsAvailable !== 1 ? 's' : ''} available`
                : "Know what they'll ask before they ask it"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

VCVerdictCard.displayName = "VCVerdictCard";
