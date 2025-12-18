import { Shield, Sparkles, Network, Database, Award, DollarSign, Lock, Lightbulb } from "lucide-react";
import { MoatScores } from "@/lib/memoDataExtractor";
import { safeLower } from "@/lib/stringUtils";

interface MemoMoatScoreCardProps {
  moatScores: MoatScores;
  companyName: string;
  category?: string;
  stage?: string;
}

const moatConfig = {
  networkEffects: { label: "Network Effects", icon: Network, description: "Value grows with users" },
  switchingCosts: { label: "Switching Costs", icon: Lock, description: "Hard to leave" },
  dataAdvantage: { label: "Data Advantage", icon: Database, description: "Proprietary data moat" },
  brandTrust: { label: "Brand/Trust", icon: Award, description: "Reputation & certifications" },
  costAdvantage: { label: "Cost Advantage", icon: DollarSign, description: "Economic moat" }
};

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-400";
}

function getScoreBarColor(score: number): string {
  if (score >= 7) return "bg-green-500";
  if (score >= 4) return "bg-yellow-500";
  return "bg-red-400";
}

function getOverallGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 70) return { grade: "A", color: "text-green-500", label: "STRONG" };
  if (score >= 50) return { grade: "B", color: "text-blue-500", label: "MODERATE" };
  if (score >= 30) return { grade: "C", color: "text-yellow-500", label: "DEVELOPING" };
  return { grade: "D", color: "text-red-400", label: "WEAK" };
}

interface SmartSuggestion {
  title: string;
  suggestion: string;
  priority: 'high' | 'medium';
}

function getSmartMoatSuggestions(
  moatScores: MoatScores, 
  companyName: string,
  category?: string,
  stage?: string
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const categoryLower = safeLower(category || '', "MemoMoatScoreCard.category");
  const stageLower = safeLower(stage || '', "MemoMoatScoreCard.stage");
  
  // Only suggest for weak areas (score < 5)
  const weakAreas = {
    networkEffects: moatScores.networkEffects.score < 5,
    switchingCosts: moatScores.switchingCosts.score < 5,
    dataAdvantage: moatScores.dataAdvantage.score < 5,
    brandTrust: moatScores.brandTrust.score < 5,
    costAdvantage: moatScores.costAdvantage.score < 5
  };

  // Network Effects suggestions based on category
  if (weakAreas.networkEffects) {
    if (categoryLower.includes('marketplace') || categoryLower.includes('platform')) {
      suggestions.push({
        title: "Launch Cross-Side Network Effects",
        suggestion: `Build a referral loop between buyers and sellers. Incentivize both sides to invite their counterparts — Uber did this by giving drivers bonuses for recruiting riders.`,
        priority: 'high'
      });
    } else if (categoryLower.includes('saas') || categoryLower.includes('b2b')) {
      suggestions.push({
        title: "Create a Data Network Effect",
        suggestion: `Aggregate anonymized customer data to build benchmarks and insights. Each new customer improves the product for everyone — this is how ZoomInfo and Segment built moats.`,
        priority: 'high'
      });
    } else if (categoryLower.includes('community') || categoryLower.includes('social')) {
      suggestions.push({
        title: "Enable User-Generated Content",
        suggestion: `Let users create content others consume. Stack Overflow, Figma Community, and Notion Templates all became stickier when users invested in building for others.`,
        priority: 'high'
      });
    } else {
      suggestions.push({
        title: "Add Collaboration Features",
        suggestion: `Enable teams to work together inside your product. Shared workspaces create organic virality — each new team member increases value for existing users.`,
        priority: 'medium'
      });
    }
  }

  // Switching Costs suggestions based on category
  if (weakAreas.switchingCosts) {
    if (categoryLower.includes('fintech') || categoryLower.includes('finance')) {
      suggestions.push({
        title: "Become the System of Record",
        suggestion: `Own the historical transaction data and reporting. Banks can't leave Plaid easily because years of financial connections would break. Build that same dependency.`,
        priority: 'high'
      });
    } else if (categoryLower.includes('hr') || categoryLower.includes('workforce')) {
      suggestions.push({
        title: "Embed in Critical Workflows",
        suggestion: `Integrate with payroll, benefits, and compliance systems. Rippling's switching costs come from being woven into every HR process — extraction is a nightmare.`,
        priority: 'high'
      });
    } else {
      suggestions.push({
        title: "Deep Integration Strategy",
        suggestion: `Build bidirectional syncs with the tools your customers already use (CRM, ERP, Slack). The more integrations active, the harder it is to rip out — aim for 5+ per enterprise customer.`,
        priority: 'high'
      });
    }
  }

  // Data Advantage suggestions
  if (weakAreas.dataAdvantage) {
    if (categoryLower.includes('ai') || categoryLower.includes('ml') || categoryLower.includes('analytics')) {
      suggestions.push({
        title: "Build Proprietary Training Data",
        suggestion: `Every customer interaction should improve your models. Create feedback loops where users correct/rate outputs — this is how ChatGPT and Midjourney compound their advantage.`,
        priority: 'high'
      });
    } else if (categoryLower.includes('climate') || categoryLower.includes('sustainability')) {
      suggestions.push({
        title: "Aggregate Industry Benchmarks",
        suggestion: `Collect anonymized emissions/sustainability data across customers to create industry standards. Companies will pay premium for "how do I compare to peers?" insights.`,
        priority: 'high'
      });
    } else {
      suggestions.push({
        title: "Create Unique Data Assets",
        suggestion: `Identify what proprietary data ${companyName} collects that no one else has. Package this into benchmarks, predictive models, or insights dashboards — data moats compound over time.`,
        priority: 'medium'
      });
    }
  }

  // Brand/Trust suggestions
  if (weakAreas.brandTrust) {
    if (stageLower.includes('seed') || stageLower.includes('series')) {
      suggestions.push({
        title: "Pursue Enterprise Certifications",
        suggestion: `SOC2 Type II and ISO 27001 are table stakes for enterprise sales. Budget 3-6 months and $30-50K. This unlocks Fortune 500 deals that competitors without certs can't access.`,
        priority: 'high'
      });
    } else {
      suggestions.push({
        title: "Build Social Proof Portfolio",
        suggestion: `Get 3-5 recognizable logos as case studies with quantified outcomes. "Increased revenue 40% for [Brand Name]" is worth more than 100 unknown testimonials.`,
        priority: 'medium'
      });
    }
  }

  // Cost Advantage suggestions
  if (weakAreas.costAdvantage) {
    if (categoryLower.includes('ai') || categoryLower.includes('infrastructure')) {
      suggestions.push({
        title: "Optimize Unit Economics Through Scale",
        suggestion: `Invest in proprietary inference infrastructure or negotiate volume discounts. Companies like OpenAI and Anthropic are 10x cheaper at scale — pass savings to customers as moat.`,
        priority: 'medium'
      });
    } else {
      suggestions.push({
        title: "Build Operational Efficiency",
        suggestion: `Automate customer onboarding, support, and ops. If ${companyName} can deliver at 50% the cost of competitors, you can undercut on price OR have 2x the margin to reinvest in growth.`,
        priority: 'medium'
      });
    }
  }

  // Sort by priority and return top 3
  return suggestions
    .sort((a, b) => a.priority === 'high' && b.priority !== 'high' ? -1 : 1)
    .slice(0, 3);
}

