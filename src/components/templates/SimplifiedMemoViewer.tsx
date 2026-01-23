import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Users,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Rocket,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SimplifiedMemoSection {
  title: string;
  narrative?: string;
  keyPoints?: string[];
}

export interface SectionToolData {
  sectionScore?: number;
  vcInvestmentLogic?: {
    primaryQuestions: string[];
    keyMetrics: string[];
    redFlags: string[];
    greenFlags: string[];
  };
  actionPlan90Day?: {
    milestones: Array<{
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }>;
  };
  benchmarks?: {
    metrics: Array<{
      label: string;
      yourValue: string;
      benchmark: string;
      status: "above" | "at" | "below";
    }>;
  };
}

export interface HolisticVerdict {
  verdict: string;
  stageContext: string;
}

export interface ActionPlanItem {
  id: string;
  category: string;
  priority: "critical" | "high" | "medium";
  problem: string;
  impact: string;
  howToFix: string;
}

export interface AIActionPlan {
  summaryLine: string;
  items: ActionPlanItem[];
}

export interface SimplifiedMemoViewerProps {
  companyName: string;
  companyDescription?: string;
  heroStatement?: string;
  sections: SimplifiedMemoSection[];
  sectionTools?: Record<string, SectionToolData>;
  holisticVerdicts?: Record<string, HolisticVerdict>;
  aiActionPlan?: AIActionPlan;
  onBack?: () => void;
  showBackButton?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const sectionIcons: Record<string, React.ElementType> = {
  Problem: AlertTriangle,
  Solution: Lightbulb,
  Market: Target,
  Competition: Shield,
  Team: Users,
  "Business Model": DollarSign,
  Traction: BarChart3,
  Vision: Rocket,
};

export const getScoreColor = (score: number): string => {
  if (score >= 70) return "text-primary";
  if (score >= 55) return "text-amber-500";
  return "text-destructive";
};

export const getScoreBg = (score: number): string => {
  if (score >= 70) return "bg-primary/10 border-primary/30";
  if (score >= 55) return "bg-amber-500/10 border-amber-500/30";
  return "bg-destructive/10 border-destructive/30";
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "high":
      return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "medium":
      return "bg-primary/10 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SectionNavBarProps {
  sections: SimplifiedMemoSection[];
  sectionTools?: Record<string, SectionToolData>;
}

const SectionNavBar = ({ sections, sectionTools }: SectionNavBarProps) => (
  <div className="flex flex-wrap gap-2 mb-8">
    {sections.map((section) => {
      const score = sectionTools?.[section.title]?.sectionScore;
      return (
        <Badge
          key={section.title}
          variant="outline"
          className={cn(
            "cursor-pointer hover:bg-accent transition-colors",
            score && getScoreBg(score)
          )}
          onClick={() => {
            document
              .getElementById(`section-${section.title}`)
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {section.title}
          {score && (
            <span className={cn("ml-1 font-bold", getScoreColor(score))}>
              {score}
            </span>
          )}
        </Badge>
      );
    })}
  </div>
);

interface ExpandableToolsProps {
  title: string;
  tools: SectionToolData;
  expanded: boolean;
  onToggle: () => void;
}

const ExpandableTools = ({ title, tools, expanded, onToggle }: ExpandableToolsProps) => (
  <div className="mt-4">
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="w-full justify-between text-muted-foreground hover:text-foreground"
    >
      <span className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Strategic Analysis Tools
      </span>
      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>

    {expanded && (
      <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted">
        {/* VC Investment Logic */}
        {tools.vcInvestmentLogic && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">VC Investment Logic</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Primary Questions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {tools.vcInvestmentLogic.primaryQuestions.map((q, i) => (
                    <li key={i} className="text-foreground/80">{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Key Metrics:</p>
                <ul className="list-disc list-inside space-y-1">
                  {tools.vcInvestmentLogic.keyMetrics.map((m, i) => (
                    <li key={i} className="text-foreground/80">{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <p className="text-destructive mb-1">Red Flags:</p>
                <ul className="list-disc list-inside space-y-1">
                  {tools.vcInvestmentLogic.redFlags.map((f, i) => (
                    <li key={i} className="text-foreground/80">{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-primary mb-1">Green Flags:</p>
                <ul className="list-disc list-inside space-y-1">
                  {tools.vcInvestmentLogic.greenFlags.map((f, i) => (
                    <li key={i} className="text-foreground/80">{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 90-Day Action Plan */}
        {tools.actionPlan90Day && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">90-Day Action Plan</h5>
            <div className="space-y-2">
              {tools.actionPlan90Day.milestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0",
                      milestone.priority === "high" && "border-destructive/30 text-destructive",
                      milestone.priority === "medium" && "border-amber-500/30 text-amber-500",
                      milestone.priority === "low" && "border-primary/30 text-primary"
                    )}
                  >
                    {milestone.priority}
                  </Badge>
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarks */}
        {tools.benchmarks && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Industry Benchmarks</h5>
            <div className="grid gap-2">
              {tools.benchmarks.metrics.map((metric, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-muted/30 rounded px-3 py-2">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{metric.yourValue}</span>
                    <span className="text-muted-foreground">vs {metric.benchmark}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        metric.status === "above" && "border-primary/30 text-primary",
                        metric.status === "at" && "border-amber-500/30 text-amber-500",
                        metric.status === "below" && "border-destructive/30 text-destructive"
                      )}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

interface ActionPlanSectionProps {
  actionPlan: AIActionPlan;
}

const ActionPlanSection = ({ actionPlan }: ActionPlanSectionProps) => {
  // Start with all items collapsed by default
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card className="mb-8 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          AI Action Plan
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{actionPlan.summaryLine}</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {actionPlan.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/30",
                expandedItems.has(item.id) && "bg-muted/20"
              )}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Badge className={cn("shrink-0", getPriorityColor(item.priority))}>
                    {item.priority}
                  </Badge>
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.problem}</p>
                  </div>
                </div>
                {expandedItems.has(item.id) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>

              {expandedItems.has(item.id) && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div>
                    <p className="text-sm font-medium text-amber-500">Impact</p>
                    <p className="text-sm text-muted-foreground">{item.impact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">How to Fix</p>
                    <p className="text-sm text-muted-foreground">{item.howToFix}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SimplifiedMemoViewer({
  companyName,
  companyDescription,
  heroStatement,
  sections,
  sectionTools = {},
  holisticVerdicts = {},
  aiActionPlan,
  onBack,
  showBackButton = true,
}: SimplifiedMemoViewerProps) {
  // Start with all sections collapsed by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  // Calculate overall score
  const sectionScores = Object.values(sectionTools)
    .map((t) => t.sectionScore)
    .filter((s): s is number => s !== undefined);
  const overallScore =
    sectionScores.length > 0
      ? Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length)
      : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Button */}
      {showBackButton && onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{companyName}</h1>
            {companyDescription && (
              <p className="text-muted-foreground mt-2">{companyDescription}</p>
            )}
          </div>
          {overallScore !== null && (
            <div
              className={cn(
                "text-center px-6 py-4 rounded-xl border-2",
                getScoreBg(overallScore)
              )}
            >
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <p className={cn("text-4xl font-bold", getScoreColor(overallScore))}>
                {overallScore}
              </p>
            </div>
          )}
        </div>

        {heroStatement && (
          <Card className="mt-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg font-medium italic text-center">"{heroStatement}"</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section Navigation */}
      <SectionNavBar sections={sections} sectionTools={sectionTools} />

      {/* AI Action Plan */}
      {aiActionPlan && <ActionPlanSection actionPlan={aiActionPlan} />}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => {
          const Icon = sectionIcons[section.title] || Target;
          const tools = sectionTools[section.title];
          const verdict = holisticVerdicts[section.title];
          const score = tools?.sectionScore;

          return (
            <Card
              key={section.title}
              id={`section-${section.title}`}
              className="overflow-hidden"
            >
              {/* Section Header */}
              <CardHeader
                className={cn(
                  "border-b border-border",
                  score && score >= 70 && "bg-primary/5",
                  score && score >= 55 && score < 70 && "bg-amber-500/5",
                  score && score < 55 && "bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      {verdict && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {verdict.verdict}
                        </p>
                      )}
                    </div>
                  </div>
                  {score !== undefined && (
                    <div className={cn("text-3xl font-bold", getScoreColor(score))}>
                      {score}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* VC Perspective */}
                {verdict && (
                  <div className="bg-muted/30 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      VC Perspective
                    </p>
                    <p className="italic text-sm">{verdict.stageContext}</p>
                  </div>
                )}

                {/* Narrative */}
                {section.narrative && (
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {section.narrative}
                  </p>
                )}

                {/* Key Points */}
                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="font-medium text-sm">Key Takeaways</p>
                    <ul className="space-y-2">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Expandable Tools */}
                {tools && (
                  <ExpandableTools
                    title={section.title}
                    tools={tools}
                    expanded={expandedSections.has(section.title)}
                    onToggle={() => toggleSection(section.title)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SimplifiedMemoViewer;
