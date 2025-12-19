import { useState } from "react";
import { 
  Calculator, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Users, 
  Building, 
  ShoppingCart, 
  TrendingUp,
  Sparkles,
  Target,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnchoredAssumptions, AIMetricEstimate } from "@/lib/anchoredAssumptions";
import type { BusinessModelType } from "@/lib/businessModelFramework";

interface MemoAnchoredAssumptionsProps {
  assumptions: AnchoredAssumptions;
  companyName?: string;
  onEdit?: () => void;
}

const businessModelLabels: Record<BusinessModelType, { label: string; icon: typeof Building }> = {
  b2c_subscription: { label: 'B2C Subscription', icon: Users },
  b2c_transactional: { label: 'B2C Transactional', icon: ShoppingCart },
  b2b_smb_saas: { label: 'B2B SMB SaaS', icon: Building },
  b2b_mid_market: { label: 'B2B Mid-Market', icon: Building },
  b2b_enterprise: { label: 'B2B Enterprise', icon: Building },
  marketplace: { label: 'Marketplace', icon: ShoppingCart },
  fintech_aum: { label: 'Fintech AUM', icon: TrendingUp },
  agency_services: { label: 'Agency/Services', icon: Building },
  hardware: { label: 'Hardware', icon: Building },
  unknown: { label: 'General', icon: Building },
};

const sourceConfig: Record<AnchoredAssumptions['source'], { label: string; color: string; icon: typeof Info }> = {
  founder_input: { label: 'Founder Input', color: 'bg-success/20 text-success border-success/30', icon: Target },
  company_model: { label: 'Company Data', color: 'bg-success/20 text-success border-success/30', icon: Target },
  ai_extracted: { label: 'AI Extracted', color: 'bg-warning/20 text-warning border-warning/30', icon: Sparkles },
  ai_estimated: { label: 'AI Estimated', color: 'bg-primary/20 text-primary border-primary/30', icon: Sparkles },
  default: { label: 'Default', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle },
};

const confidenceConfig: Record<'high' | 'medium' | 'low', { label: string; color: string }> = {
  high: { label: 'High Confidence', color: 'text-success' },
  medium: { label: 'Medium Confidence', color: 'text-warning' },
  low: { label: 'Low Confidence', color: 'text-destructive' },
};

const formatCurrency = (value: number, currency: string = 'USD'): string => {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', SEK: 'kr', NOK: 'kr', DKK: 'kr' };
  const symbol = symbols[currency] || '$';
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${symbol}${Math.round(value / 1000)}k`;
  return `${symbol}${value.toLocaleString()}`;
};

const formatPeriod = (periodicity: string): string => {
  switch (periodicity) {
    case 'monthly': return '/month';
    case 'annual': return '/year';
    case 'per_transaction': return '/transaction';
    default: return '';
  }
};

export const MemoAnchoredAssumptions = ({ 
  assumptions, 
  companyName = 'Company',
  onEdit 
}: MemoAnchoredAssumptionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const modelConfig = businessModelLabels[assumptions.businessModelType] || businessModelLabels.unknown;
  const ModelIcon = modelConfig.icon;
  const sourceInfo = sourceConfig[assumptions.source] || sourceConfig.default;
  const SourceIcon = sourceInfo.icon;
  const confidenceInfo = confidenceConfig[assumptions.sourceConfidence] || confidenceConfig.low;
  
  const hasAIEstimate = assumptions.source === 'ai_estimated' && assumptions.aiEstimate;

  return (
    <div className="relative animate-fade-in mb-8">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          {/* Header - Always visible */}
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Key Assumptions</span>
                    <Badge variant="outline" className={`text-xs ${sourceInfo.color}`}>
                      <SourceIcon className="w-3 h-3 mr-1" />
                      {sourceInfo.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ModelIcon className="w-3.5 h-3.5" />
                      {modelConfig.label}
                    </span>
                    <span className="text-border">•</span>
                    <span className="font-medium text-foreground">
                      {assumptions.primaryMetricLabel}: {assumptions.primaryMetricValue 
                        ? `${formatCurrency(assumptions.primaryMetricValue, assumptions.currency)}${formatPeriod(assumptions.periodicity)}`
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="h-8 px-3"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          {/* Expanded content */}
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2 border-t border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Metric Card */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {assumptions.primaryMetricFullLabel}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className={`text-xs font-medium ${confidenceInfo.color}`}>
                            {confidenceInfo.label}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">{assumptions.sourceDescription}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {assumptions.primaryMetricValue 
                        ? formatCurrency(assumptions.primaryMetricValue, assumptions.currency)
                        : '—'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPeriod(assumptions.periodicity)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {assumptions.sourceDescription}
                  </p>
                </div>
                
                {/* Scale Requirements Card */}
                {assumptions.scaleRequirements && (
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Scale to $100M ARR
                    </span>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {assumptions.scaleRequirements.unitsNeeded.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {assumptions.scaleRequirements.unitLabel}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          assumptions.scaleRequirements.feasibilityAssessment === 'highly_feasible' 
                            ? 'bg-success/20 text-success border-success/30'
                            : assumptions.scaleRequirements.feasibilityAssessment === 'feasible'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : assumptions.scaleRequirements.feasibilityAssessment === 'challenging'
                            ? 'bg-warning/20 text-warning border-warning/30'
                            : 'bg-destructive/20 text-destructive border-destructive/30'
                        }`}
                      >
                        {assumptions.scaleRequirements.feasibilityAssessment.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {assumptions.scaleRequirements.context}
                    </p>
                  </div>
                )}
              </div>
              
              {/* AI Comparables Section */}
              {hasAIEstimate && assumptions.aiEstimate && (
                <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">AI Estimation Details</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {assumptions.aiEstimate.reasoning}
                  </p>
                  
                  {assumptions.aiEstimate.comparables && assumptions.aiEstimate.comparables.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Comparable Companies:</span>
                      <div className="flex flex-wrap gap-2">
                        {assumptions.aiEstimate.comparables.map((comp, idx) => (
                          <TooltipProvider key={idx}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="text-xs">
                                  {comp.name}: {formatCurrency(comp.value, assumptions.currency)}
                                </Badge>
                              </TooltipTrigger>
                              {comp.note && (
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">{comp.note}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                    <span className="text-xs text-muted-foreground">
                      Range: {formatCurrency(assumptions.aiEstimate.range.low, assumptions.currency)} – {formatCurrency(assumptions.aiEstimate.range.high, assumptions.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Methodology: {assumptions.aiEstimate.methodology}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
