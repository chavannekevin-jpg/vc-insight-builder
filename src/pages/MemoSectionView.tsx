import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoTeamList } from "@/components/memo/MemoTeamList";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoMomentumCard } from "@/components/memo/MemoMomentumCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";

import { extractMoatScores, extractTeamMembers, extractUnitEconomics } from "@/lib/memoDataExtractor";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Grid, BookOpen, Zap, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent, MemoParagraph, EnhancedSectionTools } from "@/types/memo";

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

// Import sample tools as fallback
import { SAMPLE_SECTION_TOOLS } from "@/data/sampleMemoTools";

export default function MemoSectionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const sectionIndex = parseInt(searchParams.get("section") || "0");
  
  const [loading, setLoading] = useState(true);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [sectionTools, setSectionTools] = useState<Record<string, EnhancedSectionTools>>({});

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [sectionIndex]);

  useEffect(() => {
    const loadMemo = async () => {
      if (!companyId) {
        navigate("/portal");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data: company } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .maybeSingle();

        if (!company) {
          navigate("/portal");
          return;
        }

        setCompanyInfo(company);
        setHasPremium(company.has_premium || false);

        const { data: memo } = await supabase
          .from("memos")
          .select("structured_content")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memo?.structured_content) {
          setMemoContent(memo.structured_content as unknown as MemoStructuredContent);
          
          // Fetch tool data for this company
          const { data: toolData } = await supabase
            .from("memo_tool_data")
            .select("*")
            .eq("company_id", companyId);
          
          if (toolData && toolData.length > 0) {
            const toolsMap: Record<string, EnhancedSectionTools> = {};
            toolData.forEach((tool) => {
              const sectionName = tool.section_name;
              if (!toolsMap[sectionName]) {
                toolsMap[sectionName] = {};
              }
              const toolKey = tool.tool_name as keyof EnhancedSectionTools;
              const aiData = tool.ai_generated_data as Record<string, any> || {};
              const userOverrides = tool.user_overrides as Record<string, any> || {};
              const mergedData = {
                ...aiData,
                ...userOverrides,
                dataSource: tool.data_source || "ai-complete"
              };
              (toolsMap[sectionName] as any)[toolKey] = 
                ["sectionScore", "benchmarks", "caseStudy", "vcInvestmentLogic", "actionPlan90Day", "leadInvestorRequirements"].includes(tool.tool_name)
                  ? mergedData
                  : { aiGenerated: aiData, userOverrides: userOverrides, dataSource: tool.data_source || "ai-complete" };
            });
            setSectionTools(toolsMap);
          }
        } else {
          navigate(`/analysis?companyId=${companyId}&view=full`);
          return;
        }
      } catch (error) {
        console.error("Error loading memo:", error);
        toast({
          title: "Error",
          description: "Failed to load section",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadMemo();
  }, [companyId, navigate]);

  if (loading) {
    return <MemoLoadingScreen />;
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
  
  // Redirect if section doesn't exist (but allow section 0 for VC Quick Take)
  if (!isVCQuickTakePage && !currentSection) {
    navigate(`/analysis/overview?companyId=${companyId}`);
    return null;
  }

  // Locking: Only Section 0 (VC Quick Take) is free
  // Non-premium users trying to access paid sections get redirected to checkout
  const isLocked = !hasPremium && sectionIndex > 0;
  
  if (isLocked) {
    navigate(`/checkout-memo?companyId=${companyId}`, { replace: true });
    return null;
  }
  
  const progressPercent = ((sectionIndex + 1) / totalSections) * 100;

  const goToSection = (index: number) => {
    if (index >= 0 && index < totalSections) {
      navigate(`/analysis/section?companyId=${companyId}&section=${index}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render VC Quick Take page (Section 0)
  if (isVCQuickTakePage) {
    const vcQuickTake = memoContent.vcQuickTake;
    const actionPlan = vcQuickTake ? extractActionPlan(memoContent, vcQuickTake) : null;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Sticky Navigation Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 py-3 max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                    {sectionIndex + 1} of {totalSections}
                  </span>
                </div>
                <div className="flex-1 max-w-xs">
                  <Progress value={progressPercent} className="h-1.5" />
                </div>
              </div>
              
              {/* Full Memo button - redirect to checkout for freemium, show for premium */}
              {hasPremium ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/analysis?companyId=${companyId}&view=full`)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Full Memo</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/checkout-memo?companyId=${companyId}`)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Unlock Full</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Free Preview Context Card */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/20 rounded-full">
                FREE PREVIEW
              </span>
              <span className="text-xs text-muted-foreground">Page 1 of {totalSections}</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              This Is What VCs Think About {companyInfo?.name}
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
          {vcQuickTake && (
            <MemoVCQuickTake quickTake={vcQuickTake} showTeaser={false} />
          )}

          {/* Action Plan */}
          {actionPlan && actionPlan.items.length > 0 && (
            <div className="mt-8">
              <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo?.name} />
            </div>
          )}

          {/* Urgency CTA for non-premium users */}
          {!hasPremium && (
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
                    onClick={() => navigate(`/checkout-memo?companyId=${companyId}`)}
                    className="w-full sm:w-auto"
                  >
                    Unlock Full Memo →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/analysis/overview?companyId=${companyId}`)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
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
                  onClick={() => navigate(`/analysis/overview?companyId=${companyId}`)}
                  className="text-muted-foreground"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  All Sections
                </Button>
                {/* Full Memo button - only for premium users */}
                {hasPremium && (
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/analysis?companyId=${companyId}&view=full`)}
                    className="text-muted-foreground"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Full Memo
                  </Button>
                )}
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
  const isSolutionSection = titleLower.includes('solution');
  const isTeamSection = titleLower.includes('team');
  const isMarketSection = titleLower.includes('market');
  const isCompetitionSection = titleLower.includes('competition');
  const isBusinessSection = titleLower.includes('business');
  const isTractionSection = titleLower.includes('traction');
  const isThesisSection = titleLower.includes('thesis');
  const isVisionSection = titleLower.includes('vision');

  const narrative = currentSection!.narrative || {
    paragraphs: currentSection!.paragraphs,
    highlights: currentSection!.highlights,
    keyPoints: currentSection!.keyPoints
  };

  const sectionText = narrative.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const extractedTeamMembers = isTeamSection ? extractTeamMembers(sectionText) : [];
  const extractedMoatScores = isCompetitionSection ? extractMoatScores(sectionText) : null;
  const extractedUnitEconomics = isBusinessSection ? extractUnitEconomics(sectionText, '') : null;

  const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
  const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

  // Get problem text for differentiation card
  const problemSection = memoContent.sections.find(s => s.title.toLowerCase().includes('problem'));
  const problemText = problemSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                     problemSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';

  // Get section-specific tools data - use sample data as fallback
  const currentSectionTools = sectionTools[currentSection!.title] || SAMPLE_SECTION_TOOLS[currentSection!.title] || {};
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            {/* Section Title & Progress */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                  {sectionIndex + 1} of {totalSections}
                </span>
              </div>
              <div className="flex-1 max-w-xs">
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            </div>
            
            {/* Escape Hatch - View Full Memo */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/analysis?companyId=${companyId}&view=full`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Full Memo</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <MemoSection title={currentSection!.title} index={actualSectionIndex}>
            {/* Section Score Card - Premium Only */}
            {hasPremium && currentSectionTools?.sectionScore && (
              <SectionScoreCard
                sectionName={currentSection!.title}
                score={currentSectionTools.sectionScore}
              />
            )}

            {/* Hero Statement */}
            {heroParagraph && <MemoHeroStatement text={heroParagraph.text} />}

            {/* Company Overview */}
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
                  companyName={companyInfo?.name || 'Company'}
                />
                {hasPremium && currentSectionTools?.evidenceThreshold && (
                  <ProblemEvidenceThreshold data={currentSectionTools.evidenceThreshold} />
                )}
                {hasPremium && currentSectionTools?.founderBlindSpot && (
                  <ProblemFounderBlindSpot data={currentSectionTools.founderBlindSpot} />
                )}
              </div>
            )}

            {/* Solution Section Tools */}
            {isSolutionSection && hasPremium && (
              <div className="space-y-6">
                <MemoDifferentiationCard 
                  solutionText={sectionText}
                  problemText={problemText}
                  companyName={companyInfo?.name || 'Company'}
                />
                {currentSectionTools?.technicalDefensibility && (
                  <SolutionTechnicalDefensibility data={currentSectionTools.technicalDefensibility} />
                )}
                {currentSectionTools?.commoditizationTeardown && (
                  <SolutionCommoditizationTeardown data={currentSectionTools.commoditizationTeardown} />
                )}
                {currentSectionTools?.competitorBuildAnalysis && (
                  <SolutionCompetitorBuildAnalysis data={currentSectionTools.competitorBuildAnalysis} />
                )}
              </div>
            )}

            {/* Market Section Tools */}
            {isMarketSection && hasPremium && (
              <div className="space-y-6">
                <MemoVCScaleCard 
                  avgMonthlyRevenue={100}
                  currentCustomers={0}
                  currentMRR={0}
                  companyName={companyInfo?.name || 'Company'}
                  category={companyInfo?.category || 'Technology'}
                />
                {currentSectionTools?.bottomsUpTAM && (
                  <MarketTAMCalculator data={currentSectionTools.bottomsUpTAM} />
                )}
                {currentSectionTools?.marketReadinessIndex && (
                  <MarketReadinessIndexCard data={currentSectionTools.marketReadinessIndex} />
                )}
                {currentSectionTools?.vcMarketNarrative && (
                  <MarketVCNarrativeCard data={currentSectionTools.vcMarketNarrative} />
                )}
              </div>
            )}

            {/* Competition Section Tools */}
            {isCompetitionSection && hasPremium && (
              <div className="space-y-6">
                {extractedMoatScores && (
                  <MemoMoatScoreCard 
                    moatScores={extractedMoatScores}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}
                {currentSectionTools?.competitorChessboard && (
                  <CompetitionChessboardCard data={currentSectionTools.competitorChessboard} />
                )}
                {currentSectionTools?.moatDurability && (
                  <CompetitionMoatDurabilityCard data={currentSectionTools.moatDurability} />
                )}
              </div>
            )}

            {/* Team Section Tools */}
            {isTeamSection && hasPremium && (
              <div className="space-y-6">
                {extractedTeamMembers.length > 0 && (
                  <>
                    <MemoTeamList 
                      members={extractedTeamMembers.map(tm => ({
                        name: tm.name,
                        role: tm.role,
                        equity: tm.equity,
                        description: ''
                      }))} 
                      showEquity={extractedTeamMembers.some(tm => tm.equity)} 
                    />
                    <MemoTeamGapCard 
                      teamMembers={extractedTeamMembers}
                      stage={companyInfo?.stage || 'Pre-seed'}
                      companyName={companyInfo?.name || 'Company'}
                    />
                  </>
                )}
                {currentSectionTools?.credibilityGapAnalysis && (
                  <TeamCredibilityGapCard data={currentSectionTools.credibilityGapAnalysis} />
                )}
              </div>
            )}

            {/* Business Model Section Tools */}
            {isBusinessSection && hasPremium && (
              <div className="space-y-6">
                {extractedUnitEconomics && (
                  <MemoUnitEconomicsCard 
                    unitEconomics={extractedUnitEconomics}
                    companyName={companyInfo?.name || 'Company'}
                  />
                )}
                {currentSectionTools?.modelStressTest && (
                  <BusinessModelStressTestCard data={currentSectionTools.modelStressTest} />
                )}
              </div>
            )}

            {/* Traction Section Tools */}
            {isTractionSection && hasPremium && (
              <div className="space-y-6">
                <MemoMomentumCard 
                  tractionText={sectionText}
                  companyName={companyInfo?.name || 'Company'}
                  stage={companyInfo?.stage || 'Pre-seed'}
                />
                {currentSectionTools?.tractionDepthTest && (
                  <TractionDepthTestCard data={currentSectionTools.tractionDepthTest} />
                )}
              </div>
            )}

            {/* Vision Section Tools */}
            {isVisionSection && hasPremium && (
              <div className="space-y-6">
                {currentSectionTools?.vcMilestoneMap && (
                  <VisionMilestoneMapCard data={currentSectionTools.vcMilestoneMap} />
                )}
                {currentSectionTools?.scenarioPlanning && (
                  <VisionScenarioPlanningCard data={currentSectionTools.scenarioPlanning} />
                )}
                {currentSectionTools?.exitNarrative && (
                  <VisionExitNarrativeCard data={currentSectionTools.exitNarrative} />
                )}
                <MemoExitPathCard 
                  exitData={{
                    category: companyInfo?.category || 'Technology',
                    revenueMultiple: { low: 5, mid: 10, high: 15 }
                  }}
                  companyName={companyInfo?.name || 'Company'}
                />
              </div>
            )}

            {/* Section Benchmarks - Premium Only */}
            {hasPremium && currentSectionTools?.benchmarks && (
              <SectionBenchmarks
                sectionName={currentSection!.title}
                benchmarks={currentSectionTools.benchmarks}
              />
            )}

            {/* Micro Case Study - Premium Only */}
            {hasPremium && currentSectionTools?.caseStudy && (
              <MicroCaseStudyCard caseStudy={currentSectionTools.caseStudy} />
            )}

            {/* VC Perspective */}
            {currentSection!.vcReflection && (
              hasPremium ? (
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
              ) : (
                <MemoCollapsibleVC vcReflection={currentSection!.vcReflection} defaultOpen={true} />
              )
            )}

            {/* VC Investment Logic Card - Premium Only */}
            {hasPremium && currentSectionTools?.vcInvestmentLogic && (
              <VCInvestmentLogicCard
                sectionName={currentSection!.title}
                logic={currentSectionTools.vcInvestmentLogic}
              />
            )}

            {/* 90-Day Action Plan - Premium Only */}
            {hasPremium && currentSectionTools?.actionPlan90Day && (
              <Section90DayPlan
                sectionName={currentSection!.title}
                plan={currentSectionTools.actionPlan90Day}
              />
            )}

            {/* Lead Investor Requirements - Premium Only */}
            {hasPremium && currentSectionTools?.leadInvestorRequirements && (
              <LeadInvestorCard
                sectionName={currentSection!.title}
                requirements={currentSectionTools.leadInvestorRequirements}
              />
            )}
          </MemoSection>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-4">
            {/* Main Navigation - Next/Previous */}
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
                variant={sectionIndex === totalSections - 1 ? "default" : "default"}
                onClick={() => {
                  if (sectionIndex === totalSections - 1) {
                    navigate(`/memo/complete?companyId=${companyId}`);
                  } else {
                    goToSection(sectionIndex + 1);
                  }
                }}
                className="gap-2"
              >
                <span className="hidden sm:inline">
                  {sectionIndex === totalSections - 1 ? 'Complete Review' : 'Next Section'}
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
                onClick={() => navigate(`/analysis/overview?companyId=${companyId}`)}
                className="text-muted-foreground"
              >
                <Grid className="w-4 h-4 mr-2" />
                All Sections
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/analysis?companyId=${companyId}&view=full`)}
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