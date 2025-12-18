import { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, AlertCircle, Users, TrendingUp, Target, DollarSign, Lightbulb, Shield, Rocket } from "lucide-react";
import { safeTitle } from "@/lib/stringUtils";

interface LockedSectionOverlayProps {
  children: ReactNode;
  sectionTitle: string;
}

interface TeaserInsight {
  icon: React.ElementType;
  text: string;
  highlight: string;
}

// Generate section-specific teaser insights to create curiosity and urgency
const getTeaserInsight = (sectionTitle: unknown): TeaserInsight => {
  const title = safeTitle(sectionTitle).toLowerCase();

  if (title.includes('solution') || title.includes('product')) {
    return {
      icon: Lightbulb,
      text: "We identified",
      highlight: "3 positioning gaps VCs will question"
    };
  }

  if (title.includes('market') || title.includes('tam') || title.includes('opportunity')) {
    return {
      icon: TrendingUp,
      text: "We found",
      highlight: "2 paths to $100M ARR — and 1 risky assumption"
    };
  }

  if (title.includes('team') || title.includes('founder')) {
    return {
      icon: Users,
      text: "We spotted",
      highlight: "2 critical role gaps for your stage"
    };
  }

  if (title.includes('competition') || title.includes('moat') || title.includes('defensibility')) {
    return {
      icon: Shield,
      text: "Your moat shows",
      highlight: "3 strengths + 1 weakness VCs will probe"
    };
  }

  if (title.includes('business') || title.includes('model') || title.includes('revenue')) {
    return {
      icon: DollarSign,
      text: "Unit economics reveal",
      highlight: "2 strengths and 1 red flag to fix"
    };
  }

  if (title.includes('traction') || title.includes('growth') || title.includes('metrics')) {
    return {
      icon: Rocket,
      text: "We uncovered",
      highlight: "3 proof points VCs love + 2 they'll challenge"
    };
  }

  if (title.includes('ask') || title.includes('funding') || title.includes('raise')) {
    return {
      icon: Target,
      text: "Your ask has",
      highlight: "1 validation issue and 2 optimization tips"
    };
  }

  if (title.includes('thesis') || title.includes('investment') || title.includes('vision')) {
    return {
      icon: Target,
      text: "We synthesized",
      highlight: "the key conditions for your success"
    };
  }

  // Default fallback
  return {
    icon: AlertCircle,
    text: "We analyzed",
    highlight: "what VCs will debate about this section"
  };
};

export function LockedSectionOverlay({ children, sectionTitle }: LockedSectionOverlayProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");

  const handleClick = () => {
    if (companyId) {
      navigate(`/checkout-analysis?companyId=${companyId}`);
    }
  };

  const insight = getTeaserInsight(sectionTitle);
  const InsightIcon = insight.icon;

  return (
    <div 
      className="relative cursor-pointer group"
      onClick={handleClick}
    >
      {/* Blurred content */}
      <div className="blur-md select-none pointer-events-none opacity-60">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 transition-all group-hover:bg-background/60 group-hover:border-primary/30">
        <div className="text-center space-y-4 p-6 max-w-md">
          {/* Lock icon with pulse effect */}
          <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
            <Lock className="w-6 h-6 text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30" />
          </div>
          
          {/* Section title */}
          <p className="font-display font-bold text-lg text-foreground">{sectionTitle}</p>
          
          {/* Dynamic teaser insight with icon */}
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card/80 border border-primary/20 shadow-sm">
            <InsightIcon className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {insight.text} <span className="font-semibold text-foreground">{insight.highlight}</span>
            </p>
          </div>
          
          {/* Original tagline */}
          <p className="text-xs text-muted-foreground italic">
            This is what VCs see. You don't. Yet.
          </p>
          
          {/* CTA */}
          <p className="text-sm text-primary font-semibold group-hover:underline flex items-center justify-center gap-1">
            Click to unlock full analysis
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </p>
        </div>
      </div>
    </div>
  );
}
