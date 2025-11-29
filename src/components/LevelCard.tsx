import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface LevelCardProps {
  levelNumber: number;
  totalLevels: number;
  title: string;
  tldr: string;
  icon: LucideIcon | React.ComponentType<any>;
  children: ReactNode;
  className?: string;
}

export const LevelCard = ({ 
  levelNumber,
  totalLevels,
  title, 
  tldr, 
  icon: Icon, 
  children,
  className 
}: LevelCardProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Neon border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-purple opacity-20 blur-xl rounded-2xl" />
      
      {/* Card content */}
      <div className="relative bg-card/95 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
            <Icon className="w-6 h-6 text-neon-pink" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">Level {levelNumber} of {totalLevels}</div>
            <h2 className="text-2xl font-bold neon-pink mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground italic">{tldr}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
