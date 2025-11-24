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
        "bg-card/95 backdrop-blur-xl border border-border/50 p-8 rounded-3xl transition-all duration-500 shadow-md",
        hover && "cursor-pointer hover:border-primary/40 hover:shadow-xl hover:-translate-y-2 hover:bg-card",
        className
      )}
    >
      {children}
    </div>
  );
};
