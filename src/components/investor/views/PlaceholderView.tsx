import { LucideIcon, Construction } from "lucide-react";

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

const PlaceholderView = ({ title, description, icon: Icon = Construction }: PlaceholderViewProps) => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-5 ring-4 ring-muted/30">
            <Icon className="w-10 h-10 text-muted-foreground/70" />
          </div>
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground/80 max-w-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderView;
