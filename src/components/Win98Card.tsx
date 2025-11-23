import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Win98CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accentColor?: "teal" | "blue" | "pink" | "yellow" | "green" | "purple";
}

export const Win98Card = ({ children, className, title, accentColor }: Win98CardProps) => {
  const accentClass = accentColor ? `pastel-${accentColor}` : "";
  
  return (
    <div className={cn("win98-window", className)}>
      {title && (
        <div className="win98-title-bar">
          <span>{title}</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 win98-raised flex items-center justify-center text-xs leading-none pb-0.5">_</div>
            <div className="w-4 h-4 win98-raised flex items-center justify-center text-xs leading-none">□</div>
            <div className="w-4 h-4 win98-raised flex items-center justify-center text-xs leading-none">×</div>
          </div>
        </div>
      )}
      {accentColor && <div className={cn("h-1", accentClass)} />}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
