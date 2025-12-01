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
import { Sparkles, ArrowLeft, RefreshCw, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MemoStructuredContent } from "@/types/memo";
import { Button } from "@/components/ui/button";

export default function GeneratedMemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [memoContent, setMemoContent] = useState<MemoStructuredContent | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  const handlePrint = () => {
    window.print();
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
          // No memo or empty memo exists, generate one
          console.log("GeneratedMemo: No existing memo found, generating new one...");
          const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-full-memo', {
            body: { companyId }
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
        } else {
          // Memo exists with content, fetch company info
          const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .maybeSingle();

          if (companyError) throw companyError;

          setMemoContent(memo.structured_content as unknown as MemoStructuredContent);
          setCompanyInfo(company);
        }
      } catch (error: any) {
        console.error("GeneratedMemo: Error loading memo:", error);
        toast({
          title: "Error Loading Memo",
          description: error?.message || "Failed to load memo. Please try again.",
          variant: "destructive"
        });
        // Stay on page but show error state
      }
      
      setLoading(false);
    };
    init();
  }, [companyId, navigate]);

  const handleRegenerate = async () => {
    if (!companyId) return;
    
    setRegenerating(true);
    
    // Set a timeout to warn user if it's taking too long
    const warningTimeout = setTimeout(() => {
      toast({
        title: "Still Processing",
        description: "This may take 60-90 seconds as we generate all sections with critical analysis...",
      });
    }, 10000); // Warn after 10 seconds
    
    try {
      console.log("Regenerating memo with force=true and new critical prompts...");
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
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        details: error?.details || error
      });
      
      toast({
        title: "Error",
        description: error?.message || "Failed to regenerate memo. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground">Loading your investment memo...</p>
      </div>
    );
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
