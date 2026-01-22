import { FileText, User, Sparkles, Bot, CheckCircle2, Edit2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type DataSourceType = 
  | 'manual'           // Founder directly typed it
  | 'deck_confirmed'   // Extracted from deck and confirmed by founder
  | 'deck_extracted'   // Extracted from deck, not yet confirmed
  | 'ai_accepted'      // AI suggestion accepted by founder
  | 'ai_inferred'      // AI inferred, not confirmed
  | 'smart_fill'       // From SmartFill modal
  | 'unknown';

interface ProvenanceBadgeProps {
  source: DataSourceType;
  timestamp?: string;
  originalValue?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const SOURCE_CONFIG: Record<DataSourceType, {
  label: string;
  icon: typeof FileText;
  variant: 'default' | 'secondary' | 'outline';
  colorClass: string;
  description: string;
}> = {
  manual: {
    label: 'Founder Input',
    icon: User,
    variant: 'default',
    colorClass: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    description: 'You directly entered this information',
  },
  deck_confirmed: {
    label: 'Deck (Confirmed)',
    icon: CheckCircle2,
    variant: 'secondary',
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    description: 'Extracted from your pitch deck and confirmed by you',
  },
  deck_extracted: {
    label: 'From Deck',
    icon: FileText,
    variant: 'secondary',
    colorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    description: 'Extracted from your pitch deck (not yet confirmed)',
  },
  ai_accepted: {
    label: 'AI (Accepted)',
    icon: Sparkles,
    variant: 'secondary',
    colorClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    description: 'AI suggestion that you reviewed and accepted',
  },
  ai_inferred: {
    label: 'AI Inferred',
    icon: Bot,
    variant: 'outline',
    colorClass: 'bg-muted text-muted-foreground border-border',
    description: 'Inferred by AI based on available context (not confirmed)',
  },
  smart_fill: {
    label: 'Smart Fill',
    icon: Sparkles,
    variant: 'secondary',
    colorClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    description: 'Added via the Smart Fill questionnaire',
  },
  unknown: {
    label: 'Unknown',
    icon: FileText,
    variant: 'outline',
    colorClass: 'bg-muted text-muted-foreground border-border',
    description: 'Source unknown',
  },
};

export const ProvenanceBadge = ({
  source,
  timestamp,
  originalValue,
  showTooltip = true,
  size = 'sm',
  className,
}: ProvenanceBadgeProps) => {
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.unknown;
  const Icon = config.icon;
  
  const badge = (
    <Badge
      variant={config.variant}
      className={cn(
        config.colorClass,
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1',
        'flex items-center gap-1 font-normal',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
    </Badge>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.description}</p>
            {timestamp && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(timestamp).toLocaleDateString()}
              </p>
            )}
            {originalValue && source !== 'manual' && (
              <p className="text-xs text-muted-foreground">
                Original: "{originalValue.substring(0, 50)}..."
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper to determine source type from memo_responses data
export function getSourceType(source: string | null | undefined): DataSourceType {
  if (!source) return 'unknown';
  
  switch (source.toLowerCase()) {
    case 'manual':
    case 'founder':
    case 'user':
      return 'manual';
    case 'deck_confirmed':
    case 'deck-confirmed':
      return 'deck_confirmed';
    case 'deck':
    case 'deck_extraction':
    case 'pitch_deck':
      return 'deck_extracted';
    case 'ai_accepted':
    case 'ai-accepted':
      return 'ai_accepted';
    case 'ai':
    case 'ai_inferred':
    case 'inferred':
      return 'ai_inferred';
    case 'smart_fill':
    case 'smartfill':
      return 'smart_fill';
    default:
      return 'unknown';
  }
}
