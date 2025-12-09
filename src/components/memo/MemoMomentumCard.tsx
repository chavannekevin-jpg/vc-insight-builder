import { TrendingUp, Rocket, Users, BarChart3, Zap, AlertTriangle, Target } from "lucide-react";

interface MomentumMetrics {
  growthRate: number | null;
  userCount: number | null;
  revenueSignals: string[];
  retentionSignals: string[];
  velocitySignals: string[];
}

interface MemoMomentumCardProps {
  tractionText: string;
  companyName: string;
  stage: string;
}

function extractMomentumMetrics(text: string): MomentumMetrics {
  const textLower = text.toLowerCase();
  
  // Extract growth rate patterns
  const growthPatterns = [
    /(\d+)%\s*(month|mom|m\/m|weekly|monthly)\s*(growth|increase)/gi,
    /growing\s*(\d+)%/gi,
    /(\d+)x\s*(growth|increase)/gi
  ];
  
  let growthRate: number | null = null;
  for (const pattern of growthPatterns) {
    const match = pattern.exec(text);
    if (match) {
      growthRate = parseInt(match[1]);
      break;
    }
  }
  
  // Extract user count
  const userPatterns = [
    /(\d+(?:,\d{3})*(?:\.\d+)?(?:k|K)?)\s*(users|customers|clients|subscribers)/gi,
    /(users|customers):\s*(\d+(?:,\d{3})*(?:\.\d+)?(?:k|K)?)/gi
  ];
  
  let userCount: number | null = null;
  for (const pattern of userPatterns) {
    const match = pattern.exec(text);
    if (match) {
      const numStr = match[1] || match[2];
      userCount = parseFloat(numStr.replace(/,/g, '').replace(/k/i, '000'));
      break;
    }
  }
  
  // Revenue signals
  const revenueKeywords = ['revenue', 'arr', 'mrr', 'paying', 'monetizing', 'sales', 'contracts', 'deals'];
  const revenueSignals = revenueKeywords.filter(k => textLower.includes(k));
  
  // Retention signals
  const retentionKeywords = ['retention', 'churn', 'nps', 'engagement', 'active', 'returning', 'loyalty'];
  const retentionSignals = retentionKeywords.filter(k => textLower.includes(k));
  
  // Velocity signals
  const velocityKeywords = ['viral', 'organic', 'word of mouth', 'referral', 'waitlist', 'pipeline', 'accelerating'];
  const velocitySignals = velocityKeywords.filter(k => textLower.includes(k));
  
  return {
    growthRate,
    userCount,
    revenueSignals,
    retentionSignals,
    velocitySignals
  };
}

function getMomentumScore(metrics: MomentumMetrics, stage: string): number {
  let score = 30; // Base score
  
  // Growth rate scoring
  if (metrics.growthRate) {
    if (metrics.growthRate >= 20) score += 25; // T2D3 pace
    else if (metrics.growthRate >= 10) score += 15;
    else if (metrics.growthRate >= 5) score += 10;
  }
  
  // User count scoring (stage-adjusted)
  if (metrics.userCount) {
    const stageThresholds: Record<string, number> = {
      'pre-seed': 100,
      'seed': 1000,
      'series a': 10000
    };
    const threshold = stageThresholds[stage.toLowerCase()] || 500;
    if (metrics.userCount >= threshold) score += 20;
    else if (metrics.userCount >= threshold / 2) score += 10;
  }
  
  // Signal scoring
  score += metrics.revenueSignals.length * 3;
  score += metrics.retentionSignals.length * 4;
  score += metrics.velocitySignals.length * 3;
  
  return Math.min(100, score);
}

function getGrowthTrajectory(score: number): { label: string; color: string; icon: React.ReactNode } {
  if (score >= 80) return { label: 'ROCKETSHIP', color: 'text-green-500', icon: <Rocket className="w-5 h-5" /> };
  if (score >= 60) return { label: 'STRONG MOMENTUM', color: 'text-blue-500', icon: <TrendingUp className="w-5 h-5" /> };
  if (score >= 40) return { label: 'BUILDING', color: 'text-yellow-500', icon: <BarChart3 className="w-5 h-5" /> };
  return { label: 'EARLY STAGE', color: 'text-muted-foreground', icon: <Target className="w-5 h-5" /> };
}

