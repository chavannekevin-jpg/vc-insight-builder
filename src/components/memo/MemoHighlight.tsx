import { TrendingUp } from "lucide-react";

interface MemoHighlightProps {
  metric: string;
  label: string;
}

export const MemoHighlight = ({ metric, label }: MemoHighlightProps) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover-scale">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      
      {/* Content */}
      <div className="relative">
        <div className="text-4xl font-display font-bold text-primary mb-2 group-hover:scale-105 transition-transform">
          {metric}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
};
