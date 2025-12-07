import { ReactNode } from "react";

interface MemoSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  index?: number;
}

// Section-specific accent colors
const sectionColors: Record<string, { gradient: string; badge: string }> = {
  "Problem": {
    gradient: "from-warning/20 via-warning/10 to-warning/20",
    badge: "from-warning to-warning/70"
  },
  "Solution": {
    gradient: "from-success/20 via-success/10 to-success/20",
    badge: "from-success to-success/70"
  },
  "Market": {
    gradient: "from-secondary/20 via-secondary/10 to-secondary/20",
    badge: "from-secondary to-secondary/70"
  },
  "Competition": {
    gradient: "from-accent/20 via-accent/10 to-accent/20",
    badge: "from-accent to-accent/70"
  },
  "Team": {
    gradient: "from-primary/20 via-primary/10 to-primary/20",
    badge: "from-primary to-primary/70"
  },
  "Business Model": {
    gradient: "from-success/20 via-success/10 to-success/20",
    badge: "from-success to-success/70"
  },
  "Traction": {
    gradient: "from-secondary/20 via-secondary/10 to-secondary/20",
    badge: "from-secondary to-secondary/70"
  },
  "Vision": {
    gradient: "from-primary/20 via-primary/10 to-primary/20",
    badge: "from-primary to-primary/70"
  },
  "Investment Thesis": {
    gradient: "from-primary/30 via-secondary/20 to-accent/30",
    badge: "from-primary via-secondary to-accent"
  }
};

export const MemoSection = ({ title, children, className, index = 0 }: MemoSectionProps) => {
  const colors = sectionColors[title] || {
    gradient: "from-primary/20 via-primary/10 to-primary/20",
    badge: "from-primary to-primary/70"
  };

  return (
    <div 
      className={`relative animate-fade-in pdf-section ${className}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      data-section={title}
    >
      {/* Gradient border effect - section-specific color */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-3xl blur-xl opacity-50`} />
      
      <div className="relative bg-card/95 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Section number badge - section-specific gradient */}
        <div className={`absolute -top-4 -left-4 md:-top-5 md:-left-5 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${colors.badge} rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl`}>
          <span className="text-primary-foreground font-bold text-lg md:text-xl">{index + 1}</span>
        </div>
        
        <h2 className="text-2xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-foreground pl-10 md:pl-12 tracking-tight">
          {title}
        </h2>
        
        <div className="space-y-6 md:space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};
