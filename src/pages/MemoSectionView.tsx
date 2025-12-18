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
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Grid, BookOpen, Zap, AlertTriangle, Eye, Lock, FileText, Target, Users, TrendingUp, Swords, DollarSign, Rocket, Lightbulb, Trophy, BarChart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent, MemoParagraph, EnhancedSectionTools } from "@/types/memo";

// Helper to safely get section title as string
const safeTitle = (title: unknown): string => {
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && 'text' in title) {
    return String((title as { text: unknown }).text || '');
  }
  return String(title || '');
};

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

import { isValidCompanyId } from "@/lib/companyIdUtils";

export default function MemoSectionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get("companyId");
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

  // Use companyInfo.id as source of truth for navigation (more reliable than URL params)
  const companyId = companyInfo?.id || companyIdFromUrl;

  useEffect(() => {
    const loadMemo = async () => {
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
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`, { replace: true });
        return;
      }

      try {
        const { data: company } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyIdFromUrl)
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
          .eq("company_id", companyIdFromUrl)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memo?.structured_content) {
          setMemoContent(memo.structured_content as unknown as MemoStructuredContent);
          
          // Fetch tool data for this company
          const { data: toolData } = await supabase
            .from("memo_tool_data")
            .select("*")
            .eq("company_id", companyIdFromUrl);
          
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
          navigate(`/analysis?companyId=${companyIdFromUrl}&view=full`);
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
  }, [companyIdFromUrl, navigate]);

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
                  <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5">
                    <Eye className="w-3 h-3" />
                    Preview
                  </span>
                </div>
                <div className="flex-1 max-w-xs">
                  <Progress value={0} className="h-1.5" />
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
                  onClick={handleUnlock}
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
          {/* Lobby Welcome Card */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-muted/50 via-background to-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-amber-600 px-2.5 py-1 bg-amber-500/10 rounded-full flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                LOBBY
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              The partners just finished discussing {companyInfo?.name}.
            </h3>
            <p className="text-sm text-muted-foreground">
              You're not in the room yet — but we caught what they said on the way out.
            </p>
          </div>

          {/* What's Inside Preview Grid */}
          {!hasPremium && memoContent.sections && memoContent.sections.length > 0 && (
            <div className="mb-8 p-5 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
                What's Inside the Full IC Brief
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {memoContent.sections.map((section, idx) => {
                   const sectionTitle = safeTitle(section.title).toLowerCase();
                  const sectionConfig = {
                    problem: { icon: Target, snippet: "Evidence threshold • Founder blind spots • Pain validation" },
                    solution: { icon: Lightbulb, snippet: "Technical defensibility • Commoditization risk • Build analysis" },
                    market: { icon: TrendingUp, snippet: "TAM reality check • Timing signals • VC narrative fit" },
                    team: { icon: Users, snippet: "Credibility gaps • Key hire priorities • Founder-market fit" },
                    competition: { icon: Swords, snippet: "Moat durability • Competitive positioning • Chessboard analysis" },
                    business: { icon: DollarSign, snippet: "Unit economics • Stress test • Revenue model viability" },
                    traction: { icon: BarChart, snippet: "Growth depth test • Milestone validation • Signal strength" },
                    thesis: { icon: Trophy, snippet: "Investment logic • Lead investor lens • Deal conviction" },
                    vision: { icon: Rocket, snippet: "Exit narrative • Scenario planning • Milestone roadmap" },
                  };
                  
                  const matchedKey = Object.keys(sectionConfig).find(key => sectionTitle.includes(key)) || 'problem';
                  const config = sectionConfig[matchedKey as keyof typeof sectionConfig];
                  const IconComponent = config.icon;
                  
                  return (
                    <div 
                      key={idx} 
                      className="p-3 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors group cursor-pointer"
                      onClick={handleUnlock}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-3.5 h-3.5 text-primary/70" />
                          <span className="text-xs text-primary/70 font-medium">Section {idx + 1}</span>
                        </div>
                        <Lock className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{safeTitle(section.title)}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                        {config.snippet}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sample Memo CTA */}
          {!hasPremium && (
            <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Want to see what a full analysis looks like?</p>
                  <p className="text-xs text-muted-foreground">Explore our sample memo with all sections unlocked</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/sample-memo?view=full')}
                className="whitespace-nowrap"
              >
                View Sample Memo
              </Button>
            </div>
          )}

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
            <MemoVCQuickTake 
              quickTake={vcQuickTake} 
              showTeaser={!hasPremium} 
              onUnlock={handleUnlock} 
            />
          )}

          {/* Action Plan - Only shown to premium users */}
          {hasPremium && actionPlan && actionPlan.items.length > 0 && (
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
                    onClick={handleUnlock}
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
                
                {hasPremium ? (
                  <Button 
                    variant="default"
                    onClick={() => goToSection(1)}
                    className="gap-2"
                  >
                    <span className="hidden sm:inline">Next: {memoContent.sections[0]?.title || 'Problem'}</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    onClick={handleUnlock}
                    className="gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Unlock Section 1</span>
                    <span className="sm:hidden">Unlock</span>
                  </Button>
                )}
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

  const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
  const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

  // Get problem text for differentiation card
  const problemSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('problem'));
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