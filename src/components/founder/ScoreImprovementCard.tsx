import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  AlertTriangle, 
  Target,
  ArrowRight,
  Lightbulb,
  Users,
  BarChart3,
  FileText,
  Rocket,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Concern {
  category?: string;
  text?: string;
  severity?: string;
}

interface VCVerdict {
  overallScore?: number;
  concerns?: Concern[];
  criticalWeaknesses?: string[];
  readinessLevel?: string;
  strengths?: { category?: string; text?: string }[];
}

interface ScoreImprovementCardProps {
  companyId: string;
  vcVerdict: VCVerdict | null;
  currentScore: number;
  scoreboardEligible: boolean;
  onRegenerateClick?: () => void;
}

// Map concern categories to improvement suggestions
const improvementSuggestions: Record<string, {
  icon: typeof TrendingUp;
  title: string;
  actions: string[];
  potentialGain: number;
}> = {
  team: {
    icon: Users,
    title: "Strengthen Team Credibility",
    actions: [
      "Add LinkedIn profiles for key team members",
      "Highlight relevant industry experience",
      "Showcase previous startup or domain expertise"
    ],
    potentialGain: 8
  },
  traction: {
    icon: BarChart3,
    title: "Demonstrate Traction",
    actions: [
      "Add specific MRR/ARR numbers",
      "Include user growth metrics with percentages",
      "Show customer retention or engagement data"
    ],
    potentialGain: 12
  },
  market: {
    icon: Target,
    title: "Sharpen Market Analysis",
    actions: [
      "Provide bottom-up TAM calculation",
      "Identify specific market entry wedge",
      "Add competitor differentiation analysis"
    ],
    potentialGain: 7
  },
  problem: {
    icon: AlertTriangle,
    title: "Validate Problem Statement",
    actions: [
      "Include customer interview insights",
      "Add pain point quantification (time/money lost)",
      "Show evidence of willingness to pay"
    ],
    potentialGain: 6
  },
  solution: {
    icon: Lightbulb,
    title: "Clarify Solution & Moat",
    actions: [
      "Explain technical differentiation",
      "Describe barriers to competition",
      "Add product demo or screenshots"
    ],
    potentialGain: 8
  },
  business_model: {
    icon: FileText,
    title: "Define Business Model",
    actions: [
      "Add unit economics (CAC, LTV, margins)",
      "Clarify pricing strategy",
      "Show path to profitability"
    ],
    potentialGain: 9
  },
  vision: {
    icon: Rocket,
    title: "Expand Vision & Ambition",
    actions: [
      "Define 5-year company vision",
      "Outline potential exit scenarios",
      "Describe market expansion strategy"
    ],
    potentialGain: 5
  }
};

const ScoreImprovementCard = ({ 
  companyId,
  vcVerdict, 
  currentScore,
  scoreboardEligible,
  onRegenerateClick
}: ScoreImprovementCardProps) => {
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    if (!vcVerdict?.concerns) return [];

    const categoryMap: Record<string, Concern[]> = {};
    
    // Group concerns by category
    vcVerdict.concerns.forEach(concern => {
      const category = concern.category?.toLowerCase() || 'general';
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(concern);
    });

    // Generate recommendations based on concerns
    const recs = Object.entries(categoryMap)
      .filter(([category]) => improvementSuggestions[category])
      .map(([category, concerns]) => {
        const suggestion = improvementSuggestions[category];
        return {
          category,
          ...suggestion,
          concernCount: concerns.length,
          originalConcerns: concerns.map(c => c.text).filter(Boolean)
        };
      })
      .sort((a, b) => b.potentialGain - a.potentialGain)
      .slice(0, 4); // Top 4 recommendations

    return recs;
  }, [vcVerdict]);

  const potentialScore = useMemo(() => {
    const totalGain = recommendations.reduce((sum, r) => sum + r.potentialGain, 0);
    return Math.min(currentScore + totalGain, 100);
  }, [currentScore, recommendations]);

  if (!vcVerdict || recommendations.length === 0) {
    return null;
  }

  const getPriorityColor = (gain: number) => {
    if (gain >= 10) return "bg-red-500/10 text-red-500 border-red-500/30";
    if (gain >= 7) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
    return "bg-blue-500/10 text-blue-500 border-blue-500/30";
  };

  const getPriorityLabel = (gain: number) => {
    if (gain >= 10) return "Critical";
    if (gain >= 7) return "High";
    return "Medium";
  };

  return (
    <Card className="border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Improve Your Score
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Potential:</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              {currentScore} → {potentialScore}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Score</span>
            <span className="font-medium">{currentScore}/100</span>
          </div>
          <div className="relative">
            <Progress value={currentScore} className="h-3" />
            <div 
              className="absolute top-0 h-3 bg-green-500/30 rounded-r-full transition-all"
              style={{ 
                left: `${currentScore}%`, 
                width: `${potentialScore - currentScore}%` 
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            +{potentialScore - currentScore} points potential improvement
          </p>
        </div>

        {/* Investor Visibility Teaser */}
        {!scoreboardEligible && currentScore < 60 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
            <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Score 60+ to unlock investor visibility
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                High-scoring companies get featured to our network of 800+ active investors.
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Improvements</h4>
          
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div 
                key={rec.category}
                className="bg-background border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{rec.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(rec.potentialGain)}`}
                    >
                      {getPriorityLabel(rec.potentialGain)}
                    </Badge>
                    <span className="text-xs text-green-500 font-medium">
                      +{rec.potentialGain} pts
                    </span>
                  </div>
                </div>
                
                <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                  {rec.actions.slice(0, 2).map((action, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/portal')}
          >
            Update Answers
          </Button>
          <Button 
            className="flex-1 gap-2"
            onClick={onRegenerateClick}
          >
            <TrendingUp className="w-4 h-4" />
            Regenerate Score
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreImprovementCard;
