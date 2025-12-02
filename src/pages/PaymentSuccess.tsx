import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Check, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!companyId || !sessionId) {
        setError("Missing payment information");
        setLoading(false);
        return;
      }

      try {
        // Verify the payment and grant access
        const { data, error: invokeError } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId, companyId }
        });

        if (invokeError) throw invokeError;

        if (data?.success) {
          setVerified(true);
          // Auto-redirect to memo after successful verification
          setTimeout(() => {
            navigate(`/memo?companyId=${companyId}`);
          }, 2000);
        } else {
          setError(data?.error || "Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [companyId, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
        
        <div className="max-w-2xl mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
          <ModernCard className="p-8 text-center space-y-6 w-full">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Verification Issue
              </h1>
              <p className="text-muted-foreground">{error}</p>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => navigate("/portal")}
                size="lg"
                className="w-full"
              >
                Back to Portal
              </Button>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="max-w-2xl mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
        <ModernCard className="p-8 text-center space-y-6 w-full">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-success" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Redirecting you to your memo...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Premium access activated</span>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={() => navigate(`/memo?companyId=${companyId}`)}
              size="lg"
              className="w-full gradient-primary shadow-glow hover-neon-pulse font-bold"
            >
              View Your Memo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              onClick={() => navigate("/portal")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Portal
            </Button>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
