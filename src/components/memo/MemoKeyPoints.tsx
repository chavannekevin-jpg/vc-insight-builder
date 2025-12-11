import { CheckCircle2 } from "lucide-react";
import { renderMarkdownText } from "@/lib/markdownParser";

interface MemoKeyPointsProps {
  points: string[];
}

export const MemoKeyPoints = ({ points }: MemoKeyPointsProps) => {
  // Helper to safely convert to string
  const safeText = (text: unknown) => typeof text === 'string' ? text : String(text || '');
  
  return (
    <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-8 border border-border/50 shadow-sm">
      <h4 className="text-sm font-semibold text-primary mb-6 uppercase tracking-wider flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5" />
        Key Takeaways
      </h4>
      <div className="space-y-4">
        {points.map((point, index) => (
          <div 
            key={index} 
            className="flex items-start gap-4 p-4 rounded-xl bg-background/60 hover:bg-background/80 transition-all duration-200 animate-fade-in hover:scale-[1.02]"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-foreground leading-relaxed font-medium">{renderMarkdownText(safeText(point))}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
