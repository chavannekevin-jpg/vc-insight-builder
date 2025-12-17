import { memo, useMemo } from "react";
import { AlertTriangle, Eye, TrendingDown, Users, DollarSign, Target, Zap } from "lucide-react";

interface VCFirstImpressionProps {
  responses: Array<{ question_key: string; answer: string | null }>;
  companyName: string;
  stage: string;
  category?: string | null;
}

// Generate conceptual judgments based on available data - not blaming missing data
const generateJudgments = (
  responses: Array<{ question_key: string; answer: string | null }>,
  companyName: string,
  stage: string,
  category?: string | null
): Array<{ icon: typeof AlertTriangle; judgment: string; severity: "harsh" | "warning" | "concern" }> => {
  const judgments: Array<{ icon: typeof AlertTriangle; judgment: string; severity: "harsh" | "warning" | "concern" }> = [];
  
  const getResponse = (key: string) => responses.find(r => r.question_key === key)?.answer?.trim();
  
  const problemValidation = getResponse("problem_validation");
  const targetCustomer = getResponse("target_customer");
  const marketSize = getResponse("market_size");
  const traction = getResponse("current_traction");
  const competitiveAdvantage = getResponse("competitive_advantage");
  const revenueModel = getResponse("revenue_model");
  const founderBackground = getResponse("founder_background");
  
  // Problem-based judgments
  if (problemValidation) {
    if (problemValidation.length < 100) {
      judgments.push({
        icon: AlertTriangle,
        judgment: `"${companyName}'s problem statement lacks depth. Either they don't understand the pain, or it's not painful enough."`,
        severity: "harsh"
      });
    } else if (!problemValidation.toLowerCase().includes("customer") && !problemValidation.toLowerCase().includes("user")) {
      judgments.push({
        icon: Users,
        judgment: `"No customer voice in the problem description. Feels like a solution looking for a problem."`,
        severity: "warning"
      });
    }
  }
  
  // Target customer judgments
  if (targetCustomer) {
    if (targetCustomer.toLowerCase().includes("everyone") || targetCustomer.toLowerCase().includes("anyone")) {
      judgments.push({
        icon: Target,
        judgment: `"'Everyone' is not a target customer. This founder hasn't done the hard work of narrowing focus."`,
        severity: "harsh"
      });
    } else if (targetCustomer.length < 50) {
      judgments.push({
        icon: Target,
        judgment: `"Vague customer definition. If they can't describe their customer, they can't sell to them."`,
        severity: "warning"
      });
    }
  }
  
  // Market size judgments
  if (marketSize) {
    const hasNumbers = /\$?\d+[BMK]?|\d+\s*(billion|million|trillion)/i.test(marketSize);
    if (!hasNumbers) {
      judgments.push({
        icon: TrendingDown,
        judgment: `"No market sizing data. Either they haven't researched it, or the numbers don't support the story."`,
        severity: "harsh"
      });
    } else if (marketSize.toLowerCase().includes("trillion")) {
      judgments.push({
        icon: TrendingDown,
        judgment: `"Trillion-dollar TAM claim. Classic red flag for unrealistic market thinking."`,
        severity: "warning"
      });
    }
  }
  
  // Traction judgments
  if (traction) {
    const hasMetrics = /\d+/.test(traction);
    if (!hasMetrics) {
      judgments.push({
        icon: Zap,
        judgment: `"Traction section with no numbers. If they had real traction, they'd lead with it."`,
        severity: "harsh"
      });
    } else if (traction.toLowerCase().includes("will") || traction.toLowerCase().includes("plan to")) {
      judgments.push({
        icon: Zap,
        judgment: `"Future tense in traction. They're selling a plan, not progress."`,
        severity: "warning"
      });
    }
  }
  
  // Competitive advantage judgments
  if (competitiveAdvantage) {
    if (competitiveAdvantage.toLowerCase().includes("first mover") || competitiveAdvantage.toLowerCase().includes("first to market")) {
      judgments.push({
        icon: AlertTriangle,
        judgment: `"Relying on 'first mover advantage.' That's not a moat, it's a head start that disappears."`,
        severity: "warning"
      });
    }
    if (competitiveAdvantage.length < 80) {
      judgments.push({
        icon: AlertTriangle,
        judgment: `"Weak competitive differentiation. Easy to replicate means easy to lose."`,
        severity: "concern"
      });
    }
  }
  
  // Revenue model judgments
  if (revenueModel) {
    if (revenueModel.toLowerCase().includes("freemium") && !revenueModel.toLowerCase().includes("conversion")) {
      judgments.push({
        icon: DollarSign,
        judgment: `"Freemium without conversion strategy. Free users don't pay bills."`,
        severity: "warning"
      });
    }
    if (revenueModel.toLowerCase().includes("ads") || revenueModel.toLowerCase().includes("advertising")) {
      judgments.push({
        icon: DollarSign,
        judgment: `"Ad-based model at ${stage}. Need massive scale before this works."`,
        severity: "concern"
      });
    }
  }
  
  // Stage-specific judgments
  if (stage === "Pre Seed" && traction && /\$?\d+[KM]?\s*(MRR|ARR|revenue)/i.test(traction)) {
    // Pre-seed with real revenue is good, no harsh judgment
  } else if (stage === "Seed" && !traction) {
    judgments.push({
      icon: Zap,
      judgment: `"Seed stage without traction data. What have they been doing?"`,
      severity: "harsh"
    });
  }
  
  // Founder background judgments
  if (founderBackground) {
    if (founderBackground.length < 100) {
      judgments.push({
        icon: Users,
        judgment: `"Minimal founder background. Either hiding something or doesn't understand what VCs look for."`,
        severity: "concern"
      });
    }
  }
  
  // Generic category-based judgment if we have category but few responses
  if (category && judgments.length < 2) {
    judgments.push({
      icon: Eye,
      judgment: `"${category} space is crowded. Need to see clear differentiation to take this seriously."`,
      severity: "concern"
    });
  }
  
  // Return top 3 most severe judgments
  const severityOrder = { harsh: 0, warning: 1, concern: 2 };
  return judgments
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 3);
};

export const VCFirstImpression = memo(({ responses, companyName, stage, category }: VCFirstImpressionProps) => {
  const judgments = useMemo(
    () => generateJudgments(responses, companyName, stage, category),
    [responses, companyName, stage, category]
  );
  
  // Only show if we have at least one response to analyze
  const hasResponses = responses.some(r => r.answer && r.answer.trim());
  
  if (!hasResponses || judgments.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-destructive/30 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-destructive" />
        <h3 className="font-semibold text-destructive">VC First Impression</h3>
        <span className="text-xs text-muted-foreground ml-auto">Based on your current profile</span>
      </div>
      
      <div className="space-y-4">
        {judgments.map((item, index) => {
          const Icon = item.icon;
          const borderColor = item.severity === "harsh" ? "border-l-destructive" : 
                             item.severity === "warning" ? "border-l-amber-500" : "border-l-muted-foreground";
          
          return (
            <div 
              key={index} 
              className={`pl-4 border-l-2 ${borderColor} py-1`}
            >
              <p className="text-sm text-muted-foreground italic">
                {item.judgment}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          These are real reactions VCs have internally. Your full verdict reveals the complete picture.
        </p>
      </div>
    </div>
  );
});

VCFirstImpression.displayName = "VCFirstImpression";
