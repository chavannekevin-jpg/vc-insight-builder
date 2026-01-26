import { useMemo } from "react";
import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  analyzeEvidence, 
  type EvidenceChecklistResult 
} from "@/lib/preseedValidation";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface WorkshopEvidenceChecklistProps {
  text: string;
  sectionKey: string;
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'B': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'C': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default: return 'bg-red-500/10 text-red-600 border-red-500/20';
  }
}

export function WorkshopEvidenceChecklist({ text, sectionKey }: WorkshopEvidenceChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const result = useMemo<EvidenceChecklistResult>(() => 
    analyzeEvidence(text, sectionKey), 
    [text, sectionKey]
  );

  // Don't show if no items for this section
  if (result.items.length === 0) {
    return null;
  }

  const detectedCount = result.items.filter(i => i.detected).length;
  const totalCount = result.items.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Validation Checklist</span>
              <Badge variant="outline" className={cn("text-xs", getGradeColor(result.grade))}>
                {detectedCount}/{totalCount} • Grade {result.grade}
              </Badge>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
            {result.items.map((item) => (
              <div 
                key={item.key}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md transition-colors",
                  item.detected ? "bg-green-500/5" : "bg-muted/50"
                )}
              >
                {item.detected ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    item.detected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </p>
                  {!item.detected && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {item.hint}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
