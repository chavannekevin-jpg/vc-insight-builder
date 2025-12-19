import { AlertTriangle, CheckCircle2, Database, Lightbulb, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { ConditionalAssessment, ConfidenceLevel } from '@/types/memo';
import { getConfidenceLabel, getAssessmentColor, getAssessmentBgColor } from '@/lib/toolDataUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataQualitySummaryProps {
  overallAssessment?: ConditionalAssessment;
  sectionAssessments?: Record<string, ConditionalAssessment>;
}

export const DataQualitySummary = ({ 
  overallAssessment, 
  sectionAssessments 
}: DataQualitySummaryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!overallAssessment) {
    return null;
  }

  const { confidence, confidenceScore, dataCompleteness, whatWouldChangeThisAssessment } = overallAssessment;

  // Collect all unique suggestions from all assessments
  const allSuggestions = new Set<string>();
  whatWouldChangeThisAssessment?.forEach(s => allSuggestions.add(s));
  if (sectionAssessments) {
    Object.values(sectionAssessments).forEach(assessment => {
      assessment.whatWouldChangeThisAssessment?.forEach(s => allSuggestions.add(s));
    });
  }

  const getOverallIcon = (conf: ConfidenceLevel) => {
    switch (conf) {
      case 'high': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'medium': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'low': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'insufficient_data': return <Database className="w-5 h-5 text-red-500" />;
    }
  };

  const getConfidenceMessage = (conf: ConfidenceLevel): string => {
    switch (conf) {
      case 'high': 
        return "This memo is based on comprehensive data. Assessments are highly reliable.";
      case 'medium': 
        return "This memo has good data coverage, but some assessments are based on assumptions.";
      case 'low': 
        return "Limited data available. Many assessments are based on assumptions that should be verified.";
      case 'insufficient_data': 
        return "Critical data is missing. Assessments may not reflect your actual situation.";
    }
  };

  const getSectionsByConfidence = () => {
    if (!sectionAssessments) return { low: [], medium: [], high: [] };
    
    const grouped: Record<string, string[]> = { low: [], medium: [], high: [], insufficient_data: [] };
    Object.entries(sectionAssessments).forEach(([section, assessment]) => {
      grouped[assessment.confidence]?.push(section);
    });
    return grouped;
  };

  const sectionsByConfidence = getSectionsByConfidence();

  return (
    <Card className={`border-2 ${getAssessmentBgColor(confidence)}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getOverallIcon(confidence)}
                <div className="text-left">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Data Quality Assessment
                    <Badge variant="outline" className={`${getAssessmentColor(confidence)} border-current/30`}>
                      {confidenceScore}% confidence
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dataCompleteness}% of requested data provided
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CardContent className="pt-0">
          <p className={`text-sm ${getAssessmentColor(confidence)} mb-4`}>
            {getConfidenceMessage(confidence)}
          </p>

          <CollapsibleContent>
            <div className="space-y-4 pt-4 border-t border-border/50">
              {/* Section Breakdown */}
              {sectionAssessments && Object.keys(sectionAssessments).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Section Confidence Levels
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(sectionsByConfidence.insufficient_data?.length > 0 || sectionsByConfidence.low?.length > 0) && (
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-medium text-red-600 mb-1">Needs Data</p>
                        <div className="flex flex-wrap gap-1">
                          {[...sectionsByConfidence.insufficient_data, ...sectionsByConfidence.low].map(s => (
                            <Badge key={s} variant="outline" className="text-xs text-red-600 border-red-500/30">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {sectionsByConfidence.medium?.length > 0 && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs font-medium text-amber-600 mb-1">Partial Data</p>
                        <div className="flex flex-wrap gap-1">
                          {sectionsByConfidence.medium.map(s => (
                            <Badge key={s} variant="outline" className="text-xs text-amber-600 border-amber-500/30">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {sectionsByConfidence.high?.length > 0 && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs font-medium text-emerald-600 mb-1">Good Data</p>
                        <div className="flex flex-wrap gap-1">
                          {sectionsByConfidence.high.map(s => (
                            <Badge key={s} variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              {allSuggestions.size > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    How to Improve Confidence
                  </h4>
                  <ul className="space-y-2">
                    {Array.from(allSuggestions).slice(0, 5).map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">→</span>
                        <span className="text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                  {allSuggestions.size > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{allSuggestions.size - 5} more suggestions
                    </p>
                  )}
                </div>
              )}

              {/* Assumptions Made */}
              {overallAssessment.assumptions && overallAssessment.assumptions.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Key Assumptions Made
                  </h4>
                  <ul className="space-y-1">
                    {overallAssessment.assumptions.slice(0, 3).map((assumption, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};