/**
 * SharedMemoView - Public shareable page for investment memos
 * 
 * This page allows admins to share the FULL investment analysis with partners
 * via a secure token-based link without requiring authentication.
 * 
 * Displays complete audit including: section scores, tool cards, VC perspective,
 * benchmarks, case studies, action plans, and lead investor requirements.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, Copy, Calendar, Shield, CheckCircle2, Lock, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Memo components
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
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

import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { VCFramingExplainerCard } from "@/components/memo/VCFramingExplainerCard";
import { MemoAnchoredAssumptions } from "@/components/memo/MemoAnchoredAssumptions";
import { MemoScoreRadar } from "@/components/memo/MemoScoreRadar";

// VC tool cards
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

// Types & utilities
import { MemoStructuredContent, MemoParagraph, EnhancedSectionTools } from "@/types/memo";
import { safeTitle, sanitizeMemoContent } from "@/lib/stringUtils";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { extractMoatScores, extractTeamMembers, extractUnitEconomics, extractPricingMetrics } from "@/lib/memoDataExtractor";
import { extractAnchoredAssumptions, detectCurrencyFromResponses, getAIMetricEstimate, applyAIEstimate, getFallbackMetricValue, type AnchoredAssumptions } from "@/lib/anchoredAssumptions";

interface SharedMemoData {
  token: string;
  company_id: string;
  company_name: string;
  category: string | null;
  stage: string;
  description: string | null;
  public_score: number | null;
  vc_verdict_json: any;
  structured_content: any;
  memo_created_at: string | null;
  is_active: boolean;
  expires_at: string | null;
}

export default function SharedMemoView() {
  const { token } = useParams<{ token: string }>();
  
  const [loading, setLoading] = useState(true);
  const [memoData, setMemoData] = useState<SharedMemoData | null>(null);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [sectionTools, setSectionTools] = useState<Record<string, EnhancedSectionTools>>({});
  const [memoResponses, setMemoResponses] = useState<Record<string, string>>({});
  const [anchoredAssumptions, setAnchoredAssumptions] = useState<AnchoredAssumptions | null>(null);
  const [holisticVerdicts, setHolisticVerdicts] = useState<Record<string, { verdict: string; stageContext?: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Action plan derived from memo content
  const actionPlan = useMemo(() => {
    if (!memoContent?.vcQuickTake) return null;
    return extractActionPlan(memoContent, memoContent.vcQuickTake);
  }, [memoContent]);

  useEffect(() => {
    const fetchSharedMemo = async () => {
      if (!token) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch from the public view (basic company + memo info)
        const { data, error: fetchError } = await supabase
          .from("shared_memo_view")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching shared memo:", fetchError);
          setError("Failed to load memo");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("This share link is invalid or has expired");
          setLoading(false);
          return;
        }

        const sharedData = data as unknown as SharedMemoData;
        setMemoData(sharedData);
        setMemoContent(sanitizeMemoContent(sharedData.structured_content));

        // 2. Fetch tool data from shareable_section_scores view
        const { data: toolData } = await supabase
          .from("shareable_section_scores")
          .select("*")
          .eq("company_id", sharedData.company_id);

        if (toolData && toolData.length > 0) {
          const toolsMap: Record<string, EnhancedSectionTools> = {};
          const verdictsMap: Record<string, { verdict: string; stageContext?: string }> = {};
          
          toolData.forEach((tool: any) => {
            const sectionName = tool.section_name;
            
            // Extract holistic verdicts separately
            if (tool.tool_name === 'holisticVerdict') {
              const aiData = tool.ai_generated_data as Record<string, any> || {};
              const verdictText = aiData.holisticVerdict || aiData.verdict;
              if (verdictText) {
                verdictsMap[sectionName] = {
                  verdict: verdictText,
                  stageContext: aiData.stageContext
                };
              }
              return;
            }
            
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
          setHolisticVerdicts(verdictsMap);
        }

        // 3. Fetch responses from shareable_memo_responses view
        const { data: responsesData } = await supabase
          .from("shareable_memo_responses")
          .select("*")
          .eq("company_id", sharedData.company_id);

        if (responsesData) {
          const responsesMap: Record<string, string> = {};
          responsesData.forEach((r: any) => {
            if (r.answer) responsesMap[r.question_key] = r.answer;
          });
          setMemoResponses(responsesMap);

          // Extract anchored assumptions
          const currency = detectCurrencyFromResponses(responsesMap);
          let assumptions = extractAnchoredAssumptions(null, responsesMap, currency);
          
          // AI estimation if no primary metric value
          if (assumptions.primaryMetricValue === null) {
            try {
              const estimate = await getAIMetricEstimate(assumptions, {
                name: sharedData.company_name,
                category: sharedData.category || undefined,
                stage: sharedData.stage
              }, responsesMap);
              if (estimate) {
                assumptions = applyAIEstimate(assumptions, estimate);
              }
            } catch (e) {
              console.error('AI estimation failed, using fallback:', e);
              const fallback = getFallbackMetricValue(assumptions, sharedData.stage);
              assumptions = { ...assumptions, primaryMetricValue: fallback, source: 'ai_estimated' };
            }
          }
          setAnchoredAssumptions(assumptions);
        }

        // 4. Increment view count (fire and forget)
        supabase.rpc("increment_share_link_views", { p_token: token });

      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedMemo();
  }, [token]);

  const copyShareLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (s: number | null) => {
    if (!s) return "text-muted-foreground";
    if (s >= 75) return "text-success";
    if (s >= 60) return "text-primary";
    if (s >= 45) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (s: number | null) => {
    if (!s) return "bg-muted";
    if (s >= 75) return "bg-success";
    if (s >= 60) return "bg-primary";
    if (s >= 45) return "bg-warning";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !memoData || !memoContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">{error || "This memo is not available"}</p>
          <div className="p-4 rounded-lg bg-muted/30 border border-border text-left">
            <p className="text-sm text-muted-foreground">
              This link may have expired or been deactivated. Please contact the person who shared this link for access.
            </p>
          </div>
        </div>
      </div>
    );
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
  const extractedPricing = extractPricingMetrics(businessModelText, tractionTextGlobal, memoResponses, undefined, marketTextGlobal, anchoredAssumptions || undefined);

  let exitPathShown = false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">Shared Analysis</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--muted) / 0.3) 100%)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-primary/10" />
          
          <div className="relative p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Investment Analysis</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{memoData.company_name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline">{memoData.category || "Uncategorized"}</Badge>
                  <Badge variant="secondary">{memoData.stage}</Badge>
                  {memoData.memo_created_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(memoData.memo_created_at), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                {memoData.description && (
                  <p className="text-foreground/80 leading-relaxed">{memoData.description}</p>
                )}
              </div>
              
              {memoData.public_score && (
                <div className="text-center shrink-0">
                  <div className={cn("text-5xl font-bold mb-1", getScoreColor(memoData.public_score))}>
                    {memoData.public_score}
                  </div>
                  <p className="text-xs text-muted-foreground">Fundability Score</p>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className={cn("h-full rounded-full transition-all", getScoreBg(memoData.public_score))}
                      style={{ width: `${memoData.public_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Investment Readiness Scorecard - Score Radar */}
        {sectionTools && Object.keys(sectionTools).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-8"
          >
            <MemoScoreRadar
              sectionTools={sectionTools}
              companyName={memoData.company_name}
              stage={memoData.stage}
              category={memoData.category || undefined}
              holisticVerdicts={holisticVerdicts}
            />
          </motion.div>
        )}

        {/* Anchored Assumptions */}
        {anchoredAssumptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <MemoAnchoredAssumptions 
              assumptions={anchoredAssumptions}
              companyName={memoData.company_name}
            />
          </motion.div>
        )}

        {/* VC Quick Take */}
        {memoContent.vcQuickTake && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <MemoVCQuickTake 
              quickTake={memoContent.vcQuickTake} 
              showTeaser={false}
            />
          </motion.div>
        )}

        {/* Action Plan */}
        {actionPlan && actionPlan.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <MemoActionPlan actionPlan={actionPlan} companyName={memoData.company_name} />
          </motion.div>
        )}

        {/* Memo Sections with Full Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
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
                      companyName={memoData?.company_name || 'Company'}
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
                      companyName={memoData?.company_name || 'Company'}
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
                        companyName={memoData?.company_name || 'Company'}
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
                      <MemoTeamList 
                        members={extractedTeamMembers.map(tm => ({
                          name: tm.name,
                          role: tm.role,
                          equity: tm.equity,
                          description: ''
                        }))} 
                        showEquity={extractedTeamMembers.some(tm => tm.equity)} 
                      />
                    )}
                    <MemoTeamGapCard 
                      teamMembers={extractedTeamMembers}
                      stage={memoData?.stage || 'Pre-seed'}
                      companyName={memoData?.company_name || 'Company'}
                      credibilityToolData={currentSectionTools?.credibilityGapAnalysis}
                      teamStoryRaw={memoResponses['team_story']}
                    />
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
                        companyName={memoData?.company_name || 'Company'}
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
                      companyName={memoData?.company_name || 'Company'}
                      stage={memoData?.stage || 'Pre-seed'}
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
                          category: memoData?.category || 'Technology',
                          revenueMultiple: { low: 5, mid: 10, high: 15 }
                        }}
                        companyName={memoData?.company_name || 'Company'}
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
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-border text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>This analysis was shared via a private link</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Generated by Kontrol • Confidential investment analysis
          </p>
        </motion.div>
      </main>
    </div>
  );
}
