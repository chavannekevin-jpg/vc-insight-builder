import { cn } from "@/lib/utils";
import { ElementType } from "react";

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
        "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg",
        "border border-primary/20 bg-primary/5",
        "hover:border-primary/40 hover:bg-primary/10",
        "transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <span className="text-xs font-medium text-foreground truncate">
        {shortTitle}
      </span>
    </button>
  );
};
