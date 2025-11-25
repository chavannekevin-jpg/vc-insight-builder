import { ReactNode } from "react";

interface MemoSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  index?: number;
}

export const MemoSection = ({ title, children, className, index = 0 }: MemoSectionProps) => {
  return (
    <div 
      className={`relative animate-fade-in ${className}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
        {/* Section number badge */}
        <div className="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-xl">
          <span className="text-primary-foreground font-bold text-xl">{index + 1}</span>
        </div>
        
        <h2 className="text-4xl font-display font-bold mb-8 text-foreground pl-12 tracking-tight">
          {title}
        </h2>
        
        <div className="space-y-8 pl-2">
          {children}
        </div>
      </div>
    </div>
  );
};
