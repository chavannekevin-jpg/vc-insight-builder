import { Flame, AlertTriangle, DollarSign, Clock, TrendingUp, Lightbulb } from "lucide-react";

interface PainScore {
  score: number;
  label: string;
  evidence: string;
}

interface PainAnalysis {
  urgency: PainScore;
  frequency: PainScore;
  willingness: PainScore;
  alternatives: PainScore;
  overallScore: number;
}

interface MemoPainValidatorCardProps {
  problemText: string;
  companyName: string;
}

function analyzePainPoints(text: string): PainAnalysis {
  const textLower = text.toLowerCase();
  
  // Urgency indicators
  const urgencyKeywords = ['critical', 'urgent', 'immediate', 'now', 'can\'t wait', 'emergency', 'crisis', 'broken', 'failing', 'losing'];
  const urgencyCount = urgencyKeywords.filter(k => textLower.includes(k)).length;
  const urgencyScore = Math.min(10, urgencyCount * 2 + 3);
  
  // Frequency indicators
  const frequencyKeywords = ['daily', 'every day', 'constantly', 'always', 'recurring', 'frequent', 'regular', 'ongoing', 'continuous'];
  const frequencyCount = frequencyKeywords.filter(k => textLower.includes(k)).length;
  const frequencyScore = Math.min(10, frequencyCount * 2 + 3);
  
  // Willingness to pay indicators
  const payKeywords = ['budget', 'spend', 'invest', 'pay', 'cost', 'expensive', 'money', 'revenue', 'savings', 'roi'];
  const payCount = payKeywords.filter(k => textLower.includes(k)).length;
  const payScore = Math.min(10, payCount * 2 + 3);
  
  // Poor alternatives indicators
  const altKeywords = ['manual', 'spreadsheet', 'excel', 'no solution', 'workaround', 'legacy', 'outdated', 'inefficient', 'broken process'];
  const altCount = altKeywords.filter(k => textLower.includes(k)).length;
  const altScore = Math.min(10, altCount * 2 + 3);
  
  const overallScore = Math.round((urgencyScore + frequencyScore + payScore + altScore) / 4 * 10);
  
  return {
    urgency: {
      score: urgencyScore,
      label: urgencyScore >= 7 ? 'High' : urgencyScore >= 4 ? 'Medium' : 'Low',
      evidence: urgencyCount > 0 ? `Found ${urgencyCount} urgency signals` : 'Limited urgency signals detected'
    },
    frequency: {
      score: frequencyScore,
      label: frequencyScore >= 7 ? 'High' : frequencyScore >= 4 ? 'Medium' : 'Low',
      evidence: frequencyCount > 0 ? `Found ${frequencyCount} frequency indicators` : 'Problem frequency unclear'
    },
    willingness: {
      score: payScore,
      label: payScore >= 7 ? 'Strong' : payScore >= 4 ? 'Moderate' : 'Weak',
      evidence: payCount > 0 ? `Found ${payCount} budget/ROI references` : 'Willingness to pay not demonstrated'
    },
    alternatives: {
      score: altScore,
      label: altScore >= 7 ? 'Poor' : altScore >= 4 ? 'Mediocre' : 'Good',
      evidence: altCount > 0 ? `Found ${altCount} workaround indicators` : 'Current alternatives unclear'
    },
    overallScore
  };
}

function getHeatLevel(score: number): { label: string; color: string; bgColor: string; icon: string } {
  if (score >= 80) return { label: 'HAIR ON FIRE', color: 'text-red-500', bgColor: 'from-red-500/20 to-orange-500/10', icon: '🔥🔥🔥' };
  if (score >= 60) return { label: 'BURNING', color: 'text-orange-500', bgColor: 'from-orange-500/20 to-yellow-500/10', icon: '🔥🔥' };
  if (score >= 40) return { label: 'WARM', color: 'text-yellow-500', bgColor: 'from-yellow-500/20 to-amber-500/10', icon: '🔥' };
  return { label: 'LUKEWARM', color: 'text-blue-400', bgColor: 'from-blue-500/10 to-cyan-500/5', icon: '❄️' };
}

function getSuggestions(analysis: PainAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (analysis.urgency.score < 6) {
    suggestions.push("Add specific examples of costs/consequences of not solving this problem now");
  }
  if (analysis.frequency.score < 6) {
    suggestions.push("Clarify how often users encounter this pain point (daily? weekly?)");
  }
  if (analysis.willingness.score < 6) {
    suggestions.push("Include evidence of existing budget spend on alternatives or ROI expectations");
  }
  if (analysis.alternatives.score < 6) {
    suggestions.push("Describe current workarounds and why they're inadequate");
  }
  
  return suggestions.slice(0, 3);
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-400";
}

function getBarColor(score: number): string {
  if (score >= 7) return "bg-green-500";
  if (score >= 4) return "bg-yellow-500";
  return "bg-red-400";
}

export function MemoPainValidatorCard({ problemText, companyName }: MemoPainValidatorCardProps) {
  const analysis = analyzePainPoints(problemText);
  const heatLevel = getHeatLevel(analysis.overallScore);
  const suggestions = getSuggestions(analysis);
  
  const dimensions = [
    { key: 'urgency', label: 'Problem Urgency', icon: Clock, data: analysis.urgency },
    { key: 'frequency', label: 'Pain Frequency', icon: TrendingUp, data: analysis.frequency },
    { key: 'willingness', label: 'Willingness to Pay', icon: DollarSign, data: analysis.willingness },
    { key: 'alternatives', label: 'Current Alternatives', icon: AlertTriangle, data: analysis.alternatives },
  ];
  
  return (
    <div className={`my-10 bg-gradient-to-br ${heatLevel.bgColor} border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Pain Validator</h3>
          <p className="text-sm text-muted-foreground">Is {companyName}'s problem burning hot?</p>
        </div>
      </div>

      {/* Heat Level Meter */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Pain Intensity Score</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{heatLevel.icon}</span>
            <span className={`text-3xl font-bold ${heatLevel.color}`}>{analysis.overallScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="h-4 bg-muted/50 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 via-yellow-500 via-orange-500 to-red-500`}
            style={{ width: `${analysis.overallScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={`font-semibold ${heatLevel.color}`}>{heatLevel.label}</span>
          <span className="text-muted-foreground">VC Target: 70+ ("Hair on Fire")</span>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="space-y-4 mb-6">
        {dimensions.map(({ key, label, icon: Icon, data }) => (
          <div key={key} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
                {data.score}/10 • {data.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(data.score)}`}
                  style={{ width: `${data.score * 10}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.evidence}</p>
          </div>
        ))}
      </div>

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-border/30 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Strengthen Your Problem Statement</span>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* VC Context */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> The best startups solve "hair on fire" problems where customers are actively seeking solutions and willing to pay immediately. A lukewarm problem = slow sales cycles and high churn risk.
        </p>
      </div>
    </div>
  );
}
