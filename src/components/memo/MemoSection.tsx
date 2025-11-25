import { ReactNode } from "react";
import { ModernCard } from "@/components/ModernCard";

interface MemoSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const MemoSection = ({ title, children, className }: MemoSectionProps) => {
  return (
    <ModernCard className={className}>
      <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border/50 pb-3">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </ModernCard>
  );
};
