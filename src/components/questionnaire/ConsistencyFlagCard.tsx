import { AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsistencyFlagCardProps {
  severity: 'warning' | 'error';
  description: string;
  suggestion: string;
  field1: string;
  field2: string;
  onNavigateToField?: (field: string) => void;
  className?: string;
}

const formatFieldName = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const ConsistencyFlagCard = ({
  severity,
  description,
  suggestion,
  field1,
  field2,
  onNavigateToField,
  className
}: ConsistencyFlagCardProps) => {
  const isError = severity === 'error';
  
  return (
    <div className={cn(
      'rounded-lg border p-3',
      isError 
        ? 'bg-red-500/5 border-red-500/20' 
        : 'bg-amber-500/5 border-amber-500/20',
      className
    )}>
      <div className="flex items-start gap-2.5">
        {isError ? (
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            isError ? 'text-red-700' : 'text-amber-700'
          )}>
            Potential Inconsistency
          </p>
          
          <p className="text-sm text-foreground mt-1">
            {description}
          </p>
          
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <span>Between:</span>
            {onNavigateToField ? (
              <>
                <button 
                  onClick={() => onNavigateToField(field1)}
                  className="text-primary hover:underline"
                >
                  {formatFieldName(field1)}
                </button>
                <ChevronRight className="h-3 w-3" />
                <button 
                  onClick={() => onNavigateToField(field2)}
                  className="text-primary hover:underline"
                >
                  {formatFieldName(field2)}
                </button>
              </>
            ) : (
              <>
                <span className="font-medium">{formatFieldName(field1)}</span>
                <span>&</span>
                <span className="font-medium">{formatFieldName(field2)}</span>
              </>
            )}
          </div>
          
          <div className={cn(
            'mt-2 text-xs p-2 rounded',
            isError ? 'bg-red-500/10' : 'bg-amber-500/10'
          )}>
            <span className="font-medium">Suggestion:</span> {suggestion}
          </div>
        </div>
      </div>
    </div>
  );
};
