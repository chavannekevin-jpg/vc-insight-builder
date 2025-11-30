import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Zap, Target, TrendingDown, ArrowRight, Sparkles, Home } from "lucide-react";
import { ModernCard } from "@/components/ModernCard";

interface DiagnosticData {
  acv: string;
  marketDescription: string;
  currentRevenue: string;
  currentCustomers: string;
}

interface DiagnosticResult {
  rating: "VC-Fit" | "Venture-Adjacent" | "Lifestyle Business in Denial";
  ratingExplanation: string;
  narrative: string;
  fantasyVsPhysics: string;
  vcComments: string[];
  structuralFragility: {
    topAssumptions: string[];
    firstToCollapse: string;
    consequences: string;
  };
  improvements: string[];
  verdict: string;
}

export default function VentureScaleDiagnostic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  
  const [formData, setFormData] = useState<DiagnosticData>({
    acv: "",
    marketDescription: "",
    currentRevenue: "",
    currentCustomers: ""
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: company } = await supabase
        .from("companies")
        .select("id, name, description, category, biggest_challenge")
        .eq("founder_id", session.user.id)
        .single();

      if (company) {
        setCompanyId(company.id);

        // Fetch memo responses for additional context
        const { data: responses } = await supabase
          .from("memo_responses")
          .select("question_key, answer")
          .eq("company_id", company.id);

        // Extract market context using AI
        const { data: contextData, error: contextError } = await supabase.functions.invoke(
          "extract-market-context",
          {
            body: {
              company: {
                name: company.name,
                description: company.description,
                category: company.category,
                challenge: company.biggest_challenge
              },
              responses: responses || []
            }
          }
        );

        if (!contextError && contextData?.marketContext) {
          setFormData(prev => ({
            ...prev,
            marketDescription: contextData.marketContext
          }));
        }
      }
    } catch (error) {
      console.error("Error loading company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostic = async () => {
    // Validation
    if (!formData.acv || !formData.marketDescription) {
      toast({
        title: "Missing information",
        description: "Please provide your ACV and market description.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("venture-scale-diagnostic", {
        body: {
          diagnosticData: formData,
          companyId
        }
      });

      if (error) throw error;

      if (data?.result) {
        setResult(data.result);
        toast({
          title: "Analysis complete",
          description: "Your venture scale diagnostic is ready."
        });
      }
    } catch (error: any) {
      console.error("Diagnostic error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze venture scale potential",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "VC-Fit":
        return "text-success border-success/40 bg-success/10";
      case "Venture-Adjacent":
        return "text-warning border-warning/40 bg-warning/10";
      default:
        return "text-destructive border-destructive/40 bg-destructive/10";
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case "VC-Fit":
        return <Target className="w-6 h-6" />;
      case "Venture-Adjacent":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <TrendingDown className="w-6 h-6" />;
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => setResult(null)}
            className="mb-6 gap-2"
          >
            ← Run Another Diagnostic
          </Button>

          <div className="space-y-8">
            {/* Rating Badge */}
            <ModernCard className="text-center">
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-3 px-6 py-3 border-2 rounded-2xl ${getRatingColor(result.rating)}`}>
                  {getRatingIcon(result.rating)}
                  <span className="text-2xl font-bold">{result.rating}</span>
                </div>
                <p className="text-lg text-muted-foreground">{result.ratingExplanation}</p>
              </div>
            </ModernCard>

            {/* Revenue Machine Narrative */}
            <ModernCard>
              <h2 className="text-2xl font-bold mb-4 neon-pink">How Your Revenue Machine Works</h2>
              <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{result.narrative}</p>
            </ModernCard>

            {/* Fantasy vs Physics */}
            <ModernCard>
              <h2 className="text-2xl font-bold mb-4 neon-pink">The Fantasy vs The Physics</h2>
              <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{result.fantasyVsPhysics}</p>
            </ModernCard>

            {/* VC Comments */}
            <ModernCard className="border-2 border-primary/30">
              <h2 className="text-2xl font-bold mb-4 neon-pink">What VCs Will Actually Say When You Leave the Room</h2>
              <div className="space-y-3">
                {result.vcComments.map((comment, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <p className="text-foreground/90 italic">&ldquo;{comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </ModernCard>

            {/* Structural Fragility */}
            <ModernCard>
              <h2 className="text-2xl font-bold mb-4 neon-pink">Structural Fragility</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Top Assumptions Holding This Together:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {result.structuralFragility.topAssumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <p className="font-semibold mb-2">First to Collapse:</p>
                  <p className="text-foreground/90">{result.structuralFragility.firstToCollapse}</p>
                  <p className="text-sm text-muted-foreground mt-2"><strong>Consequences:</strong> {result.structuralFragility.consequences}</p>
                </div>
              </div>
            </ModernCard>

            {/* Improvements */}
            <ModernCard>
              <h2 className="text-2xl font-bold mb-4 neon-pink">If You Actually Wanted to Make This VC-Grade</h2>
              <ul className="space-y-3">
                {result.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{improvement}</span>
                  </li>
                ))}
              </ul>
            </ModernCard>

            {/* Verdict */}
            <ModernCard className="border-2 border-primary/30 shadow-glow">
              <h2 className="text-2xl font-bold mb-4 neon-pink">The Verdict</h2>
              <p className="text-lg text-foreground/90 whitespace-pre-line leading-relaxed">{result.verdict}</p>
            </ModernCard>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/hub")}
                size="lg"
                className="flex-1"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate("/portal")}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Update Company Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/hub")}
          className="mb-6 gap-2"
        >
          ← Back to Dashboard
        </Button>

          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold neon-pink">Venture Scale Diagnostic</h1>
              <p className="text-xl text-muted-foreground">Can your business model reach $100M ARR?</p>
            </div>

            {/* Intro */}
            <ModernCard>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Why This Matters</h2>
                <p className="text-foreground/90 leading-relaxed">
                  VCs need companies that can scale to $100M+ ARR. This diagnostic calculates how many customers you&apos;d need at your 
                  current ACV to reach that threshold, and whether it&apos;s realistically achievable in your market within a reasonable timeframe.
                </p>
                <p className="text-foreground/90 leading-relaxed">
                  Simple math. Hard truth.
                </p>
              </div>
            </ModernCard>

          {/* Form */}
          <ModernCard>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleRunDiagnostic(); }}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="acv">What&apos;s your Annual Contract Value (ACV)? *</Label>
                  <Input
                    id="acv"
                    type="number"
                    placeholder="e.g., 25000"
                    value={formData.acv}
                    onChange={(e) => setFormData({ ...formData, acv: e.target.value })}
                    required
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">Average revenue per customer per year</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketDescription">Describe your market *</Label>
                  <Textarea
                    id="marketDescription"
                    placeholder="e.g., We sell to mid-market SaaS companies (50-500 employees) in the US and Europe. There are approximately 15,000 companies in this segment. Our GTM is outbound sales with an average 60-day sales cycle."
                    value={formData.marketDescription}
                    onChange={(e) => setFormData({ ...formData, marketDescription: e.target.value })}
                    className="min-h-[120px]"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading market insights from your profile..." : "Who are your customers, how big is the addressable market, and how do you sell to them? (Pre-filled from your profile - adjust as needed)"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentRevenue">Current Annual Revenue (Optional)</Label>
                    <Input
                      id="currentRevenue"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.currentRevenue}
                      onChange={(e) => setFormData({ ...formData, currentRevenue: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Your current ARR or projected first-year revenue</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentCustomers">Current Customers (Optional)</Label>
                    <Input
                      id="currentCustomers"
                      type="number"
                      placeholder="e.g., 25"
                      value={formData.currentCustomers}
                      onChange={(e) => setFormData({ ...formData, currentCustomers: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">How many paying customers today?</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-primary shadow-glow hover:shadow-glow-strong"
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Run Diagnostic
                  </>
                )}
              </Button>
            </form>
          </ModernCard>
        </div>
      </div>
    </div>
  );
}