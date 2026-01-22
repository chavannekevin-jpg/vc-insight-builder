import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Telescope, Building2, ArrowRight, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketLensUpsellDialog } from "@/components/market-lens/MarketLensUpsellDialog";

interface StrategicToolsSpotlightProps {
  matchingFunds: number;
  hasMarketLensBriefing?: boolean;
  reportsAnalyzed?: number;
  hasPaid?: boolean;
}

export const StrategicToolsSpotlight = memo(({ 
  matchingFunds, 
  hasMarketLensBriefing = false,
  reportsAnalyzed = 0,
  hasPaid = false
}: StrategicToolsSpotlightProps) => {
  const navigate = useNavigate();
  const [showMarketLensUpsell, setShowMarketLensUpsell] = useState(false);

  const handleMarketLensClick = () => {
    if (hasPaid) {
      navigate("/market-lens");
    } else {
      setShowMarketLensUpsell(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">Your Next Moves</h3>
        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
          Premium
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Market Lens Card */}
        <div 
          onClick={handleMarketLensClick}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-6 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors" />
          
          <div className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Telescope className="w-6 h-6 text-primary" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold group-hover:text-primary transition-colors">
                Market Lens
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered market intelligence tailored to your sector, stage, and geography.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {hasMarketLensBriefing ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {reportsAnalyzed} reports analyzed
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Generate your briefing
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* VC Network Card */}
        <div 
          onClick={() => navigate("/fund-discovery")}
          className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-transparent p-6 cursor-pointer transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-colors" />
          
          <div className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold group-hover:text-emerald-600 transition-colors">
                VC Network
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discover investors that match your profile, stage, and sector focus.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {matchingFunds > 0 ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  <Users className="w-3 h-3 mr-1" />
                  {matchingFunds} investors match
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Explore matches
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Market Lens Upsell Dialog */}
      <MarketLensUpsellDialog 
        open={showMarketLensUpsell} 
        onOpenChange={setShowMarketLensUpsell} 
      />
    </div>
  );
});

StrategicToolsSpotlight.displayName = "StrategicToolsSpotlight";
