import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Sparkles, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

export default function WaitlistCheckout() {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };

    const fetchCompany = async () => {
      if (!companyId) return;
      const { data } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();
      if (data) setCompanyName(data.name);
    };

    checkAuth();
    fetchCompany();
  }, [navigate, companyId]);

  const handlePayment = async () => {
    if (!userId || !companyId) {
      toast({
        title: "Error",
        description: "Missing user or company information",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if already on waitlist
      const { data: existing } = await supabase
        .from("waitlist_signups")
        .select("*")
        .eq("user_id", userId)
        .eq("company_id", companyId)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Already on Waitlist",
          description: "You've already secured your early access discount!",
        });
        navigate("/waitlist-confirmation");
        return;
      }

      // In production, integrate with Stripe here
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create waitlist signup record
      const { error } = await supabase
        .from("waitlist_signups")
        .insert({
          user_id: userId,
          company_id: companyId,
          pricing_tier: "early_access",
          discount_amount: 29.99,
          has_paid: true,
          paid_at: new Date().toISOString(),
          payment_intent_id: `simulated_${Date.now()}`, // Replace with real Stripe payment intent
        });

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: "Your spot is secured with the 50% discount.",
      });

      navigate("/waitlist-confirmation");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Early Access Offer
            </Badge>
            <h1 className="text-3xl font-bold">Secure Your 50% Discount</h1>
            <p className="text-muted-foreground">
              Pre-pay now and get immediate access when we launch
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Investment Memorandum Generator - Early Access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{companyName || "Your Company"}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Standard Price:</span>
                  <span className="line-through">€59.99</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Early Access Discount (50%):</span>
                  <span className="text-green-600 font-medium">-€30.00</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Due Today:</span>
                <span className="text-primary">€29.99</span>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  What You're Getting:
                </h3>
                <ul className="text-sm space-y-1.5 ml-6">
                  <li>• Full access to memo generator at launch</li>
                  <li>• AI-powered investment memorandum</li>
                  <li>• Professional formatting & export options</li>
                  <li>• Priority delivery within 24h of launch</li>
                  <li>• 50% discount locked in forever</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p className="flex items-start gap-2">
                  <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Launch Timeline:</strong> Expected within 2 weeks. You'll receive an email notification 
                    when the memo generator goes live.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Refund Policy:</strong> Full refund available anytime before launch. 
                    After launch, standard terms apply.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handlePayment}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? "Processing Payment..." : "Complete Payment - €29.99"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By completing this purchase, you agree to our terms of service and refund policy.
            Payment is processed securely.
          </p>
        </div>
      </div>
    </div>
  );
}
