import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DemoLayout } from "@/components/demo/DemoLayout";
import { MarketLensBriefing } from "@/components/market-lens/MarketLensBriefing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_COMPANY, DEMO_MARKET_LENS_BRIEFING } from "@/data/demo/demoSignalFlow";
import { DemoUpsellModal } from "@/components/demo/DemoUpsellModal";
import { RefreshCw, Settings, ArrowLeft, Sparkles } from "lucide-react";
import { MarketLensExplainer, useMarketLensExplainer } from "@/components/explainers/MarketLensExplainer";

export default function DemoMarketLens() {
  const navigate = useNavigate();
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellContext, setUpsellContext] = useState({ feature: "", description: "" });
  
  // Market lens explainer modal - use demo-specific key
  const [showExplainer, setShowExplainer] = useState(false);
  const [explainerChecked, setExplainerChecked] = useState(false);
  
  useEffect(() => {
    const seen = localStorage.getItem("demo_market_lens_explainer_seen");
    setShowExplainer(!seen);
    setExplainerChecked(true);
  }, []);
  
  const completeExplainer = () => {
    localStorage.setItem("demo_market_lens_explainer_seen", "true");
    setShowExplainer(false);
  };

  const handleRefresh = () => {
    setUpsellContext({
      feature: "Regenerating market intelligence",
      description: "Create your own analysis to generate real-time market briefings tailored to your startup."
    });
    setShowUpsell(true);
  };

  const handleEditPreferences = () => {
    setUpsellContext({
      feature: "Customizing preferences",
      description: "Your own analysis lets you set region, market focus, and specific concerns for personalized insights."
    });
    setShowUpsell(true);
  };

  return (
    <>
    {/* Market Lens Explainer Modal */}
    {explainerChecked && (
      <MarketLensExplainer 
        open={showExplainer} 
        onComplete={completeExplainer} 
      />
    )}
    <DemoLayout currentPage="market-lens">
      <div className="px-6 py-8 bg-gradient-to-b from-transparent to-muted/10">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/demo')}
                  className="gap-1 -ml-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </div>
              <h1 className="text-2xl font-display font-bold">Market Intelligence</h1>
              <p className="text-sm text-muted-foreground">
                Real-time market insights for <span className="font-medium text-foreground">{DEMO_COMPANY.name}</span> in {DEMO_COMPANY.category}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditPreferences}
                className="gap-1.5 rounded-xl border-border/40"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Preferences</span>
              </Button>
              <Button
                size="sm"
                onClick={handleRefresh}
                className="gap-1.5 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Demo Notice */}
          <Card className="border-primary/20 bg-card/60 backdrop-blur-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">This is a sample Market Lens briefing</p>
                  <p className="text-xs text-muted-foreground">
                    The real tool synthesizes 50+ industry reports and benchmarks, filtered through your specific company context. 
                    Get your own analysis to receive personalized market intelligence updated in real-time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Lens Briefing */}
          <MarketLensBriefing 
            briefing={DEMO_MARKET_LENS_BRIEFING}
            companyName={DEMO_COMPANY.name}
          />

        </div>
      </div>

      <DemoUpsellModal
        open={showUpsell}
        onOpenChange={setShowUpsell}
        feature={upsellContext.feature}
        description={upsellContext.description}
      />
    </DemoLayout>
    </>
  );
}
