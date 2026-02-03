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
import { MemoAnchoredAssumptions } from "@/components/memo/MemoAnchoredAssumptions";
import type { AnchoredAssumptions } from "@/lib/anchoredAssumptions";

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
  anchoredAssumptions?: AnchoredAssumptions | null;
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

/**
 * Parses narrative text into readable paragraphs with proper spacing.
 * Splits on double newlines, periods followed by capital letters, or very long sentences.
 */
const parseNarrativeText = (text: string): string[] => {
  if (!text) return [];
  
  // First, normalize the text - remove markdown bold/italic markers
  let normalized = text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markers
    .replace(/\*([^*]+)\*/g, '$1')     // Remove italic markers
    .trim();
  
  // Split on double newlines first
  let paragraphs = normalized.split(/\n\n+/).filter(p => p.trim());
  
  // If we only have one paragraph and it's very long, try to split it intelligently
  if (paragraphs.length === 1 && paragraphs[0].length > 400) {
    const longText = paragraphs[0];
    
    // Try to split on sentence boundaries where a new topic might start
    // Look for patterns like ". The", ". This", ". However", etc.
    const sentenceSplitPattern = /(?<=[.!?])\s+(?=[A-Z](?:he|his|hey|here|owever|oreover|dditionally|urthermore|n\s|t\s|s\s))/g;
    
    const sentences = longText.split(sentenceSplitPattern);
    
    if (sentences.length > 1) {
      // Group sentences into paragraphs of roughly 2-3 sentences each
      paragraphs = [];
      let currentParagraph = '';
      let sentenceCount = 0;
      
      sentences.forEach((sentence, index) => {
        currentParagraph += (currentParagraph ? ' ' : '') + sentence.trim();
        sentenceCount++;
        
        // Create a new paragraph every 2-3 sentences or if current is getting long
        if (sentenceCount >= 2 && (currentParagraph.length > 300 || index === sentences.length - 1)) {
          paragraphs.push(currentParagraph);
          currentParagraph = '';
          sentenceCount = 0;
        }
      });
      
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
      }
    }
  }
  
  // If still just one long paragraph, split by sentences more aggressively
  if (paragraphs.length === 1 && paragraphs[0].length > 500) {
    const text = paragraphs[0];
    const allSentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    paragraphs = [];
    let currentParagraph = '';
    
    allSentences.forEach((sentence, index) => {
      currentParagraph += sentence;
      
      // Create paragraph every 2-3 sentences
      if ((index + 1) % 3 === 0 || index === allSentences.length - 1) {
        paragraphs.push(currentParagraph.trim());
        currentParagraph = '';
      }
    });
    
    if (currentParagraph) {
      paragraphs.push(currentParagraph.trim());
    }
  }
  
  return paragraphs.filter(p => p.trim().length > 0);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SectionNavBarProps {
  sections: SimplifiedMemoSection[];
  sectionTools?: Record<string, SectionToolData>;
}

