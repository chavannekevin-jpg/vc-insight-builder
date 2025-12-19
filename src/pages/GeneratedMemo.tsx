import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { VCFramingExplainerCard } from "@/components/memo/VCFramingExplainerCard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";
import { MemoNavigation } from "@/components/memo/MemoNavigation";
import { SmartFillModal } from "@/components/SmartFillModal";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
// LockedSectionOverlay removed - freemium users don't see content at all
import { VCRejectionPreview } from "@/components/memo/VCRejectionPreview";
import { MemoVCScaleCard } from "@/components/memo/MemoVCScaleCard";
import { MemoTeamList } from "@/components/memo/MemoTeamList";
import { MemoTeamGapCard } from "@/components/memo/MemoTeamGapCard";
import { MemoMoatScoreCard } from "@/components/memo/MemoMoatScoreCard";
import { MemoUnitEconomicsCard } from "@/components/memo/MemoUnitEconomicsCard";
import { MemoExitPathCard } from "@/components/memo/MemoExitPathCard";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoMomentumCard } from "@/components/memo/MemoMomentumCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";

import { LowConfidenceWarning } from "@/components/memo/LowConfidenceWarning";
import { extractMoatScores, extractTeamMembers, extractUnitEconomics, extractPricingMetrics } from "@/lib/memoDataExtractor";
import { extractActionPlan } from "@/lib/actionPlanExtractor";
import { safeTitle, sanitizeMemoContent } from "@/lib/stringUtils";
import { ArrowLeft, Printer, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent, MemoParagraph, EnhancedSectionTools, ConditionalAssessment } from "@/types/memo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

interface SmartQuestion {
  questionKey: string;
  question: string;
  helpText: string;
  placeholder: string;
  priority: number;
}

interface GapAnalysis {
  scores: {
    memoReadiness: number;
    qualitativeScore: number;
    momentumScore: number;
  };
  criticalGaps: Array<{
    category: string;
    label: string;
    keys: string[];
    vcImportance: string;
  }>;
  filledData: Record<string, string>;
}

