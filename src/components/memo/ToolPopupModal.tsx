import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { TOOL_CONFIGS } from "@/lib/toolConfig";

// Import all tool components
import {
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
  VisionExitNarrativeCard,
  VCInvestmentLogicCard,
  Section90DayPlan,
  MicroCaseStudyCard,
  LeadInvestorCard,
  SectionBenchmarks
} from "./tools";

interface ToolPopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolType: string;
  toolData: any;
  sectionName: string;
}

// Helper to wrap raw data in EditableTool shape if needed
const wrapInEditableToolShape = (data: any): any => {
  if (!data) return null;
  
  // If it already has aiGenerated, return as-is
  if (data.aiGenerated !== undefined) {
    return data;
  }
  
  // Wrap raw data in EditableTool shape
  return {
    aiGenerated: data,
    userOverrides: null,
    dataSource: 'ai-complete' as const
  };
};

// Map tool IDs to their component renderers
// Some tools need EditableTool shape, others take raw data
const TOOL_COMPONENTS: Record<string, (data: any, sectionName: string) => React.ReactNode> = {
  // EditableTool components - need wrapping
  evidenceThreshold: (data) => <ProblemEvidenceThreshold data={wrapInEditableToolShape(data)} />,
  founderBlindSpot: (data) => <ProblemFounderBlindSpot data={wrapInEditableToolShape(data)} />,
  technicalDefensibility: (data) => <SolutionTechnicalDefensibility data={wrapInEditableToolShape(data)} />,
  commoditizationTeardown: (data) => <SolutionCommoditizationTeardown data={wrapInEditableToolShape(data)} />,
  competitorBuildAnalysis: (data) => <SolutionCompetitorBuildAnalysis data={wrapInEditableToolShape(data)} />,
  bottomsUpTAM: (data) => <MarketTAMCalculator data={wrapInEditableToolShape(data)} />,
  marketReadinessIndex: (data) => <MarketReadinessIndexCard data={wrapInEditableToolShape(data)} />,
  vcMarketNarrative: (data) => <MarketVCNarrativeCard data={wrapInEditableToolShape(data)} />,
  competitorChessboard: (data) => <CompetitionChessboardCard data={wrapInEditableToolShape(data)} />,
  moatDurability: (data) => <CompetitionMoatDurabilityCard data={wrapInEditableToolShape(data)} />,
  credibilityGapAnalysis: (data) => <TeamCredibilityGapCard data={wrapInEditableToolShape(data)} />,
  modelStressTest: (data) => <BusinessModelStressTestCard data={wrapInEditableToolShape(data)} />,
  tractionDepthTest: (data) => <TractionDepthTestCard data={wrapInEditableToolShape(data)} />,
  vcMilestoneMap: (data) => <VisionMilestoneMapCard data={wrapInEditableToolShape(data)} />,
  scenarioPlanning: (data) => <VisionScenarioPlanningCard data={wrapInEditableToolShape(data)} />,
  exitNarrative: (data) => <VisionExitNarrativeCard data={wrapInEditableToolShape(data)} />,
  
  // Non-EditableTool components - pass data directly
  vcInvestmentLogic: (data, sectionName) => <VCInvestmentLogicCard logic={data} sectionName={sectionName} />,
  actionPlan90Day: (data, sectionName) => <Section90DayPlan plan={data} sectionName={sectionName} />,
  caseStudy: (data) => <MicroCaseStudyCard caseStudy={data} />,
  leadInvestorRequirements: (data, sectionName) => <LeadInvestorCard requirements={data} sectionName={sectionName} />,
  benchmarks: (data, sectionName) => <SectionBenchmarks benchmarks={Array.isArray(data) ? data : []} sectionName={sectionName} />
};

export const ToolPopupModal = ({
  open,
  onOpenChange,
  toolType,
  toolData,
  sectionName
}: ToolPopupModalProps) => {
  const config = TOOL_CONFIGS[toolType];
  const Icon = config?.icon;
  
  const renderTool = () => {
    const renderer = TOOL_COMPONENTS[toolType];
    if (!renderer || !toolData) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Tool data not available</p>
          <p className="text-xs mt-2">Tool: {toolType}</p>
        </div>
      );
    }
    return renderer(toolData, sectionName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {config?.title || toolType}
                </DialogTitle>
                {config?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                )}
                {sectionName && (
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">
                    {sectionName}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="p-6">
            {renderTool()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
