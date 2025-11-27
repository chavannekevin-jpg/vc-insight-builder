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

    const loadPendingData = () => {
      const pendingDataStr = sessionStorage.getItem('pendingCompanyData');
      if (pendingDataStr) {
        const pendingData = JSON.parse(pendingDataStr);
        setCompanyName(pendingData.name);
      } else if (companyId) {
        // Fallback: fetch existing company if companyId is provided
        const fetchCompany = async () => {
          const { data } = await supabase
            .from("companies")
            .select("name")
            .eq("id", companyId)
            .single();
          if (data) setCompanyName(data.name);
        };
        fetchCompany();
      }
    };

    checkAuth();
    loadPendingData();
  }, [navigate, companyId]);

  const handlePayment = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get pending company data from sessionStorage
      const pendingDataStr = sessionStorage.getItem('pendingCompanyData');
      if (!pendingDataStr) {
        toast({
          title: "Error",
          description: "No questionnaire data found. Please complete the questionnaire first.",
          variant: "destructive",
        });
        navigate("/intake");
        return;
      }

      const pendingData = JSON.parse(pendingDataStr);

      // In production, integrate with Stripe here
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // After successful payment, create the company
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert({
          founder_id: userId,
          name: pendingData.name,
          description: pendingData.description,
          stage: pendingData.stage,
          category: null,
          biggest_challenge: null
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create waitlist signup record
      const { error: waitlistError } = await supabase
        .from("waitlist_signups")
        .insert({
          user_id: userId,
          company_id: newCompany.id,
          pricing_tier: "early_access",
          discount_amount: 29.99,
          has_paid: true,
          paid_at: new Date().toISOString(),
          payment_intent_id: `simulated_${Date.now()}`, // Replace with real Stripe payment intent
        });

      if (waitlistError) throw waitlistError;

      // Clear the pending data
      sessionStorage.removeItem('pendingCompanyData');

      toast({
        title: "Payment Successful!",
        description: "Your profile has been created and your spot is secured!",
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
              🎉 Early Bird Reservation
            </Badge>
            <h1 className="text-3xl font-bold">Reserve Your Early Access</h1>
            <p className="text-muted-foreground">
              Complete the questionnaire, pay now, get your memo when we launch
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Early Bird Reservation</CardTitle>
              <CardDescription>
                Investment Memorandum Generator - Reserve Your Access
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
                  <span className="text-muted-foreground">Future Launch Price:</span>
                  <span className="line-through">€59.99</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary font-medium">Early Bird Price (50% Off):</span>
                  <span className="text-primary font-medium">-€30.00</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Reserve Today:</span>
                <span className="text-primary">€29.99</span>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  🎯 Early Bird Benefits:
                </h3>
                <ul className="text-sm space-y-1.5 ml-6">
                  <li><strong>Full platform access now</strong> - all content & tools</li>
                  <li><strong>Complete questionnaire now</strong> - save your answers</li>
                  <li><strong>Memo generation later</strong> - when we officially launch</li>
                  <li><strong>50% off forever</strong> (regular price €59.99)</li>
                  <li><strong>Priority support</strong> as an early supporter</li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p className="flex items-start gap-2">
                  <Lock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>What happens next:</strong> You'll have immediate access to complete the questionnaire.
                    We'll notify you when memo generation is enabled.
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
            {loading ? "Processing..." : "Reserve My Spot - €29.99"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <strong>Note:</strong> Payment confirms your early-bird reservation. Your memo will be generated when we officially launch.
          </p>
        </div>
      </div>
    </div>
  );
}
