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
    <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50">
      <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2 flex-wrap">
        <span>Stage Reality Check</span>
        <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
          {confidence}% confidence
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-amber-900 dark:text-amber-100">
          You selected <strong>"{userStatedStage}"</strong>, but based on your metrics across {signals.length} dimensions, 
          VCs would likely categorize you as <strong className="text-amber-700 dark:text-amber-300">{detectedStage}</strong>.
        </p>
        
        {mismatchExplanation && (
          <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
            {mismatchExplanation.split('. ').slice(1).join('. ')}
          </p>
        )}
        
        <div className="flex items-start gap-2 p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg">
          <Lightbulb className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>What this means:</strong> This memo uses <strong>{detectedStage}</strong> benchmarks to give you 
            the most accurate and actionable assessment. Your scores reflect how you compare to other {detectedStage} companies.
          </p>
        </div>
        
        {/* Expandable signals section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>{isExpanded ? 'Hide' : 'Show'} supporting signals</span>
        </button>
        
        {isExpanded && supportingSignals.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Why we detected {detectedStage}:
            </p>
            <ul className="space-y-1.5">
              {supportingSignals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white/50 dark:bg-black/20 capitalize flex-shrink-0">
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
