import { LucideIcon, Construction } from "lucide-react";

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

const PlaceholderView = ({ title, description, icon: Icon = Construction }: PlaceholderViewProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground max-w-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderView;