const SectionNavBar = ({ sections, sectionTools }: SectionNavBarProps) => (
  <div className="flex flex-wrap gap-3 mb-10 p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/20">
    {sections.map((section) => {
      const score = sectionTools?.[section.title]?.sectionScore;
      return (
        <Badge
          key={section.title}
          variant="outline"
          className={cn(
            "cursor-pointer transition-all duration-200 hover:scale-105 px-4 py-2 text-sm rounded-xl backdrop-blur-sm",
            score && score >= 70 && "border-primary/40 bg-primary/10 hover:bg-primary/20",
            score && score >= 55 && score < 70 && "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20",
            score && score < 55 && "border-destructive/40 bg-destructive/10 hover:bg-destructive/20",
            !score && "border-border/40 hover:bg-muted/50"
          )}
          onClick={() => {
            document
              .getElementById(`section-${section.title}`)
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {section.title}
          {score && (
            <span className={cn("ml-2 font-bold", getScoreColor(score))}>
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
      className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl py-3"
    >
      <span className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-medium">Strategic Analysis Tools</span>
      </span>
      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>

    {expanded && (
      <div className="mt-6 space-y-8 pl-5 border-l-2 border-primary/20">
        {/* VC Investment Logic */}
        {tools.vcInvestmentLogic && (
          <div className="space-y-4">
            <h5 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">VC Investment Logic</h5>
            <p className="text-sm text-muted-foreground bg-muted/20 backdrop-blur-sm rounded-xl p-4 italic border border-border/20">
              This tool reveals how venture capitalists evaluate this specific section. It highlights the key questions investors ask, the metrics they track, and the signals (both positive and negative) that influence their investment decisions.
            </p>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Primary Questions</p>
                <ul className="space-y-2">
                  {tools.vcInvestmentLogic.primaryQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80">
                      <span className="text-primary">•</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Key Metrics</p>
                <ul className="space-y-2">
                  {tools.vcInvestmentLogic.keyMetrics.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80">
                      <span className="text-primary">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-xs font-semibold text-destructive mb-3 uppercase tracking-wider">Red Flags</p>
                <ul className="space-y-2">
                  {tools.vcInvestmentLogic.redFlags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80">
                      <span className="text-destructive">×</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">Green Flags</p>
                <ul className="space-y-2">
                  {tools.vcInvestmentLogic.greenFlags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80">
                      <span className="text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 90-Day Action Plan */}
        {tools.actionPlan90Day && (
          <div className="space-y-4">
            <h5 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">90-Day Action Plan</h5>
            <p className="text-sm text-muted-foreground bg-muted/20 backdrop-blur-sm rounded-xl p-4 italic border border-border/20">
              A prioritized roadmap of immediate actions to strengthen your position. These milestones are designed to address the most critical gaps identified in this section and demonstrate tangible progress to investors.
            </p>
            <div className="space-y-3">
              {tools.actionPlan90Day.milestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/20">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shrink-0 rounded-lg px-3 py-1",
                      milestone.priority === "high" && "border-destructive/40 bg-destructive/10 text-destructive",
                      milestone.priority === "medium" && "border-amber-500/40 bg-amber-500/10 text-amber-500",
                      milestone.priority === "low" && "border-primary/40 bg-primary/10 text-primary"
                    )}
                  >
                    {milestone.priority}
                  </Badge>
                  <div>
                    <p className="font-medium text-foreground">{milestone.title}</p>
                    <p className="text-muted-foreground text-sm mt-1">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarks */}
        {tools.benchmarks && (
          <div className="space-y-4">
            <h5 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Industry Benchmarks</h5>
            <p className="text-sm text-muted-foreground bg-muted/20 backdrop-blur-sm rounded-xl p-4 italic border border-border/20">
              Compare your metrics against industry standards for companies at your stage. This helps you understand where you excel and where you may need to improve to meet investor expectations.
            </p>
            <div className="grid gap-3">
              {tools.benchmarks.metrics.map((metric, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-muted/20 backdrop-blur-sm rounded-xl px-5 py-4 border border-border/20">
                  <span className="text-foreground font-medium">{metric.label}</span>
                  <div className="flex items-center gap-6">
                    <span className="font-bold text-foreground">{metric.yourValue}</span>
                    <span className="text-muted-foreground text-xs">vs {metric.benchmark}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs rounded-lg px-3",
                        metric.status === "above" && "border-primary/40 bg-primary/10 text-primary",
                        metric.status === "at" && "border-amber-500/40 bg-amber-500/10 text-amber-500",
                        metric.status === "below" && "border-destructive/40 bg-destructive/10 text-destructive"
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
    <Card className="mb-10 border-primary/20 bg-card/60 backdrop-blur-2xl shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-bold">AI Action Plan</span>
            <p className="text-sm text-muted-foreground font-normal mt-0.5">{actionPlan.summaryLine}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-8">
        <div className="space-y-4">
          {actionPlan.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "border border-border/30 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:bg-muted/30 hover:shadow-md backdrop-blur-sm",
                expandedItems.has(item.id) && "bg-muted/20 border-primary/30"
              )}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Badge className={cn("shrink-0 rounded-lg px-3 py-1", getPriorityColor(item.priority))}>
                    {item.priority}
                  </Badge>
                  <div>
                    <p className="font-semibold text-foreground">{item.category}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.problem}</p>
                  </div>
                </div>
                {expandedItems.has(item.id) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
              </div>

              {expandedItems.has(item.id) && (
                <div className="mt-5 pt-5 border-t border-border/30 grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs font-semibold text-amber-500 mb-2 uppercase tracking-wider">Impact</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.impact}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">How to Fix</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.howToFix}</p>
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
  anchoredAssumptions,
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
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Back Button */}
      {showBackButton && onBack && (
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analysis
        </Button>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {companyName}
            </h1>
            {companyDescription && (
              <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{companyDescription}</p>
            )}
          </div>
          {overallScore !== null && (
            <div
              className={cn(
                "text-center px-8 py-5 rounded-2xl border-2 bg-card/60 backdrop-blur-xl shadow-lg",
                getScoreBg(overallScore)
              )}
            >
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Overall Score</p>
              <p className={cn("text-5xl font-bold", getScoreColor(overallScore))}>
                {overallScore}
              </p>
            </div>
          )}
        </div>

        {heroStatement && (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 backdrop-blur-xl shadow-lg">
            <CardContent className="py-8 px-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl text-primary/40 font-serif leading-none">"</div>
                <div className="flex-1 space-y-3">
                  {parseNarrativeText(heroStatement).map((paragraph, i) => (
                    <p key={i} className="text-lg font-medium italic text-foreground/90 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="text-4xl text-primary/40 font-serif leading-none self-end">"</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Anchored Assumptions - Key Metrics */}
      {anchoredAssumptions && anchoredAssumptions.primaryMetricValue !== null && (
        <div className="mb-10">
          <MemoAnchoredAssumptions 
            assumptions={anchoredAssumptions}
            companyName={companyName}
          />
        </div>
      )}

      {/* Section Navigation */}
      <SectionNavBar sections={sections} sectionTools={sectionTools} />

      {/* AI Action Plan */}
      {aiActionPlan && <ActionPlanSection actionPlan={aiActionPlan} />}

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => {
          const Icon = sectionIcons[section.title] || Target;
          const tools = sectionTools[section.title];
          const verdict = holisticVerdicts[section.title];
          const score = tools?.sectionScore;

          return (
            <Card
              key={section.title}
              id={`section-${section.title}`}
              className="overflow-hidden bg-card/60 backdrop-blur-2xl border-border/30 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Section Header */}
              <CardHeader
                className={cn(
                  "border-b border-border/30 py-6",
                  score && score >= 70 && "bg-gradient-to-r from-primary/10 to-transparent",
                  score && score >= 55 && score < 70 && "bg-gradient-to-r from-amber-500/10 to-transparent",
                  score && score < 55 && "bg-gradient-to-r from-destructive/10 to-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{section.title}</CardTitle>
                      {verdict && (
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
                          {verdict.verdict}
                        </p>
                      )}
                    </div>
                  </div>
                  {score !== undefined && (
                    <div className={cn(
                      "text-4xl font-bold px-4 py-2 rounded-xl",
                      score >= 70 && "bg-primary/10 text-primary",
                      score >= 55 && score < 70 && "bg-amber-500/10 text-amber-500",
                      score < 55 && "bg-destructive/10 text-destructive"
                    )}>
                      {score}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 pb-8">
                {/* VC Perspective - with better text formatting */}
                {verdict && verdict.stageContext && (
                  <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-5 mb-6 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      VC Perspective
                    </p>
                    <div className="space-y-3">
                      {parseNarrativeText(verdict.stageContext).map((paragraph, i) => (
                        <p key={i} className="italic text-foreground/80 leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Narrative - parsed into readable paragraphs */}
                {section.narrative && (
                  <div className="space-y-4 mb-6">
                    {parseNarrativeText(section.narrative).map((paragraph, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Key Points */}
                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <p className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Key Takeaways</p>
                    <ul className="space-y-3">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/20">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator className="my-6 bg-border/30" />

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
