/**
 * AcceleratorMarketLens - Read-only Market Lens view for accelerators
 * 
 * Allows accelerators to view the Market Lens briefing for a specific startup
 * in their portfolio, using the startup's company context.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Eye, Loader2, Globe, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MarketLensBriefing } from "@/components/market-lens/MarketLensBriefing";
import { MarketLensEmpty } from "@/components/market-lens/MarketLensEmpty";

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
  sourcesList?: string[];
}

interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
}

export default function AcceleratorMarketLens() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !isAuthenticated || authLoading) return;

      try {
        // Fetch company
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id, name, category, stage")
          .eq("id", id)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // Fetch existing briefing
        const { data: briefingData } = await supabase
          .from("memo_responses")
          .select("answer")
          .eq("company_id", id)
          .eq("question_key", "market_lens_briefing")
          .single();

        if (briefingData?.answer) {
          setBriefing(JSON.parse(briefingData.answer));
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load market lens data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated, authLoading]);

  const generateBriefing = async () => {
    if (!id) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-lens-generate", {
        body: { companyId: id }
      });

      if (error) throw error;

      if (data?.briefing) {
        setBriefing(data.briefing);
        toast.success("Market intelligence generated successfully");
      }
    } catch (error: any) {
      console.error("Error generating briefing:", error);
      toast.error("Failed to generate market intelligence");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Startup Not Found</h2>
          <Button onClick={() => navigate("/accelerator")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/accelerator/startup/${id}/preview`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ecosystem
              </Button>
              
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">Market Lens</h1>
                  <p className="text-xs text-muted-foreground">{company.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Read-only badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30">
                <Eye className="w-4 h-4 text-secondary" />
                <span className="text-xs font-medium text-secondary">Read-Only</span>
              </div>
              
              {briefing && (
                <Button
                  size="sm"
                  onClick={generateBriefing}
                  disabled={isGenerating}
                  className="gap-1.5 rounded-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <Card className="border-blue-500/20 bg-card/60 backdrop-blur-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Market Intelligence for {company.name}</p>
                <p className="text-xs text-muted-foreground">
                  Real-time market insights synthesized from 50+ industry reports, filtered for {company.category || "this sector"}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Generating market intelligence...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take 30-60 seconds</p>
          </div>
        ) : briefing ? (
          <MarketLensBriefing briefing={briefing} companyName={company.name} />
        ) : (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Market Intelligence Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Generate a comprehensive market briefing for {company.name} to understand tailwinds, headwinds, and funding landscape.
            </p>
            <Button onClick={generateBriefing} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Market Intelligence
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
