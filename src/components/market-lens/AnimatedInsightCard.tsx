import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedInsightCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  accentColor?: "emerald" | "amber" | "blue" | "purple" | "primary";
}

const accentStyles = {
  emerald: "from-emerald-500/10 via-transparent border-emerald-500/30 hover:border-emerald-500/50",
  amber: "from-amber-500/10 via-transparent border-amber-500/30 hover:border-amber-500/50",
  blue: "from-blue-500/10 via-transparent border-blue-500/30 hover:border-blue-500/50",
  purple: "from-purple-500/10 via-transparent border-purple-500/30 hover:border-purple-500/50",
  primary: "from-primary/10 via-transparent border-primary/30 hover:border-primary/50",
};

export function AnimatedInsightCard({ 
  children, 
  className,
  delay = 0,
  accentColor = "primary"
}: AnimatedInsightCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl border bg-gradient-to-br to-transparent overflow-hidden",
        "transition-all duration-300 hover:shadow-lg hover:shadow-black/5",
        "animate-fade-in",
        accentStyles[accentColor],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
