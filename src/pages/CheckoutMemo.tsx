import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernCard } from "@/components/ModernCard";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Tag, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingSettings } from "@/hooks/usePricingSettings";

export default function CheckoutMemo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  
  const { data: pricingSettings, isLoading: pricingLoading } = usePricingSettings();
  
  const basePrice = pricingSettings?.memo_pricing.base_price ?? 59.99;
  const earlyAccessDiscount = pricingSettings?.memo_pricing.early_access_discount ?? 50;
  const earlyAccessEnabled = pricingSettings?.memo_pricing.early_access_enabled ?? true;
  
  const discountedPrice = earlyAccessEnabled ? basePrice * (1 - earlyAccessDiscount / 100) : basePrice;
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (pricingSettings && finalPrice === null) {
      const price = earlyAccessEnabled ? basePrice * (1 - earlyAccessDiscount / 100) : basePrice;
      setFinalPrice(price);
    }
  }, [pricingSettings, finalPrice, basePrice, earlyAccessDiscount, earlyAccessEnabled]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);

    if (!companyId) {
      toast({
        title: "Invalid request",
        description: "Company ID is missing.",
        variant: "destructive",
      });
      navigate("/portal");
      return;
    }

    // Verify user owns this company
    const { data: company } = await supabase
      .from("companies")
      .select("founder_id")
      .eq("id", companyId)
      .single();

    if (!company || company.founder_id !== session.user.id) {
      toast({
        title: "Access denied",
        description: "You don't have access to this company.",
        variant: "destructive",
      });
      navigate("/portal");
      return;
    }
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setValidatingCode(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount', {
        body: { code: discountCode.trim() }
      });

      if (error) throw error;

      if (!data?.valid) {
        toast({
          title: "Invalid code",
          description: data?.error || "This discount code is not valid.",
          variant: "destructive",
        });
        return;
      }

      setAppliedDiscount({
        id: data.id,
        discount_percent: data.discount_percent,
        code: data.code
      });
      const discountAmount = (basePrice * data.discount_percent) / 100;
      const newPrice = Math.max(0, basePrice - discountAmount);
      setFinalPrice(newPrice);

      toast({
        title: "Discount applied! 🎉",
        description: `${data.discount_percent}% discount has been applied to your order.`,
      });
    } catch (error) {
      console.error("Error validating discount code:", error);
      toast({
        title: "Error",
        description: "Failed to validate discount code.",
        variant: "destructive",
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !companyId || finalPrice === null) return;

    setProcessing(true);

    try {
      // If 100% discount, bypass Stripe
      if (finalPrice === 0) {
        const { error: purchaseError } = await supabase
          .from("memo_purchases" as any)
          .insert({
            user_id: user.id,
            company_id: companyId,
            amount_paid: 0,
            discount_code_used: appliedDiscount?.code || null
          });

        if (purchaseError) throw purchaseError;

        const { error: updateError } = await supabase
          .from("companies")
          .update({ has_premium: true })
          .eq("id", companyId);

        if (updateError) throw updateError;

        if (appliedDiscount) {
          await supabase.functions.invoke('use-discount', {
            body: { codeId: appliedDiscount.id }
          });
        }

        toast({
          title: "Success! 🎉",
          description: "Your memo is being generated now!",
        });

        navigate(`/memo?companyId=${companyId}`);
        return;
      }

      // Create Stripe checkout session with early access discount
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          companyId,
          discountCode: appliedDiscount?.code || (earlyAccessEnabled ? "EARLY_ACCESS" : null),
          discountPercent: appliedDiscount?.discount_percent || (earlyAccessEnabled ? earlyAccessDiscount : 0),
          discountId: appliedDiscount?.id || null,
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setFinalPrice(discountedPrice);
  };

  if (pricingLoading || finalPrice === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 
            className="text-4xl md:text-5xl font-serif font-bold"
            style={{ 
              textShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)'
            }}
          >
            Get Your Investment Memo
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete your purchase to generate your professional investment memorandum
          </p>
        </div>

        <ModernCard className="p-8 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-1">Investment Memo</h3>
              <p className="text-muted-foreground">One-time purchase</p>
            </div>
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <ul className="space-y-3 py-4">
            {[
              "AI-powered professional investment memo",
              "Market analysis and competitive landscape",
              "Financial projections and metrics",
              "Risk assessment and mitigation strategies",
              "Investor-ready format",
              "Instant generation and download"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {!appliedDiscount ? (
            <div className="space-y-3 pt-4 border-t border-border">
              <Label htmlFor="discount" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Have a discount code?
              </Label>
              <div className="flex gap-2">
                <Input
                  id="discount"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && validateDiscountCode()}
                />
                <Button
                  onClick={validateDiscountCode}
                  disabled={validatingCode || !discountCode.trim()}
                  variant="outline"
                >
                  {validatingCode ? "..." : "Apply"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">
                    {appliedDiscount.discount_percent}% Discount Applied
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Code: {appliedDiscount.code}
                  </p>
                </div>
              </div>
              <Button
                onClick={removeDiscount}
                variant="ghost"
                size="sm"
              >
                Remove
              </Button>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base price</span>
              <span className={earlyAccessEnabled || appliedDiscount ? "line-through text-muted-foreground" : "font-medium"}>
                €{basePrice.toFixed(2)}
              </span>
            </div>
            
            {earlyAccessEnabled && !appliedDiscount && (
              <div className="flex items-center justify-between text-success">
                <span>Early Access Discount ({earlyAccessDiscount}%)</span>
                <span>-€{(basePrice * earlyAccessDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            
            {appliedDiscount && (
              <div className="flex items-center justify-between text-success">
                <span>Discount ({appliedDiscount.discount_percent}%)</span>
                <span>-€{((basePrice * appliedDiscount.discount_percent) / 100).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-2xl font-bold pt-2">
              <span>Total</span>
              <span className="text-primary">€{finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {finalPrice === 0 && (
              <Badge className="w-full justify-center py-2 gradient-primary text-white border-0">
                100% Discount - Free!
              </Badge>
            )}
            
            <Button 
              onClick={handlePurchase}
              disabled={processing}
              size="lg"
              className="w-full gradient-primary shadow-glow hover-neon-pulse font-bold text-lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Redirecting to Stripe...
                </>
              ) : finalPrice === 0 ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Claim Free Memo
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay with Stripe - €{finalPrice.toFixed(2)}
                </>
              )}
            </Button>

            <Button 
              onClick={() => navigate("/portal")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Questionnaire
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By purchasing, you agree to our terms of service and privacy policy.
              {finalPrice > 0 && " Secure payment processing powered by Stripe."}
            </p>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
