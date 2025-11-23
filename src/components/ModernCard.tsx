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
        "bg-card rounded-xl border border-border p-6 shadow-md transition-all duration-300",
        hover && "hover-lift cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};
