import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DemoSidebar } from "@/components/demo/DemoSidebar";
import { SimplifiedMemoViewer } from "@/components/templates/SimplifiedMemoViewer";
import type { SectionToolData } from "@/components/templates/SimplifiedMemoViewer";
import { VCMemoExplainerModal, useVCMemoExplainer } from "@/components/memo/VCMemoExplainerModal";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { DemoFloatingCTA } from "@/components/demo/DemoFloatingCTA";

// Import demo data
import { DEMO_COMPANY } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";

/**
 * DemoVCMemorandum - A simplified one-page investment memo for the demo environment
 * Uses the exact same SimplifiedMemoViewer template as defined in admin/templates/simplified-memo
 */
export default function DemoVCMemorandum() {
  const navigate = useNavigate();
  const memoData = getDemoMemo("demo-signalflow");
  const { showExplainer, isChecked: explainerChecked, completeExplainer } = useVCMemoExplainer();

  // Transform DEMO_SECTION_TOOLS to match SectionToolData interface expected by SimplifiedMemoViewer
  const transformedTools: Record<string, SectionToolData> = {};
  
  Object.entries(DEMO_SECTION_TOOLS).forEach(([sectionTitle, tools]) => {
    const typedTools = tools as any;
    transformedTools[sectionTitle] = {
      sectionScore: typedTools.sectionScore?.score,
      vcInvestmentLogic: typedTools.vcInvestmentLogic ? {
        primaryQuestions: typedTools.vcInvestmentLogic.primaryQuestions || [],
        keyMetrics: typedTools.vcInvestmentLogic.keyMetrics || [],
        redFlags: typedTools.vcInvestmentLogic.redFlags || [],
        greenFlags: typedTools.vcInvestmentLogic.greenFlags || [],
      } : undefined,
      actionPlan90Day: typedTools.actionPlan90Day ? {
        milestones: (typedTools.actionPlan90Day.actions || []).map((action: any) => ({
          title: action.action || action.title,
          description: action.metric || action.description || '',
          priority: action.priority === 'critical' ? 'high' : 
                   action.priority === 'important' ? 'medium' : 
                   action.priority === 'nice-to-have' ? 'low' : 'medium',
        })),
      } : undefined,
      benchmarks: typedTools.benchmarks ? {
        metrics: (typedTools.benchmarks || []).map((bm: any) => ({
          label: bm.metric || bm.label,
          yourValue: bm.yourValue || '',
          benchmark: bm.benchmark || '',
          status: bm.percentile?.includes('Top') ? 'above' as const : 'at' as const,
        })),
      } : undefined,
    };
  });

  // Transform AI action plan
  const aiActionPlan = memoData?.aiActionPlan ? {
    summaryLine: memoData.aiActionPlan.summaryLine || '',
    items: memoData.aiActionPlan.items?.map((item: any) => ({
      id: item.id,
      category: item.category,
      priority: item.priority <= 1 ? 'critical' as const : 
               item.priority <= 3 ? 'high' as const : 'medium' as const,
      problem: item.problem,
      impact: item.impact,
      howToFix: item.howToFix,
    })) || [],
  } : undefined;

  return (
    <>
      {/* VC Memo Explainer Modal */}
      {explainerChecked && (
        <VCMemoExplainerModal 
          open={showExplainer} 
          onComplete={completeExplainer} 
        />
      )}
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <DemoSidebar currentPage="analysis" />
          
          <main className="flex-1 overflow-auto">
            <DemoBanner companyName={DEMO_COMPANY.name} />
            
            {/* Upgraded design wrapper */}
            <div className="relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative">
                <SimplifiedMemoViewer
                  companyName={DEMO_COMPANY.name}
                  companyDescription={DEMO_COMPANY.description}
                  heroStatement={memoData?.heroStatement || ""}
                  sections={memoData?.sections || []}
                  sectionTools={transformedTools}
                  holisticVerdicts={DEMO_HOLISTIC_VERDICTS}
                  aiActionPlan={aiActionPlan}
                  onBack={() => navigate('/demo')}
                  showBackButton={true}
                />
              </div>
            </div>
            
            <DemoFloatingCTA />
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
