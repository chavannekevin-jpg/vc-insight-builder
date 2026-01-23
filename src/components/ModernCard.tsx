import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: "default" | "glass" | "elevated";
}

export const ModernCard = ({ 
  children, 
  className, 
  hover = false, 
  onClick,
  variant = "default"
}: ModernCardProps) => {
  const variants = {
    default: "bg-card/80 backdrop-blur-xl border border-border/40",
    glass: "bg-card/60 backdrop-blur-2xl border border-border/30",
    elevated: "bg-card/90 backdrop-blur-xl border border-border/50 shadow-xl",
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        variants[variant],
        "p-6 rounded-2xl transition-all duration-300",
        hover && "cursor-pointer hover:border-primary/40 hover:bg-card/90 hover:-translate-y-0.5",
        hover && "hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
};
