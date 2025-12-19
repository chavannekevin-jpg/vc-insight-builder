import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { ConfidenceLevel } from '@/types/memo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface LowConfidenceWarningProps {
  confidence: ConfidenceLevel;
  dataCompleteness: number;
  onImproveData?: () => void;
}

export const LowConfidenceWarning = ({ 
  confidence, 
  dataCompleteness,
  onImproveData 
}: LowConfidenceWarningProps) => {
  // Only show for low confidence or insufficient data
  if (confidence === 'high' || confidence === 'medium') {
    return null;
  }

  const isInsufficientData = confidence === 'insufficient_data';

  return (
    <Alert variant="destructive" className={isInsufficientData 
      ? "bg-red-500/10 border-red-500/30 text-red-700" 
      : "bg-amber-500/10 border-amber-500/30 text-amber-700"
    }>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">
        {isInsufficientData ? "Limited Data Available" : "Data Quality Warning"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">
          {isInsufficientData 
            ? `Only ${dataCompleteness}% of the data we need is available. This memo contains significant assumptions that may not reflect your actual situation.`
            : `This assessment is based on ${dataCompleteness}% of optimal data. Some conclusions may change with more information.`
          }
        </p>
        {onImproveData && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onImproveData}
            className="border-current/30 hover:bg-current/10"
          >
            Provide More Data
            <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};