import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { ArrowUpRight } from "lucide-react";

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
        "group relative overflow-hidden",
        "flex items-center gap-2.5 px-3 py-2",
        "rounded-full border border-primary/20 bg-primary/5",
        "hover:bg-primary/15 hover:border-primary/40",
        "transition-all duration-200"
      )}
    >
      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="text-xs font-medium text-foreground whitespace-nowrap">
        {shortTitle}
      </span>
      <ArrowUpRight className="w-3 h-3 text-primary/60 group-hover:text-primary transition-colors" />
    </button>
  );
};
