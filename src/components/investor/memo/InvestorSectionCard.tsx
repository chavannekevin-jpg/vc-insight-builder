import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InvestorSectionCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  score?: number;
  isExpanded: boolean;
  onToggle: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const getScoreConfig = (score: number) => {
  if (score >= 70) return { color: 'text-green-400', bg: 'bg-green-500', label: 'Strong' };
  if (score >= 50) return { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Moderate' };
  return { color: 'text-red-400', bg: 'bg-red-500', label: 'Weak' };
};

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent';
    case 'warning':
      return 'border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent';
    case 'danger':
      return 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent';
    default:
      return 'border-border/50';
  }
};

export const InvestorSectionCard: React.FC<InvestorSectionCardProps> = ({
  title,
  content,
  icon,
  score,
  isExpanded,
  onToggle,
  variant = 'default'
}) => {
  const scoreConfig = score ? getScoreConfig(score) : null;

  return (
    <Card className={`transition-all duration-200 ${getVariantStyles(variant)} ${isExpanded ? 'ring-1 ring-primary/30' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  {icon}
                </div>
                <CardTitle className="text-base md:text-lg truncate">
                  {title}
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                {score !== undefined && scoreConfig && (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-16">
                      <Progress 
                        value={score} 
                        className="h-1.5"
                      />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${scoreConfig.color} border-current/30`}
                    >
                      {score}
                    </Badge>
                  </div>
                )}
                
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5">
            {/* Mobile score display */}
            {score !== undefined && scoreConfig && (
              <div className="flex sm:hidden items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Score:</span>
                <Progress value={score} className="h-2 flex-1" />
                <Badge 
                  variant="outline" 
                  className={`text-xs ${scoreConfig.color} border-current/30`}
                >
                  {score} - {scoreConfig.label}
                </Badge>
              </div>
            )}
            
            {/* Content */}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
