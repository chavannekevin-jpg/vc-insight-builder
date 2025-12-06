import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoParagraph } from "@/components/memo/MemoParagraph";
import { MemoKeyPoints } from "@/components/memo/MemoKeyPoints";
import { MemoHighlight } from "@/components/memo/MemoHighlight";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { SmartFillModal } from "@/components/SmartFillModal";
import { MemoLoadingScreen } from "@/components/MemoLoadingScreen";
import { ArrowLeft, RefreshCw, Printer, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent } from "@/types/memo";
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
  
  // Smart fill state
  const [showSmartFill, setShowSmartFill] = useState(false);
  const [smartQuestions, setSmartQuestions] = useState<SmartQuestion[]>([]);
  const [smartSummary, setSmartSummary] = useState("");
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [pendingGeneration, setPendingGeneration] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const analyzeAndPrepare = async (companyId: string): Promise<boolean> => {
    setAnalyzing(true);
    try {
      // Step 1: Analyze data gaps
      const { data: gapData, error: gapError } = await supabase.functions.invoke('analyze-data-gaps', {
        body: { companyId }
      });

      if (gapError) {
        console.error('Gap analysis error:', gapError);
        // Don't block - proceed with generation
        return true;
      }

      console.log('Gap analysis result:', gapData);
      setGapAnalysis(gapData.analysis);

      // If memo readiness is below 70%, generate smart questions
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
          // Don't block - proceed with generation
          return true;
        }

        if (questionData.questions && questionData.questions.length > 0) {
          setSmartQuestions(questionData.questions);
          setSmartSummary(questionData.summary);
          setShowSmartFill(true);
          return false; // Don't proceed with generation yet
        }
      }

      return true; // Proceed with generation
    } catch (error) {
      console.error('Error in analyzeAndPrepare:', error);
      return true; // Don't block on errors
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // Check premium status before showing memo
      const { data: company, error: premiumError } = await supabase
        .from("companies")
        .select("has_premium")
        .eq("id", companyId)
        .maybeSingle();

      if (premiumError || !company?.has_premium) {
        toast({
          title: "Premium Access Required",
          description: "Complete your purchase to view your investment memo",
          variant: "default"
        });
        navigate(`/checkout-memo?companyId=${companyId}`);
        return;
      }

      // Fetch the memo
      try {
        const { data: memo, error: memoError } = await supabase
          .from("memos")
          .select("structured_content, company_id")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (memoError) throw memoError;

        // Check if memo has actual content (non-empty sections)
        const hasContent = memo?.structured_content && 
                          (memo.structured_content as any).sections && 
                          Array.isArray((memo.structured_content as any).sections) && 
                          (memo.structured_content as any).sections.length > 0;

        if (!hasContent) {
          // No memo exists - analyze gaps before generating
          console.log("GeneratedMemo: No existing memo found, analyzing data gaps...");
          
          const shouldProceed = await analyzeAndPrepare(companyId);
          
          if (shouldProceed) {
            await generateMemo(companyId);
          } else {
            // Smart fill modal will show, mark as pending
            setPendingGeneration(true);
            setLoading(false);
          }
        } else {
          // Memo exists with content, fetch company info
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
      console.log("Generating memo...");
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId: companyIdToGenerate, force }
      });

      if (functionError) {
        console.error("GeneratedMemo: Edge function error:", functionError);
        throw new Error(
          functionError.message === "Not Found" || functionError.status === 404
            ? "Memo generation service is currently unavailable. Please try again in a moment."
            : functionError.message || "Failed to generate memo"
        );
      }

      if (!functionData || !functionData.structuredContent) {
        throw new Error("No structured content returned from generation");
      }

      setMemoContent(functionData.structuredContent);
      setCompanyInfo(functionData.company);
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
    
    // Set a timeout to warn user if it's taking too long
    const warningTimeout = setTimeout(() => {
      toast({
        title: "Still Processing",
        description: "This may take 60-90 seconds as we generate all sections with critical analysis...",
      });
    }, 10000);
    
    try {
      console.log("Regenerating memo with force=true...");
      const startTime = Date.now();
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId, force: true }
      });

      clearTimeout(warningTimeout);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Memo regeneration completed in ${duration}s`);

      if (functionError) {
        console.error("GeneratedMemo: Regenerate function error:", functionError);
        throw new Error(
          functionError.message === "Not Found" || functionError.status === 404
            ? "Memo generation service (404). The edge function may not be deployed yet."
            : functionError.message || "Failed to regenerate memo"
        );
      }

      if (!functionData || !functionData.structuredContent) {
        throw new Error("No structured content returned from function");
      }

      setMemoContent(functionData.structuredContent);
      setCompanyInfo(functionData.company);
      
      toast({
        title: "Success",
        description: `Memo regenerated with critical VC analysis in ${duration}s`
      });
    } catch (error: any) {
      clearTimeout(warningTimeout);
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
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
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
                className="min-w-[160px]"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="min-w-[200px]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Regenerating (60-90s)...' : 'Regenerate Memo'}
              </Button>
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg">
            <h1 className="text-4xl font-display font-bold mb-4 text-foreground">
              {companyInfo.name}
            </h1>
            {companyInfo.description && (
              <p className="text-lg text-muted-foreground mb-4">{companyInfo.description}</p>
            )}
            <div className="flex gap-3">
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

        {/* Memo Sections */}
        <div className="space-y-8">
          {memoContent.sections.map((section, index) => {
            // Support both new format (narrative/vcReflection) and legacy format (direct properties)
            const narrative = section.narrative || {
              paragraphs: section.paragraphs,
              highlights: section.highlights,
              keyPoints: section.keyPoints
            };

            return (
              <MemoSection key={section.title} title={section.title} index={index}>
                {/* Narrative Content */}
                <div className="space-y-4">
                  {narrative.paragraphs?.map((para, i) => (
                    <MemoParagraph key={i} text={para.text} emphasis={para.emphasis} />
                  ))}
                </div>

                {narrative.highlights && narrative.highlights.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {narrative.highlights.map((highlight, i) => (
                      <MemoHighlight key={i} metric={highlight.metric} label={highlight.label} />
                    ))}
                  </div>
                )}

                {narrative.keyPoints && narrative.keyPoints.length > 0 && (
                  <MemoKeyPoints points={narrative.keyPoints} />
                )}

                {/* VC Reflection Content */}
                {section.vcReflection && (
                  <>
                    {section.vcReflection.analysis && (
                      <MemoVCReflection text={section.vcReflection.analysis} />
                    )}
                    {section.vcReflection.questions && section.vcReflection.questions.length > 0 && (
                      <MemoVCQuestions questions={section.vcReflection.questions} />
                    )}
                    {section.vcReflection.benchmarking && (
                      <MemoBenchmarking text={section.vcReflection.benchmarking} />
                    )}
                    {section.vcReflection.conclusion && (
                      <MemoAIConclusion text={section.vcReflection.conclusion} />
                    )}
                  </>
                )}
              </MemoSection>
            );
          })}
        </div>
      </div>
    </div>
  );
}
