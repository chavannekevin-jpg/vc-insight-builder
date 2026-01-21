import { useEffect } from "react";
import { MemoScoreRadar } from "@/components/memo/MemoScoreRadar";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { VCFramingExplainerCard } from "@/components/memo/VCFramingExplainerCard";
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
import { StageMismatchWarning } from "@/components/memo/StageMismatchWarning";

import { extractMoatScores, extractTeamMembers, extractUnitEconomics, extractPricingMetrics } from "@/lib/memoDataExtractor";
import { MemoAnchoredAssumptions } from "@/components/memo/MemoAnchoredAssumptions";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ShareScoreButton from "@/components/founder/ShareScoreButton";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Grid, BookOpen, Zap, AlertTriangle, Eye, Lock, FileText, Target, Users, TrendingUp, Swords, DollarSign, Rocket, Lightbulb, Trophy, BarChart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoParagraph } from "@/types/memo";
import { useMemoContent, findSectionTools } from "@/hooks/useMemoContent";

import { safeTitle } from "@/lib/stringUtils";

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

import { isValidCompanyId } from "@/lib/companyIdUtils";

export default function MemoSectionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get("companyId");
  const sectionIndex = parseInt(searchParams.get("section") || "0");

  // Use cached memo content hook for instant loading
  const { 
    data: memoData, 
    isLoading, 
    error 
  } = useMemoContent(isValidCompanyId(companyIdFromUrl) ? companyIdFromUrl : null);

  // Extract cached data
  const memoContent = memoData?.memoContent || null;
  const companyInfo = memoData?.companyInfo || null;
  const hasPremium = memoData?.hasPremium || false;
  const sectionTools = memoData?.sectionTools || {};
  const memoResponses = memoData?.memoResponses || {};
  const anchoredAssumptions = memoData?.anchoredAssumptions || null;
  const holisticVerdicts = memoData?.holisticVerdicts || {};
  const companyInsightContext = memoData?.companyInsightContext || null;
  const holisticStage = memoData?.holisticStage || null;

  // Use companyInfo.id as source of truth for navigation (more reliable than URL params)
  const companyId = companyInfo?.id || companyIdFromUrl;

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [sectionIndex]);

  // Handle invalid companyId - try to recover
  useEffect(() => {
    const recoverCompanyId = async () => {
      if (!isValidCompanyId(companyIdFromUrl)) {
        console.error('[MemoSectionView] Missing or invalid companyId:', companyIdFromUrl);
        
        // Try to recover by fetching user's latest company
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: latestCompany } = await supabase
            .from("companies")
            .select("id")
            .eq("founder_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (latestCompany?.id) {
            console.log('[MemoSectionView] Recovered companyId:', latestCompany.id);
            navigate(`/analysis/section?companyId=${latestCompany.id}&section=${sectionIndex}`, { replace: true });
            return;
          }
        }
        
        navigate("/portal");
      }
    };
    
    if (!isValidCompanyId(companyIdFromUrl)) {
      recoverCompanyId();
    }
  }, [companyIdFromUrl, navigate, sectionIndex]);

  // Handle authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`, { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle error state
  useEffect(() => {
    if (error) {
      console.error("[MemoSectionView] Error loading memo:", error);
      toast({
        title: "Error",
        description: "Failed to load section",
        variant: "destructive"
      });
    }
  }, [error]);

  // Handle no memo content - redirect to generation
  useEffect(() => {
    if (!isLoading && memoData && !memoData.memoContent && companyIdFromUrl) {
      navigate(`/analysis?companyId=${companyIdFromUrl}&view=full`);
    }
  }, [isLoading, memoData, companyIdFromUrl, navigate]);

  // Handle no company - redirect to portal
  useEffect(() => {
    if (!isLoading && memoData && !memoData.companyInfo) {
      navigate("/portal");
    }
  }, [isLoading, memoData, navigate]);

  if (isLoading) {
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
  
  if (isLocked && companyId) {
    console.log('[MemoSectionView] Section locked, redirecting to checkout with companyId:', companyId);
    navigate(`/checkout-analysis?companyId=${companyId}`, { replace: true });
    return null;
  }
  
  const progressPercent = ((sectionIndex + 1) / totalSections) * 100;

  const goToSection = (index: number) => {
    if (!companyId) {
      console.error('[MemoSectionView] Cannot navigate - companyId is missing');
      navigate("/portal");
      return;
    }
    if (index >= 0 && index < totalSections) {
      navigate(`/analysis/section?companyId=${companyId}&section=${index}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUnlock = () => {
    if (!companyId) {
      console.error('[MemoSectionView] Cannot unlock - companyId is missing');
      navigate("/portal");
      return;
    }
    navigate(`/checkout-analysis?companyId=${companyId}`);
  };

  // Render VC Quick Take page (Section 0) - Full access since user has paid
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
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                  Section 0 of {totalSections - 1}
                </span>
                <div className="flex-1 max-w-xs">
                  <Progress value={progressPercent} className="h-1.5" />
                </div>
              </div>
              
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

          {/* Stage Mismatch Warning - Show on all section pages when mismatch is major */}
          {holisticStage?.mismatchSeverity === 'major' && (
            <div className="mb-8">
              <StageMismatchWarning
                userStatedStage={companyInfo?.stage || 'seed'}
                detectedStage={holisticStage.detectedStage}
                confidence={holisticStage.confidence}
                signals={holisticStage.signals || []}
                mismatchExplanation={holisticStage.mismatchExplanation}
              />
            </div>
          )}

          {/* Anchored Assumptions - Key Metrics Transparency */}
          {anchoredAssumptions && (
            <div className="mb-8">
              <MemoAnchoredAssumptions 
                assumptions={anchoredAssumptions}
                companyName={companyInfo?.name}
              />
            </div>
          )}

          {/* VC Quick Take Content - Always show full version since user has paid */}
          {vcQuickTake && (
            <MemoVCQuickTake 
              quickTake={vcQuickTake} 
              showTeaser={false} 
              onUnlock={handleUnlock} 
            />
          )}

          {/* Investment Readiness Scorecard (Spider Graph) */}
          {sectionTools && Object.keys(sectionTools).length > 0 && (
            <div className="my-8">
              <MemoScoreRadar
                sectionTools={sectionTools}
                companyName={companyInfo?.name || 'Company'}
                stage={holisticStage?.benchmarkingStage || companyInfo?.stage || 'seed'}
                category={companyInfo?.category}
                holisticVerdicts={holisticVerdicts}
                companyInsightContext={companyInsightContext}
                onSectionClick={(sectionName) => {
                  const sectionIdx = memoContent.sections.findIndex(s => 
                    safeTitle(s.title).toLowerCase().includes(sectionName.toLowerCase())
                  );
                  if (sectionIdx >= 0) {
                    goToSection(sectionIdx + 1);
                  }
                }}
              />
            </div>
          )}

          {/* Action Plan */}
          {actionPlan && actionPlan.items.length > 0 && (
            <div className="mt-8">
              <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo?.name} />
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
                  <span className="hidden sm:inline">Next: {safeTitle(memoContent.sections[0]?.title) || 'Problem'}</span>
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
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/analysis?companyId=${companyId}&view=full`)}
                  className="text-muted-foreground"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Full Memo
                </Button>
                {sectionTools && Object.keys(sectionTools).length > 0 && companyInfo && (
                  <ShareScoreButton
                    companyId={companyId || ""}
                    companyName={companyInfo.name}
                    score={(() => {
                      const scores = Object.values(sectionTools)
                        .map(t => t.sectionScore?.score)
                        .filter((s): s is number => typeof s === 'number');
                      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                    })()}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  />
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
  const titleLower = safeTitle(currentSection!.title).toLowerCase();
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

  // Extract business model, traction, and market text for pricing metrics
  const businessModelSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('business'));
  const tractionSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('traction'));
  const marketSectionGlobal = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('market'));
  const businessModelText = businessModelSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                           businessModelSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const tractionText = tractionSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                      tractionSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const marketTextGlobal = marketSectionGlobal?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                           marketSectionGlobal?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  // Extract pricing using anchoredAssumptions from state
  const extractedPricing = extractPricingMetrics(businessModelText, tractionText, memoResponses, undefined, marketTextGlobal, anchoredAssumptions || undefined);

  const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
  const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

  // Get problem text for differentiation card
  const problemSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('problem'));
  const problemText = problemSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                     problemSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';

  // Get section-specific tools data
  const currentSectionTitle = safeTitle(currentSection!.title);
  const currentSectionTools = findSectionTools(currentSectionTitle, sectionTools);
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
        {/* Stage Mismatch Warning - Show on all section pages when mismatch is major */}
        {holisticStage?.mismatchSeverity === 'major' && (
          <div className="mb-8">
            <StageMismatchWarning
              userStatedStage={companyInfo?.stage || 'seed'}
              detectedStage={holisticStage.detectedStage}
              confidence={holisticStage.confidence}
              signals={holisticStage.signals || []}
              mismatchExplanation={holisticStage.mismatchExplanation}
            />
          </div>
        )}

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

            {/* VC Framing Explanation - Educational context for why we wrote it this way */}
            <VCFramingExplainerCard sectionTitle={currentSection!.title} />

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
                  avgMonthlyRevenue={extractedPricing.avgMonthlyRevenue}
                  currentCustomers={extractedPricing.currentCustomers}
                  currentMRR={extractedPricing.currentMRR}
                  companyName={companyInfo?.name || 'Company'}
                  category={companyInfo?.category || 'Technology'}
                  currency={extractedPricing.currency}
                  businessModelType={extractedPricing.businessModelType}
                  ltv={extractedPricing.ltv}
                  avgDealSize={extractedPricing.avgDealSize}
                  aumFeePercent={extractedPricing.aumFeePercent}
                  aumTotal={extractedPricing.aumTotal}
                  setupFee={extractedPricing.setupFee}
                  transactionFeePercent={extractedPricing.transactionFeePercent}
                  avgTransactionValue={extractedPricing.avgTransactionValue}
                  isB2C={extractedPricing.isB2C}
                  isTransactionBased={extractedPricing.isTransactionBased}
                  dataSource={extractedPricing.dataSource}
                  anchoredAssumptions={anchoredAssumptions || undefined}
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
                      credibilityToolData={currentSectionTools?.credibilityGapAnalysis}
                      teamStoryRaw={memoResponses['team_story']}
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
                    navigate(`/analysis/complete?companyId=${companyId}`);
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