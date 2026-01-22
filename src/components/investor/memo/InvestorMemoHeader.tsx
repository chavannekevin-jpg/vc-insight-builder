import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Target, 
  Upload, 
  Save, 
  Share2, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface QuickAnalysis {
  overall_score: number;
  readiness_level: 'LOW' | 'MEDIUM' | 'HIGH';
  one_liner_verdict: string;
  section_scores: {
    team: number;
    market: number;
    traction: number;
    product: number;
    business_model: number;
    competition: number;
  };
}

interface InvestorMemoHeaderProps {
  companyName: string;
  tagline: string;
  stage: string;
  sector: string;
  quickAnalysis?: QuickAnalysis;
  onSaveToDealflow?: () => void;
  onShare?: () => void;
  onUploadAnother?: () => void;
  isSaving?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

const getScoreRingColor = (score: number) => {
  if (score >= 70) return 'stroke-green-500';
  if (score >= 50) return 'stroke-yellow-500';
  return 'stroke-red-500';
};

const getScoreGlow = (score: number) => {
  if (score >= 70) return 'shadow-[0_0_30px_rgba(34,197,94,0.4)]';
  if (score >= 50) return 'shadow-[0_0_30px_rgba(234,179,8,0.4)]';
  return 'shadow-[0_0_30px_rgba(239,68,68,0.4)]';
};

const getReadinessConfig = (level: string) => {
  switch (level) {
    case 'HIGH':
      return { 
        bg: 'bg-green-500/20', 
        border: 'border-green-500/50', 
        text: 'text-green-400',
        label: 'Ready to Invest',
        icon: TrendingUp
      };
    case 'MEDIUM':
      return { 
        bg: 'bg-yellow-500/20', 
        border: 'border-yellow-500/50', 
        text: 'text-yellow-400',
        label: 'Conditional',
        icon: Minus
      };
    default:
      return { 
        bg: 'bg-red-500/20', 
        border: 'border-red-500/50', 
        text: 'text-red-400',
        label: 'Not Ready',
        icon: TrendingDown
      };
  }
};

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 100 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className={`relative ${getScoreGlow(score)} rounded-full`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={`${getScoreRingColor(score)} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

export const InvestorMemoHeader: React.FC<InvestorMemoHeaderProps> = ({
  companyName,
  tagline,
  stage,
  sector,
  quickAnalysis,
  onSaveToDealflow,
  onShare,
  onUploadAnother,
  isSaving = false
}) => {
  const readinessConfig = getReadinessConfig(quickAnalysis?.readiness_level || 'LOW');
  const ReadinessIcon = readinessConfig.icon;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 p-6">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        {/* Left: Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
              {companyName}
            </h1>
          </div>
          
          <p className="text-muted-foreground mb-4 line-clamp-2">{tagline}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              <Target className="w-3 h-3 mr-1" />
              {stage}
            </Badge>
            <Badge variant="outline" className="bg-secondary/50">
              {sector}
            </Badge>
          </div>
        </div>

        {/* Center: Score Ring */}
        {quickAnalysis && (
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={quickAnalysis.overall_score} />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${readinessConfig.bg} border ${readinessConfig.border}`}>
              <ReadinessIcon className={`w-4 h-4 ${readinessConfig.text}`} />
              <span className={`text-sm font-medium ${readinessConfig.text}`}>
                {readinessConfig.label}
              </span>
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button 
            onClick={onSaveToDealflow}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Dealflow'}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUploadAnother}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-1" />
              New
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom: VC Verdict */}
      {quickAnalysis?.one_liner_verdict && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-lg italic text-muted-foreground">
            "{quickAnalysis.one_liner_verdict}"
          </p>
        </div>
      )}
    </div>
  );
};
