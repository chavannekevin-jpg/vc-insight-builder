import { Calculator, TrendingUp, Target, AlertTriangle, Info } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoVCScaleCardProps {
  avgMonthlyRevenue?: number;  // ARPU in dollars
  currentCustomers?: number;
  currentMRR?: number;
  companyName?: string;
}

export const MemoVCScaleCard = ({ 
  avgMonthlyRevenue = 300, 
  currentCustomers = 0,
  currentMRR = 0,
  companyName = "This company"
}: MemoVCScaleCardProps) => {
  const targetARR = 100_000_000; // $100M
  const annualValue = avgMonthlyRevenue * 12;
  const customersNeeded = Math.ceil(targetARR / annualValue);
  const progressPercent = currentCustomers > 0 
    ? Math.min((currentCustomers / customersNeeded) * 100, 100) 
    : 0;
  
  // Calculate years to target at various growth rates
  const yearsToTarget = (growthRate: number) => {
    if (currentMRR <= 0) return null;
    const currentARR = currentMRR * 12;
    if (currentARR >= targetARR) return 0;
    return Math.ceil(Math.log(targetARR / currentARR) / Math.log(1 + growthRate));
  };

  return (
    <div className="relative animate-fade-in my-10">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-3xl blur-2xl opacity-60" />
      
      <div className="relative bg-card border-2 border-primary/30 rounded-3xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
              <Calculator className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">The VC Scale Test</h3>
              <p className="text-muted-foreground text-sm">Path to $100M ARR</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Why $100M Matters */}
          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
            <div className="flex items-start gap-3 mb-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h4 className="font-semibold text-foreground">Why $100M ARR Matters to VCs</h4>
            </div>
            <div className="pl-8 space-y-2 text-sm text-muted-foreground">
              <p>• VCs need portfolio companies that can <strong className="text-foreground">return their entire fund</strong></p>
              <p>• At typical 10-20% ownership, $100M ARR ≈ <strong className="text-foreground">$500M-1B valuation</strong></p>
              <p>• This is the <strong className="text-primary">minimum bar</strong> for venture-scale opportunity</p>
            </div>
          </div>

          {/* The Math */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              <h4 className="font-semibold text-foreground">The Math for {companyName}</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/60 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">${avgMonthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">per customer</p>
              </div>
              <div className="bg-background/60 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Annual Value</p>
                <p className="text-2xl font-bold text-foreground">${annualValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">per customer/year</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/30 text-center">
                <p className="text-xs text-primary uppercase tracking-wider mb-1 font-semibold">Customers Needed</p>
                <p className="text-2xl font-bold text-primary">{customersNeeded.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">for $100M ARR</p>
              </div>
            </div>

            {/* Formula display */}
            <div className="bg-muted/20 rounded-lg p-4 text-center border border-border/30">
              <p className="text-sm font-mono text-muted-foreground">
                <span className="text-primary font-bold">$100M</span> ÷ (<span className="text-foreground">${avgMonthlyRevenue}</span> × 12) = <span className="text-primary font-bold">{customersNeeded.toLocaleString()}</span> customers
              </p>
            </div>
          </div>

          {/* Reality Check */}
          {currentCustomers > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">Reality Check</h4>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current: <strong className="text-foreground">{currentCustomers.toLocaleString()}</strong> customers</span>
                  <span className="text-primary font-semibold">{progressPercent.toFixed(2)}% of target</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(progressPercent, 1)}%` }}
                  />
                </div>
              </div>

              {/* Growth scenarios */}
              {currentMRR > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { rate: 0.5, label: "50% YoY" },
                    { rate: 1.0, label: "100% YoY" },
                    { rate: 2.0, label: "3x YoY" }
                  ].map(({ rate, label }) => {
                    const years = yearsToTarget(rate);
                    return (
                      <div key={rate} className="bg-background/40 rounded-lg p-3 text-center border border-border/30">
                        <p className="text-xs text-muted-foreground">{label} growth</p>
                        <p className="text-lg font-bold text-foreground">
                          {years ? `${years} years` : 'N/A'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Verdict */}
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl p-4 border border-warning/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">VC Perspective</p>
                <p className="text-sm text-muted-foreground">
                  {currentCustomers > 0 
                    ? `At current traction, exponential growth or higher ARPU tiers are needed to reach venture scale. VCs will probe how realistic the path to ${customersNeeded.toLocaleString()} paying customers is.`
                    : `VCs will calculate whether the market can support ${customersNeeded.toLocaleString()} customers at this price point, and if the company can capture enough of that market.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};