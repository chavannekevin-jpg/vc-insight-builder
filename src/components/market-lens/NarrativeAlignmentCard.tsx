import { MessageSquare, Check, Lightbulb } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Narrative Alignment</h3>
          <p className="text-xs text-muted-foreground">
            How {companyName}'s story fits investor themes
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-4 flex gap-3 items-start border-b border-border/50">
        <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Themes */}
      <div className="px-4 py-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Themes you can leverage
        </p>
        <div className="flex flex-wrap gap-2">
          {data.themes.map((theme, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20"
            >
              <Check className="w-3 h-3 text-primary" />
              <span className="text-sm">{theme}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
