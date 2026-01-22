import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { FounderLayout } from "@/components/founder/FounderLayout";
import { MarketLensBriefing } from "@/components/market-lens/MarketLensBriefing";
import { MarketLensEmpty } from "@/components/market-lens/MarketLensEmpty";
import { Button } from "@/components/ui/button";
import { Telescope, RefreshCw, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

interface Briefing {
  tailwinds: Array<{
    title: string;
    insight: string;
    relevance: string;
    source: string;
  }>;
  headwinds: Array<{
    title: string;
    insight: string;
    relevance: string;
    source: string;
  }>;
  fundingLandscape: {
    summary: string;
    dataPoints: Array<{
      metric: string;
      value: string;
      context: string;
    }>;
  };
  geographicContext: {
    summary: string;
    insights: string[];
  };
  exitPrecedents: Array<{
    company: string;
    outcome: string;
    relevance: string;
  }>;
  narrativeAlignment: {
    summary: string;
    themes: string[];
  };
  generatedAt: string;
  sourcesUsed: number;
}

export default function MarketLens() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { company, hasMemo, hasPaid, isLoading: companyLoading } = useCompany(user?.id);
  
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const canAccess = hasPaid && hasMemo;

  // Load cached briefing on mount
  useEffect(() => {
    const loadCachedBriefing = async () => {
      if (!company?.id || !canAccess) return;

      try {
        const { data } = await supabase
          .from("memo_responses")
          .select("answer, updated_at")
          .eq("company_id", company.id)
          .eq("question_key", "market_lens_briefing")
          .single();

        if (data?.answer) {
          const parsed = JSON.parse(data.answer);
          setBriefing(parsed);
        }
      } catch (error) {
        // No cached briefing, that's fine
      } finally {
        setHasLoaded(true);
      }
    };

    loadCachedBriefing();
  }, [company?.id, canAccess]);

  const generateBriefing = async () => {
    if (!company?.id) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-lens-generate", {
        body: { companyId: company.id }
      });

      if (error) throw error;

      if (data?.briefing) {
        setBriefing(data.briefing);
        toast.success("Market intelligence briefing generated");
      }
    } catch (error: any) {
      console.error("Failed to generate briefing:", error);
      toast.error(error.message || "Failed to generate briefing");
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || companyLoading) {
    return (
      <FounderLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </FounderLayout>
    );
  }

  if (!canAccess) {
    return (
      <FounderLayout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">Market Lens</h1>
          <p className="text-muted-foreground text-lg">
            {!hasPaid 
              ? "This tool is available after you purchase your full investment analysis."
              : "Generate your investment memo first to unlock personalized market intelligence."
            }
          </p>
          <Button 
            onClick={() => navigate(hasPaid ? "/hub" : "/pricing")}
            className="mt-4"
          >
            {hasPaid ? "Go to Hub" : "View Pricing"}
          </Button>
        </div>
      </FounderLayout>
    );
  }

  return (
    <FounderLayout>
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Telescope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Market Lens</h1>
              <p className="text-muted-foreground">
                Personalized market intelligence based on your analysis
              </p>
            </div>
          </div>
          
          <Button
            onClick={generateBriefing}
            disabled={isGenerating}
            variant={briefing ? "outline" : "default"}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Markets...
              </>
            ) : briefing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Briefing
              </>
            ) : (
              <>
                <Telescope className="w-4 h-4 mr-2" />
                Generate My Briefing
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        {!hasLoaded ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : briefing ? (
          <MarketLensBriefing briefing={briefing} companyName={company?.name || "Your Company"} />
        ) : (
          <MarketLensEmpty onGenerate={generateBriefing} isGenerating={isGenerating} />
        )}
      </div>
    </FounderLayout>
  );
}
