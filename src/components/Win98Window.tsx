import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Win98WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const Win98Window = ({ title, children, className }: Win98WindowProps) => {
  return (
    <div className={cn("win98-window", className)}>
      <div className="win98-title-bar">
        <span>{title}</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 win98-border bg-card flex items-center justify-center text-xs">_</div>
          <div className="w-4 h-4 win98-border bg-card flex items-center justify-center text-xs">□</div>
          <div className="w-4 h-4 win98-border bg-card flex items-center justify-center text-xs">×</div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
