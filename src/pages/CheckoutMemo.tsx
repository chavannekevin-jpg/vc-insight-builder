import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernCard } from "@/components/ModernCard";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Tag, Sparkles, ArrowLeft, Gift, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { isValidCompanyId } from "@/lib/companyIdUtils";

export default function CheckoutMemo() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get("companyId");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  
  // Referral discount state (from investor invites)
  const [referralDiscount, setReferralDiscount] = useState<{ 
    percent: number; 
    investorName: string | null;
    code: string;
  } | null>(null);
  
  // Accelerator discount state (from accelerator invites)
  const [acceleratorDiscount, setAcceleratorDiscount] = useState<{
    percent: number;
    acceleratorName: string | null;
    code: string;
  } | null>(null);
  
  // Earned referral discount state (from referring other founders)
  const [earnedReferralDiscount, setEarnedReferralDiscount] = useState<number>(0);
  
  const { data: pricingSettings, isLoading: pricingLoading } = usePricingSettings();
  
  const basePrice = pricingSettings?.memo_pricing.base_price ?? 100;
  const earlyAccessDiscount = pricingSettings?.memo_pricing.early_access_discount ?? 0;
  const earlyAccessEnabled = pricingSettings?.memo_pricing.early_access_enabled ?? false;
  
  const discountedPrice = earlyAccessEnabled ? basePrice * (1 - earlyAccessDiscount / 100) : basePrice;
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (pricingSettings) {
      recalculatePrice();
    }
  }, [pricingSettings, referralDiscount, acceleratorDiscount, appliedDiscount, earnedReferralDiscount]);

  const recalculatePrice = () => {
    if (!pricingSettings) return;
    
    let price = basePrice;
    
    // Apply early access discount
    if (earlyAccessEnabled) {
      price = price * (1 - earlyAccessDiscount / 100);
    }
    
    // Apply earned referral discount (from referring other founders)
    if (earnedReferralDiscount > 0) {
      price = price * (1 - earnedReferralDiscount / 100);
    }
    
    // Apply investor referral discount
    if (referralDiscount) {
      price = price * (1 - referralDiscount.percent / 100);
    }
    
    // Apply accelerator discount (from accelerator invites)
    if (acceleratorDiscount) {
      price = price * (1 - acceleratorDiscount.percent / 100);
    }
    
    // Apply coupon discount
    if (appliedDiscount) {
      price = price * (1 - appliedDiscount.discount_percent / 100);
    }
    
    setFinalPrice(Math.max(0, price));
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`, { replace: true });
      return;
    }
    setUser(session.user);

    // Validate companyId with strict UUID check
    let validCompanyId = companyIdFromUrl;
    
    if (!isValidCompanyId(validCompanyId)) {
      console.warn('[CheckoutMemo] Invalid companyId from URL:', companyIdFromUrl);
      
      // Try to recover by fetching user's latest company
      const { data: latestCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("founder_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestCompany?.id) {
        console.log('[CheckoutMemo] Recovered companyId:', latestCompany.id);
        validCompanyId = latestCompany.id;
        // Update URL to reflect correct companyId
        navigate(`/checkout-analysis?companyId=${latestCompany.id}`, { replace: true });
      } else {
        console.error('[CheckoutMemo] No company found for user');
        toast({
          title: "Invalid request",
          description: "Company ID is missing. Please go back and try again.",
          variant: "destructive",
        });
        navigate("/portal");
        return;
      }
    }

    // Verify user owns this company AND check premium status + referral info + earned discount
    const { data: company } = await supabase
      .from("companies")
      .select("founder_id, has_premium, referral_code, referred_by_investor, earned_referral_discount, name")
      .eq("id", validCompanyId)
      .maybeSingle();

    if (!company || company.founder_id !== session.user.id) {
      toast({
        title: "Access denied",
        description: "You don't have access to this company.",
        variant: "destructive",
      });
      navigate("/portal");
      return;
    }
    
    // Set company name for personalization
    if (company.name) {
      setCompanyName(company.name);
    }
    
    // If user already has premium access (admin-granted), bypass checkout
    if (company.has_premium) {
      toast({
        title: "Access already granted",
        description: "Redirecting to your full analysis...",
      });
      navigate(`/analysis?companyId=${validCompanyId}&view=full`, { replace: true });
      return;
    }
    
    // Check for earned referral discount (from referring other founders)
    if (company.earned_referral_discount && company.earned_referral_discount > 0) {
      setEarnedReferralDiscount(company.earned_referral_discount);
    }
    
    // Check for referral discount
    if (company.referral_code && company.referred_by_investor) {
      const { data: invite } = await supabase
        .from("startup_invites")
        .select("discount_percent, investor_id")
        .eq("code", company.referral_code)
        .eq("is_active", true)
        .single();
        
      if (invite) {
        // Get investor name
        const { data: investor } = await supabase
          .from("investor_profiles")
          .select("full_name, organization_name")
          .eq("id", invite.investor_id)
          .single();
          
        setReferralDiscount({
          percent: invite.discount_percent,
          investorName: investor?.full_name || investor?.organization_name || null,
          code: company.referral_code,
        });
      }
    }
    
    // Check for accelerator invite discount from sessionStorage
    let acceleratorCode = sessionStorage.getItem('accelerator_invite_code');
    let acceleratorPercent = sessionStorage.getItem('accelerator_discount_percent');
    
    // FALLBACK: If session storage is empty but company has accelerator_invite_id,
    // fetch the discount directly from the database. This handles the case where
    // session storage was cleared prematurely (e.g., browser refresh, navigation).
    if (!acceleratorCode) {
      const { data: companyWithInvite } = await supabase
        .from("companies")
        .select("accelerator_invite_id")
        .eq("id", validCompanyId)
        .single();
      
      if (companyWithInvite?.accelerator_invite_id) {
        const { data: invite } = await supabase
          .from("accelerator_invites")
          .select("code, discount_percent, accelerator_name, is_active, max_uses, uses, expires_at")
          .eq("id", companyWithInvite.accelerator_invite_id)
          .single();
        
        if (invite && invite.is_active) {
          const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
          const hasRemainingUses = !invite.max_uses || (invite.uses || 0) < invite.max_uses;
          
          if (!isExpired && hasRemainingUses) {
            acceleratorCode = invite.code;
            acceleratorPercent = String(invite.discount_percent);
            console.log('[CheckoutMemo] Recovered accelerator discount from DB:', invite.code, invite.discount_percent);
          }
        }
      }
    }
    
    if (acceleratorCode && acceleratorPercent) {
      // Validate the accelerator invite is still valid
      const { data: acceleratorInvite } = await supabase
        .from("accelerator_invites")
        .select("accelerator_name, discount_percent, is_active, max_uses, uses, expires_at")
        .eq("code", acceleratorCode)
        .single();
      
      if (acceleratorInvite && acceleratorInvite.is_active) {
        const isExpired = acceleratorInvite.expires_at && new Date(acceleratorInvite.expires_at) < new Date();
        const hasRemainingUses = !acceleratorInvite.max_uses || (acceleratorInvite.uses || 0) < acceleratorInvite.max_uses;
        
        if (!isExpired && hasRemainingUses) {
          setAcceleratorDiscount({
            percent: acceleratorInvite.discount_percent,
            acceleratorName: acceleratorInvite.accelerator_name,
            code: acceleratorCode,
          });
        }
      }
    }
    
    setCompanyId(validCompanyId);
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
      // Price will be recalculated by useEffect when appliedDiscount changes

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
      // If 100% discount, bypass Stripe and trigger generation
      if (finalPrice === 0) {
        // Build discount code label for tracking
        const discountCodeUsed = acceleratorDiscount?.code || appliedDiscount?.code || null;
        
        const { error: purchaseError } = await supabase
          .from("memo_purchases" as any)
          .insert({
            user_id: user.id,
            company_id: companyId,
            amount_paid: 0,
            discount_code_used: discountCodeUsed
          });

        if (purchaseError) throw purchaseError;

        // Grant premium access + 1 generation credit (same as Stripe webhook)
        const { error: updateError } = await supabase
          .from("companies")
          .update({ 
            has_premium: true,
            generations_available: 1,
            generations_used: 0,
            earned_referral_discount: 0
          })
          .eq("id", companyId);

        if (updateError) throw updateError;

        // Increment accelerator invite usage if applicable
        if (acceleratorDiscount?.code) {
          const { data: currentInvite } = await supabase
            .from("accelerator_invites")
            .select("uses")
            .eq("code", acceleratorDiscount.code)
            .single();
          
          if (currentInvite) {
            await supabase
              .from("accelerator_invites")
              .update({ uses: (currentInvite.uses || 0) + 1 })
              .eq("code", acceleratorDiscount.code);
          }
          
          // Clear sessionStorage after use
          sessionStorage.removeItem('accelerator_invite_code');
          sessionStorage.removeItem('accelerator_discount_percent');
        }

        if (appliedDiscount) {
          await supabase.functions.invoke('use-discount', {
            body: { codeId: appliedDiscount.id }
          });
        }

        // Invalidate caches to ensure fresh payment status when reaching portal/hub
        await queryClient.invalidateQueries({ queryKey: ["company"] });
        await queryClient.invalidateQueries({ queryKey: ["company", "byId", companyId] });
        await queryClient.invalidateQueries({ queryKey: ["payment", companyId] });
        await queryClient.invalidateQueries({ queryKey: ["payment"] });

        toast({
          title: "Access Granted! 🎉",
          description: "Complete your profile to generate your personalized analysis.",
        });

        // Redirect to portal WITHOUT auto-triggering generation
        // This allows user to improve answers via AnswerOptimizerWizard before generating
        navigate(`/portal?companyId=${companyId}`);
        return;
      }

      // Calculate combined discount for Stripe (stacking early access + referral + coupon)
      let remainingPrice = 1; // Start at 100%
      const discountLabels: string[] = [];

      if (earlyAccessEnabled) {
        remainingPrice = remainingPrice * (1 - earlyAccessDiscount / 100);
        discountLabels.push("EARLY_ACCESS");
      }

      if (earnedReferralDiscount > 0) {
        remainingPrice = remainingPrice * (1 - earnedReferralDiscount / 100);
        discountLabels.push(`FOUNDER_REFERRAL_${earnedReferralDiscount}%`);
      }

      if (referralDiscount) {
        remainingPrice = remainingPrice * (1 - referralDiscount.percent / 100);
        discountLabels.push(`INVESTOR_REFERRAL_${referralDiscount.code}`);
      }

      if (acceleratorDiscount) {
        remainingPrice = remainingPrice * (1 - acceleratorDiscount.percent / 100);
        discountLabels.push(`ACCELERATOR_${acceleratorDiscount.code}`);
      }

      if (appliedDiscount) {
        remainingPrice = remainingPrice * (1 - appliedDiscount.discount_percent / 100);
        discountLabels.push(appliedDiscount.code);
      }

      const combinedDiscountPercent = Math.round((1 - remainingPrice) * 100);
      const discountLabel = discountLabels.join(" + ");

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          companyId,
          discountCode: discountLabel || null,
          discountPercent: combinedDiscountPercent,
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
    // Price will be recalculated by useEffect when appliedDiscount changes
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
            The Memo VCs Would Write About {companyName || "Your Startup"}
          </h1>
          <p className="text-lg text-muted-foreground">
            Every deal gets an internal memo. This is {companyName || "yours"}—before it costs you the round.
          </p>
        </div>

        <ModernCard className="p-8 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-1">VC Due Diligence Simulation</h3>
              <p className="text-muted-foreground">One-time purchase</p>
            </div>
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <ul className="space-y-3 py-4">
            {[
              `The internal memo partners use to pass or pursue ${companyName || "your startup"}`,
              `Every weakness VCs will identify about ${companyName || "your company"}—exposed first`,
              `${companyName ? `${companyName}'s` : "Your"} deal-killing red flags surfaced before your pitch`,
              `Specific fixes to strengthen ${companyName ? `${companyName}'s` : "your"} position`,
              `The analysis that decides if ${companyName || "you"} gets a second meeting`,
              "Instant generation—know today what VCs will think"
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
            
            {earlyAccessEnabled && (
              <div className="flex items-center justify-between text-success">
                <span>Early Access Discount ({earlyAccessDiscount}%)</span>
                <span>-€{(basePrice * earlyAccessDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            
            {earnedReferralDiscount > 0 && (
              <div className="flex items-center justify-between text-success">
                <span className="flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Founder Referral Bonus ({earnedReferralDiscount}%)
                </span>
                <span>-€{(discountedPrice * earnedReferralDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            
            {referralDiscount && (
              <div className="flex items-center justify-between text-success">
                <span className="flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Investor Referral ({referralDiscount.percent}%)
                </span>
                <span>-€{((discountedPrice * (1 - earnedReferralDiscount / 100)) * referralDiscount.percent / 100).toFixed(2)}</span>
              </div>
            )}
            
            {acceleratorDiscount && (
              <div className="flex items-center justify-between text-success">
                <span className="flex items-center gap-1">
                  <Rocket className="w-4 h-4" />
                  {acceleratorDiscount.acceleratorName} ({acceleratorDiscount.percent}%)
                </span>
                <span>-€{((discountedPrice * (1 - earnedReferralDiscount / 100) * (1 - (referralDiscount?.percent || 0) / 100)) * acceleratorDiscount.percent / 100).toFixed(2)}</span>
              </div>
            )}
            
            {appliedDiscount && (
              <div className="flex items-center justify-between text-success">
                <span>Coupon Discount ({appliedDiscount.discount_percent}%)</span>
                <span>-€{(discountedPrice * appliedDiscount.discount_percent / 100).toFixed(2)}</span>
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
              onClick={() => navigate("/hub")}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By purchasing, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-primary">terms of service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="underline hover:text-primary">privacy policy</Link>.
              {finalPrice > 0 && " Secure payment processing powered by Stripe."}
            </p>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
