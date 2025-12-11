import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoTeamList, TeamMember } from "@/components/memo/MemoTeamList";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { ChevronLeft, ChevronRight, Grid, BookOpen, ArrowLeft, Sparkles, Rocket, Zap, AlertTriangle, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { MemoStructuredContent, MemoParagraph, MemoVCQuickTake as MemoVCQuickTakeType } from "@/types/memo";
import type { MoatScores, UnitEconomicsData, ExitPathData, ExtractedTeamMember } from "@/lib/memoDataExtractor";

// Import new VC tools
import {
  SectionScoreCard,
  VCInvestmentLogicCard,
  Section90DayPlan,
  LeadInvestorCard,
  SectionBenchmarks,
  MicroCaseStudyCard,
  ProblemEvidenceThreshold,
  ProblemFounderBlindSpot,
  SolutionTechnicalDefensibility,
  SolutionCommoditizationTeardown,
  SolutionCompetitorBuildAnalysis,
  MarketTAMCalculator,
  MarketReadinessIndexCard,
  MarketVCNarrativeCard,
  CompetitionChessboardCard,
  CompetitionMoatDurabilityCard,
  TeamCredibilityGapCard,
  BusinessModelStressTestCard,
  TractionDepthTestCard,
  VisionMilestoneMapCard,
  VisionScenarioPlanningCard,
  VisionExitNarrativeCard
} from "@/components/memo/tools";

// Import sample tool data
import { SAMPLE_SECTION_TOOLS } from "@/data/sampleMemoTools";

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

// Sample data for CarbonPrint demo
const SAMPLE_TEAM: TeamMember[] = [
  {
    name: "Sarah Chen",
    role: "CEO",
    equity: "45%",
    description: "Former sustainability lead at Google Cloud. MBA from Stanford."
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO",
    equity: "35%",
    description: "Ex-Amazon principal engineer, 12 years building large-scale data infrastructure."
  },
  {
    name: "Jennifer Liu",
    role: "COO",
    equity: "20%",
    description: "Former McKinsey partner specializing in sustainability practice."
  }
];

const SAMPLE_TEAM_EXTRACTED: ExtractedTeamMember[] = [
  { name: "Sarah Chen", role: "CEO" },
  { name: "Marcus Rodriguez", role: "CTO" },
  { name: "Jennifer Liu", role: "COO" }
];

const SAMPLE_MOAT_SCORES: MoatScores = {
  networkEffects: { score: 4, evidence: '"...supply chain data creates marketplace dynamics..."' },
  switchingCosts: { score: 8, evidence: '"...deep ERP integrations and workflow embedding..."' },
  dataAdvantage: { score: 9, evidence: '"...proprietary carbon measurement algorithms..."' },
  brandTrust: { score: 6, evidence: '"...enterprise certifications and Fortune 500 logos..."' },
  costAdvantage: { score: 3, evidence: 'Not emphasized' },
  overallScore: 60
};

const SAMPLE_UNIT_ECONOMICS: UnitEconomicsData = {
  ltv: 45000,
  cac: 12000,
  ltvCacRatio: 3.75,
  paybackMonths: 9,
  grossMargin: 78,
  monthlyChurn: 1.8
};

const SAMPLE_EXIT_DATA: ExitPathData = {
  currentARR: 96600,
  category: "Climate Tech",
  revenueMultiple: { low: 6, mid: 10, high: 15 }
};

const SAMPLE_VC_QUICK_TAKE: MemoVCQuickTakeType = {
  verdict: "CarbonPrint shows strong fundamentals with an experienced team and growing market demand for carbon tracking solutions. The regulatory tailwinds and enterprise traction create compelling investment potential.",
  readinessLevel: "MEDIUM",
  readinessRationale: "Strong team and market timing, but needs more traction data and validated unit economics before Series A readiness.",
  concerns: [
    "Unit economics need validation at scale",
    "Competition from established sustainability platforms",
    "Customer concentration risk with limited enterprise clients"
  ],
  strengths: [
    "Strong founding team with relevant industry experience",
    "Clear regulatory tailwinds driving demand",
    "Early enterprise traction with Fortune 500 logos"
  ]
};

export default function SampleMemoSectionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionIndex = parseInt(searchParams.get("section") || "0");
  
  const [loading, setLoading] = useState(true);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [sectionIndex]);

  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const { data: existingMemo, error: fetchError } = await supabase
          .from('memos')
          .select('structured_content, company:companies(*)')
          .eq('company_id', DEMO_COMPANY_ID)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingMemo && existingMemo.structured_content) {
          setMemoContent(existingMemo.structured_content as unknown as MemoStructuredContent);
          setCompanyInfo(existingMemo.company);
        } else {
          toast.error('Sample memo not yet generated.');
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error loading sample memo:', error);
        toast.error('Failed to load sample memo');
      } finally {
        setLoading(false);
      }
    };

    fetchMemo();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-lg font-medium text-primary">Loading sample memo...</p>
        </div>
      </div>
    );
  }

  if (!memoContent || !companyInfo) {
    return null;
  }

  // Total sections includes VC Quick Take (section 0) + all memo sections
  const totalSections = memoContent.sections.length + 1;
  
  // Section 0 = VC Quick Take, Section 1+ = actual memo sections
  const isVCQuickTakePage = sectionIndex === 0;
  const actualSectionIndex = sectionIndex - 1;
  const currentSection = isVCQuickTakePage ? null : memoContent.sections[actualSectionIndex];
  
  if (!isVCQuickTakePage && !currentSection) {
    navigate('/sample-memo?view=full');
    return null;
  }

  const progressPercent = ((sectionIndex + 1) / totalSections) * 100;

  const goToSection = (index: number) => {
    if (index >= 0 && index < totalSections) {
      navigate(`/sample-memo/section?section=${index}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render VC Quick Take page (Section 0)
  if (isVCQuickTakePage) {
    const vcQuickTake = memoContent.vcQuickTake || SAMPLE_VC_QUICK_TAKE;
    const actionPlan = extractActionPlan(memoContent, vcQuickTake);

    return (
      <div className="min-h-screen bg-background">
        {/* Sticky Navigation Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 py-3 max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                    {sectionIndex + 1} of {totalSections}
                  </span>
                </div>
                <div className="flex-1 max-w-xs">
                  <Progress value={progressPercent} className="h-1.5" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const shareUrl = 'https://uglybaby.co/sample-memo/section?section=0';
                    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                    window.open(linkedInUrl, '_blank', 'width=600,height=600');
                  }}
                  className="text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10"
                  title="Share on LinkedIn"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Share</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/sample-memo?view=full')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Full Memo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Sample Memo Badge */}
          <div className="mb-6 flex items-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Sample Memo: {companyInfo?.name || 'CarbonPrint'}</span>
          </div>

          {/* Free Preview Context Card */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/20 rounded-full">
                FREE PREVIEW
              </span>
              <span className="text-xs text-muted-foreground">Page 1 of {totalSections}</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              This Is What VCs Think About {companyInfo?.name || 'CarbonPrint'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The VC Quick Take summarizes the investment verdict, top concerns, and critical action items. 
              The full memo contains {totalSections - 1} more deep-dive sections with VC questions, competitive analysis, 
              and specific fixes for each weakness.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>📄 {totalSections} detailed sections</span>
              <span>❓ VC questions with prep guides</span>
              <span>🎯 Actionable fixes for every issue</span>
            </div>
          </div>

          {/* VC Quick Take Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  VC Quick Take
                </h1>
                <p className="text-sm text-muted-foreground">
                  Investment verdict, key concerns, and action plan
                </p>
              </div>
            </div>
          </div>

          {/* VC Quick Take Content */}
          <MemoVCQuickTake quickTake={vcQuickTake} showTeaser={false} />

          {/* Action Plan */}
          {actionPlan && actionPlan.items.length > 0 && (
            <div className="mt-8">
              <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo?.name || 'CarbonPrint'} />
            </div>
          )}

          {/* Urgency CTA */}
          <div className="mt-8 p-6 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground mb-1">
                  73% of startups get rejected based on problems like these
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  The remaining {totalSections - 1} sections show exactly how VCs analyze each area and what you can do to fix every concern before your pitch.
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto"
                >
                  Get Your Own Memo →
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                
                {/* Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSections }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSection(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === sectionIndex 
                          ? 'bg-primary w-6' 
                          : idx < sectionIndex 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="default"
                  onClick={() => goToSection(1)}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Next: Problem</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/sample-memo?view=full')}
                  className="text-muted-foreground"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Full Memo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular section rendering (Section 1+)
  // Section type detection
  const titleLower = currentSection!.title.toLowerCase();
  const isProblemSection = titleLower.includes('problem');
  const isTeamSection = titleLower.includes('team');
  const isMarketSection = titleLower.includes('market');
  const isCompetitionSection = titleLower.includes('competition');
  const isBusinessSection = titleLower.includes('business');
  const isThesisSection = titleLower.includes('thesis');
  const isVisionSection = titleLower.includes('vision');
  const isTractionSection = titleLower.includes('traction');
  const isSolutionSection = titleLower.includes('solution');

  const narrative = currentSection!.narrative || {
    paragraphs: currentSection!.paragraphs,
    highlights: currentSection!.highlights,
    keyPoints: currentSection!.keyPoints
  };

  const sectionText = narrative.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
  const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

  // Exit Path only on Vision section (not Thesis)
  const showExitPath = isVisionSection;

  // Get section-specific tools data
  const sectionTools = SAMPLE_SECTION_TOOLS[currentSection!.title];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            {/* Back & Progress */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                  {sectionIndex + 1} of {totalSections}
                </span>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            </div>
            
            {/* View Full Memo */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/sample-memo?view=full')}
              className="text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Full Memo</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Sample Memo Badge */}
        {sectionIndex === 1 && (
          <div className="mb-6 flex items-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Sample Memo: {companyInfo?.name || 'CarbonPrint'}</span>
          </div>
        )}

        <MemoSection title={currentSection!.title} index={actualSectionIndex}>
          {/* Section Score Card */}
          {sectionTools?.sectionScore && (
            <SectionScoreCard
              sectionName={currentSection!.title}
              score={sectionTools.sectionScore}
            />
          )}

          {/* Hero Statement */}
          {heroParagraph && <MemoHeroStatement text={heroParagraph.text} />}

          {/* Content Overview */}
          <MemoCollapsibleOverview
            paragraphs={otherParagraphs}
            highlights={narrative.highlights}
            keyPoints={narrative.keyPoints}
            defaultOpen={true}
          />

          {/* Problem Section Tools */}
          {isProblemSection && (
            <div className="space-y-6">
              <MemoPainValidatorCard 
                problemText={sectionText}
                companyName={companyInfo?.name || 'CarbonPrint'}
              />
              {sectionTools?.evidenceThreshold && (
                <ProblemEvidenceThreshold data={sectionTools.evidenceThreshold} />
              )}
              {sectionTools?.founderBlindSpot && (
                <ProblemFounderBlindSpot data={sectionTools.founderBlindSpot} />
              )}
            </div>
          )}

          {/* Solution Section Tools */}
          {isSolutionSection && sectionTools && (
            <div className="space-y-6">
              {sectionTools.technicalDefensibility && (
                <SolutionTechnicalDefensibility data={sectionTools.technicalDefensibility} />
              )}
              {sectionTools.commoditizationTeardown && (
                <SolutionCommoditizationTeardown data={sectionTools.commoditizationTeardown} />
              )}
              {sectionTools.competitorBuildAnalysis && (
                <SolutionCompetitorBuildAnalysis data={sectionTools.competitorBuildAnalysis} />
              )}
            </div>
          )}

          {/* Team Section */}
          {isTeamSection && (
            <div className="space-y-6">
              <MemoTeamList members={SAMPLE_TEAM} showEquity={true} />
              <MemoTeamGapCard 
                teamMembers={SAMPLE_TEAM_EXTRACTED}
                stage={companyInfo?.stage || 'Pre-Seed'}
                companyName={companyInfo?.name || 'CarbonPrint'}
              />
              {sectionTools?.credibilityGapAnalysis && (
                <TeamCredibilityGapCard data={sectionTools.credibilityGapAnalysis} />
              )}
            </div>
          )}

          {/* Market Section Tools */}
          {isMarketSection && (
            <div className="space-y-6">
              <MemoVCScaleCard 
                avgMonthlyRevenue={350}
                currentCustomers={23}
                currentMRR={8050}
                companyName={companyInfo?.name || 'CarbonPrint'}
                category={companyInfo?.category || 'Climate Tech'}
              />
              {sectionTools?.bottomsUpTAM && (
                <MarketTAMCalculator data={sectionTools.bottomsUpTAM} />
              )}
              {sectionTools?.marketReadinessIndex && (
                <MarketReadinessIndexCard data={sectionTools.marketReadinessIndex} />
              )}
              {sectionTools?.vcMarketNarrative && (
                <MarketVCNarrativeCard data={sectionTools.vcMarketNarrative} />
              )}
            </div>
          )}

          {/* Competition Section Tools */}
          {isCompetitionSection && (
            <div className="space-y-6">
              <MemoMoatScoreCard 
                moatScores={SAMPLE_MOAT_SCORES}
                companyName={companyInfo?.name || 'CarbonPrint'}
              />
              {sectionTools?.competitorChessboard && (
                <CompetitionChessboardCard data={sectionTools.competitorChessboard} />
              )}
              {sectionTools?.moatDurability && (
                <CompetitionMoatDurabilityCard data={sectionTools.moatDurability} />
              )}
            </div>
          )}

          {/* Business Model Section Tools */}
          {isBusinessSection && (
            <div className="space-y-6">
              <MemoUnitEconomicsCard 
                unitEconomics={SAMPLE_UNIT_ECONOMICS}
                companyName={companyInfo?.name || 'CarbonPrint'}
              />
              {sectionTools?.modelStressTest && (
                <BusinessModelStressTestCard data={sectionTools.modelStressTest} />
              )}
            </div>
          )}

          {/* Traction Section Tools */}
          {isTractionSection && sectionTools && (
            <div className="space-y-6">
              {sectionTools.tractionDepthTest && (
                <TractionDepthTestCard data={sectionTools.tractionDepthTest} />
              )}
            </div>
          )}

          {/* Vision Section Tools */}
          {isVisionSection && (
            <div className="space-y-6">
              {sectionTools?.vcMilestoneMap && (
                <VisionMilestoneMapCard data={sectionTools.vcMilestoneMap} />
              )}
              {sectionTools?.scenarioPlanning && (
                <VisionScenarioPlanningCard data={sectionTools.scenarioPlanning} />
              )}
              {sectionTools?.exitNarrative && (
                <VisionExitNarrativeCard data={sectionTools.exitNarrative} />
              )}
            </div>
          )}

          {/* Exit Path Card */}
          {showExitPath && (
            <MemoExitPathCard 
              exitData={SAMPLE_EXIT_DATA}
              companyName={companyInfo?.name || 'CarbonPrint'}
            />
          )}

          {/* Section Benchmarks */}
          {sectionTools?.benchmarks && (
            <SectionBenchmarks
              sectionName={currentSection!.title}
              benchmarks={sectionTools.benchmarks}
            />
          )}

          {/* Micro Case Study */}
          {sectionTools?.caseStudy && (
            <MicroCaseStudyCard caseStudy={sectionTools.caseStudy} />
          )}

          {/* VC Perspective */}
          {currentSection!.vcReflection && (
            <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
              
              <MemoVCReflection text={currentSection!.vcReflection.analysis} />
              
              {currentSection!.vcReflection.questions && currentSection!.vcReflection.questions.length > 0 && (
                <MemoVCQuestions questions={currentSection!.vcReflection.questions} defaultAllOpen={true} />
              )}
              
              {currentSection!.vcReflection.benchmarking && (
                <MemoBenchmarking text={currentSection!.vcReflection.benchmarking} />
              )}
              
              <MemoAIConclusion text={currentSection!.vcReflection.conclusion} />
            </div>
          )}

          {/* VC Investment Logic Card */}
          {sectionTools?.vcInvestmentLogic && (
            <VCInvestmentLogicCard
              sectionName={currentSection!.title}
              logic={sectionTools.vcInvestmentLogic}
            />
          )}

          {/* 90-Day Action Plan */}
          {sectionTools?.actionPlan90Day && (
            <Section90DayPlan
              sectionName={currentSection!.title}
              plan={sectionTools.actionPlan90Day}
            />
          )}

          {/* Lead Investor Requirements */}
          {sectionTools?.leadInvestorRequirements && (
            <LeadInvestorCard
              sectionName={currentSection!.title}
              requirements={sectionTools.leadInvestorRequirements}
            />
          )}
        </MemoSection>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-4">
            {/* Main Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline"
                onClick={() => goToSection(sectionIndex - 1)}
                disabled={sectionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSections }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSection(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === sectionIndex 
                        ? 'bg-primary w-6' 
                        : idx < sectionIndex 
                          ? 'bg-primary/50' 
                          : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="default"
                onClick={() => {
                  if (sectionIndex === totalSections - 1) {
                    navigate('/sample-memo/complete');
                  } else {
                    goToSection(sectionIndex + 1);
                  }
                }}
                className="gap-2"
              >
                <span className="hidden sm:inline">
                  {sectionIndex === totalSections - 1 ? 'Complete' : 'Next Section'}
                </span>
                <span className="sm:hidden">
                  {sectionIndex === totalSections - 1 ? 'Done' : 'Next'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Secondary Actions */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sample-memo?view=full')}
                className="text-muted-foreground"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                View Full Memo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}