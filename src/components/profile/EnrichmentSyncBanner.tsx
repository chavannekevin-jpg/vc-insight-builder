import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Calculator,
  MessageSquare,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileEnrichment } from "@/hooks/useProfileEnrichments";

interface EnrichmentSyncBannerProps {
  pendingCount: number;
  pendingEnrichments: ProfileEnrichment[];
  syncing: boolean;
  lastSyncedAt: string | null;
  onSync: () => void;
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  'tam_calculator': <Calculator className="w-3.5 h-3.5" />,
  'improve_score': <MessageSquare className="w-3.5 h-3.5" />,
  'venture_diagnostic': <TrendingUp className="w-3.5 h-3.5" />,
  'strategic_tool': <BarChart3 className="w-3.5 h-3.5" />,
};

const SOURCE_LABELS: Record<string, string> = {
  'tam_calculator': 'TAM Calculator',
  'improve_score': 'Score Improvements',
  'venture_diagnostic': 'Venture Diagnostic',
  'strategic_tool': 'Strategic Tools',
  'pain_validator': 'Pain Validator',
  'business_model': 'Business Model',
  'moat_analysis': 'Moat Analysis',
};

export function EnrichmentSyncBanner({
  pendingCount,
  pendingEnrichments,
  syncing,
  lastSyncedAt,
  onSync
}: EnrichmentSyncBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (pendingCount === 0) {
    if (!lastSyncedAt) return null;
    
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-success">
              <Sparkles className="w-4 h-4" />
              <span>Profile is up to date</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Last synced: {new Date(lastSyncedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group enrichments by source
  const groupedBySource: Record<string, ProfileEnrichment[]> = {};
  pendingEnrichments.forEach(e => {
    if (!groupedBySource[e.source_type]) {
      groupedBySource[e.source_type] = [];
    }
    groupedBySource[e.source_type].push(e);
  });

  return (
    <Card className="border-primary/30 bg-primary/5 overflow-hidden">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-primary" />
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {pendingCount}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">
                {pendingCount} new insight{pendingCount > 1 ? 's' : ''} to sync
              </p>
              <p className="text-xs text-muted-foreground">
                AI will merge these into your profile sections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? (
                <>
                  Hide <ChevronUp className="w-3 h-3 ml-1" />
                </>
              ) : (
                <>
                  Details <ChevronDown className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
            <Button
              onClick={onSync}
              disabled={syncing}
              size="sm"
              className="gap-1.5"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync to Profile"}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
            {Object.entries(groupedBySource).map(([source, items]) => (
              <div 
                key={source} 
                className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  {SOURCE_ICONS[source] || <BarChart3 className="w-3.5 h-3.5" />}
                  <span className="text-muted-foreground">
                    {SOURCE_LABELS[source] || source}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {items.length} update{items.length > 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
