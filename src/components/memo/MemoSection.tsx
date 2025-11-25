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
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Section number badge */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-primary-foreground font-bold text-lg">{index + 1}</span>
        </div>
        
        <h2 className="text-3xl font-display font-bold mb-6 text-foreground pl-10">
          {title}
        </h2>
        
        <div className="space-y-6 pl-2">
          {children}
        </div>
      </div>
    </div>
  );
};
