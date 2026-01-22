import { Telescope, Loader2, TrendingUp, Wind, MapPin, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketLensEmptyProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export function MarketLensEmpty({ onGenerate, isGenerating }: MarketLensEmptyProps) {
  const features = [
    {
      icon: TrendingUp,
      title: "Market Tailwinds",
      description: "Trends working in your favor that you can leverage in investor conversations"
    },
    {
      icon: Wind,
      title: "Market Headwinds",
      description: "Challenges and risks you should be prepared to address"
    },
    {
      icon: MapPin,
      title: "Geographic Context",
      description: "Regional ecosystem dynamics and funding landscape"
    },
    {
      icon: Target,
      title: "Narrative Alignment",
      description: "How your story fits current investor themes"
    }
  ];

  return (
    <div className="py-12 space-y-10">
      {/* Hero section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
          <Telescope className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          Your Personalized Market Intelligence
        </h2>
        <p className="text-muted-foreground text-lg">
          We'll analyze our market research database and extract only the insights 
          that are directly relevant to your company, stage, and sector.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {features.map((feature) => (
          <div 
            key={feature.title}
            className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Markets...
            </>
          ) : (
            <>
              <Telescope className="w-4 h-4 mr-2" />
              Generate My Briefing
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Takes about 30 seconds to analyze all available market data
        </p>
      </div>
    </div>
  );
}
