import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ConditionalAssessment, ConfidenceLevel } from '@/types/memo';
import { getConfidenceLabel, getAssessmentColor, getAssessmentBgColor } from '@/lib/toolDataUtils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ConditionalAssessmentBadgeProps {
  assessment: ConditionalAssessment;
  compact?: boolean;
  showDetails?: boolean;
}

const getConfidenceIcon = (confidence: ConfidenceLevel) => {
  switch (confidence) {
    case 'high': return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'medium': return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'low': return <AlertCircle className="w-3.5 h-3.5" />;
    case 'insufficient_data': return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

export const ConditionalAssessmentBadge = ({ 
  assessment, 
  compact = false,
  showDetails = false 
}: ConditionalAssessmentBadgeProps) => {
  const [isOpen, setIsOpen] = useState(showDetails);
  
  if (compact) {
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${getAssessmentColor(assessment.confidence)} border-current/30`}
      >
        {getConfidenceIcon(assessment.confidence)}
        <span className="ml-1">{assessment.confidenceScore}%</span>
      </Badge>
    );
  }

  const hasWhatWouldChange = assessment.whatWouldChangeThisAssessment?.length > 0;
  const hasAssumptions = assessment.assumptions?.length > 0;
  const hasCaveats = assessment.caveats?.length > 0;
  const hasDetails = hasWhatWouldChange || hasAssumptions || hasCaveats;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border p-3 ${getAssessmentBgColor(assessment.confidence)}`}>
        <CollapsibleTrigger className="w-full" disabled={!hasDetails}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={getAssessmentColor(assessment.confidence)}>
                {getConfidenceIcon(assessment.confidence)}
              </span>
              <span className={`text-sm font-medium ${getAssessmentColor(assessment.confidence)}`}>
                {getConfidenceLabel(assessment.confidence)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({assessment.confidenceScore}% confidence, {assessment.dataCompleteness}% data)
              </span>
            </div>
            {hasDetails && (
              <span className="text-muted-foreground">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t border-current/10 space-y-3">
            {hasWhatWouldChange && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  What Would Change This Assessment
                </p>
                <ul className="text-sm space-y-1">
                  {assessment.whatWouldChangeThisAssessment.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasAssumptions && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Assumptions Made
                </p>
                <ul className="text-sm space-y-1">
                  {assessment.assumptions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasCaveats && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Caveats
                </p>
                <ul className="text-sm space-y-1">
                  {assessment.caveats?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};