import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Loader2, RotateCcw, CheckCircle, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RegenerationCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!companyId) {
      toast.error("Missing company information");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-regeneration-checkout', {
        body: { companyId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  if (!companyId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <ModernCard className="max-w-md w-full p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold">Invalid Request</h1>
          <p className="text-muted-foreground">Missing company information.</p>
          <Button onClick={() => navigate("/portal")} className="w-full">
            Back to Dashboard
          </Button>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/portal")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <ModernCard className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold">Regenerate Your Analysis</h1>
            <p className="text-muted-foreground">
              Update your investment memo with fresh insights
            </p>
          </div>

          {/* What's included */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">What's included:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Full questionnaire review with your previous answers pre-filled
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  AI wizard suggestions to improve your answers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Fresh VC-grade investment memo generation
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  Updated benchmarks and analysis tools
                </span>
              </li>
            </ul>
          </div>

          {/* Price and CTA */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="text-center">
              <span className="text-4xl font-bold">€8.99</span>
              <span className="text-muted-foreground ml-2">one-time</span>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full gradient-primary shadow-glow h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Pay & Regenerate
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
