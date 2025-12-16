import { useParams, useNavigate } from "react-router-dom";
import { DemoModeBanner } from "@/components/acceleratorDemo/DemoModeBanner";
import { AcceleratorDemoHeader } from "@/components/acceleratorDemo/AcceleratorDemoHeader";
import { DemoWrapper } from "@/components/acceleratorDemo/DemoWrapper";
import { getStartupById } from "@/data/acceleratorDemo/demoStartups";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";
import { Button } from "@/components/ui/button";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { 
  ArrowLeft, 
  FileText, 
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  BarChart3,
  Rocket,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const sectionIcons: Record<string, any> = {
  Problem: Target,
  Solution: Lightbulb,
  Market: TrendingUp,
  Competition: Shield,
  Team: Users,
  "Business Model": DollarSign,
  Traction: BarChart3,
  Vision: Rocket
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-destructive";
};

const StartupMemo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const startup = getStartupById(id || "");
  const memoData = getDemoMemo(id || "");

  if (!startup || !memoData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Memo not found</h1>
          <Button onClick={() => navigate("/accelerator-demo/cohort")}>
            Back to Cohort
          </Button>
        </div>
      </div>
    );
  }

  const sectionScoreMap: Record<string, number> = {
    Problem: startup.sectionScores.problem,
    Solution: startup.sectionScores.solution,
    Market: startup.sectionScores.market,
    Competition: startup.sectionScores.competition,
    Team: startup.sectionScores.team,
    "Business Model": startup.sectionScores.businessModel,
    Traction: startup.sectionScores.traction,
    Vision: startup.sectionScores.vision
  };

  return (
    <DemoWrapper>
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <AcceleratorDemoHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {startup.name}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{startup.name} Investment Memo</h1>
              <p className="text-muted-foreground">{startup.tagline}</p>
            </div>
          </div>

          {/* Hero Statement */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl">
            <p className="text-lg font-medium text-foreground leading-relaxed">
              {memoData.heroStatement}
            </p>
          </div>
        </div>

        {/* VC Quick Take */}
        <section className="mb-12">
          <MemoVCQuickTake quickTake={memoData.vcQuickTake} showTeaser={false} />
        </section>

        {/* Section Navigation */}
        <nav className="mb-8 p-4 bg-card/50 border border-border/50 rounded-xl">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Jump to Section</h3>
          <div className="flex flex-wrap gap-2">
            {memoData.sections.map((section, index) => {
              const Icon = sectionIcons[section.title] || FileText;
              const score = sectionScoreMap[section.title];
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
        <div className="space-y-12">
          {memoData.sections.map((section, index) => {
            const Icon = sectionIcons[section.title] || FileText;
            const score = sectionScoreMap[section.title];
            
            return (
              <section
                key={index}
                id={`section-${index}`}
                className="scroll-mt-24"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{section.title}</h2>
                  </div>
                  <div className={cn("text-2xl font-bold", getScoreColor(score))}>
                    {score}<span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </div>

                {/* Section Content */}
                <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <p className="text-foreground/90 leading-relaxed mb-6">
                    {section.narrative}
                  </p>

                  {/* Key Points */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Key Points</h4>
                    <ul className="space-y-2">
                      {section.keyPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground/80">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl text-center">
          <h3 className="text-lg font-bold mb-2">Want this analysis for your cohort?</h3>
          <p className="text-muted-foreground mb-4">
            Get detailed fundability analysis for every startup in your accelerator program.
          </p>
          <Button onClick={() => navigate("/accelerators")}>
            Learn More About Accelerator Plans
          </Button>
        </div>
      </main>
    </div>
    </DemoWrapper>
  );
};

export default StartupMemo;
