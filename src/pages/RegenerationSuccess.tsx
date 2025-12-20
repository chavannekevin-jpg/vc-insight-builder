import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Check, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { PaymentErrorBoundary } from "@/components/PaymentErrorBoundary";

function RegenerationSuccessContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const companyId = searchParams.get("companyId");
  
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  
  // Refs to prevent race conditions
  const isMountedRef = useRef(true);

  const verifyPayment = useCallback(async () => {
    if (!sessionId || !companyId) {
      setError("Missing payment information");
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-regeneration-payment', {
        body: { sessionId, companyId }
      });

      if (!isMountedRef.current) return;

      if (invokeError) throw invokeError;

      if (data?.success) {
        setVerified(true);
        setError(null);
      } else {
        setError(data?.error || "Payment verification failed");
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Verification error:", err);
      setError("Failed to verify payment. Please try again or contact support.");
    } finally {
      if (isMountedRef.current) {
        setRetrying(false);
      }
    }
  }, [sessionId, companyId]);

  useEffect(() => {
    isMountedRef.current = true;
    verifyPayment();

    return () => {
      isMountedRef.current = false;
    };
  }, [verifyPayment]);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    await verifyPayment();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <ModernCard className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Payment Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            If you completed payment, your access may still be granted.
          </p>
          
          {sessionId && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              Session: {sessionId.slice(0, 30)}...
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full gap-2"
              disabled={retrying}
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              Retry Verification
            </Button>
            <Button onClick={() => navigate("/portal")} variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </div>
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
          <h1 className="text-2xl font-bold">Payment Confirmed!</h1>
          <p className="text-muted-foreground">
            Your regeneration has been unlocked. Let's review your answers with Kev, your AI wizard.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(`/portal?regenerate=true&companyId=${companyId}`)}
            className="w-full gap-2 gradient-primary shadow-glow"
          >
            <Sparkles className="w-4 h-4" />
            Start Questionnaire
          </Button>
          
          <Button 
            onClick={() => navigate("/portal")}
            variant="outline"
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </ModernCard>
    </div>
  );
}

export default function RegenerationSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const companyId = searchParams.get("companyId");

  return (
    <PaymentErrorBoundary sessionId={sessionId} companyId={companyId}>
      <RegenerationSuccessContent />
    </PaymentErrorBoundary>
  );
}
