import { CheckCircle2 } from "lucide-react";

interface MemoKeyPointsProps {
  points: string[];
}

export const MemoKeyPoints = ({ points }: MemoKeyPointsProps) => {
  return (
    <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 border border-border/50">
      <h4 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Key Takeaways
      </h4>
      <div className="space-y-3">
        {points.map((point, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-lg bg-background/60 hover:bg-background/80 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-foreground leading-relaxed font-medium">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
