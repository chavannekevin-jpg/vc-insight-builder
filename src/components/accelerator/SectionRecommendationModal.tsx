/**
 * SectionRecommendationModal - AI-powered section improvement recommendations
 * 
 * This modal shows accelerators how they can help a startup improve
 * their score in a specific section, with actionable recommendations.
 */

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Clock, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
  title: string;
  description: string;
  impact: "high" | "medium";
  timeframe: string;
  questions?: Array<{
    id: string;
    question: string;
    placeholder: string;
  }>;
}

interface Recommendations {
  suggestions: Suggestion[];
  keyInsight: string;
}

interface SectionRecommendationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  sectionName: string;
  sectionScore: number;
  sectionBenchmark?: number;
  sectionVerdict?: string;
  companyDescription?: string;
  allSectionScores?: Record<string, { score: number; benchmark: number }>;
}

export function SectionRecommendationModal({
  open,
  onOpenChange,
  companyId,
  companyName,
  sectionName,
  sectionScore,
  sectionBenchmark = 65,
  sectionVerdict,
  companyDescription,
  allSectionScores,
}: SectionRecommendationModalProps) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && companyId && sectionName) {
      loadRecommendations();
    }
  }, [open, companyId, sectionName]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check if we have cached recommendations
      const { data: cached } = await supabase
        .from("accelerator_section_recommendations")
        .select("suggestions, key_insight, generated_at")
        .eq("company_id", companyId)
        .eq("section_name", sectionName)
        .maybeSingle();

      if (cached && cached.suggestions) {
        // Check if cache is less than 7 days old
        const cacheAge = Date.now() - new Date(cached.generated_at).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        if (cacheAge < sevenDays) {
          setRecommendations({
            suggestions: cached.suggestions as unknown as Suggestion[],
            keyInsight: cached.key_insight || "",
          });
          setIsLoading(false);
          return;
        }
      }

      // Generate new recommendations
      const { data, error: fnError } = await supabase.functions.invoke('suggest-section-improvements', {
        body: {
          sectionName,
          sectionScore: { score: sectionScore, benchmark: sectionBenchmark },
          sectionVerdict: sectionVerdict || "Analysis pending",
          companyContext: companyDescription || companyName,
          allSectionScores
        }
      });

      if (fnError) throw fnError;

      if (data?.suggestions) {
        const recs: Recommendations = {
          suggestions: data.suggestions,
          keyInsight: data.keyInsight || "",
        };
        setRecommendations(recs);

        // Cache the recommendations
        await supabase
          .from("accelerator_section_recommendations")
          .upsert({
            company_id: companyId,
            section_name: sectionName,
            suggestions: data.suggestions,
            key_insight: data.keyInsight,
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'company_id,section_name'
          });
      }
    } catch (err: any) {
      console.error("Error loading recommendations:", err);
      setError(err.message || "Failed to load recommendations");
      toast.error("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 45) return "text-warning";
    return "text-destructive";
  };

  const getImpactBadge = (impact: string) => {
    if (impact === "high") {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success/20 text-success">
          High Impact
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
        Medium Impact
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto border-white/[0.08]"
        style={{
          background: 'linear-gradient(135deg, hsl(330 20% 12%) 0%, hsl(330 20% 8%) 100%)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>How to Improve {sectionName}</span>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                Recommendations for {companyName}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Score Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Score</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-3xl font-bold", getScoreColor(sectionScore))}>
                  {sectionScore}
                </span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">VC Benchmark</p>
              <span className="text-2xl font-bold text-foreground">{sectionBenchmark}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Generating recommendations...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadRecommendations}>Try Again</Button>
            </div>
          ) : recommendations ? (
            <div className="space-y-6">
              {/* Key Insight */}
              {recommendations.keyInsight && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">Key Insight</p>
                      <p className="text-foreground">{recommendations.keyInsight}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Action Items
                </h4>
                
                {recommendations.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h5 className="font-medium text-foreground">{suggestion.title}</h5>
                      <div className="flex items-center gap-2 shrink-0">
                        {getImpactBadge(suggestion.impact)}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {suggestion.timeframe}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                    
                    {suggestion.questions && suggestion.questions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                          Questions to ask the founder:
                        </p>
                        <ul className="space-y-2">
                          {suggestion.questions.map((q, qIndex) => (
                            <li key={qIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-foreground">{q.question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {recommendations && (
            <Button onClick={loadRecommendations} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refresh Recommendations
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
