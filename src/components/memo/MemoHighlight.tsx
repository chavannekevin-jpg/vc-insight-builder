import { TrendingUp } from "lucide-react";

interface MemoHighlightProps {
  metric: string;
  label: string;
}

export const MemoHighlight = ({ metric, label }: MemoHighlightProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:scale-[1.03]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon */}
      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 mb-6 group-hover:bg-primary/25 transition-colors">
        <TrendingUp className="w-6 h-6 text-primary" />
      </div>
      
      {/* Content */}
      <div className="relative">
        <div className="text-5xl font-display font-bold text-primary mb-3 group-hover:scale-105 transition-transform">
          {metric}
        </div>
        <div className="text-sm font-medium text-muted-foreground leading-snug">
          {label}
        </div>
      </div>
    </div>
  );
};
