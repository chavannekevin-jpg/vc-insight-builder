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
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { 
  AnchoredAssumptions, 
  AIMetricEstimate,
  FinancialMetricSet,
  MetricDiscrepancy,
  ClassifiedMetric,
  MetricClassification
} from "@/lib/anchoredAssumptions";
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
  calculated: { label: 'Calculated', color: 'bg-success/20 text-success border-success/30', icon: Calculator },
  ai_extracted: { label: 'AI Extracted', color: 'bg-warning/20 text-warning border-warning/30', icon: Sparkles },
  ai_estimated: { label: 'AI Estimated', color: 'bg-primary/20 text-primary border-primary/30', icon: Sparkles },
  default: { label: 'Default', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle },
};

const confidenceConfig: Record<'high' | 'medium' | 'low', { label: string; color: string }> = {
  high: { label: 'High Confidence', color: 'text-success' },
  medium: { label: 'Medium Confidence', color: 'text-warning' },
  low: { label: 'Low Confidence', color: 'text-destructive' },
};

const classificationConfig: Record<MetricClassification, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  actual: { label: 'Actual', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle2 },
  calculated: { label: 'Calculated', color: 'bg-primary/20 text-primary border-primary/30', icon: Calculator },
  projected: { label: 'Projected', color: 'bg-warning/20 text-warning border-warning/30', icon: TrendingUp },
  target: { label: 'Target', color: 'bg-muted text-muted-foreground border-border', icon: Target },
  assumed: { label: 'Assumed', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertCircle },
  minimum: { label: 'Minimum', color: 'bg-accent/50 text-accent-foreground border-accent', icon: AlertTriangle },
  benchmark: { label: 'Benchmark', color: 'bg-secondary text-secondary-foreground border-secondary', icon: Info },
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

const ClassifiedMetricDisplay = ({ 
  metric, 
  label,
  showCalculation = false 
}: { 
  metric: ClassifiedMetric; 
  label: string;
  showCalculation?: boolean;
}) => {
  const config = classificationConfig[metric.classification];
  const ClassIcon = config.icon;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant="outline" className={`text-xs ${config.color}`}>
        <ClassIcon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
      <span className="font-medium">{label}:</span>
      <span className="font-bold">{formatCurrency(metric.value, metric.currency)}</span>
      {metric.asOfDate && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {metric.asOfDate}
        </span>
      )}
      {showCalculation && metric.calculationMethod && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-xs">{metric.calculationMethod}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

const DiscrepancyAlert = ({ discrepancy }: { discrepancy: MetricDiscrepancy }) => {
  return (
    <div className={`p-3 rounded-lg border ${
      discrepancy.severity === 'error' 
        ? 'bg-destructive/10 border-destructive/30' 
        : discrepancy.severity === 'warning'
        ? 'bg-warning/10 border-warning/30'
        : 'bg-muted border-border'
    }`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
          discrepancy.severity === 'error' ? 'text-destructive' : 'text-warning'
        }`} />
        <div className="space-y-1">
          <p className="text-sm">{discrepancy.explanation}</p>
          {discrepancy.recommendation && (
            <p className="text-xs text-muted-foreground">{discrepancy.recommendation}</p>
          )}
        </div>
      </div>
    </div>
  );
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
  const hasClassifiedMetrics = assumptions.classifiedMetrics;
  const hasDiscrepancies = assumptions.metricDiscrepancies && assumptions.metricDiscrepancies.length > 0;

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
                    {hasDiscrepancies && (
                      <Badge variant="outline" className="text-xs bg-warning/20 text-warning border-warning/30">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {assumptions.metricDiscrepancies!.length} issue{assumptions.metricDiscrepancies!.length > 1 ? 's' : ''}
                      </Badge>
                    )}
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
            <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-4">
              {/* Discrepancy Alerts */}
              {hasDiscrepancies && (
                <div className="space-y-2">
                  {assumptions.metricDiscrepancies!.map((discrepancy, idx) => (
                    <DiscrepancyAlert key={idx} discrepancy={discrepancy} />
                  ))}
                </div>
              )}
              
              {/* Classified Metrics Section */}
              {hasClassifiedMetrics && (
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Financial Metrics (Classified)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Actual Metrics */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Actual (Verified)
                      </span>
                      <div className="space-y-1.5">
                        {assumptions.classifiedMetrics!.arr.actual && (
                          <ClassifiedMetricDisplay 
                            metric={assumptions.classifiedMetrics!.arr.actual} 
                            label="ARR"
                            showCalculation
                          />
                        )}
                        {assumptions.classifiedMetrics!.mrr.actual && (
                          <ClassifiedMetricDisplay 
                            metric={assumptions.classifiedMetrics!.mrr.actual} 
                            label="MRR"
                          />
                        )}
                        {assumptions.classifiedMetrics!.acv.actual && (
                          <ClassifiedMetricDisplay 
                            metric={assumptions.classifiedMetrics!.acv.actual} 
                            label="Avg ACV"
                            showCalculation
                          />
                        )}
                        {assumptions.classifiedMetrics!.customers.actual && (
                          <ClassifiedMetricDisplay 
                            metric={assumptions.classifiedMetrics!.customers.actual} 
                            label="Customers"
                          />
                        )}
                        {assumptions.classifiedMetrics!.growth.yearlyRate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Actual
                            </Badge>
                            <span className="font-medium">YoY Growth:</span>
                            <span className="font-bold text-success">
                              +{assumptions.classifiedMetrics!.growth.yearlyRate.value}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stated Pricing / Minimums */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Stated Pricing
                      </span>
                      <div className="space-y-1.5">
                        {assumptions.classifiedMetrics!.acv.minimum && (
                          <ClassifiedMetricDisplay 
                            metric={assumptions.classifiedMetrics!.acv.minimum} 
                            label="Minimum"
                          />
                        )}
                        {assumptions.classifiedMetrics!.acv.target && (
                          <ClassifiedMetricDisplay 
                            metric={assumptions.classifiedMetrics!.acv.target} 
                            label="Target ACV"
                          />
                        )}
                      </div>
                      
                      {/* Historical if available */}
                      {assumptions.classifiedMetrics!.mrr.historical && assumptions.classifiedMetrics!.mrr.historical.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/30">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                            <History className="w-3 h-3" />
                            Historical
                          </span>
                          {assumptions.classifiedMetrics!.mrr.historical.map((m, idx) => (
                            <ClassifiedMetricDisplay key={idx} metric={m} label="MRR" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Legacy display for non-classified data */}
              {!hasClassifiedMetrics && (
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
              )}
              
              {/* Scale Requirements (shown even with classified metrics) */}
              {hasClassifiedMetrics && assumptions.scaleRequirements && (
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Path to $100M ARR (using actual ACV of {assumptions.classifiedMetrics?.acv.actual ? formatCurrency(assumptions.classifiedMetrics.acv.actual.value, assumptions.currency) : formatCurrency(assumptions.primaryMetricValue || 0, assumptions.currency)})
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
              
              {/* AI Comparables Section */}
              {hasAIEstimate && assumptions.aiEstimate && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
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
