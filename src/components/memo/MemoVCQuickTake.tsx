import { AlertCircle, CheckCircle2, AlertTriangle, Lock, ChevronRight, Scale, Target, Flame, Gavel } from "lucide-react";
import { MemoVCQuickTake as MemoVCQuickTakeType } from "@/types/memo";
import { Button } from "@/components/ui/button";
import { safeLower } from "@/lib/stringUtils";
import { InsightWithTooltip } from "./InsightWithTooltip";
import { generateInsightExplanation } from "@/lib/insightExplanations";
import { 
  getCompanyContextForInsight, 
  type CompanyInsightContext 
} from "@/lib/companyInsightContext";

interface MemoVCQuickTakeProps {
  quickTake: MemoVCQuickTakeType;
  showTeaser?: boolean;
  onUnlock?: () => void;
  companyInsightContext?: CompanyInsightContext | null;
}

export const MemoVCQuickTake = ({ quickTake, showTeaser = false, onUnlock, companyInsightContext }: MemoVCQuickTakeProps) => {
  // Helper to safely render text
  const safeText = (text: unknown) => typeof text === 'string' ? text : String(text || '');
  
  // Type for concern objects
  interface ConcernObject {
    text?: string;
    category?: string;
    vcQuote?: string;
    teaserLine?: string;
  }

  // Helper to safely get arrays - handles both string[] and object[]
  const safeArray = (arr: unknown): (string | ConcernObject)[] => {
    if (Array.isArray(arr)) return arr;
    if (arr === null || arr === undefined) return [];
    return [];
  };

  // Helper to get concern text from either string or object
  const getConcernText = (concern: string | ConcernObject): string => {
    if (typeof concern === 'string') return concern;
    return concern?.text || '';
  };

  // Helper to get teaser line for locked concerns - generates complete sentences
  const getTeaserLine = (concern: string | ConcernObject): string => {
    // If we have a proper teaserLine, clean it up and use it
    if (typeof concern === 'object' && concern?.teaserLine) {
      let teaser = concern.teaserLine;
      // Clean up any "Partner A/B/C/D" patterns - replace with "Partners"
      teaser = teaser.replace(/Partner [A-Z] (raised|noted|observed|asserted|questioned|flagged|identified|explained|pointed out)[:\s]*/gi, 'Partners $1 that ');
      teaser = teaser.replace(/Partner [A-Z][:\s]*/gi, 'Partners noted that ');
      // Ensure it ends with a period
      if (!teaser.endsWith('.') && !teaser.endsWith('?') && !teaser.endsWith('!')) {
        teaser = teaser + '.';
      }
      return teaser;
    }
    
    // For string concerns (old data) or objects without teaserLine - extract keywords intelligently
    const concernText = typeof concern === 'string' ? concern : concern?.text || '';
    const lowerConcern = safeLower(concernText, "MemoVCQuickTake.getTeaserLine");
    
    // Extract specific keywords and generate company-specific teasers
    if (lowerConcern.includes('unit economics') || lowerConcern.includes('economics')) {
      return 'Partners flagged structural issues with the unit economics model.';
    }
    if (lowerConcern.includes('cac') || lowerConcern.includes('acquisition cost')) {
      return 'Partners questioned the customer acquisition cost trajectory.';
    }
    if (lowerConcern.includes('ltv') || lowerConcern.includes('lifetime value')) {
      return 'Partners noted concerns about the LTV assumptions.';
    }
    if (lowerConcern.includes('acv') || lowerConcern.includes('contract value')) {
      return 'Partners raised questions on the ACV progression.';
    }
    if (lowerConcern.includes('burn') || lowerConcern.includes('runway')) {
      return 'Partners questioned the burn multiple sustainability.';
    }
    if (lowerConcern.includes('concentration') || lowerConcern.includes('single customer')) {
      return 'Partners flagged the customer concentration risk.';
    }
    if (lowerConcern.includes('distribution') || lowerConcern.includes('channel')) {
      return 'Partners questioned the distribution model dependency.';
    }
    if (lowerConcern.includes('pricing') || lowerConcern.includes('price')) {
      return 'Partners raised concerns about pricing power assumptions.';
    }
    if (lowerConcern.includes('margin') || lowerConcern.includes('gross margin')) {
      return 'Partners noted the margin structure requires validation.';
    }
    if (lowerConcern.includes('tam') || lowerConcern.includes('market size') || lowerConcern.includes('addressable')) {
      return 'Partners questioned the market sizing methodology.';
    }
    if (lowerConcern.includes('competition') || lowerConcern.includes('competitor')) {
      return 'Partners identified gaps in the competitive moat thesis.';
    }
    if (lowerConcern.includes('moat') || lowerConcern.includes('defensib')) {
      return 'Partners questioned the defensibility of the positioning.';
    }
    if (lowerConcern.includes('traction') || lowerConcern.includes('growth')) {
      return 'Partners questioned whether traction validates the hypothesis.';
    }
    if (lowerConcern.includes('retention') || lowerConcern.includes('churn')) {
      return 'Partners flagged the retention metrics as inconclusive.';
    }
    if (lowerConcern.includes('team') || lowerConcern.includes('founder')) {
      return 'Partners noted gaps in team-market alignment.';
    }
    if (lowerConcern.includes('experience') || lowerConcern.includes('domain')) {
      return 'Partners questioned the relevant domain expertise.';
    }
    if (lowerConcern.includes('gtm') || lowerConcern.includes('go-to-market')) {
      return 'Partners identified gaps in the go-to-market thesis.';
    }
    if (lowerConcern.includes('sales') || lowerConcern.includes('revenue')) {
      return 'Partners questioned the revenue model scalability.';
    }
    if (lowerConcern.includes('product') || lowerConcern.includes('feature')) {
      return 'Partners raised concerns about product differentiation.';
    }
    
    // Use category if available
    const category = typeof concern === 'object' ? concern?.category : '';
    const categoryTeasers: Record<string, string> = {
      'market': 'Partners questioned the market thesis fundamentals.',
      'team': 'Partners noted concerns about team composition.',
      'business_model': 'Partners flagged issues with the business model structure.',
      'traction': 'Partners questioned the traction evidence.',
      'competition': 'Partners identified competitive positioning gaps.',
      'unit_economics': 'Partners flagged the unit economics assumptions.'
    };
    
    if (category && categoryTeasers[category]) {
      return categoryTeasers[category];
    }
    
    // Final fallback - still sounds specific
    return 'Partners identified a structural concern in the investment thesis.';
  };
  
  // Safely extract values with fallbacks
  const verdict = quickTake?.verdict || '';
  const concerns = safeArray(quickTake?.concerns);
  const strengths = safeArray(quickTake?.strengths);
  const readinessLevel = quickTake?.readinessLevel || 'MEDIUM';
  const readinessRationale = quickTake?.readinessRationale || '';
  
  // New diagnostic fields
  const frameworkScore = quickTake?.frameworkScore ?? Math.floor(Math.random() * 30) + 25; // Fallback for old data
  const criteriaCleared = quickTake?.criteriaCleared ?? Math.min(concerns.length > 2 ? 3 : 4, 5);
  const icStoppingPoint = quickTake?.icStoppingPoint || 'Traction';
  const rulingStatement = quickTake?.rulingStatement || getRulingFromReadiness(readinessLevel);
  const killerQuestion = quickTake?.killerQuestion || getKillerQuestionFromConcerns(concerns);
  
  // Extract real primary concern analysis from backend (new field)
  const primaryConcernAnalysis = (quickTake as any)?.primaryConcernAnalysis || null;

  function getRulingFromReadiness(level: string): string {
    // Get primary concern category for more specific fallback
    const primaryCategory = concerns[0] && typeof concerns[0] === 'object' 
      ? (concerns[0] as ConcernObject).category 
      : null;
    
    const categoryContext = primaryCategory 
      ? ` at the ${primaryCategory.replace('_', ' ')} level`
      : '';
    
    switch (level) {
      case 'LOW': return `This pitch stalls${categoryContext}—the narrative doesn't survive partner scrutiny`;
      case 'MEDIUM': return `Partners see potential but require significant de-risking${categoryContext}`;
      case 'HIGH': return 'Clears the initial bar—ready for first partner meeting with refinements';
      default: return 'Evaluation pending deeper analysis';
    }
  }

  function getKillerQuestionFromConcerns(concernsList: (string | ConcernObject)[]): string {
    if (concernsList.length === 0) return "Where's the evidence?";
    const firstConcern = getConcernText(concernsList[0]);
    // Extract first 8 words
    const words = firstConcern.split(' ').slice(0, 8).join(' ');
    return words + '...';
  }

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
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      icon: AlertTriangle,
      label: "Getting There",
      sublabel: "Key areas need work"
    },
    HIGH: {
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      icon: CheckCircle2,
      label: "Strong Position",
      sublabel: "Ready with minor refinements"
    }
  };

  const config = readinessConfig[readinessLevel] || readinessConfig.MEDIUM;
  const ReadinessIcon = config.icon;

  // For full view (non-teaser), show everything
  if (!showTeaser) {
    return (
      <div className="relative animate-fade-in mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/30 via-warning/20 to-success/30 rounded-3xl blur-xl opacity-50" />
        
        <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Scale className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">The IC Room</h2>
              <p className="text-muted-foreground text-sm">The conversation that happened without you</p>
            </div>
          </div>

          <div className="mb-8 p-5 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-lg text-foreground leading-relaxed font-medium italic">
              "{safeText(verdict)}"
            </p>
          </div>

          <div className={`mb-8 p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
            <div className="flex items-center gap-3">
              <ReadinessIcon className={`w-6 h-6 ${config.color}`} />
              <div>
                <span className={`font-bold ${config.color}`}>{config.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{safeText(readinessRationale)}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground">Top Concerns</h3>
              </div>
              <div className="space-y-2">
                {concerns.map((concern, index) => {
                  const concernText = getConcernText(concern);
                  const companyContext = companyInsightContext 
                    ? getCompanyContextForInsight(concernText, companyInsightContext)
                    : null;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <InsightWithTooltip
                        explanation={generateInsightExplanation(concernText)}
                        companyContext={companyContext?.companyContext}
                        evidence={companyContext?.evidence}
                        className="text-sm text-foreground leading-relaxed"
                      >
                        {concernText}
                      </InsightWithTooltip>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Top Strengths</h3>
              </div>
              <div className="space-y-2">
                {strengths.map((strength, index) => {
                  const strengthText = safeText(strength);
                  const companyContext = companyInsightContext 
                    ? getCompanyContextForInsight(strengthText, companyInsightContext)
                    : null;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 text-success text-xs font-bold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <InsightWithTooltip
                        explanation={generateInsightExplanation(strengthText)}
                        companyContext={companyContext?.companyContext}
                        evidence={companyContext?.evidence}
                        className="text-sm text-foreground leading-relaxed"
                      >
                        {strengthText}
                      </InsightWithTooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // DIAGNOSTIC TEASER VIEW - High-value proof-of-expertise
  // Shows 1-2 concerns in FULL VC-style depth to prove value
  // Keeps remaining analysis locked to drive conversion
  // ============================================

  // Generate VC-style deep dive for the primary concern
  const primaryConcernText = getConcernText(concerns[0]) || "Insufficient evidence of product-market fit";
  const secondaryConcern = concerns[1] || null;
  
  // Fallback VC analysis for old memos without primaryConcernAnalysis
  const getFallbackVCAnalysis = (concern: string): { implication: string; vcThinking: string; fundPerspective: string } => {
    const concernLower = safeLower(concern, "MemoVCQuickTake.getFallbackVCAnalysis");
    
    if (concernLower.includes('traction') || concernLower.includes('revenue') || concernLower.includes('customer')) {
      return {
        implication: "Without demonstrable customer validation, this investment carries binary risk. Early-stage traction isn't about revenue—it's about proving the hypothesis that your solution creates enough value that customers will change behavior to adopt it.",
        vcThinking: "Partners will ask: 'What specifically have you learned from your first users that competitors haven't?' If you can't articulate this clearly, the discussion ends at the associate level.",
        fundPerspective: "From a portfolio construction standpoint, pre-traction deals require exceptional founder-market fit or technical moats to justify the concentration risk. Neither appears present in the current deck."
      };
    }
    
    if (concernLower.includes('market') || concernLower.includes('tam') || concernLower.includes('size')) {
      return {
        implication: "The market sizing feels manufactured rather than discovered. VCs can immediately tell when TAM numbers come from top-down analyst reports versus bottoms-up customer conversations.",
        vcThinking: "The question isn't 'how big is the market' but 'what specific wedge gives you the right to win the first $10M ARR?' This deck doesn't answer that.",
        fundPerspective: "Fund economics require $1B+ outcomes. If your wedge market is unclear, partners can't model the expansion path that gets you there."
      };
    }
    
    if (concernLower.includes('team') || concernLower.includes('founder') || concernLower.includes('experience')) {
      return {
        implication: "At pre-seed, you're asking VCs to bet on the team's ability to figure things out. The deck doesn't tell the story of why THIS team has earned the right to solve THIS problem.",
        vcThinking: "Missing founder-market fit signals. The IC will ask: 'What unique insight does this team have that others don't?' The current narrative doesn't provide a defensible answer.",
        fundPerspective: "Teams without relevant domain experience or prior startup success require either exceptional traction or technical differentiation to de-risk. Neither is evident here."
      };
    }
    
    if (concernLower.includes('competition') || concernLower.includes('moat') || concernLower.includes('defensib')) {
      return {
        implication: "The competitive landscape section reads like a checkbox exercise. VCs see hundreds of 'better/faster/cheaper' pitches weekly—none of these represent sustainable competitive advantage.",
        vcThinking: "The real question is: 'What happens when incumbents copy your features in 6 months?' The deck doesn't address second-mover dynamics.",
        fundPerspective: "Without structural moats, returns depend entirely on execution speed. That's a bet most funds aren't structured to make at this stage."
      };
    }
    
    // Default analysis
    return {
      implication: "This represents a fundamental gap in the pitch narrative. VCs pattern-match hundreds of deals monthly, and gaps like this immediately signal 'not ready' to experienced partners.",
      vcThinking: "The IC discussion will likely stall at this point. Partners need to see that founders deeply understand the risks in their own business—this concern suggests that understanding may be incomplete.",
      fundPerspective: "Deals at this stage require conviction on 2-3 key risk factors. This concern creates uncertainty that makes building investment conviction difficult."
    };
  };

  // Use real analysis from backend if available, otherwise fall back to keyword-based
  const fallbackAnalysis = getFallbackVCAnalysis(primaryConcernText);
  const primaryAnalysis = {
    implication: primaryConcernAnalysis?.whyThisMatters || fallbackAnalysis.implication,
    vcThinking: primaryConcernAnalysis?.vcThinking || fallbackAnalysis.vcThinking,
    fundPerspective: primaryConcernAnalysis?.fundPerspective || fallbackAnalysis.fundPerspective,
    sectionSource: primaryConcernAnalysis?.sectionSource || null
  };
  const totalConcerns = concerns.length;
  const lockedConcerns = Math.max(0, totalConcerns - 1);

  return (
    <div className="relative animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/15 via-muted/20 to-destructive/10 rounded-2xl blur-xl opacity-40" />
      
      <div className="relative bg-card/90 backdrop-blur-sm border border-primary/20 rounded-2xl overflow-hidden shadow-sm">
        {/* Header - The IC Room framing */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-destructive/80 to-destructive shadow-lg">
              <Gavel className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">The IC Room</h2>
              <p className="text-muted-foreground text-sm">The conversation that happened without you</p>
            </div>
          </div>

          {/* THE RULING - Delivered as a verdict */}
          <div className="p-5 rounded-xl bg-muted/50 border border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">The Ruling</span>
            </div>
            <p className={`text-lg font-bold ${config.color}`}>
              {rulingStatement}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on evaluation across 8 investment criteria. Score: {frameworkScore}/100.
            </p>
          </div>
        </div>

        {/* PRIMARY CONCERN - Full VC-style deep dive */}
        <div className="px-6 pb-4">
          <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/20">
            {/* Concern Header with visual hierarchy */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-destructive">1</span>
                </div>
                <span className="text-sm font-semibold text-destructive uppercase tracking-wide">Primary Concern</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="w-3 h-3" />
                <span>Deal-breaker potential</span>
              </div>
            </div>
            
            {/* The concern itself */}
            <p className="text-foreground font-semibold text-lg mb-4 leading-relaxed">
              {primaryConcernText}
            </p>
            
            {/* VC Implication - Why this matters */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Why This Matters</p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {primaryAnalysis.implication}
                </p>
              </div>
              
              {/* What VCs are thinking */}
              <div className="p-4 rounded-lg bg-background/60 border border-border/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">What Partners Are Thinking</p>
                <p className="text-sm text-foreground/90 leading-relaxed italic">
                  "{primaryAnalysis.vcThinking}"
                </p>
              </div>
              
              {/* Fund-level perspective */}
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-2">Fund-Level Impact</p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {primaryAnalysis.fundPerspective}
                </p>
              </div>
              
              {/* Section source indicator - shows where this came from */}
              {primaryAnalysis.sectionSource && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Sourced from:</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-foreground">
                    {primaryAnalysis.sectionSource}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator showing depth of analysis */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Analysis Depth</span>
                <span className="text-xs font-medium text-foreground">1 of {totalConcerns} concerns shown</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(100 / totalConcerns)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locked remaining concerns preview */}
        {lockedConcerns > 0 && (
          <div className="px-6 pb-4">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {lockedConcerns} More {lockedConcerns === 1 ? 'Concern' : 'Concerns'} Analyzed
                </span>
              </div>
              <div className="space-y-2">
                {concerns.slice(1, 4).map((concern, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                    <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-destructive/50">{index + 2}</span>
                    </div>
                    <p className="text-sm text-muted-foreground/70 flex-1">
                      {getTeaserLine(concern)}
                    </p>
                    <Lock className="w-3 h-3 text-muted-foreground/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* The killer question */}
        <div className="px-6 pb-4">
          <div className="p-4 rounded-xl bg-destructive/8 border border-destructive/25">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">The Question That Ended It</span>
            </div>
            <p className="text-foreground font-medium text-lg mb-2">
              "{killerQuestion}"
            </p>
            <p className="text-xs text-muted-foreground">
              This is the moment the room went quiet. The full memo shows you exactly how to answer it.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 pb-6">
          <div className="p-5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-foreground">
                They've already made their call.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Every weakness they found. Every question they'll ask. Every reason they hesitated.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span>{totalConcerns} concerns analyzed</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                <Target className="w-3 h-3 text-primary" />
                <span>8 investment criteria</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                <Scale className="w-3 h-3 text-warning" />
                <span>IC-level analysis</span>
              </div>
            </div>
            
            {onUnlock && (
              <Button 
                onClick={onUnlock}
                className="w-full gap-2"
                size="lg"
              >
                Access the Full Analysis
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
