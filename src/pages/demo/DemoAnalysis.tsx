import { useNavigate } from "react-router-dom";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_COMPANY, DEMO_SECTION_SCORES } from "@/data/demo/demoSignalFlow";
import { DEMO_SECTION_TOOLS, DEMO_HOLISTIC_VERDICTS } from "@/data/demo/demoSignalFlowTools";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  FileText, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users, 
  Building2, 
  LineChart, 
  Compass,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";

// Section icons mapping
const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Problem": AlertTriangle,
  "Solution": Lightbulb,
  "Market": TrendingUp,
  "Competition": Target,
  "Team": Users,
  "Business Model": Building2,
  "Traction": LineChart,
  "Vision": Compass
};

// Get score color based on value
const getScoreColor = (score: number) => {
  if (score >= 70) return "text-emerald-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
};

// Get score background based on value
const getScoreBg = (score: number) => {
  if (score >= 70) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 55) return "bg-amber-500/10 border-amber-500/30";
  return "bg-red-500/10 border-red-500/30";
};

export default function DemoAnalysis() {
  const navigate = useNavigate();
  const memoData = getDemoMemo("demo-signalflow");
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  if (!memoData) {
    return (
      <DemoLayout currentPage="analysis">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Memo data not found</p>
        </div>
      </DemoLayout>
    );
  }

  // Build section score map from DEMO_SECTION_TOOLS
  const sectionScoreMap: Record<string, number> = {};
  Object.entries(DEMO_SECTION_TOOLS).forEach(([section, tools]) => {
    if (tools.sectionScore?.score) {
      sectionScoreMap[section] = tools.sectionScore.score;
    }
  });

  // Calculate overall score
  const scores = Object.values(sectionScoreMap);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <DemoLayout currentPage="analysis">
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/demo')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{DEMO_COMPANY.name} Investment Memo</h1>
                <p className="text-muted-foreground">{DEMO_COMPANY.description}</p>
              </div>
            </div>

            {/* Hero Statement */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {memoData.heroStatement}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Score Card */}
          <Card className="mb-8 border-2 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Investment Readiness Score
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Based on 8 sections evaluated against VC benchmarks
                  </p>
                </div>
                <div className={cn("text-5xl font-bold", getScoreColor(overallScore))}>
                  {overallScore}
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VC Quick Take */}
          <section className="mb-12">
            <MemoVCQuickTake quickTake={memoData.vcQuickTake} showTeaser={false} />
          </section>

          {/* Section Navigation */}
          <nav className="mb-8 p-4 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Jump to Section</h3>
            <div className="flex flex-wrap gap-2">
              {memoData.sections.map((section, index) => {
                const Icon = sectionIcons[section.title] || FileText;
                const score = sectionScoreMap[section.title] || 0;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-sm transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {section.title}
                    <span className={cn("text-xs font-bold", getScoreColor(score))}>
                      {score}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sections */}
          <div className="space-y-8">
            {memoData.sections.map((section, index) => {
              const Icon = sectionIcons[section.title] || FileText;
              const score = sectionScoreMap[section.title] || 0;
              const tools = DEMO_SECTION_TOOLS[section.title];
              const verdict = DEMO_HOLISTIC_VERDICTS[section.title];
              const isExpanded = expandedSections[index];
              
              return (
                <section
                  key={index}
                  id={`section-${index}`}
                  className="scroll-mt-24"
                >
                  <Card className="overflow-hidden">
                    {/* Section Header */}
                    <div className={cn("p-4 border-b", getScoreBg(score))}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-foreground" />
                          </div>
                          <h2 className="text-xl font-bold">{section.title}</h2>
                        </div>
                        <div className={cn("text-2xl font-bold", getScoreColor(score))}>
                          {score}<span className="text-sm text-muted-foreground">/100</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* VC Verdict */}
                      {verdict && (
                        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            VC Perspective
                          </h4>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {verdict.verdict}
                          </p>
                          {verdict.stageContext && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {verdict.stageContext}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Narrative */}
                      <p className="text-foreground/90 leading-relaxed mb-6">
                        {section.narrative}
                      </p>

                      {/* Key Points */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Key Points</h4>
                        <ul className="space-y-2">
                          {section.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Expandable Tools Section */}
                      {tools && (
                        <div className="border-t border-border pt-4">
                          <button
                            onClick={() => toggleSection(index)}
                            className="flex items-center justify-between w-full text-left group"
                          >
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                              View Strategic Analysis Tools
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-4 space-y-4">
                              {/* VC Investment Logic */}
                              {tools.vcInvestmentLogic && (
                                <div className="p-4 bg-card border border-border rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded text-xs font-semibold",
                                      tools.vcInvestmentLogic.decision === "INTERESTED" 
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-amber-500/10 text-amber-600"
                                    )}>
                                      {tools.vcInvestmentLogic.decision}
                                    </span>
                                    <span className="text-xs text-muted-foreground">VC Investment Logic</span>
                                  </div>
                                  <p className="text-sm text-foreground/90 mb-2">
                                    {tools.vcInvestmentLogic.reasoning}
                                  </p>
                                  <p className="text-xs text-muted-foreground italic">
                                    Key condition: {tools.vcInvestmentLogic.keyCondition}
                                  </p>
                                </div>
                              )}

                              {/* 90-Day Action Plan Preview */}
                              {tools.actionPlan90Day?.actions && (
                                <div className="p-4 bg-card border border-border rounded-lg">
                                  <h5 className="text-sm font-semibold mb-3">90-Day Action Plan</h5>
                                  <div className="space-y-2">
                                    {tools.actionPlan90Day.actions.slice(0, 3).map((action: any, i: number) => (
                                      <div key={i} className="flex items-start gap-2 text-sm">
                                        <span className={cn(
                                          "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase flex-shrink-0",
                                          action.priority === "critical" ? "bg-red-500/10 text-red-600" :
                                          action.priority === "important" ? "bg-amber-500/10 text-amber-600" :
                                          "bg-blue-500/10 text-blue-600"
                                        )}>
                                          {action.priority}
                                        </span>
                                        <span className="text-foreground/80">{action.action}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Benchmarks */}
                              {tools.benchmarks && tools.benchmarks.length > 0 && (
                                <div className="p-4 bg-card border border-border rounded-lg">
                                  <h5 className="text-sm font-semibold mb-3">Benchmarks</h5>
                                  <div className="space-y-2">
                                    {tools.benchmarks.map((b: any, i: number) => (
                                      <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{b.metric}</span>
                                        <div className="flex items-center gap-3">
                                          <span className="font-medium">{b.yourValue}</span>
                                          <span className="text-xs text-muted-foreground">vs {b.benchmark}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>
              );
            })}
          </div>

          {/* AI Action Plan */}
          {memoData.aiActionPlan && (
            <section className="mt-12">
              <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">AI Action Plan</h2>
                      <p className="text-sm text-muted-foreground">{memoData.aiActionPlan.summaryLine}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {memoData.aiActionPlan.items.map((item, index) => (
                      <div key={item.id} className="p-4 bg-card border border-border rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-amber-600 uppercase">
                                {item.category}
                              </span>
                            </div>
                            <p className="font-medium text-foreground mb-2">{item.problem}</p>
                            <p className="text-sm text-muted-foreground mb-3">{item.impact}</p>
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                              <p className="text-sm text-foreground/90">
                                <span className="font-semibold text-emerald-600">How to fix: </span>
                                {item.howToFix}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Back to Dashboard */}
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/demo')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
