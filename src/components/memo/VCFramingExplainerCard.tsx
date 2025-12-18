import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, AlertTriangle, Lightbulb, TrendingUp, Swords, Users, DollarSign, BarChart, Rocket, GraduationCap } from "lucide-react";
import { getFramingExplanation } from "@/data/vcFramingExplanations";

interface VCFramingExplainerCardProps {
  sectionTitle: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Swords,
  Users,
  DollarSign,
  BarChart,
  Rocket,
};

export function VCFramingExplainerCard({ sectionTitle }: VCFramingExplainerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const explanation = getFramingExplanation(sectionTitle);
  
  if (!explanation) return null;
  
  const IconComponent = ICON_MAP[explanation.icon] || BookOpen;
  
  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              VC Framing Technique
            </span>
            <span className="text-sm font-medium text-foreground">
              {explanation.technique}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs hidden sm:inline">
            {isExpanded ? "Hide" : "Learn why we wrote it this way"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-primary/10">
          {/* Why It Works */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Why This Works With VCs</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {explanation.whyItWorks}
            </p>
          </div>
          
          {/* Key Elements */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Notice How We...</h4>
            </div>
            <ul className="space-y-1.5 pl-6">
              {explanation.keyElements.map((element, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{element}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
