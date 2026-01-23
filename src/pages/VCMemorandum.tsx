import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SimplifiedMemoViewer } from "@/components/templates/SimplifiedMemoViewer";
import type { SectionToolData, AIActionPlan, SimplifiedMemoSection, HolisticVerdict } from "@/components/templates/SimplifiedMemoViewer";
import { useMemoContent } from "@/hooks/useMemoContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  
  const { data: memoContent, isLoading: memoLoading } = useMemoContent(companyId);

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
        setHasAccess(company.has_premium === true && company.memo_content_generated === true);
      }
      
      setLoading(false);
    }
    
    checkAccess();
  }, [companyId]);

  if (loading || memoLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!hasAccess || !memoContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The VC Memorandum is only available after you've generated an investment analysis. 
              Please complete your company profile and purchase an analysis to access this feature.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/hub")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate(companyId ? `/checkout-analysis?companyId=${companyId}` : "/checkout-analysis")}>
                Get Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
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
  );
}
