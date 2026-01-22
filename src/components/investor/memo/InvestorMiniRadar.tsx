import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface SectionScores {
  team: number;
  market: number;
  traction: number;
  product: number;
  business_model: number;
  competition: number;
}

interface InvestorMiniRadarProps {
  sectionScores: SectionScores;
}

const BENCHMARK_SCORE = 60; // Fundable threshold

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAboveBenchmark = data.score >= BENCHMARK_SCORE;
    
    return (
      <div className="bg-card border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{data.label}</p>
        <p className={`text-lg font-bold ${isAboveBenchmark ? 'text-green-400' : 'text-yellow-400'}`}>
          Score: {data.score}
        </p>
        <p className="text-xs text-muted-foreground">
          Benchmark: {BENCHMARK_SCORE}
        </p>
      </div>
    );
  }
  return null;
};

export const InvestorMiniRadar: React.FC<InvestorMiniRadarProps> = ({
  sectionScores
}) => {
  const radarData = [
    { label: 'Team', score: sectionScores.team, benchmark: BENCHMARK_SCORE },
    { label: 'Market', score: sectionScores.market, benchmark: BENCHMARK_SCORE },
    { label: 'Traction', score: sectionScores.traction, benchmark: BENCHMARK_SCORE },
    { label: 'Product', score: sectionScores.product, benchmark: BENCHMARK_SCORE },
    { label: 'Model', score: sectionScores.business_model, benchmark: BENCHMARK_SCORE },
    { label: 'Moat', score: sectionScores.competition, benchmark: BENCHMARK_SCORE },
  ];

  const avgScore = Math.round(
    Object.values(sectionScores).reduce((a, b) => a + b, 0) / 6
  );

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Section Scores
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            Avg: <span className={avgScore >= 60 ? 'text-green-400' : 'text-yellow-400'}>{avgScore}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid 
                stroke="hsl(var(--muted-foreground))" 
                strokeOpacity={0.2}
                gridType="polygon"
              />
              <PolarAngleAxis 
                dataKey="label" 
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 11,
                  fontWeight: 500
                }}
                tickLine={false}
              />
              
              {/* Benchmark line at 60 */}
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="transparent"
                strokeOpacity={0.5}
              />
              
              {/* Actual scores */}
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="hsl(var(--primary))"
                fillOpacity={0.25}
              />
              
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Mini legend */}
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
            <span className="text-muted-foreground">Your Scores</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-primary/50" />
            <span className="text-muted-foreground">Fundable (60)</span>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
          {radarData.map((item) => (
            <div 
              key={item.label}
              className={`text-center p-2 rounded-lg ${
                item.score >= BENCHMARK_SCORE 
                  ? 'bg-green-500/10' 
                  : item.score >= 40 
                    ? 'bg-yellow-500/10' 
                    : 'bg-red-500/10'
              }`}
            >
              <div className={`text-lg font-bold ${
                item.score >= BENCHMARK_SCORE 
                  ? 'text-green-400' 
                  : item.score >= 40 
                    ? 'text-yellow-400' 
                    : 'text-red-400'
              }`}>
                {item.score}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
