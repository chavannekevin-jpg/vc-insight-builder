import { ModernCard } from "@/components/ModernCard";

interface MemoHighlightProps {
  metric: string;
  label: string;
}

export const MemoHighlight = ({ metric, label }: MemoHighlightProps) => {
  return (
    <ModernCard className="text-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <div className="text-3xl font-bold text-primary mb-2">{metric}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </ModernCard>
  );
};
