import { 
  Target, Users, DollarSign, TrendingUp, Shield, Lightbulb, 
  BarChart3, Rocket, Building2, Clock, AlertCircle, Layers
} from "lucide-react";

interface MemoFactCardProps {
  text: string;
  title?: string;
  category?: string;
}

// Map categories to icons
const categoryIcons: Record<string, React.ElementType> = {
  problem: AlertCircle,
  solution: Lightbulb,
  market: BarChart3,
  target: Target,
  customer: Users,
  competition: Shield,
  team: Users,
  business: DollarSign,
  revenue: DollarSign,
  traction: TrendingUp,
  growth: Rocket,
  vision: Layers,
  company: Building2,
  timeline: Clock,
  default: Lightbulb
};

const getIconForContent = (text: string, category?: string): React.ElementType => {
  if (category) {
    const lowerCategory = category.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lowerCategory.includes(key)) return icon;
    }
  }
  
  // Infer from text content
  const lowerText = text.toLowerCase();
  if (lowerText.includes("revenue") || lowerText.includes("$") || lowerText.includes("€") || lowerText.includes("price")) {
    return DollarSign;
  }
  if (lowerText.includes("customer") || lowerText.includes("user") || lowerText.includes("client")) {
    return Users;
  }
  if (lowerText.includes("growth") || lowerText.includes("increase") || lowerText.includes("%")) {
    return TrendingUp;
  }
  if (lowerText.includes("market") || lowerText.includes("tam") || lowerText.includes("sam")) {
    return BarChart3;
  }
  if (lowerText.includes("competitor") || lowerText.includes("differentiat")) {
    return Shield;
  }
  if (lowerText.includes("target") || lowerText.includes("focus")) {
    return Target;
  }
  
  return Lightbulb;
};

const extractTitle = (text: string): string => {
  // Try to extract a short title from the first part of the text
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length <= 50) {
    return firstSentence;
  }
  // Take first few words
  const words = text.split(' ').slice(0, 4);
  return words.join(' ') + '...';
};

export const MemoFactCard = ({ text, title, category }: MemoFactCardProps) => {
  const Icon = getIconForContent(text, category);
  const displayTitle = title || extractTitle(text);
  const displayText = title ? text : text.slice(displayTitle.length - 3).replace(/^[.!?\s]+/, '');

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:bg-card">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
            {displayTitle}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {displayText || text}
          </p>
        </div>
      </div>
    </div>
  );
};
