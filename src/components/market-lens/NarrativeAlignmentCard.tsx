import { MessageSquare, Check, Lightbulb, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NarrativeAlignmentData {
  summary: string;
  themes: string[];
}

interface NarrativeAlignmentCardProps {
  data: NarrativeAlignmentData;
  companyName: string;
}

export function NarrativeAlignmentCard({ data, companyName }: NarrativeAlignmentCardProps) {
  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-primary/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/10">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Narrative Alignment</h3>
          <p className="text-xs text-muted-foreground">
            How {companyName}'s story fits investor themes
          </p>
        </div>
      </div>

      {/* Summary with icon */}
      <div className="px-5 py-4 flex gap-4 items-start">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Themes as enhanced pills */}
      <div className="px-5 pb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary" />
          Themes you can leverage
        </p>
        <div className="flex flex-wrap gap-2">
          {data.themes.map((theme, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium">{theme}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
