import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoCollapsibleVC } from "@/components/memo/MemoCollapsibleVC";
import { MemoNavigation } from "@/components/memo/MemoNavigation";
import { SmartFillModal } from "@/components/SmartFillModal";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { LockedSectionOverlay } from "@/components/memo/LockedSectionOverlay";
import { UnlockMemoCTA } from "@/components/memo/UnlockMemoCTA";
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
import { extractMoatScores, extractTeamMembers, extractUnitEconomics } from "@/lib/memoDataExtractor";
import { ArrowLeft, RefreshCw, Printer, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent, MemoParagraph } from "@/types/memo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);
  
  // Smart fill state
  const [showSmartFill, setShowSmartFill] = useState(false);
  const [smartQuestions, setSmartQuestions] = useState<SmartQuestion[]>([]);
  const [smartSummary, setSmartSummary] = useState("");
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  
  // VC Rejection Preview state
  const [showRejectionPreview, setShowRejectionPreview] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);

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
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .maybeSingle();

          if (companyError) throw companyError;

          setMemoContent(memo.structured_content as unknown as MemoStructuredContent);
          setCompanyInfo(companyData);
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
  }, [companyId, navigate]);

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
      const maxPolls = 60; // 5 minutes max
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
          // Continue polling on error
          continue;
        }

        if (statusData.status === "completed") {
          console.log("Memo generation completed!");
          setMemoContent(statusData.structuredContent);
          setCompanyInfo(statusData.company);
          
          // Show rejection preview for non-premium users after generation
          if (!hasPremium && statusData.structuredContent?.vcQuickTake) {
            setShowRejectionPreview(true);
          }
          return;
        }

        if (statusData.status === "failed") {
          throw new Error(statusData.error || "Memo generation failed");
        }

        // Still processing - update could show progress message
        console.log(`Job status: ${statusData.status}, elapsed: ${statusData.elapsedSeconds}s - ${statusData.message}`);
      }

      // Timeout reached
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
      const maxPolls = 60;
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
          console.log(`Memo regeneration completed in ${duration}s`);
          
          setMemoContent(statusData.structuredContent);
          setCompanyInfo(statusData.company);
          
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

  // Handlers for VC Rejection Preview
  const handlePreviewMemo = () => {
    setShowRejectionPreview(false);
  };

  const handleGetFullMemo = () => {
    setShowRejectionPreview(false);
    navigate(`/checkout-memo?companyId=${companyId}`);
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
          onPreviewMemo={handlePreviewMemo}
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
              
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={regenerating}
                size="sm"
                className="md:min-w-[200px]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
                <span className="sm:hidden">{regenerating ? '...' : 'Regen'}</span>
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

        {/* VC Quick Take - Always visible for all users, with teaser for free users */}
        {memoContent.vcQuickTake && (
          <div data-section="quick-take">
            <MemoVCQuickTake quickTake={memoContent.vcQuickTake} showTeaser={!hasPremium} />
          </div>
        )}

        {/* Memo Sections */}
        <div className="space-y-8">
          {(() => {
            let exitPathShown = false;
            
            return memoContent.sections.map((section, index) => {
              const narrative = section.narrative || {
                paragraphs: section.paragraphs,
                highlights: section.highlights,
                keyPoints: section.keyPoints
              };

              // Section type detection
              const isTeamSection = section.title.toLowerCase().includes('team');
              const isMarketSection = section.title.toLowerCase().includes('market');
              const isCompetitionSection = section.title.toLowerCase().includes('competition');
              const isBusinessSection = section.title.toLowerCase().includes('business');
              const isThesisSection = section.title.toLowerCase().includes('thesis');
              const isVisionSection = section.title.toLowerCase().includes('vision');
              
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

              const sectionContent = (
                <MemoSection key={section.title} title={section.title} index={index}>
                  {/* Hero Statement - always visible */}
                  {heroParagraph && (
                    <MemoHeroStatement text={heroParagraph.text} />
                  )}

                  {/* Company Overview - collapsible, default open */}
                  <MemoCollapsibleOverview
                    paragraphs={otherParagraphs}
                    highlights={narrative.highlights}
                    keyPoints={narrative.keyPoints}
                    defaultOpen={true}
                  />

                  {/* Strategic Cards - Premium Only */}
                  {hasPremium && (
                    <>
                      {/* Team Section Cards */}
                      {isTeamSection && extractedTeamMembers.length > 0 && (
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

                      {/* Market Section - VC Scale Card */}
                      {isMarketSection && (
                        <MemoVCScaleCard 
                          avgMonthlyRevenue={100}
                          currentCustomers={0}
                          currentMRR={0}
                          companyName={companyInfo?.name || 'Company'}
                          category={companyInfo?.category || 'Technology'}
                        />
                      )}

                      {/* Competition Section - Moat Score Card */}
                      {isCompetitionSection && extractedMoatScores && (
                        <MemoMoatScoreCard 
                          moatScores={extractedMoatScores}
                          companyName={companyInfo?.name || 'Company'}
                        />
                      )}

                      {/* Business Model Section - Unit Economics Card */}
                      {isBusinessSection && extractedUnitEconomics && (
                        <MemoUnitEconomicsCard 
                          unitEconomics={extractedUnitEconomics}
                          companyName={companyInfo?.name || 'Company'}
                        />
                      )}

                      {/* Vision/Thesis Section - Exit Path Card (shown once) */}
                      {showExitPath && (
                        <MemoExitPathCard 
                          exitData={{
                            category: companyInfo?.category || 'Technology',
                            revenueMultiple: { low: 5, mid: 10, high: 15 }
                          }}
                          companyName={companyInfo?.name || 'Company'}
                        />
                      )}
                    </>
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
                </MemoSection>
              );

              // First section (Problem) + Quick Take is always visible
              if (index === 0) {
                return (
                  <div key={section.title}>
                    {sectionContent}
                    {/* Show CTA after Problem section if not premium */}
                    {!hasPremium && <UnlockMemoCTA />}
                  </div>
                );
              }

              // Remaining sections: blur if not premium
              if (!hasPremium) {
                return (
                  <LockedSectionOverlay key={section.title} sectionTitle={section.title}>
                    {sectionContent}
                  </LockedSectionOverlay>
                );
              }

              return sectionContent;
            });
          })()}
        </div>
      </div>
    </div>
  );
}
