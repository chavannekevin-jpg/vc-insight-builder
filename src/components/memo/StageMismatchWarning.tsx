import { AlertTriangle, Target, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface StageSignal {
  dimension: string;
  signal: string;
  strength: number;
  evidence: string;
}

interface StageMismatchWarningProps {
  userStatedStage: string;
  detectedStage: string;
  confidence: number;
  signals: StageSignal[];
  mismatchExplanation?: string;
}

export function StageMismatchWarning({
  userStatedStage,
  detectedStage,
  confidence,
  signals,
  mismatchExplanation
}: StageMismatchWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get signals that support the detected stage
  const supportingSignals = signals
    .filter(s => s.signal === detectedStage)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);

  return (
    <Alert className="border-secondary/30 bg-secondary/10 dark:bg-secondary/10 dark:border-secondary/30">
      <Target className="h-5 w-5 text-secondary" />
      <AlertTitle className="text-foreground flex items-center gap-2 flex-wrap">
        <span>Stage Reality Check</span>
        <Badge variant="outline" className="text-xs bg-secondary/20 dark:bg-secondary/20 text-secondary border-secondary/30 dark:border-secondary/40">
          {confidence}% confidence
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-foreground/90">
          You selected <strong>"{userStatedStage}"</strong>, but based on your metrics across {signals.length} dimensions, 
          VCs would likely categorize you as <strong className="text-secondary">{detectedStage}</strong>.
        </p>
        
        {mismatchExplanation && (
          <p className="text-sm text-muted-foreground">
            {mismatchExplanation.split('. ').slice(1).join('. ')}
          </p>
        )}
        
        <div className="flex items-start gap-2 p-3 bg-secondary/15 dark:bg-secondary/10 rounded-lg">
          <Lightbulb className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
          <p className="text-sm text-foreground/90">
            <strong>What this means:</strong> This memo uses <strong>{detectedStage}</strong> benchmarks to give you 
            the most accurate and actionable assessment. Your scores reflect how you compare to other {detectedStage} companies.
          </p>
        </div>
        
        {/* Expandable signals section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>{isExpanded ? 'Hide' : 'Show'} supporting signals</span>
        </button>
        
        {isExpanded && supportingSignals.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-secondary/20">
            <p className="text-xs font-medium text-secondary uppercase tracking-wide">
              Why we detected {detectedStage}:
            </p>
            <ul className="space-y-1.5">
              {supportingSignals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-secondary/10 dark:bg-secondary/10 capitalize flex-shrink-0">
                    {signal.dimension}
                  </Badge>
                  <span>{signal.evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
