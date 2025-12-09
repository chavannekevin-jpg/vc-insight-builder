import { TrendingUp, Building, Target, DollarSign, Calendar } from "lucide-react";
import { ExitPathData, getSuggestedAcquirers } from "@/lib/memoDataExtractor";

interface MemoExitPathCardProps {
  exitData: ExitPathData;
  companyName: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function calculateExitScenarios(arr: number, multiples: { low: number; mid: number; high: number }) {
  return {
    conservative: arr * multiples.low,
    moderate: arr * multiples.mid,
    optimistic: arr * multiples.high
  };
}

function calculateVCReturns(exitValue: number, ownershipPercent: number) {
  return exitValue * (ownershipPercent / 100);
}

export function MemoExitPathCard({ exitData, companyName }: MemoExitPathCardProps) {
  const suggestedAcquirers = getSuggestedAcquirers(exitData.category);
  
  // Calculate scenarios for $100M ARR target (venture scale)
  const targetARR = 100000000; // $100M
  const scenarios = calculateExitScenarios(targetARR, exitData.revenueMultiple);
  
  // Typical VC ownership at exit
  const vcOwnershipScenarios = [10, 15, 20]; // %
  
  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-green-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Exit Path Analysis</h3>
          <p className="text-sm text-muted-foreground">VC return modeling for {companyName}</p>
        </div>
      </div>

      {/* Revenue Multiple Context */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Revenue Multiple Range ({exitData.category})</span>
          <span className="text-sm font-bold text-foreground">
            {exitData.revenueMultiple.low}x – {exitData.revenueMultiple.high}x ARR
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden relative">
            <div 
              className="absolute h-full bg-gradient-to-r from-yellow-500 via-green-500 to-green-600 rounded-full"
              style={{ 
                left: `${(exitData.revenueMultiple.low / 25) * 100}%`,
                width: `${((exitData.revenueMultiple.high - exitData.revenueMultiple.low) / 25) * 100}%`
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Conservative</span>
          <span>Market Rate: {exitData.revenueMultiple.mid}x</span>
          <span>Optimistic</span>
        </div>
      </div>

      {/* Exit Scenarios at $100M ARR */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Exit Valuation at $100M ARR (Venture Scale)
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/50 border border-border/30 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Conservative</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(scenarios.conservative)}</p>
            <p className="text-xs text-muted-foreground">{exitData.revenueMultiple.low}x</p>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-center">
            <p className="text-xs text-green-600 mb-1">Expected</p>
            <p className="text-xl font-bold text-green-500">{formatCurrency(scenarios.moderate)}</p>
            <p className="text-xs text-green-600">{exitData.revenueMultiple.mid}x</p>
          </div>
          <div className="bg-background/50 border border-border/30 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Optimistic</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(scenarios.optimistic)}</p>
            <p className="text-xs text-muted-foreground">{exitData.revenueMultiple.high}x</p>
          </div>
        </div>
      </div>

      {/* VC Return Math */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          VC Return Math (at {formatCurrency(scenarios.moderate)} exit)
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {vcOwnershipScenarios.map(ownership => (
            <div key={ownership} className="bg-background/50 border border-border/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{ownership}% ownership</p>
              <p className="text-base font-bold text-foreground">
                {formatCurrency(calculateVCReturns(scenarios.moderate, ownership))}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          At expected exit valuation of {formatCurrency(scenarios.moderate)}
        </p>
      </div>

      {/* Potential Acquirers */}
      <div className="border-t border-border/30 pt-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          Potential Strategic Acquirers
        </h4>
        <div className="flex flex-wrap gap-2">
          {suggestedAcquirers.map((acquirer, idx) => (
            <span 
              key={idx}
              className="px-3 py-1.5 bg-background/50 border border-border/30 rounded-full text-sm text-foreground"
            >
              {acquirer}
            </span>
          ))}
        </div>
      </div>

      {/* Current ARR Context if available */}
      {exitData.currentARR && (
        <div className="mt-5 pt-5 border-t border-border/30">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Current ARR:</span>
            <span className="font-semibold text-foreground">{formatCurrency(exitData.currentARR)}</span>
            <span className="text-muted-foreground">
              ({((exitData.currentARR / targetARR) * 100).toFixed(1)}% to venture scale)
            </span>
          </div>
        </div>
      )}

      {/* VC Perspective */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> These multiples assume healthy growth rates (40%+ YoY) and strong unit economics. Actual exit valuations depend heavily on market conditions, competitive dynamics, and strategic fit.
        </p>
      </div>
    </div>
  );
}
