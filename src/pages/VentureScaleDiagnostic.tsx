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
  expectedCustomers: string;
  salesCycle: string;
  churnRate: string;
  expansionRevenue: string;
  customerType: string;
  gtmStrategy: string;
  currentMRR: string;
  currentCustomers: string;
  targetRevenue: string;
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
    expectedCustomers: "",
    salesCycle: "",
    churnRate: "",
    expansionRevenue: "",
    customerType: "",
    gtmStrategy: "",
    currentMRR: "",
    currentCustomers: "",
    targetRevenue: "75000000"
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("founder_id", session.user.id)
        .single();

      if (company) {
        setCompanyId(company.id);
      }
    } catch (error) {
      console.error("Error loading company:", error);
    }
  };

  const handleRunDiagnostic = async () => {
    // Validation
    const requiredFields = ["acv", "expectedCustomers", "salesCycle", "churnRate", "customerType", "gtmStrategy"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof DiagnosticData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields to run the diagnostic.",
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
            <h1 className="text-4xl font-bold neon-pink">Venture Scale Diagnostic Engine</h1>
            <p className="text-xl text-muted-foreground">The reality check you need before pitching VCs</p>
          </div>

          {/* Intro */}
          <ModernCard>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Why Run the Math?</h2>
              <p className="text-foreground/90 leading-relaxed">
                Venture investors aren&apos;t looking for good ideas—they&apos;re looking for companies that can generate 50–100 million ARR and deliver 
                fund-level returns. This tool models the actual physics of growth: ACV, customer volume, sales velocity, retention, 
                and expansion. It exposes whether your business can realistically scale to venture outcomes, or if you&apos;re building 
                something that will never satisfy VC economics.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                This isn&apos;t aspirational. It&apos;s structural. Let&apos;s see if your math holds up.
              </p>
            </div>
          </ModernCard>

          {/* Form */}
          <ModernCard>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleRunDiagnostic(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="acv">Annual Contract Value (ACV) *</Label>
                  <Input
                    id="acv"
                    type="number"
                    placeholder="e.g., 25000"
                    value={formData.acv}
                    onChange={(e) => setFormData({ ...formData, acv: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Average revenue per customer per year</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCustomers">Expected Customers at Target *</Label>
                  <Input
                    id="expectedCustomers"
                    type="number"
                    placeholder="e.g., 3000"
                    value={formData.expectedCustomers}
                    onChange={(e) => setFormData({ ...formData, expectedCustomers: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">How many customers to hit target ARR?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesCycle">Sales Cycle (days) *</Label>
                  <Input
                    id="salesCycle"
                    type="number"
                    placeholder="e.g., 90"
                    value={formData.salesCycle}
                    onChange={(e) => setFormData({ ...formData, salesCycle: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Time from first touch to signed contract</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churnRate">Annual Churn Rate (%) *</Label>
                  <Input
                    id="churnRate"
                    type="number"
                    placeholder="e.g., 15"
                    value={formData.churnRate}
                    onChange={(e) => setFormData({ ...formData, churnRate: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">What % of customers leave each year?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expansionRevenue">Net Revenue Retention (%)</Label>
                  <Input
                    id="expansionRevenue"
                    type="number"
                    placeholder="e.g., 110"
                    value={formData.expansionRevenue}
                    onChange={(e) => setFormData({ ...formData, expansionRevenue: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Including upsells and expansion (100% = flat)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMRR">Current MRR</Label>
                  <Input
                    id="currentMRR"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.currentMRR}
                    onChange={(e) => setFormData({ ...formData, currentMRR: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Your current monthly recurring revenue</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCustomers">Current Customers</Label>
                  <Input
                    id="currentCustomers"
                    type="number"
                    placeholder="e.g., 25"
                    value={formData.currentCustomers}
                    onChange={(e) => setFormData({ ...formData, currentCustomers: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">How many paying customers today?</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRevenue">Target ARR</Label>
                  <Input
                    id="targetRevenue"
                    type="number"
                    placeholder="e.g., 75000000"
                    value={formData.targetRevenue}
                    onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Your venture-scale goal (default: $75M)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerType">Customer Type (ICP) *</Label>
                <Input
                  id="customerType"
                  placeholder="e.g., Mid-market SaaS companies with 50-500 employees"
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Who exactly are you selling to?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gtmStrategy">Go-to-Market Strategy *</Label>
                <Textarea
                  id="gtmStrategy"
                  placeholder="Describe how you acquire customers (e.g., outbound sales, PLG, channel partners, etc.)"
                  value={formData.gtmStrategy}
                  onChange={(e) => setFormData({ ...formData, gtmStrategy: e.target.value })}
                  className="min-h-[100px]"
                  required
                />
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
                    Running Diagnostic...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Run Venture Scale Diagnostic
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