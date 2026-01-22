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

const statusStyles = {
  good: {
    border: 'border-success/40 hover:border-success/60',
    bg: 'bg-success/5 hover:bg-success/10',
    icon: 'text-success',
    stat: 'text-success'
  },
  warning: {
    border: 'border-warning/40 hover:border-warning/60',
    bg: 'bg-warning/5 hover:bg-warning/10',
    icon: 'text-warning',
    stat: 'text-warning'
  },
  critical: {
    border: 'border-destructive/40 hover:border-destructive/60',
    bg: 'bg-destructive/5 hover:bg-destructive/10',
    icon: 'text-destructive',
    stat: 'text-destructive'
  },
  neutral: {
    border: 'border-border/50 hover:border-primary/40',
    bg: 'bg-card/60 hover:bg-muted/50',
    icon: 'text-muted-foreground',
    stat: 'text-foreground'
  }
};

export const MiniToolCard = ({
  title,
  shortTitle,
  icon: Icon,
  quickStat,
  status = 'neutral',
  onClick
}: MiniToolCardProps) => {
  const styles = statusStyles[status];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        "min-h-[80px] text-center",
        styles.border,
        styles.bg
      )}
    >
      {/* Icon */}
      <Icon className={cn("w-5 h-5 mb-1.5", styles.icon)} />
      
      {/* Title */}
      <span className="text-[10px] font-medium text-muted-foreground leading-tight line-clamp-2">
        {shortTitle}
      </span>
      
      {/* Quick Stat */}
      {quickStat && quickStat !== '—' && (
        <span className={cn("text-xs font-semibold mt-1", styles.stat)}>
          {quickStat}
        </span>
      )}
      
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20" />
      </div>
    </button>
  );
};
