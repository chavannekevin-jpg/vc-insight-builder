import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";
import { VCFramingExplainerCard } from "@/components/memo/VCFramingExplainerCard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
import { MemoMomentumCard } from "@/components/memo/MemoMomentumCard";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoTeamList } from "@/components/memo/MemoTeamList";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent, MemoParagraph, EnhancedSectionTools } from "@/types/memo";
import { safeTitle, sanitizeMemoContent } from "@/lib/stringUtils";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { extractMoatScores, extractTeamMembers, extractUnitEconomics, extractPricingMetrics } from "@/lib/memoDataExtractor";

// Import VC tools
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

export default function AdminMemoView() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [sectionTools, setSectionTools] = useState<Record<string, EnhancedSectionTools>>({});
  const [memoResponses, setMemoResponses] = useState<Record<string, string>>({});

  const actionPlan = useMemo(() => {
    if (!memoContent?.vcQuickTake) return null;
    return extractActionPlan(memoContent, memoContent.vcQuickTake);
  }, [memoContent]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        // Check admin role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleError || !roleData) {
          toast({
            title: "Access Denied",
            description: "You don't have admin permissions",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);

        if (!companyId) {
          navigate("/admin/memos");
          return;
        }

        // Fetch company info
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("*, profiles!companies_founder_id_fkey(email)")
          .eq("id", companyId)
          .maybeSingle();

        if (companyError || !company) {
          toast({
            title: "Error",
            description: "Company not found",
            variant: "destructive",
          });
          navigate("/admin/memos");
          return;
        }

        setCompanyInfo({
          ...company,
          founder_email: (company.profiles as any)?.email || "N/A"
        });

        // Fetch memo
        const { data: memo, error: memoError } = await supabase
          .from("memos")
          .select("structured_content")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError || !memo?.structured_content) {
          toast({
            title: "No Memo Found",
            description: "This company doesn't have a generated memo yet",
            variant: "destructive",
          });
          navigate("/admin/memos");
          return;
        }

        setMemoContent(sanitizeMemoContent(memo.structured_content));

        // Fetch tool data for this company
        const { data: toolData } = await supabase
          .from("memo_tool_data")
          .select("*")
          .eq("company_id", companyId);
        
        // Fetch memo responses for pricing extraction
        const { data: responsesData } = await supabase
          .from("memo_responses")
          .select("question_key, answer")
          .eq("company_id", companyId);
        
        if (responsesData) {
          const responsesMap: Record<string, string> = {};
          responsesData.forEach(r => {
            if (r.answer) responsesMap[r.question_key] = r.answer;
          });
          setMemoResponses(responsesMap);
        }
        
        if (toolData && toolData.length > 0) {
          const toolsMap: Record<string, EnhancedSectionTools> = {};
          toolData.forEach((tool) => {
            const sectionName = tool.section_name;
            if (!toolsMap[sectionName]) {
              toolsMap[sectionName] = {};
            }
            let aiData = tool.ai_generated_data as Record<string, any> || {};
            const userOverrides = tool.user_overrides as Record<string, any> || {};
            
            // Unwrap double-wrapped data from AI hallucination
            if (aiData.aiGenerated !== undefined && typeof aiData.aiGenerated === 'object') {
              aiData = aiData.aiGenerated;
            }
            
            // Tools that use direct merged data format (not EditableTool pattern)
            const directMergeTools = ["sectionScore", "benchmarks", "caseStudy", "vcInvestmentLogic", "actionPlan90Day", "leadInvestorRequirements"];
            
            if (directMergeTools.includes(tool.tool_name)) {
              (toolsMap[sectionName] as any)[tool.tool_name] = {
                ...aiData,
                ...userOverrides,
                dataSource: tool.data_source || "ai-complete"
              };
            } else {
              (toolsMap[sectionName] as any)[tool.tool_name] = {
                aiGenerated: aiData,
                userOverrides: userOverrides,
                dataSource: tool.data_source || "ai-complete"
              };
            }
          });
          setSectionTools(toolsMap);
        }
      } catch (error) {
        console.error("Error loading memo:", error);
        toast({
          title: "Error",
          description: "Failed to load memo",
          variant: "destructive",
        });
        navigate("/admin/memos");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [companyId, navigate]);

  if (loading) {
    return <MemoLoadingScreen />;
  }

  if (!isAdmin || !memoContent || !companyInfo) {
    return null;
  }

  // Extract pricing metrics for scale card
  const businessModelSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('business'));
  const tractionSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('traction'));
  const marketSection = memoContent.sections.find(s => safeTitle(s.title).toLowerCase().includes('market'));
  const businessModelText = businessModelSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                           businessModelSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const tractionTextGlobal = tractionSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                             tractionSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const marketTextGlobal = marketSection?.narrative?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || 
                           marketSection?.paragraphs?.map((p: MemoParagraph) => p.text).join(' ') || '';
  const extractedPricing = extractPricingMetrics(businessModelText, tractionTextGlobal, memoResponses, undefined, marketTextGlobal);

  let exitPathShown = false;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Indicator Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">
              Admin View: {companyInfo.name} ({companyInfo.founder_email})
            </span>
            <span className="text-xs text-amber-500/70">• Read-only • User not notified</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/memos")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Memos
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="w-4 h-4" />
              Viewing: {companyInfo.name}
            </div>
          </div>
        </div>
      </div>

      {/* Memo Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* VC Quick Take */}
        {memoContent.vcQuickTake && (
          <div className="mb-8">
            <MemoVCQuickTake 
              quickTake={memoContent.vcQuickTake} 
              showTeaser={false}
            />
          </div>
        )}

        {/* Action Plan */}
        {actionPlan && actionPlan.items.length > 0 && (
          <div className="mt-8">
            <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo.name} />
          </div>
        )}

        {/* Memo Sections with Full Tools */}
        <div className="space-y-8 mt-12">
          {memoContent.sections.map((section, index) => {
            const narrative = section.narrative || {
              paragraphs: section.paragraphs,
              highlights: section.highlights,
              keyPoints: section.keyPoints
            };

            // Section type detection
            const titleLower = safeTitle(section.title).toLowerCase();
            const isProblemSection = titleLower.includes('problem');
            const isSolutionSection = titleLower.includes('solution');
            const isTeamSection = titleLower.includes('team');
            const isMarketSection = titleLower.includes('market');
            const isCompetitionSection = titleLower.includes('competition');
            const isBusinessSection = titleLower.includes('business');
            const isTractionSection = titleLower.includes('traction');
            const isThesisSection = titleLower.includes('thesis');
            const isVisionSection = titleLower.includes('vision');
            
            // Determine if we should show exit path (only once)
            const showExitPath = !exitPathShown && (isThesisSection || isVisionSection);
            if (showExitPath) exitPathShown = true;

            // Extract data from section content
            const sectionText = narrative.paragraphs?.map(p => p.text).join(' ') || '';
            const extractedTeamMembers = isTeamSection ? extractTeamMembers(sectionText) : [];
            const extractedMoatScores = isCompetitionSection ? extractMoatScores(sectionText) : null;
            const extractedUnitEconomics = isBusinessSection ? extractUnitEconomics(sectionText, '') : null;

            // Separate hero statement from other paragraphs
            const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
            const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

            // Get section-specific tools
            const currentSectionTools = sectionTools[section.title] || {};

            return (
              <MemoSection key={section.title} title={section.title} index={index}>
                {/* Section Score Card */}
                {currentSectionTools?.sectionScore && (
                  <SectionScoreCard
                    sectionName={section.title}
                    score={currentSectionTools.sectionScore}
                  />
                )}

                {/* Hero Statement */}
                {heroParagraph && (
                  <MemoHeroStatement text={heroParagraph.text} />
                )}

                {/* VC Framing Explanation */}
                <VCFramingExplainerCard sectionTitle={section.title} />

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
                    {currentSectionTools?.evidenceThreshold && (
                      <ProblemEvidenceThreshold data={currentSectionTools.evidenceThreshold} />
                    )}
                    {currentSectionTools?.founderBlindSpot && (
                      <ProblemFounderBlindSpot data={currentSectionTools.founderBlindSpot} />
                    )}
                  </div>
                )}

                {/* Solution Section Tools */}
                {isSolutionSection && (
                  <div className="space-y-6">
                    <MemoDifferentiationCard 
                      solutionText={sectionText}
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
                {isMarketSection && (
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
                {isCompetitionSection && (
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
                {isTeamSection && (
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
                {isBusinessSection && (
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
                {isTractionSection && (
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
                {isVisionSection && (
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
                    {showExitPath && (
                      <MemoExitPathCard 
                        exitData={{
                          category: companyInfo?.category || 'Technology',
                          revenueMultiple: { low: 5, mid: 10, high: 15 }
                        }}
                        companyName={companyInfo?.name || 'Company'}
                      />
                    )}
                  </div>
                )}

                {/* Section Benchmarks */}
                {currentSectionTools?.benchmarks && (
                  <SectionBenchmarks
                    sectionName={section.title}
                    benchmarks={currentSectionTools.benchmarks}
                  />
                )}

                {/* Micro Case Study */}
                {currentSectionTools?.caseStudy && (
                  <MicroCaseStudyCard caseStudy={currentSectionTools.caseStudy} />
                )}

                {/* VC Perspective */}
                {section.vcReflection && (
                  <div className="mt-10 space-y-8 pt-8 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Investor Perspective</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>
                    
                    <MemoVCReflection text={section.vcReflection.analysis} />
                    
                    {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                      <MemoVCQuestions questions={section.vcReflection.questions} defaultAllOpen={true} />
                    )}
                    
                    {section.vcReflection.benchmarking && (
                      <MemoBenchmarking text={section.vcReflection.benchmarking} />
                    )}
                    
                    <MemoAIConclusion text={section.vcReflection.conclusion} />
                  </div>
                )}

                {/* VC Investment Logic Card */}
                {currentSectionTools?.vcInvestmentLogic && (
                  <VCInvestmentLogicCard
                    sectionName={safeTitle(section.title)}
                    logic={currentSectionTools.vcInvestmentLogic}
                  />
                )}

                {/* 90-Day Action Plan */}
                {currentSectionTools?.actionPlan90Day && (
                  <Section90DayPlan
                    sectionName={safeTitle(section.title)}
                    plan={currentSectionTools.actionPlan90Day}
                  />
                )}

                {/* Lead Investor Requirements */}
                {currentSectionTools?.leadInvestorRequirements && (
                  <LeadInvestorCard
                    sectionName={safeTitle(section.title)}
                    requirements={currentSectionTools.leadInvestorRequirements}
                  />
                )}
              </MemoSection>
            );
          })}
        </div>
      </div>
    </div>
  );
}
