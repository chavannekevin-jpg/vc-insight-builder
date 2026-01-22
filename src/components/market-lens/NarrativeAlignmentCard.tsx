import { MessageSquare, Check } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Narrative Alignment</h3>
          <p className="text-xs text-muted-foreground">
            How {companyName}'s story fits investor themes
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4">
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {/* Themes */}
      <div className="px-5 pb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Themes you can leverage
        </p>
        <div className="flex flex-wrap gap-2">
          {data.themes.map((theme, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-1.5"
            >
              <Check className="w-3 h-3 text-primary" />
              {theme}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
