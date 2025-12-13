import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Check, Loader2, RotateCcw, AlertCircle } from "lucide-react";

export default function RegenerationSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const companyId = searchParams.get("companyId");
  
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationsAvailable, setGenerationsAvailable] = useState<number | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !companyId) {
        setError("Missing payment information");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-regeneration-payment', {
          body: { sessionId, companyId }
        });

        if (error) throw error;

        if (data?.success) {
          setVerified(true);
          setGenerationsAvailable(data.generationsAvailable);
        } else {
          setError(data?.error || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [sessionId, companyId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <ModernCard className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Payment Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/portal")} className="w-full">
            Back to Portal
          </Button>
        </ModernCard>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <ModernCard className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Generation Credit Added!</h1>
          <p className="text-muted-foreground">
            You now have {generationsAvailable} generation credit{generationsAvailable !== 1 ? 's' : ''} available.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(`/memo-regenerate?companyId=${companyId}`)}
            className="w-full gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Regenerate Memo Now
          </Button>
          
          <Button 
            onClick={() => navigate("/portal")}
            variant="outline"
            className="w-full"
          >
            Back to Portal
          </Button>
        </div>
      </ModernCard>
    </div>
  );
}
