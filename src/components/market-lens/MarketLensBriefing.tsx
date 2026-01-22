import { format } from "date-fns";
import { TailwindCard } from "./TailwindCard";
import { HeadwindCard } from "./HeadwindCard";
import { FundingLandscapeCard } from "./FundingLandscapeCard";
import { GeographicContextCard } from "./GeographicContextCard";
import { ExitPrecedentsCard } from "./ExitPrecedentsCard";
import { NarrativeAlignmentCard } from "./NarrativeAlignmentCard";
import { DataSourcesCard } from "./DataSourcesCard";
import { FileText, Clock, Sparkles, TrendingUp, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Briefing {
  tailwinds: Array<{
    title: string;
    insight: string;
    relevance: string;
    source: string;
  }>;
  headwinds: Array<{
    title: string;
    insight: string;
    relevance: string;
    source: string;
  }>;
  fundingLandscape: {
    summary: string;
    dataPoints: Array<{
      metric: string;
      value: string;
      context: string;
    }>;
  };
  geographicContext: {
    summary: string;
    insights: string[];
  };
  exitPrecedents: Array<{
    company: string;
    outcome: string;
    relevance: string;
  }>;
  narrativeAlignment: {
    summary: string;
    themes: string[];
  };
  generatedAt: string;
  sourcesUsed: number;
  sourcesList?: string[];
}

interface MarketLensBriefingProps {
  briefing: Briefing;
  companyName: string;
}

export function MarketLensBriefing({ briefing, companyName }: MarketLensBriefingProps) {
  const generatedDate = briefing.generatedAt 
    ? format(new Date(briefing.generatedAt), "MMM d, yyyy 'at' h:mm a")
    : "Recently";

  const tailwindPercent = briefing.tailwinds.length + briefing.headwinds.length > 0
    ? Math.round((briefing.tailwinds.length / (briefing.tailwinds.length + briefing.headwinds.length)) * 100)
    : 50;

  return (
    <div className="space-y-6">
      {/* Hero Section with Meta */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            AI-Powered Analysis
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Generated {generatedDate}</span>
          </div>
        </div>
        
        {/* Compact Market Signal Summary */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{briefing.tailwinds.length}</span>
              <span className="text-xs text-muted-foreground">Tailwinds</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50">
              <Wind className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{briefing.headwinds.length}</span>
              <span className="text-xs text-muted-foreground">Headwinds</span>
            </div>
          </div>
          <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
              style={{ width: `${tailwindPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-primary">{tailwindPercent}% favorable</span>
        </div>
      </div>

      {/* Tailwinds & Headwinds side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-4">
        <TailwindCard items={briefing.tailwinds} />
        <HeadwindCard items={briefing.headwinds} />
      </div>

      {/* Funding Landscape - full width */}
      <FundingLandscapeCard data={briefing.fundingLandscape} />

      {/* Geographic Context & Exit Precedents */}
      <div className="grid md:grid-cols-2 gap-4">
        <GeographicContextCard data={briefing.geographicContext} />
        <ExitPrecedentsCard items={briefing.exitPrecedents} />
      </div>

      {/* Narrative Alignment - full width */}
      <NarrativeAlignmentCard data={briefing.narrativeAlignment} companyName={companyName} />

      {/* Data Sources */}
      <DataSourcesCard 
        sourcesCount={briefing.sourcesUsed} 
        sourcesList={briefing.sourcesList || []} 
      />
    </div>
  );
}
