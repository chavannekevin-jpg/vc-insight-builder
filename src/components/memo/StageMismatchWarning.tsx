import { Target, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface StageMismatchWarningProps {
  userStatedStage: string;
  detectedStage: string;
  confidence: number;
  signals?: unknown[]; // Kept for backwards compatibility but not displayed
  mismatchExplanation?: string; // Kept for backwards compatibility but not displayed
}

export function StageMismatchWarning({
  userStatedStage,
  detectedStage,
  confidence,
}: StageMismatchWarningProps) {
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
          You selected <strong>"{userStatedStage}"</strong>, but based on our analysis, 
          VCs would likely categorize you as <strong className="text-secondary">{detectedStage}</strong>.
        </p>
        
        <div className="flex items-start gap-2 p-3 bg-secondary/15 dark:bg-secondary/10 rounded-lg">
          <Lightbulb className="h-4 w-4 mt-0.5 text-secondary flex-shrink-0" />
          <p className="text-sm text-foreground/90">
            <strong>What this means:</strong> This memo uses <strong>{detectedStage}</strong> benchmarks to give you 
            the most accurate and actionable assessment. Your scores reflect how you compare to other {detectedStage} companies.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
