import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Check, Sparkles, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { PaymentErrorBoundary } from "@/components/PaymentErrorBoundary";

function PaymentSuccessContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  
  // Refs to prevent race conditions
  const navigatedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const verifyPayment = useCallback(async () => {
    if (!companyId || !sessionId) {
      setError("Missing payment information");
      setLoading(false);
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId, companyId }
      });

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      if (invokeError) throw invokeError;

      if (data?.success) {
        setVerified(true);
        setError(null);
        
        // Auto-redirect after 2 seconds with proper cleanup
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && !navigatedRef.current) {
            navigatedRef.current = true;
            try {
              navigate(`/portal?companyId=${companyId}`);
            } catch (navError) {
              console.error("Navigation error:", navError);
            }
          }
        }, 2000);
      } else {
        setError(data?.error || "Payment verification failed");
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Payment verification error:", err);
      setError("Failed to verify payment. Please try again or contact support.");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRetrying(false);
      }
    }
  }, [companyId, sessionId, navigate]);

  // Initial verification
  useEffect(() => {
    isMountedRef.current = true;
    verifyPayment();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [verifyPayment]);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    setLoading(true);
    await verifyPayment();
  };

  const handleManualNavigate = () => {
    if (!navigatedRef.current) {
      navigatedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      navigate(`/portal?companyId=${companyId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">
            {retrying ? "Retrying verification..." : "Verifying your payment..."}
          </p>
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
              <p className="text-sm text-muted-foreground mt-2">
                If you completed payment, your access may still be granted. Try the portal or retry verification.
              </p>
            </div>

            {sessionId && (
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                Session: {sessionId.slice(0, 30)}...
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button 
                onClick={handleRetry}
                size="lg"
                className="w-full gap-2"
                disabled={retrying}
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                Retry Verification
              </Button>
              
              <Button 
                onClick={() => navigate("/portal")}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Go to Portal
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
              Thank you for your purchase. Redirecting you to complete your profile...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Premium access activated</span>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleManualNavigate}
              size="lg"
              className="w-full gradient-primary shadow-glow hover-neon-pulse font-bold"
            >
              Complete Your Profile
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Redirecting automatically in 2 seconds...
            </p>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const companyId = searchParams.get("companyId");

  return (
    <PaymentErrorBoundary sessionId={sessionId} companyId={companyId}>
      <PaymentSuccessContent />
    </PaymentErrorBoundary>
  );
}