export function MemoMoatScoreCard({ moatScores, companyName, category, stage }: MemoMoatScoreCardProps) {
  const overallGrade = getOverallGrade(moatScores.overallScore);
  const suggestions = getSmartMoatSuggestions(moatScores, companyName, category, stage);
  
  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-blue-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Defensibility Score</h3>
          <p className="text-sm text-muted-foreground">How protected is {companyName} from competition?</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Overall Defensibility</span>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${overallGrade.color}`}>{moatScores.overallScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(moatScores.overallScore / 10)}`}
            style={{ width: `${moatScores.overallScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={`font-semibold ${overallGrade.color}`}>{overallGrade.label}</span>
          <span className="text-muted-foreground">VC Benchmark: 60+</span>
        </div>
      </div>

      {/* Individual Moat Scores */}
      <div className="space-y-4 mb-6">
        {(Object.keys(moatConfig) as Array<keyof typeof moatConfig>).map((key) => {
          const config = moatConfig[key];
          const score = moatScores[key];
          const Icon = config.icon;
          
          return (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(score.score)}`}>
                  {score.score}/10
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score.score)}`}
                    style={{ width: `${score.score * 10}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {score.evidence}
              </p>
            </div>
          );
        })}
      </div>

      {/* Smart MOAT Acceleration Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-border/30 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">MOAT Acceleration Opportunities</span>
          </div>
          <div className="space-y-4">
            {suggestions.map((suggestion, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border ${
                  suggestion.priority === 'high' 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/30 border-border/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    suggestion.priority === 'high' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-semibold text-foreground">{suggestion.title}</h5>
                      {suggestion.priority === 'high' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-primary/20 text-primary">
                          High Impact
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VC Context */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> Defensibility is crucial for venture returns. Companies with strong moats can maintain pricing power and resist competitive pressure as they scale.
        </p>
      </div>
    </div>
  );
}
