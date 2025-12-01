import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompanySummaryCardProps {
  companyId: string;
  companyName: string;
  companyDescription: string;
  companyStage: string;
}

export const CompanySummaryCard = ({
  companyId,
  companyName,
  companyDescription,
  companyStage
}: CompanySummaryCardProps) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadOrGenerateSummary();
  }, [companyId]);

  const loadOrGenerateSummary = async () => {
    try {
      // Check if summary exists in memo_responses
      const { data: existingResponse } = await supabase
        .from("memo_responses")
        .select("answer")
        .eq("company_id", companyId)
        .eq("question_key", "ai_company_summary")
        .maybeSingle();

      if (existingResponse?.answer) {
        setSummary(existingResponse.answer);
        setLoading(false);
      } else {
        await generateSummary();
      }
    } catch (error) {
      console.error("Error loading summary:", error);
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-company-tagline", {
        body: {
          companyName,
          description: companyDescription,
          stage: companyStage,
          generateSummary: true
        }
      });

      if (error) throw error;

      const generatedSummary = data?.summary || `${companyName} is a ${companyStage} stage company focused on ${companyDescription}`;

      // Save summary to database
      await supabase
        .from("memo_responses")
        .upsert({
          company_id: companyId,
          question_key: "ai_company_summary",
          answer: generatedSummary
        }, {
          onConflict: "company_id,question_key"
        });

      setSummary(generatedSummary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary(`${companyName} is a ${companyStage} stage company. ${companyDescription}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generateSummary();
    setRegenerating(false);
    toast.success("Summary regenerated successfully");
  };

  return (
    <Card className="h-full border-2 border-primary/20 shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Company Overview</CardTitle>
          </div>
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        <CardDescription>AI-generated company summary</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Generating your company summary...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground/90 bg-primary/5 p-4 rounded-lg border border-primary/20">
              {summary}
            </p>
            <p className="text-xs text-muted-foreground italic">
              This summary is generated based on your company information and can be regenerated at any time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
