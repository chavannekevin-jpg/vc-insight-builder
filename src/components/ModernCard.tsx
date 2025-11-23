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
        "bg-card border-2 border-border p-6 transition-all duration-300",
        hover && "cursor-pointer hover:border-primary hover:translate-x-1 hover:translate-y-1",
        className
      )}
      style={{ 
        boxShadow: hover 
          ? '4px 4px 0 hsl(var(--primary)), 8px 8px 0 hsl(var(--muted))' 
          : '4px 4px 0 hsl(var(--muted))' 
      }}
    >
      {children}
    </div>
  );
};
