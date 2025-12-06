import { ArrowRight, TrendingDown, FileText } from 'lucide-react';
import { ModernCard } from '@/components/ModernCard';
import { Badge } from '@/components/ui/badge';
import { OwnershipChart } from './OwnershipChart';
import { 
  DilutionResult, 
  formatCurrency, 
  formatPercentage,
  getStakeholderColor,
  instrumentLabels
} from '@/lib/dilutionCalculator';

interface DilutionComparisonProps {
  result: DilutionResult;
  roundName: string;
}

export function DilutionComparison({ result, roundName }: DilutionComparisonProps) {
  const { preRound, postRound, dilutionPercentages } = result;

  return (
    <div className="space-y-6">
      {/* Charts Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before Round */}
        <ModernCard className="!p-4">
          <OwnershipChart
            stakeholders={preRound.stakeholders}
            esopPool={preRound.esopPool}
            title="Before Round"
            showLegend={false}
          />
        </ModernCard>

        {/* After Round */}
        <ModernCard className="!p-4 relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-glow z-10 hidden lg:flex">
            <ArrowRight className="w-4 h-4 text-primary-foreground" />
          </div>
          <OwnershipChart
            stakeholders={postRound.stakeholders}
            esopPool={postRound.esopPool}
            title={`After ${roundName}`}
            showLegend={false}
          />
        </ModernCard>
      </div>

      {/* Round Summary */}
      <ModernCard className="!p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold">Round Summary</h4>
          <Badge variant="outline" className="gap-1">
            <FileText className="w-3 h-3" />
            {instrumentLabels[postRound.instrument]}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Post-Money</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(postRound.postMoney)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">New Investor</p>
            <p className="text-lg font-bold text-secondary">
              {formatPercentage(postRound.newInvestorOwnership)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Price/Share</p>
            <p className="text-lg font-bold">
              ${postRound.pricePerShare.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">ESOP Pool</p>
            <p className="text-lg font-bold text-accent">
              {postRound.esopPool}%
            </p>
          </div>
        </div>
        {postRound.instrument !== 'equity' && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            💡 {instrumentLabels[postRound.instrument]} converts to equity at next priced round
          </p>
        )}
      </ModernCard>

      {/* Dilution Table */}
      <ModernCard className="!p-4">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-destructive" />
          Dilution Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Stakeholder</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Before</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">After</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Dilution</th>
              </tr>
            </thead>
            <tbody>
              {preRound.stakeholders.map((pre, index) => {
                const post = postRound.stakeholders.find(p => p.id === pre.id);
                const dilution = dilutionPercentages[pre.id] || 0;
                
                return (
                  <tr key={pre.id} className="border-b border-border/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStakeholderColor(pre.type, index) }}
                        />
                        <span className="font-medium">{pre.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatPercentage(pre.ownership || 0)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatPercentage(post?.ownership || 0)}
                    </td>
                    <td className="py-3 px-3 text-right text-destructive">
                      -{dilution.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {/* New Investor Row */}
              <tr className="border-b border-border/30 bg-success/5">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'hsl(140, 100%, 50%)' }}
                    />
                    <span className="font-medium">{roundName} Investor</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-muted-foreground">—</td>
                <td className="py-3 px-3 text-right font-semibold text-success">
                  {formatPercentage(postRound.newInvestorOwnership)}
                </td>
                <td className="py-3 px-3 text-right text-success">New</td>
              </tr>
              {/* ESOP Row */}
              <tr>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full bg-muted-foreground"
                    />
                    <span className="font-medium">ESOP Pool</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  {preRound.esopPool}%
                </td>
                <td className="py-3 px-3 text-right">
                  {postRound.esopPool}%
                </td>
                <td className="py-3 px-3 text-right text-muted-foreground">
                  {postRound.esopPool > preRound.esopPool ? (
                    <span className="text-accent">+{postRound.esopPool - preRound.esopPool}%</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ModernCard>
    </div>
  );
}
