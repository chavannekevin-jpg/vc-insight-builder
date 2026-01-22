import { useState } from 'react';
import { ChevronDown, ChevronUp, History, Edit2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProvenanceBadge, getSourceType, type DataSourceType } from './ProvenanceBadge';

interface VersionEntry {
  value: string;
  source: DataSourceType;
  timestamp: string;
  changedBy?: 'founder' | 'ai' | 'system';
}

interface FieldVersionHistoryProps {
  fieldKey: string;
  currentValue: string;
  currentSource: string;
  currentTimestamp?: string;
  history?: VersionEntry[];
  className?: string;
}

export const FieldVersionHistory = ({
  fieldKey,
  currentValue,
  currentSource,
  currentTimestamp,
  history = [],
  className,
}: FieldVersionHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sourceType = getSourceType(currentSource);
  
  // Combine current value with history for display
  const allVersions: VersionEntry[] = [
    {
      value: currentValue,
      source: sourceType,
      timestamp: currentTimestamp || new Date().toISOString(),
      changedBy: sourceType === 'manual' ? 'founder' : sourceType.startsWith('ai') ? 'ai' : 'system',
    },
    ...history,
  ];
  
  const hasHistory = history.length > 0;
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getChangedByLabel = (changedBy?: string) => {
    switch (changedBy) {
      case 'founder':
        return 'You';
      case 'ai':
        return 'AI';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Current Value Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ProvenanceBadge source={sourceType} timestamp={currentTimestamp} />
          {currentTimestamp && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(currentTimestamp)}
            </span>
          )}
        </div>
        
        {hasHistory && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground h-6 px-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <History className="h-3 w-3 mr-1" />
            {history.length} previous
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 ml-1" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-1" />
            )}
          </Button>
        )}
      </div>
      
      {/* Version History */}
      {isExpanded && hasHistory && (
        <div className="pl-4 border-l-2 border-border/50 space-y-3 mt-3">
          {history.map((version, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <ProvenanceBadge source={version.source} size="sm" showTooltip={false} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(version.timestamp)} by {getChangedByLabel(version.changedBy)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs line-clamp-2 pl-1">
                {version.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
