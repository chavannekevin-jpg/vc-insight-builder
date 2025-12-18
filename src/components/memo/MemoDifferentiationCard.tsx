import { Crosshair, Check, X, Minus, Sparkles, AlertCircle, Target } from "lucide-react";
import { safeLower } from "@/lib/stringUtils";

interface DifferentiationFactor {
  factor: string;
  yourSolution: 'strong' | 'moderate' | 'weak';
  doNothing: 'strong' | 'moderate' | 'weak';
  competitors: 'strong' | 'moderate' | 'weak';
}

interface MemoDifferentiationCardProps {
  solutionText: string;
  problemText?: string;
  companyName: string;
}

function extractDifferentiators(solutionText: string, problemText?: string): DifferentiationFactor[] {
  const textLower = safeLower(solutionText, "MemoDifferentiationCard") + ' ' + safeLower(problemText || '', "MemoDifferentiationCard.problem");
  
  const factors: DifferentiationFactor[] = [];
  
  // Speed/Time to value
  const speedKeywords = ['fast', 'quick', 'instant', 'real-time', 'automated', 'minutes not hours'];
  const hasSpeed = speedKeywords.some(k => textLower.includes(k));
  factors.push({
    factor: 'Speed / Time to Value',
    yourSolution: hasSpeed ? 'strong' : 'moderate',
    doNothing: 'weak',
    competitors: 'moderate'
  });
  
  // Cost efficiency
  const costKeywords = ['cheaper', 'affordable', 'save', 'reduce cost', 'roi', 'efficient'];
  const hasCost = costKeywords.some(k => textLower.includes(k));
  factors.push({
    factor: 'Cost Efficiency',
    yourSolution: hasCost ? 'strong' : 'moderate',
    doNothing: 'weak',
    competitors: 'moderate'
  });
  
  // Ease of use
  const easeKeywords = ['simple', 'easy', 'intuitive', 'no-code', 'self-serve', 'frictionless'];
  const hasEase = easeKeywords.some(k => textLower.includes(k));
  factors.push({
    factor: 'Ease of Use',
    yourSolution: hasEase ? 'strong' : 'moderate',
    doNothing: 'moderate',
    competitors: 'moderate'
  });
  
  // Innovation/Tech
  const techKeywords = ['ai', 'machine learning', 'proprietary', 'patented', 'novel', 'unique', 'first'];
  const hasTech = techKeywords.some(k => textLower.includes(k));
  factors.push({
    factor: 'Innovation / Technology',
    yourSolution: hasTech ? 'strong' : 'moderate',
    doNothing: 'weak',
    competitors: 'moderate'
  });
  
  // Integration/Ecosystem
  const integrationKeywords = ['integrate', 'connect', 'api', 'ecosystem', 'compatible', 'plug'];
  const hasIntegration = integrationKeywords.some(k => textLower.includes(k));
  factors.push({
    factor: 'Integration Capability',
    yourSolution: hasIntegration ? 'strong' : 'moderate',
    doNothing: 'weak',
    competitors: 'moderate'
  });
  
  // Scalability
  const scaleKeywords = ['scale', 'enterprise', 'grow', 'unlimited', 'any size'];
  const hasScale = scaleKeywords.some(k => textLower.includes(k));
  factors.push({
    factor: 'Scalability',
    yourSolution: hasScale ? 'strong' : 'moderate',
    doNothing: 'weak',
    competitors: 'moderate'
  });
  
  return factors;
}

function getStrengthIcon(strength: 'strong' | 'moderate' | 'weak') {
  switch (strength) {
    case 'strong': return <Check className="w-4 h-4 text-green-500" />;
    case 'moderate': return <Minus className="w-4 h-4 text-yellow-500" />;
    case 'weak': return <X className="w-4 h-4 text-red-400" />;
  }
}

function getStrengthColor(strength: 'strong' | 'moderate' | 'weak') {
  switch (strength) {
    case 'strong': return 'bg-green-500/10 border-green-500/20';
    case 'moderate': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'weak': return 'bg-red-500/10 border-red-500/20';
  }
}

function calculateDifferentiationScore(factors: DifferentiationFactor[]): number {
  let score = 0;
  const strengthValue = { 'strong': 3, 'moderate': 2, 'weak': 1 };
  
  factors.forEach(f => {
    const yourScore = strengthValue[f.yourSolution];
    const compScore = strengthValue[f.competitors];
    const delta = yourScore - compScore;
    score += delta * 10 + 10; // Normalize to 0-30 range per factor
  });
  
  return Math.min(100, Math.max(0, Math.round(score / factors.length * 3)));
}

function getUVPSuggestions(factors: DifferentiationFactor[]): string[] {
  const suggestions: string[] = [];
  
  const weakAreas = factors.filter(f => f.yourSolution === 'weak' || f.yourSolution === 'moderate');
  
  if (weakAreas.some(f => f.factor.includes('Speed'))) {
    suggestions.push("Quantify time savings (e.g., '10x faster than manual processes')");
  }
  if (weakAreas.some(f => f.factor.includes('Cost'))) {
    suggestions.push("Add specific ROI figures or cost comparison to alternatives");
  }
  if (weakAreas.some(f => f.factor.includes('Innovation'))) {
    suggestions.push("Highlight proprietary technology or unique methodology");
  }
  if (weakAreas.some(f => f.factor.includes('Integration'))) {
    suggestions.push("Mention key integrations or API capabilities");
  }
  
  return suggestions.slice(0, 3);
}

export function MemoDifferentiationCard({ solutionText, problemText, companyName }: MemoDifferentiationCardProps) {
  const factors = extractDifferentiators(solutionText, problemText);
  const score = calculateDifferentiationScore(factors);
  const suggestions = getUVPSuggestions(factors);
  
  const strongCount = factors.filter(f => f.yourSolution === 'strong').length;
  
  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-cyan-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Crosshair className="w-6 h-6 text-cyan-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Differentiation Matrix</h3>
          <p className="text-sm text-muted-foreground">How does {companyName} stack up?</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Differentiation Strength</span>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${score >= 70 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-400'}`}>
              {score}
            </span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {strongCount} of {factors.length} strong differentiators
          </span>
          <span className="text-muted-foreground">Target: 70+ (Clear UVP)</span>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-3 px-2 text-muted-foreground font-medium">Factor</th>
              <th className="text-center py-3 px-2 text-primary font-semibold">{companyName}</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Do Nothing</th>
              <th className="text-center py-3 px-2 text-muted-foreground font-medium">Competitors</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((factor, idx) => (
              <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                <td className="py-3 px-2 font-medium text-foreground">{factor.factor}</td>
                <td className="py-3 px-2">
                  <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center border ${getStrengthColor(factor.yourSolution)}`}>
                    {getStrengthIcon(factor.yourSolution)}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center border ${getStrengthColor(factor.doNothing)}`}>
                    {getStrengthIcon(factor.doNothing)}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center border ${getStrengthColor(factor.competitors)}`}>
                    {getStrengthIcon(factor.competitors)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          <span>Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus className="w-3 h-3 text-yellow-500" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <X className="w-3 h-3 text-red-400" />
          <span>Weak</span>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-t border-border/30 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Strengthen Your Value Proposition</span>
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
          <span className="font-semibold text-foreground">VC Perspective:</span> VCs need to see clear differentiation from the "do nothing" option and existing competitors. The strongest companies have 3+ dimensions where they're clearly superior.
        </p>
      </div>
    </div>
  );
}
