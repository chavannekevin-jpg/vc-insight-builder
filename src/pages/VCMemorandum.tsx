import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimplifiedMemoViewer } from "@/components/templates/SimplifiedMemoViewer";
import type { SectionToolData, AIActionPlan, SimplifiedMemoSection, HolisticVerdict } from "@/components/templates/SimplifiedMemoViewer";
import { useMemoContent } from "@/hooks/useMemoContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, FileText, Sparkles, Loader2, BookOpen, ChevronRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VCMemoExplainerModal, useVCMemoExplainer } from "@/components/memo/VCMemoExplainerModal";
import { toast } from "sonner";

/**
 * VCMemorandum - A simplified one-page investment memo for paid users
 * Uses the exact same SimplifiedMemoViewer template as defined in admin/templates/simplified-memo
 * Only accessible after a user has generated an investment analysis
 */
export default function VCMemorandum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [hasMemoContent, setHasMemoContent] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { showExplainer, isChecked: explainerChecked, completeExplainer } = useVCMemoExplainer();
  
  const { data: memoContent, isLoading: memoLoading, refetch: refetchMemo } = useMemoContent(companyId);

  // Check if user has paid and has a memo
  useEffect(() => {
    async function checkAccess() {
      if (!companyId) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data: company } = await supabase
        .from("companies")
        .select("name, description, has_premium, memo_content_generated")
        .eq("id", companyId)
        .single();

      if (company) {
        setCompanyName(company.name || "Company");
        setCompanyDescription(company.description || "");
        setHasPremium(company.has_premium === true);
        setHasMemoContent(company.memo_content_generated === true);
        setHasAccess(company.has_premium === true && company.memo_content_generated === true);
      }
      
      setLoading(false);
    }
    
    checkAccess();
  }, [companyId]);

  // Handle memo generation for paid users without memo content
  const handleGenerateMemo = async () => {
    if (!companyId) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-full-memo', {
        body: { companyId }
      });

      if (error) throw error;

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const { data: job } = await supabase
          .from('memo_generation_jobs')
          .select('status')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (job?.status === 'completed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setHasMemoContent(true);
          setHasAccess(true);
          refetchMemo();
          toast.success("VC Memorandum generated successfully!");
        } else if (job?.status === 'failed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          toast.error("Failed to generate memo. Please try again.");
        }
      }, 2000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isGenerating) {
          setIsGenerating(false);
          toast.error("Generation timed out. Please try again.");
        }
      }, 300000);

    } catch (error) {
      console.error("Error generating memo:", error);
      setIsGenerating(false);
      toast.error("Failed to start memo generation");
    }
  };

  if (loading || memoLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Premium loading skeleton */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-4xl mx-auto py-12 px-6 space-y-8">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-2/3 rounded-xl" />
              <Skeleton className="h-6 w-1/2 rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paid user without memo - show generate option
  if (hasPremium && !hasMemoContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center justify-center min-h-screen p-8">
            <Card className="max-w-lg bg-card/80 backdrop-blur-2xl border-border/30 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Generate Your VC Memorandum</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Your investment analysis is ready to be transformed into the VC memo format.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Professional Format</p>
                      <p className="text-xs text-muted-foreground">
                        The same structure VCs use internally to evaluate deals
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Instant Generation</p>
                      <p className="text-xs text-muted-foreground">
                        Your memo will be ready in under a minute
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleGenerateMemo}
                    disabled={isGenerating}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Memo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate VC Memorandum
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/hub")}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess || !memoContent) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center justify-center min-h-screen p-8">
            <Card className="max-w-md bg-card/80 backdrop-blur-2xl border-border/30 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Access Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-center text-sm">
                  The VC Memorandum is only available after you've generated an investment analysis. 
                  Please complete your company profile and purchase an analysis to access this feature.
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate(companyId ? `/checkout-analysis?companyId=${companyId}` : "/checkout-analysis")}
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl font-semibold"
                  >
                    Get Analysis
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/hub")}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Transform memo content to SimplifiedMemoViewer format
  const sections: SimplifiedMemoSection[] = (memoContent.memoContent?.sections || []).map((section: any) => ({
    title: section.title,
    narrative: section.paragraphs?.map((p: any) => p.text).join(' ') || section.narrative || '',
    keyPoints: section.keyPoints || [],
  }));

  // Transform section tools
  const sectionTools: Record<string, SectionToolData> = {};
  
  if (memoContent.sectionTools) {
    Object.entries(memoContent.sectionTools).forEach(([sectionTitle, tools]) => {
      const typedTools = tools as any;
      sectionTools[sectionTitle] = {
        sectionScore: typedTools.sectionScore?.score,
        vcInvestmentLogic: typedTools.vcInvestmentLogic ? {
          primaryQuestions: typedTools.vcInvestmentLogic.primaryQuestions || [],
          keyMetrics: typedTools.vcInvestmentLogic.keyMetrics || [],
          redFlags: typedTools.vcInvestmentLogic.redFlags || [],
          greenFlags: typedTools.vcInvestmentLogic.greenFlags || [],
        } : undefined,
        actionPlan90Day: typedTools.actionPlan90Day ? {
          milestones: (typedTools.actionPlan90Day.actions || typedTools.actionPlan90Day.milestones || []).map((action: any) => ({
            title: action.action || action.title,
            description: action.metric || action.description || '',
            priority: action.priority === 'critical' ? 'high' : 
                     action.priority === 'important' ? 'medium' : 
                     action.priority === 'nice-to-have' ? 'low' : 'medium',
          })),
        } : undefined,
        benchmarks: typedTools.benchmarks ? {
          metrics: (Array.isArray(typedTools.benchmarks) ? typedTools.benchmarks : typedTools.benchmarks.metrics || []).map((bm: any) => ({
            label: bm.metric || bm.label,
            yourValue: bm.yourValue || '',
            benchmark: bm.benchmark || '',
            status: (bm.percentile?.includes('Top') || bm.status === 'above') ? 'above' as const : 
                   bm.status === 'below' ? 'below' as const : 'at' as const,
          })),
        } : undefined,
      };
    });
  }

  // Transform holistic verdicts
  const holisticVerdicts: Record<string, HolisticVerdict> = {};
  if (memoContent.holisticVerdicts) {
    Object.entries(memoContent.holisticVerdicts).forEach(([key, value]) => {
      const typedValue = value as any;
      holisticVerdicts[key] = {
        verdict: typedValue.verdict || '',
        stageContext: typedValue.stageContext || '',
      };
    });
  }

  // Transform action plan - derive from memoContent's sections or create empty
  let aiActionPlan: AIActionPlan | undefined;
  // Try to extract from any section tool's action plan
  const firstSectionWithPlan = Object.values(sectionTools).find(t => t.actionPlan90Day);
  if (firstSectionWithPlan?.actionPlan90Day) {
    aiActionPlan = {
      summaryLine: 'Focus on key areas identified in your analysis',
      items: firstSectionWithPlan.actionPlan90Day.milestones.slice(0, 5).map((m, index) => ({
        id: String(index),
        category: 'strategy',
        priority: m.priority === 'high' ? 'critical' as const : 
                 m.priority === 'medium' ? 'high' as const : 'medium' as const,
        problem: m.title,
        impact: 'Address to strengthen investment readiness',
        howToFix: m.description,
      })),
    };
  }

  // Get hero statement from VC quick take or first section
  const heroStatement = memoContent.memoContent?.vcQuickTake?.verdict || 
                        memoContent.memoContent?.vcQuickTake?.readinessRationale ||
                        memoContent.memoContent?.sections?.[0]?.paragraphs?.[0]?.text || '';

  return (
    <>
      {/* VC Memo Explainer Modal */}
      {explainerChecked && (
        <VCMemoExplainerModal 
          open={showExplainer} 
          onComplete={completeExplainer} 
        />
      )}
      
      {/* Upgraded design wrapper */}
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative">
            <SimplifiedMemoViewer
              companyName={companyName}
              companyDescription={companyDescription}
              heroStatement={heroStatement}
              sections={sections}
              sectionTools={sectionTools}
              holisticVerdicts={holisticVerdicts}
              aiActionPlan={aiActionPlan}
              onBack={() => navigate(`/analysis?companyId=${companyId}`)}
              showBackButton={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
