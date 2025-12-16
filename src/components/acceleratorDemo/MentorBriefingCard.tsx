import { Lightbulb, Target, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoStartup } from "@/data/acceleratorDemo/demoStartups";

interface MentorBriefingCardProps {
  startup: DemoStartup;
}

export const MentorBriefingCard = ({ startup }: MentorBriefingCardProps) => {
  // Generate session recommendations based on startup weaknesses
  const getSessionRecommendations = () => {
    const recommendations: { focus: string; preparation: string; outcome: string }[] = [];
    const scores = startup.sectionScores;

    // Find weakest sections
    const sortedSections = Object.entries(scores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3);

    sortedSections.forEach(([section, score]) => {
      switch (section) {
        case "businessModel":
          recommendations.push({
            focus: "Unit Economics Deep Dive",
            preparation: "Review their current pricing, CAC, and LTV assumptions. Bring benchmark data for their category.",
            outcome: "Clear path to 3:1 LTV:CAC ratio with specific pricing recommendations"
          });
          break;
        case "market":
          recommendations.push({
            focus: "TAM Validation Workshop",
            preparation: "Challenge their market size methodology. Prepare bottoms-up calculation framework.",
            outcome: "Defensible SAM with clear segment prioritization"
          });
          break;
        case "competition":
          recommendations.push({
            focus: "Competitive Positioning Session",
            preparation: "Map their differentiation against top 3 competitors. Identify potential moats.",
            outcome: "Clear 'why us vs them' narrative for each competitor"
          });
          break;
        case "traction":
          recommendations.push({
            focus: "Traction Narrative Building",
            preparation: "Review their metrics. Identify the most compelling growth story.",
            outcome: "3-5 metrics that tell a compelling growth story"
          });
          break;
        case "solution":
          recommendations.push({
            focus: "Defensibility Analysis",
            preparation: "Evaluate technical moats, switching costs, and data advantages.",
            outcome: "Clear defensibility story with evidence points"
          });
          break;
        case "problem":
          recommendations.push({
            focus: "Pain Point Validation",
            preparation: "Review customer interview notes. Prepare problem quantification framework.",
            outcome: "Quantified pain in dollars with customer quotes"
          });
          break;
        case "team":
          recommendations.push({
            focus: "Team Gap Analysis",
            preparation: "Map current skills vs. what's needed for next stage. Identify hire priorities.",
            outcome: "Clear hiring roadmap with timeline"
          });
          break;
        case "vision":
          recommendations.push({
            focus: "Milestone Mapping",
            preparation: "Review their 18-month plan. Identify gaps between funding ask and milestones.",
            outcome: "Realistic milestone timeline tied to funding needs"
          });
          break;
      }
    });

    return recommendations.slice(0, 3);
  };

  const recommendations = getSessionRecommendations();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-primary/5 border-b border-primary/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mentor Briefing</h3>
            <p className="text-sm text-muted-foreground">Session recommendations for {startup.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Primary Focus */}
        <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-warning">Primary Focus Area</span>
          </div>
          <p className="text-sm text-foreground">{startup.mentorFocus}</p>
        </div>

        {/* Session Recommendations */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Recommended Sessions
          </h4>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded">
                    Session {index + 1}
                  </span>
                  <h5 className="font-medium text-sm text-foreground">{rec.focus}</h5>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Preparation:</span>
                    <p className="text-foreground/80 mt-0.5">{rec.preparation}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Target Outcome:</span>
                    <p className="text-foreground/80 mt-0.5">{rec.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Concerns to Address */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Top Concerns to Address</h4>
          <div className="space-y-2">
            {startup.topConcerns.map((concern, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-destructive mt-0.5">•</span>
                <span className="text-muted-foreground">{concern}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths to Leverage */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Strengths to Leverage</h4>
          <div className="space-y-2">
            {startup.topStrengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={cn(
                "text-xl font-bold",
                startup.fundabilityScore >= 75 ? "text-success" : 
                startup.fundabilityScore >= 60 ? "text-primary" : 
                startup.fundabilityScore >= 45 ? "text-warning" : "text-destructive"
              )}>
                {startup.fundabilityScore}
              </div>
              <div className="text-xs text-muted-foreground">Fundability</div>
            </div>
            <div>
              <div className={cn(
                "text-xl font-bold",
                startup.weeklyProgress > 2 ? "text-success" :
                startup.weeklyProgress < -2 ? "text-destructive" : "text-muted-foreground"
              )}>
                {startup.weeklyProgress > 0 ? "+" : ""}{startup.weeklyProgress}
              </div>
              <div className="text-xs text-muted-foreground">Week Δ</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">
                {startup.founders.length}
              </div>
              <div className="text-xs text-muted-foreground">Founders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