export default function GeneratedMemo() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const viewMode = searchParams.get("view"); // 'full' for full memo, otherwise redirect to wizard
  const shouldRegenerate = searchParams.get("regenerate") === "true";
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [shouldRedirectToWizard, setShouldRedirectToWizard] = useState(false);
  const [sectionTools, setSectionTools] = useState<Record<string, EnhancedSectionTools>>({});
  const [memoResponses, setMemoResponses] = useState<Record<string, string>>({});
  
  // Smart fill state
  const [showSmartFill, setShowSmartFill] = useState(false);
  const [smartQuestions, setSmartQuestions] = useState<SmartQuestion[]>([]);
  const [smartSummary, setSmartSummary] = useState("");
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  
  // VC Rejection Preview state
  const [showRejectionPreview, setShowRejectionPreview] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);

  // IMPORTANT: useMemo must be called before any early returns to follow Rules of Hooks
  const actionPlan = useMemo(() => {
    if (!memoContent) return null;
    return extractActionPlan(memoContent, memoContent.vcQuickTake);
  }, [memoContent]);

  const handlePrint = () => {
    window.print();
  };

  const analyzeAndPrepare = async (companyId: string): Promise<boolean> => {
    setAnalyzing(true);
    try {
      const { data: gapData, error: gapError } = await supabase.functions.invoke('analyze-data-gaps', {
        body: { companyId }
      });

      if (gapError) {
        console.error('Gap analysis error:', gapError);
        return true;
      }

      console.log('Gap analysis result:', gapData);
      setGapAnalysis(gapData.analysis);

      if (gapData.analysis.scores.memoReadiness < 70 && gapData.analysis.criticalGaps.length > 0) {
        console.log('Memo readiness below 70%, generating smart questions...');
        
        const { data: questionData, error: questionError } = await supabase.functions.invoke('generate-smart-questions', {
          body: { 
            gapAnalysis: gapData.analysis,
            company: gapData.company
          }
        });

        if (questionError) {
          console.error('Smart questions error:', questionError);
          return true;
        }

        if (questionData.questions && questionData.questions.length > 0) {
          setSmartQuestions(questionData.questions);
          setSmartSummary(questionData.summary);
          setShowSmartFill(true);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in analyzeAndPrepare:', error);
      return true;
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!companyId) {
        console.error("GeneratedMemo: No company ID provided in URL");
        toast({
          title: "Error",
          description: "No company ID provided. Redirecting to portal...",
          variant: "destructive"
        });
        navigate("/portal");
        return;
      }

      console.log("GeneratedMemo: Loading memo for company:", companyId);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("GeneratedMemo: User not authenticated", authError);
        toast({
          title: "Session Expired",
          description: "Please log in again to view your memo.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }
      
      setUserId(user.id);

      const { data: company } = await supabase
        .from("companies")
        .select("has_premium")
        .eq("id", companyId)
        .maybeSingle();

      setHasPremium(company?.has_premium || false);

      try {
        const { data: memo, error: memoError } = await supabase
          .from("memos")
          .select("structured_content, company_id")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError) throw memoError;

        const hasContent = memo?.structured_content && 
                          (memo.structured_content as any).sections && 
                          Array.isArray((memo.structured_content as any).sections) && 
                          (memo.structured_content as any).sections.length > 0;

        if (!hasContent) {
          console.log("GeneratedMemo: No existing memo found, analyzing data gaps...");
          
          const shouldProceed = await analyzeAndPrepare(companyId);
          
          if (shouldProceed) {
            await generateMemo(companyId);
          } else {
            setPendingGeneration(true);
            setLoading(false);
          }
        } else {
          // Memo exists - check if we should redirect to wizard mode
          // Don't redirect if regenerate param is set (user wants to regenerate)
          const regenerateParam = searchParams.get("regenerate") === "true";
          if (viewMode !== 'full' && !regenerateParam) {
            // Redirect to section-by-section wizard
            setShouldRedirectToWizard(true);
            setLoading(false);
            return;
          }
          
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .maybeSingle();

          if (companyError) throw companyError;

          setMemoContent(sanitizeMemoContent(memo.structured_content));
          setCompanyInfo(companyData);
          
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
              const aiData = tool.ai_generated_data as Record<string, any> || {};
              const userOverrides = tool.user_overrides as Record<string, any> || {};
              const mergedData = {
                ...aiData,
                ...userOverrides,
                dataSource: tool.data_source || "ai-complete"
              };
              (toolsMap[sectionName] as any)[tool.tool_name] = 
                ["sectionScore", "benchmarks", "caseStudy", "vcInvestmentLogic", "actionPlan90Day", "leadInvestorRequirements"].includes(tool.tool_name)
                  ? mergedData
                  : { aiGenerated: aiData, userOverrides: userOverrides, dataSource: tool.data_source || "ai-complete" };
            });
            setSectionTools(toolsMap);
          }
          
          setLoading(false);
        }
      } catch (error: any) {
        console.error("GeneratedMemo: Error loading memo:", error);
        toast({
          title: "Error Loading Memo",
          description: error?.message || "Failed to load memo. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    init();
  }, [companyId, navigate, viewMode]);
  
  // Redirect to wizard mode if memo exists and not in full view mode
  useEffect(() => {
    if (shouldRedirectToWizard && companyId && !shouldRegenerate) {
      navigate(`/analysis/section?companyId=${companyId}&section=0`, { replace: true });
    }
  }, [shouldRedirectToWizard, companyId, navigate, shouldRegenerate]);

  // Handle regenerate param from URL (for premium users regenerating from dashboard)
  useEffect(() => {
    if (shouldRegenerate && companyId && hasPremium && !loading && !regenerating && memoContent) {
      console.log("Auto-regenerating memo due to regenerate URL param...");
      // Clear the regenerate param from URL to prevent re-triggering
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("regenerate");
      setSearchParams(newParams, { replace: true });
      // Trigger regeneration
      handleRegenerate();
    }
  }, [shouldRegenerate, companyId, hasPremium, loading, regenerating, memoContent]);

  // Helper to fetch memo and tool data from database (same as initial load)
  const fetchMemoFromDatabase = async (companyIdToFetch: string) => {
    console.log("Fetching memo from database...");
    
    // Fetch memo
    const { data: memo, error: memoError } = await supabase
      .from("memos")
      .select("structured_content, company_id")
      .eq("company_id", companyIdToFetch)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (memoError) {
      throw new Error("Failed to fetch memo from database");
    }

    if (!memo?.structured_content) {
      throw new Error("Memo content not found in database");
    }

    // Fetch company data
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyIdToFetch)
      .maybeSingle();

    if (companyError) {
      throw new Error("Failed to fetch company data");
    }

    // Fetch tool data
    const { data: toolData } = await supabase
      .from("memo_tool_data")
      .select("*")
      .eq("company_id", companyIdToFetch);
    
    if (toolData && toolData.length > 0) {
      const toolsMap: Record<string, EnhancedSectionTools> = {};
      toolData.forEach((tool) => {
        const sectionName = tool.section_name;
        if (!toolsMap[sectionName]) {
          toolsMap[sectionName] = {};
        }
        let aiData = tool.ai_generated_data as Record<string, any> || {};
        const userOverrides = tool.user_overrides as Record<string, any> || {};
        
        // CRITICAL: Unwrap double-wrapped data from AI hallucination
        // AI sometimes wraps response in { aiGenerated: {...}, dataSource: "..." } despite instructions
        if (aiData.aiGenerated !== undefined && typeof aiData.aiGenerated === 'object') {
          console.log(`Unwrapping double-wrapped data for ${tool.tool_name}`);
          aiData = aiData.aiGenerated;
        }
        
        // Tools that use direct merged data format (not EditableTool pattern)
        const directMergeTools = ["sectionScore", "benchmarks", "caseStudy", "vcInvestmentLogic", "actionPlan90Day", "leadInvestorRequirements"];
        
        if (directMergeTools.includes(tool.tool_name)) {
          // Direct merge format - data used as-is
          (toolsMap[sectionName] as any)[tool.tool_name] = {
            ...aiData,
            ...userOverrides,
            dataSource: tool.data_source || "ai-complete"
          };
        } else {
          // EditableTool pattern - wrap raw data with aiGenerated
          (toolsMap[sectionName] as any)[tool.tool_name] = {
            aiGenerated: aiData,
            userOverrides: userOverrides,
            dataSource: tool.data_source || "ai-complete"
          };
        }
      });
      setSectionTools(toolsMap);
      console.log("Tool data fetched:", Object.keys(toolsMap));
    }

    setMemoContent(sanitizeMemoContent(memo.structured_content));
    setCompanyInfo(companyData);
    console.log("Memo loaded from database successfully");
    
    return memo.structured_content;
  };

  const generateMemo = async (companyIdToGenerate: string, force: boolean = false) => {
    setLoading(true);
    try {
      console.log("Starting memo generation...");
      
      // Step 1: Start generation and get jobId
      const { data: startData, error: startError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId: companyIdToGenerate, force }
      });

      if (startError) {
        console.error("GeneratedMemo: Edge function error:", startError);
        throw new Error(
          startError.message === "Not Found" || startError.status === 404
            ? "Memo generation service is currently unavailable. Please try again in a moment."
            : startError.message || "Failed to start memo generation"
        );
      }

      if (!startData?.jobId) {
        throw new Error("No job ID returned from generation");
      }

      const jobId = startData.jobId;
      console.log(`Memo generation job started: ${jobId}`);

      // Step 2: Poll for completion
      const pollInterval = 5000; // 5 seconds
      const maxPolls = 100; // ~8.3 minutes max (extended for longer AI generation)
      let pollCount = 0;

      while (pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        pollCount++;

        console.log(`Polling job status (attempt ${pollCount})...`);
        
        const { data: statusData, error: statusError } = await supabase.functions.invoke('check-memo-job', {
          body: { jobId }
        });

        if (statusError) {
          console.error("Error checking job status:", statusError);
          continue;
        }

        if (statusData.status === "completed") {
          console.log("Memo generation completed! Fetching from database...");
          
          // CRITICAL FIX: Fetch from database instead of using statusData directly
          // This ensures data consistency and goes through the same code path as navigation
          const content = await fetchMemoFromDatabase(companyIdToGenerate);
          
          // Show rejection preview for non-premium users after generation
          if (!hasPremium && (content as any)?.vcQuickTake) {
            setShowRejectionPreview(true);
          }
          return;
        }

        if (statusData.status === "failed") {
          throw new Error(statusData.error || "Memo generation failed");
        }

        console.log(`Job status: ${statusData.status}, elapsed: ${statusData.elapsedSeconds}s - ${statusData.message}`);
      }

      throw new Error("Memo generation timed out. Please refresh and check if your memo is ready.");

    } catch (error: any) {
      console.error("Error generating memo:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to generate memo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setPendingGeneration(false);
    }
  };

  const handleSmartFillComplete = async () => {
    setShowSmartFill(false);
    if (companyId && pendingGeneration) {
      await generateMemo(companyId);
    }
  };

  const handleSmartFillSkip = async () => {
    setShowSmartFill(false);
    if (companyId && pendingGeneration) {
      await generateMemo(companyId);
    }
  };

  const handleRegenerate = async () => {
    if (!companyId) return;
    
    setRegenerating(true);
    
    try {
      console.log("Regenerating memo with force=true...");
      const startTime = Date.now();
      
      // Step 1: Start regeneration
      const { data: startData, error: startError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId, force: true }
      });

      if (startError) {
        console.error("GeneratedMemo: Regenerate function error:", startError);
        throw new Error(
          startError.message === "Not Found" || startError.status === 404
            ? "Memo generation service (404). The edge function may not be deployed yet."
            : startError.message || "Failed to regenerate memo"
        );
      }

      if (!startData?.jobId) {
        throw new Error("No job ID returned from regeneration");
      }

      const jobId = startData.jobId;
      console.log(`Regeneration job started: ${jobId}`);

      // Step 2: Poll for completion
      const pollInterval = 5000;
      const maxPolls = 100; // ~8.3 minutes max (extended for longer AI generation)
      let pollCount = 0;

      while (pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        pollCount++;

        const { data: statusData, error: statusError } = await supabase.functions.invoke('check-memo-job', {
          body: { jobId }
        });

        if (statusError) {
          console.error("Error checking job status:", statusError);
          continue;
        }

        if (statusData.status === "completed") {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`Memo regeneration completed in ${duration}s, fetching from database...`);
          
          // CRITICAL FIX: Fetch from database instead of using statusData directly
          await fetchMemoFromDatabase(companyId);
          
          toast({
            title: "Success",
            description: `Memo regenerated with critical VC analysis in ${duration}s`
          });
          return;
        }

        if (statusData.status === "failed") {
          throw new Error(statusData.error || "Memo regeneration failed");
        }
      }

      throw new Error("Memo regeneration timed out. Please refresh and check if your memo is ready.");

    } catch (error: any) {
      console.error("Error regenerating memo:", error);
      
      toast({
        title: "Error",
        description: error?.message || "Failed to regenerate memo. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Smart Fill Modal
  if (showSmartFill && companyId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center space-y-4 mb-8">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
            <h1 className="text-2xl font-display font-bold">Almost ready for your memo</h1>
            <p className="text-muted-foreground">
              We found some gaps in your data that would improve your memo quality.
            </p>
            {gapAnalysis && (
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Data Quality:</span>
                  <Progress value={gapAnalysis.scores.memoReadiness} className="w-24 h-2" />
                  <span className="font-medium">{gapAnalysis.scores.memoReadiness}%</span>
                </div>
              </div>
            )}
          </div>
          
          <SmartFillModal
            open={showSmartFill}
            onOpenChange={setShowSmartFill}
            companyId={companyId}
            questions={smartQuestions}
            summary={smartSummary}
            currentReadiness={gapAnalysis?.scores.memoReadiness || 0}
            onComplete={handleSmartFillComplete}
            onSkip={handleSmartFillSkip}
          />
        </div>
      </div>
    );
  }

  if (loading || analyzing) {
    return <MemoLoadingScreen analyzing={analyzing} />;
  }

  // Handler for VC Rejection Preview - close and scroll to memo
  const handleGetFullMemo = () => {
    setShowRejectionPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!memoContent || !companyInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">No memo content available.</p>
        </div>
      </div>
    );
  }

  const hasQuickTake = !!memoContent.vcQuickTake;

  // Debug logging for memo content structure
  console.log('GeneratedMemo render - memoContent structure:', {
    hasSections: !!memoContent.sections,
    sectionsCount: memoContent.sections?.length || 0,
    hasVcQuickTake: !!memoContent.vcQuickTake,
    vcQuickTakeType: typeof memoContent.vcQuickTake,
    vcQuickTakeConcernsType: memoContent.vcQuickTake ? typeof memoContent.vcQuickTake.concerns : 'N/A',
    vcQuickTakeConcernsIsArray: memoContent.vcQuickTake ? Array.isArray(memoContent.vcQuickTake.concerns) : 'N/A',
    vcQuickTakeStrengthsType: memoContent.vcQuickTake ? typeof memoContent.vcQuickTake.strengths : 'N/A',
    vcQuickTakeStrengthsIsArray: memoContent.vcQuickTake ? Array.isArray(memoContent.vcQuickTake.strengths) : 'N/A',
  });

  // actionPlan is now computed at the top of the component (before early returns)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* VC Rejection Preview Modal */}
      {memoContent.vcQuickTake && (
        <VCRejectionPreview
          open={showRejectionPreview}
          onOpenChange={setShowRejectionPreview}
          companyName={companyInfo.name}
          vcQuickTake={memoContent.vcQuickTake}
          onGetFullMemo={handleGetFullMemo}
          founderName={companyInfo.founderName}
          industry={companyInfo.category}
          stage={companyInfo.stage}
        />
      )}
      
      {/* Floating Navigation */}
      <MemoNavigation sections={memoContent.sections} hasQuickTake={hasQuickTake} />
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl pb-24">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/portal")}
              className="no-print"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
            
            <div className="flex gap-3 no-print">
              <Button
                variant="default"
                onClick={handlePrint}
                size="sm"
                className="md:min-w-[160px]"
              >
                <Printer className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Print / Save as PDF</span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              {companyInfo.name}
            </h1>
            {companyInfo.description && (
              <p className="text-base md:text-lg text-muted-foreground mb-4">{companyInfo.description}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {companyInfo.stage}
              </span>
              {companyInfo.category && (
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  {companyInfo.category}
                </span>
              )}
            </div>
          </div>
        </div>


        {/* Low Confidence Warning for important data gaps */}
        {hasPremium && memoContent.overallAssessment && (
          <div className="mb-6">
            <LowConfidenceWarning 
              confidence={memoContent.overallAssessment.confidence}
              dataCompleteness={memoContent.overallAssessment.dataCompleteness}
              onImproveData={() => navigate(`/company-profile-edit?companyId=${companyId}`)}
            />
          </div>
        )}

        {/* VC Quick Take - Always visible for all users, with teaser for free users */}
        {memoContent.vcQuickTake && (
          <div data-section="quick-take">
            <MemoVCQuickTake quickTake={memoContent.vcQuickTake} showTeaser={!hasPremium} />
          </div>
        )}

        {/* Action Plan - Premium only */}
        {hasPremium && actionPlan && actionPlan.items.length > 0 && (
          <MemoActionPlan actionPlan={actionPlan} companyName={companyInfo?.name} />
        )}

        {/* Memo Sections - For non-premium users, only show locked placeholders */}
        {!hasPremium ? (
          <div className="space-y-6">
            {/* Locked Section Placeholders for freemium users */}
            <div className="bg-card/50 border border-border/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {memoContent.sections.length} Premium Sections Available
                </h3>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {memoContent.sections.map((section, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-sm border border-border/30"
                  >
                    🔒 {safeTitle(section.title)}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Unlock detailed VC analysis, strategic tools, benchmarks, and actionable insights for each section.
              </p>
              <Button onClick={() => navigate(`/checkout-analysis?companyId=${companyId}`)}>
                Unlock Full Memo
              </Button>
            </div>
          </div>
        ) : (
        <div className="space-y-8">
          {(() => {
            let exitPathShown = false;
            
            // Extract business model, traction, and market text for pricing metrics
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
            
            return memoContent.sections.map((section, index) => {
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
              
              // Determine if we should show exit path (only once, prefer thesis over vision)
              const showExitPath = !exitPathShown && (isThesisSection || isVisionSection);
              if (showExitPath) exitPathShown = true;

              // Extract data from section content for strategic cards
              const sectionText = narrative.paragraphs?.map(p => p.text).join(' ') || '';
              const extractedTeamMembers = isTeamSection ? extractTeamMembers(sectionText) : [];
              const extractedMoatScores = isCompetitionSection ? extractMoatScores(sectionText) : null;
              const extractedUnitEconomics = isBusinessSection ? extractUnitEconomics(sectionText, '') : null;

              // Separate hero statement (high emphasis) from other paragraphs
              const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
              const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

              // Get section-specific tools data - use sample data as fallback
              const currentSectionTools = sectionTools[section.title] || SAMPLE_SECTION_TOOLS[section.title] || {};

              const sectionContent = (
                <MemoSection key={section.title} title={section.title} index={index}>
                  {/* Section Score Card - Premium Only */}
                  {hasPremium && currentSectionTools?.sectionScore && (
                    <SectionScoreCard
                      sectionName={section.title}
                      score={currentSectionTools.sectionScore}
                    />
                  )}

                  {/* Hero Statement - always visible */}
                  {heroParagraph && (
                    <MemoHeroStatement text={heroParagraph.text} />
                  )}

                  {/* VC Framing Explanation - Educational context for why we wrote it this way */}
                  <VCFramingExplainerCard sectionTitle={section.title} />

                  {/* Company Overview - collapsible, default open */}
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
                      {/* Show MemoTeamList if we have extracted members */}
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
                      {/* MemoTeamGapCard - uses tool data as priority, falls back to extracted */}
                      <MemoTeamGapCard 
                        teamMembers={extractedTeamMembers}
                        stage={companyInfo?.stage || 'Pre-seed'}
                        companyName={companyInfo?.name || 'Company'}
                        credibilityToolData={currentSectionTools?.credibilityGapAnalysis}
                      />
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

                  {/* Section Benchmarks - Premium Only */}
                  {hasPremium && currentSectionTools?.benchmarks && (
                    <SectionBenchmarks
                      sectionName={section.title}
                      benchmarks={currentSectionTools.benchmarks}
                    />
                  )}

                  {/* Micro Case Study - Premium Only */}
                  {hasPremium && currentSectionTools?.caseStudy && (
                    <MicroCaseStudyCard caseStudy={currentSectionTools.caseStudy} />
                  )}

                  {/* VC Perspective - Full details for premium users */}
                  {section.vcReflection && (
                    hasPremium ? (
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
                    ) : (
                      <MemoCollapsibleVC vcReflection={section.vcReflection} defaultOpen={true} />
                    )
                  )}

                  {/* VC Investment Logic Card - Premium Only */}
                  {hasPremium && currentSectionTools?.vcInvestmentLogic && (
                    <VCInvestmentLogicCard
                      sectionName={safeTitle(section.title)}
                      logic={currentSectionTools.vcInvestmentLogic}
                    />
                  )}

                  {/* 90-Day Action Plan - Premium Only */}
                  {hasPremium && currentSectionTools?.actionPlan90Day && (
                    <Section90DayPlan
                      sectionName={safeTitle(section.title)}
                      plan={currentSectionTools.actionPlan90Day}
                    />
                  )}

                  {/* Lead Investor Requirements - Premium Only */}
                  {hasPremium && currentSectionTools?.leadInvestorRequirements && (
                    <LeadInvestorCard
                      sectionName={safeTitle(section.title)}
                      requirements={currentSectionTools.leadInvestorRequirements}
                    />
                  )}
                </MemoSection>
              );

              return sectionContent;
            });
          })()}
        </div>
        )}
      </div>
    </div>
  );
}