function getStageBenchmarks(stage: string): { metric: string; benchmark: string; vcExpectation: string }[] {
  const benchmarks: Record<string, { metric: string; benchmark: string; vcExpectation: string }[]> = {
    'pre-seed': [
      { metric: 'MoM Growth', benchmark: '15-20%', vcExpectation: 'Show early product-market fit signals' },
      { metric: 'Users', benchmark: '100-500', vcExpectation: 'Engaged pilot customers or beta users' },
      { metric: 'Revenue', benchmark: 'Optional', vcExpectation: 'Early monetization is a bonus, not required' },
    ],
    'seed': [
      { metric: 'MoM Growth', benchmark: '15-25%', vcExpectation: 'Consistent growth with repeatability' },
      { metric: 'Users', benchmark: '1,000-5,000', vcExpectation: 'Evidence of scalable acquisition' },
      { metric: 'Revenue', benchmark: '$10K-50K MRR', vcExpectation: 'Clear path to $1M ARR' },
    ],
    'series a': [
      { metric: 'MoM Growth', benchmark: '10-15%', vcExpectation: 'T2D3 trajectory (triple, triple, double, double)' },
      { metric: 'Users', benchmark: '10,000+', vcExpectation: 'Proven scalable acquisition channels' },
      { metric: 'Revenue', benchmark: '$1M+ ARR', vcExpectation: 'Path to $10M ARR visible' },
    ],
  };
  
  return benchmarks[stage.toLowerCase()] || benchmarks['seed'];
}

export function MemoMomentumCard({ tractionText, companyName, stage }: MemoMomentumCardProps) {
  const metrics = extractMomentumMetrics(tractionText);
  const score = getMomentumScore(metrics, stage);
  const trajectory = getGrowthTrajectory(score);
  const benchmarks = getStageBenchmarks(stage);
  
  const hasData = metrics.growthRate || metrics.userCount || 
                  metrics.revenueSignals.length > 0 || 
                  metrics.retentionSignals.length > 0;
  
  return (
    <div className="my-10 bg-gradient-to-br from-card via-card to-green-500/5 border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Momentum Scorecard</h3>
          <p className="text-sm text-muted-foreground">Is {companyName} on a venture trajectory?</p>
        </div>
      </div>

      {/* Overall Momentum Score */}
      <div className="bg-background/50 border border-border/30 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Growth Trajectory</span>
            <span className={trajectory.color}>{trajectory.icon}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${trajectory.color}`}>{score}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-blue-500' : score >= 30 ? 'bg-yellow-500' : 'bg-muted-foreground'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={`font-semibold ${trajectory.color}`}>{trajectory.label}</span>
          <span className="text-muted-foreground">VC Benchmark for {stage}: 60+</span>
        </div>
      </div>

      {/* Key Metrics Extracted */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-background/50 border border-border/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground uppercase">Growth Rate</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {metrics.growthRate ? `${metrics.growthRate}%` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">MoM</p>
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground uppercase">Users/Customers</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {metrics.userCount ? metrics.userCount.toLocaleString() : '—'}
          </p>
          <p className="text-xs text-muted-foreground">detected</p>
        </div>
      </div>

      {/* Traction Signals */}
      {hasData && (
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Detected Traction Signals
          </h4>
          <div className="flex flex-wrap gap-2">
            {metrics.revenueSignals.map((signal, idx) => (
              <span key={`rev-${idx}`} className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                💰 {signal}
              </span>
            ))}
            {metrics.retentionSignals.map((signal, idx) => (
              <span key={`ret-${idx}`} className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                🔄 {signal}
              </span>
            ))}
            {metrics.velocitySignals.map((signal, idx) => (
              <span key={`vel-${idx}`} className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                🚀 {signal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stage Benchmarks */}
      <div className="border-t border-border/30 pt-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          {stage} Stage Benchmarks
        </h4>
        <div className="space-y-3">
          {benchmarks.map((b, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-background/30 rounded-lg p-3 border border-border/20">
              <div className="min-w-[100px]">
                <p className="text-xs text-muted-foreground">{b.metric}</p>
                <p className="text-sm font-semibold text-primary">{b.benchmark}</p>
              </div>
              <p className="text-xs text-muted-foreground flex-1">{b.vcExpectation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VC Context */}
      <div className="mt-5 pt-5 border-t border-border/30">
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">VC Perspective:</span> At {stage} stage, VCs look for "slope over intercept" — the rate of improvement matters more than absolute numbers. Consistent month-over-month growth signals product-market fit.
        </p>
      </div>
    </div>
  );
}
