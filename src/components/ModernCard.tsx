import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const ModernCard = ({ children, className, hover = false }: ModernCardProps) => {
  return (
    <div 
      className={cn(
        "bg-card/95 backdrop-blur-sm border border-border/50 p-6 rounded-2xl transition-all duration-300",
        hover && "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      style={{ 
        boxShadow: hover 
          ? '0 10px 40px -10px hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--border) / 0.1)' 
          : '0 4px 20px -4px hsl(var(--muted) / 0.3), 0 0 0 1px hsl(var(--border) / 0.1)' 
      }}
    >
      {children}
    </div>
  );
};
