import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { ChevronRight } from "lucide-react";

export interface MiniToolCardProps {
  id: string;
  title: string;
  shortTitle: string;
  icon: ElementType;
  quickStat?: string;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
  onClick: () => void;
}

export const MiniToolCard = ({
  shortTitle,
  icon: Icon,
  onClick
}: MiniToolCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-3 w-full",
        "px-4 py-3 rounded-xl",
        "bg-card/80 border border-border/50",
        "hover:bg-muted/50 hover:border-primary/30",
        "transition-all duration-200",
        "hover:shadow-sm"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">
          {shortTitle}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
};
