import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface FounderScoreDisplayProps {
  score: number;
  className?: string;
}

export const FounderScoreDisplay = ({ score, className }: FounderScoreDisplayProps) => {
  const getScoreColor = () => {
    if (score >= 86) return "text-neon-pink";
    if (score >= 71) return "text-green-400";
    if (score >= 41) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = () => {
    if (score >= 86) return "LEGENDARY";
    if (score >= 71) return "STRONG";
    if (score >= 41) return "SOLID";
    return "NEEDS WORK";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TrendingUp className="w-4 h-4 text-muted-foreground" />
      <div className="flex flex-col items-end">
        <div className={cn("text-2xl font-bold transition-all duration-300", getScoreColor())}>
          {score}
        </div>
        <div className="text-xs text-muted-foreground">{getScoreLabel()}</div>
      </div>
    </div>
  );
};
