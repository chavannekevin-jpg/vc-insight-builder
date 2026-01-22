import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Flame,
  Shield,
  Zap
} from 'lucide-react';

interface Concern {
  category: string;
  text: string;
  severity: 'critical' | 'warning' | 'minor';
}

interface Strength {
  category: string;
  text: string;
}

interface InvestorQuickTakeProps {
  concerns: Concern[];
  strengths: Strength[];
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case 'critical':
      return {
        icon: XCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-400 border-red-500/40'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
      };
    default:
      return {
        icon: AlertCircle,
        bg: 'bg-muted/30',
        border: 'border-muted/50',
        text: 'text-muted-foreground',
        badge: 'bg-muted/30 text-muted-foreground border-muted/50'
      };
  }
};

const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('product') || lowerCategory.includes('solution')) return Zap;
  if (lowerCategory.includes('team')) return Shield;
  if (lowerCategory.includes('market')) return Sparkles;
  return Flame;
};

export const InvestorQuickTake: React.FC<InvestorQuickTakeProps> = ({
  concerns,
  strengths
}) => {
  // Limit to 4 items each for quick scanning
  const displayedConcerns = concerns.slice(0, 4);
  const displayedStrengths = strengths.slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Red Flags / Concerns */}
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Red Flags & Concerns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedConcerns.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No major concerns identified</p>
          ) : (
            displayedConcerns.map((concern, index) => {
              const config = getSeverityConfig(concern.severity);
              const Icon = config.icon;
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${config.bg} border ${config.border} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${config.badge}`}
                        >
                          {concern.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {concern.category}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {concern.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            Key Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedStrengths.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No key strengths identified</p>
          ) : (
            displayedStrengths.map((strength, index) => {
              const CategoryIcon = getCategoryIcon(strength.category);
              
              return (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-3">
                    <CategoryIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-green-400 capitalize font-medium">
                          {strength.category}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {strength.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
