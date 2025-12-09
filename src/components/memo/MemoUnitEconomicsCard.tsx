import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Minus } from "lucide-react";
import { UnitEconomicsData } from "@/lib/memoDataExtractor";

interface MemoUnitEconomicsCardProps {
  unitEconomics: UnitEconomicsData;
  companyName: string;
}

type HealthStatus = 'healthy' | 'caution' | 'concern' | 'unknown';

function getLTVCACStatus(ratio: number | undefined): { status: HealthStatus; label: string; benchmark: string } {
  if (!ratio) return { status: 'unknown', label: 'Not Available', benchmark: 'Healthy: ≥3x' };
  if (ratio >= 3) return { status: 'healthy', label: `${ratio}x`, benchmark: '≥3x' };
  if (ratio >= 2) return { status: 'caution', label: `${ratio}x`, benchmark: '≥3x' };
  return { status: 'concern', label: `${ratio}x`, benchmark: '≥3x' };
}

function getPaybackStatus(months: number | undefined): { status: HealthStatus; label: string; benchmark: string } {
  if (!months) return { status: 'unknown', label: 'Not Available', benchmark: 'Healthy: ≤12mo' };
  if (months <= 12) return { status: 'healthy', label: `${months} mo`, benchmark: '≤12 months' };
  if (months <= 18) return { status: 'caution', label: `${months} mo`, benchmark: '≤12 months' };
  return { status: 'concern', label: `${months} mo`, benchmark: '≤12 months' };
}

function getGrossMarginStatus(margin: number | undefined): { status: HealthStatus; label: string; benchmark: string } {
  if (!margin) return { status: 'unknown', label: 'Not Available', benchmark: 'SaaS: ≥70%' };
  if (margin >= 70) return { status: 'healthy', label: `${margin}%`, benchmark: '≥70%' };
  if (margin >= 50) return { status: 'caution', label: `${margin}%`, benchmark: '≥70%' };
  return { status: 'concern', label: `${margin}%`, benchmark: '≥70%' };
}

function getChurnStatus(churn: number | undefined): { status: HealthStatus; label: string; benchmark: string } {
  if (!churn) return { status: 'unknown', label: 'Not Available', benchmark: 'Healthy: ≤2%' };
  if (churn <= 2) return { status: 'healthy', label: `${churn}%`, benchmark: '≤2% monthly' };
  if (churn <= 5) return { status: 'caution', label: `${churn}%`, benchmark: '≤2% monthly' };
  return { status: 'concern', label: `${churn}%`, benchmark: '≤2% monthly' };
}

function getStatusIcon(status: HealthStatus): React.ReactNode {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'caution':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'concern':
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    default:
      return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy': return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'caution': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'concern': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-muted-foreground bg-muted/30 border-border/30';
  }
}

function getOptimizationSuggestions(unitEconomics: UnitEconomicsData): string[] {
  const suggestions: string[] = [];
  
  if (unitEconomics.ltvCacRatio && unitEconomics.ltvCacRatio < 3) {
    suggestions.push("Improve LTV:CAC ratio by focusing on customer retention or reducing acquisition costs");
  }
  if (unitEconomics.paybackMonths && unitEconomics.paybackMonths > 12) {
    suggestions.push("Reduce payback period through pricing optimization or upsell strategies");
  }
  if (unitEconomics.grossMargin && unitEconomics.grossMargin < 70) {
    suggestions.push("Increase gross margins by automating support, optimizing infrastructure costs");
  }
  if (unitEconomics.monthlyChurn && unitEconomics.monthlyChurn > 2) {
    suggestions.push("Address churn through better onboarding, product stickiness, or customer success");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Maintain current trajectory - unit economics are venture-grade");
  }
  
  return suggestions.slice(0, 3);
}

export function MemoUnitEconomicsCard({ unitEconomics, companyName }: MemoUnitEconomicsCardProps) {
  const ltvCacStatus = getLTVCACStatus(unitEconomics.ltvCacRatio);
  const paybackStatus = getPaybackStatus(unitEconomics.paybackMonths);
  const marginStatus = getGrossMarginStatus(unitEconomics.grossMargin);
  const churnStatus = getChurnStatus(unitEconomics.monthlyChurn);
  
  const suggestions = getOptimizationSuggestions(unitEconomics);
  
  // Calculate overall health
  const statuses = [ltvCacStatus.status, paybackStatus.status, marginStatus.status, churnStatus.status];
  const knownStatuses = statuses.filter(s => s !== 'unknown');
  const healthyCount = knownStatuses.filter(s => s === 'healthy').length;
  const concernCount = knownStatuses.filter(s => s === 'concern').length;
  
  let overallHealth: { label: string; color: string } = { label: 'Insufficient Data', color: 'text-muted-foreground' };
  if (knownStatuses.length >= 2) {
    if (concernCount >= 2) {
      overallHealth = { label: 'Needs Work', color: 'text-red-400' };
    } else if (healthyCount >= 2) {
      overallHealth = { label: 'Venture Grade', color: 'text-green-500' };
    } else {
      overallHealth = { label: 'Developing', color: 'text-yellow-500' };
    }
  }

  const metrics = [
    { label: 'LTV:CAC Ratio', ...ltvCacStatus },
    { label: 'CAC Payback', ...paybackStatus },
    { label: 'Gross Margin', ...marginStatus },
    { label: 'Monthly Churn', ...churnStatus }
  ];

  // Only show if we have at least some data
  const hasData = unitEconomics.ltv || unitEconomics.cac || unitEconomics.grossMargin || unitEconomics.monthlyChurn;
  
  if (!hasData) {
    return null;
  }

  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-orange-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">Unit Economics Health</h3>
          <p className="text-sm text-muted-foreground">Financial sustainability analysis for {companyName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${overallHealth.color} bg-background/50 border border-border/30`}>
          {overallHealth.label}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((metric, idx) => (
          <div 
            key={idx}
            className={`rounded-xl p-4 border ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(metric.status)}
              <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
            </div>
            <p className="text-lg font-bold">{metric.label}</p>
            <p className="text-xs text-muted-foreground">{metric.benchmark}</p>
          </div>
        ))}
      </div>

      {/* Raw Values if available */}
      {(unitEconomics.ltv || unitEconomics.cac) && (
        <div className="bg-background/50 border border-border/30 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            {unitEconomics.ltv && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lifetime Value (LTV)</p>
                <p className="text-lg font-bold text-foreground">${unitEconomics.ltv.toLocaleString()}</p>
              </div>
            )}
            {unitEconomics.cac && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer Acquisition Cost</p>
                <p className="text-lg font-bold text-foreground">${unitEconomics.cac.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      <div className="border-t border-border/30 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Optimization Opportunities</span>
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

      {/* VC Context */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> Strong unit economics de-risk the investment thesis. VCs look for LTV:CAC ≥3x and payback ≤12 months as signs of capital-efficient growth potential.
        </p>
      </div>
    </div>
  );
}
