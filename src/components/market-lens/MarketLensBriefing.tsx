import { format } from "date-fns";
import { TailwindCard } from "./TailwindCard";
import { HeadwindCard } from "./HeadwindCard";
import { FundingLandscapeCard } from "./FundingLandscapeCard";
import { GeographicContextCard } from "./GeographicContextCard";
import { ExitPrecedentsCard } from "./ExitPrecedentsCard";
import { NarrativeAlignmentCard } from "./NarrativeAlignmentCard";
import { MarketSignalChart } from "./MarketSignalChart";
import { FileText, Clock, Sparkles } from "lucide-react";
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
}

interface MarketLensBriefingProps {
  briefing: Briefing;
  companyName: string;
}

export function MarketLensBriefing({ briefing, companyName }: MarketLensBriefingProps) {
  const generatedDate = briefing.generatedAt 
    ? format(new Date(briefing.generatedAt), "MMM d, yyyy 'at' h:mm a")
    : "Recently";

  return (
    <div className="space-y-8">
      {/* Hero Section with Meta */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
            <Sparkles className="w-3 h-3 text-primary" />
            AI-Powered Analysis
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Generated {generatedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Based on {briefing.sourcesUsed} market reports</span>
          </div>
        </div>
        
        {/* Market Signal Overview Chart */}
        <MarketSignalChart 
          tailwindsCount={briefing.tailwinds.length} 
          headwindsCount={briefing.headwinds.length} 
        />
      </div>

      {/* Tailwinds & Headwinds side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <TailwindCard items={briefing.tailwinds} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <HeadwindCard items={briefing.headwinds} />
        </div>
      </div>

      {/* Funding Landscape - full width */}
      <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
        <FundingLandscapeCard data={briefing.fundingLandscape} />
      </div>

      {/* Geographic Context & Exit Precedents */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <GeographicContextCard data={briefing.geographicContext} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
          <ExitPrecedentsCard items={briefing.exitPrecedents} />
        </div>
      </div>

      {/* Narrative Alignment - full width */}
      <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
        <NarrativeAlignmentCard data={briefing.narrativeAlignment} companyName={companyName} />
      </div>
    </div>
  );
}
