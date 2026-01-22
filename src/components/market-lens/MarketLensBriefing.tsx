import { format } from "date-fns";
import { TailwindCard } from "./TailwindCard";
import { HeadwindCard } from "./HeadwindCard";
import { FundingLandscapeCard } from "./FundingLandscapeCard";
import { GeographicContextCard } from "./GeographicContextCard";
import { ExitPrecedentsCard } from "./ExitPrecedentsCard";
import { NarrativeAlignmentCard } from "./NarrativeAlignmentCard";
import { FileText, Clock } from "lucide-react";

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
      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Generated {generatedDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          <span>Based on {briefing.sourcesUsed} market reports</span>
        </div>
      </div>

      {/* Tailwinds & Headwinds side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-6">
        <TailwindCard items={briefing.tailwinds} />
        <HeadwindCard items={briefing.headwinds} />
      </div>

      {/* Funding Landscape - full width */}
      <FundingLandscapeCard data={briefing.fundingLandscape} />

      {/* Geographic Context & Exit Precedents */}
      <div className="grid md:grid-cols-2 gap-6">
        <GeographicContextCard data={briefing.geographicContext} />
        <ExitPrecedentsCard items={briefing.exitPrecedents} />
      </div>

      {/* Narrative Alignment - full width */}
      <NarrativeAlignmentCard data={briefing.narrativeAlignment} companyName={companyName} />
    </div>
  );
}
