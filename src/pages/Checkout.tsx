import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Sparkles, Crown, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if they have a company
      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("founder_id", session.user.id)
        .limit(1);

      if (!companies || companies.length === 0) {
        toast({
          title: "Complete the questionnaire first",
          description: "Please fill out the questionnaire before selecting a plan.",
          variant: "destructive",
        });
        navigate("/portal");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const plans = [
    {
      id: "early-access",
      title: "Early Access",
      subtitle: "Early Access - 50% Off",
      price: "€29.99",
      originalPrice: "€59.99",
      discount: "50% OFF",
      features: [
        "Get your memo when platform launches",
        "Save €30 with early access pricing",
        "Company profile shared to our VC network (optional)"
      ],
      highlight: true,
      icon: Sparkles,
      color: "green"
    },
    {
      id: "express",
      title: "Express Service",
      subtitle: "Express Service",
      price: "€159.99",
      features: [
        "Expert-crafted memo delivered within one week",
        "Personally reviewed by Kevin during early access",
        "Full automation coming soon—get priority access now",
        "Company profile shared to Kevin's VC network (optional)"
      ],
      highlight: false,
      icon: Rocket,
      color: "blue"
    },
    {
      id: "vip",
      title: "VIP Package",
      subtitle: "Ultra Premium Package",
      price: "€399",
      features: [
        "Express memo delivered within one week",
        "Memo pushed to Kevin's network of 100+ global investors",
        "Direct introductions from Kevin to VCs/investors if they show interest"
      ],
      highlight: false,
      icon: Crown,
      color: "accent",
      badge: "Most Exclusive"
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPlan) {
      toast({
        title: "Select a plan",
        description: "Please choose a plan to continue.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your memo is being prepared. You'll receive updates via email.",
      });
      setProcessing(false);
      
      // Navigate to a success/thank you page or dashboard
      navigate("/hub");
    }, 2000);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-hero -z-10 opacity-30" />
      
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 
            className="text-4xl md:text-5xl font-serif font-bold"
            style={{ 
              textShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3)'
            }}
          >
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You've completed the questionnaire! Now select the plan that fits your timeline and get your investment memo.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className="cursor-pointer"
              >
                <ModernCard 
                  className={`transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-xl scale-105' 
                      : plan.highlight 
                      ? 'ring-2 ring-primary/50 shadow-lg' 
                      : ''
                  }`}
                >
                <div className="space-y-6">
                  {plan.highlight && (
                    <Badge className="gradient-primary text-white border-0">Most Popular</Badge>
                  )}
                  {plan.badge && (
                    <Badge className="bg-accent text-white border-0">{plan.badge}</Badge>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif mb-2">{plan.subtitle}</h3>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        {plan.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">{plan.originalPrice}</span>
                        )}
                      </div>
                      {plan.discount && (
                        <Badge variant="secondary" className="mt-2">
                          {plan.discount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 min-h-[140px]">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-center pt-4">
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-2 text-primary font-medium">
                        <Check className="w-5 h-5" />
                        <span>Selected</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Click to select</span>
                    )}
                  </div>
                </div>
              </ModernCard>
              </div>
            );
          })}
        </div>

        {/* Checkout Section */}
        {selectedPlan && (
          <ModernCard className="p-8 space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-serif font-bold mb-1">Order Summary</h3>
                <p className="text-muted-foreground">Review your selection</p>
              </div>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{selectedPlanData?.title}</span>
                <span className="text-2xl font-bold text-primary">{selectedPlanData?.price}</span>
              </div>
              
              {selectedPlanData?.discount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <Badge variant="secondary">{selectedPlanData.discount}</Badge>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Payment processing will be integrated soon. For now, clicking "Complete Purchase" will simulate a successful payment.
              </p>
              
              <Button 
                onClick={handlePurchase}
                disabled={processing}
                size="lg"
                className="w-full gradient-primary shadow-glow hover-neon-pulse font-bold text-lg"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Complete Purchase
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
            </div>
          </ModernCard>
        )}

        {!selectedPlan && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Select a plan above to continue</p>
            <Button 
              onClick={() => navigate("/portal")}
              variant="outline"
            >
              Back to Questionnaire
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
