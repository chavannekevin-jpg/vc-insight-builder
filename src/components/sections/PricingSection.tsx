import { ModernCard } from "../ModernCard";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { usePricingSettings } from "@/hooks/usePricingSettings";

export const PricingSection = () => {
  const navigate = useNavigate();
  const { data: pricingSettings, isLoading } = usePricingSettings();
  
  const memoPricing = pricingSettings?.memo_pricing;
  const networkPricing = pricingSettings?.network_pricing;
  
  const memoFinalPrice = memoPricing?.early_access_enabled 
    ? Math.floor(memoPricing.base_price * (1 - memoPricing.early_access_discount / 100) * 100) / 100
    : memoPricing?.base_price ?? 59.99;

  const pricingOptions = [
    {
      title: "Free Access",
      subtitle: "Freemium Hub",
      price: "€0",
      isPermanentlyFree: true,
      features: [
        "Full access to all guides and templates",
        "Complete VC framework and methodology",
        "Pre-Seed Deck Guide",
        "PlayBook articles and resources",
        "Track your progress",
        "Community support"
      ],
      cta: "Get Started Free →",
      highlight: false,
      color: "blue" as const
    },
    {
      title: "Premium Memo",
      subtitle: "VC Due Diligence Simulation",
      price: `€${memoFinalPrice.toFixed(2)}`,
      originalPrice: memoPricing?.early_access_enabled ? `€${memoPricing.base_price.toFixed(2)}` : undefined,
      discount: memoPricing?.early_access_enabled ? `Early Access - ${memoPricing.early_access_discount}% OFF` : undefined,
      features: [
        "Everything in Free, plus:",
        "The internal memo VCs write about you",
        "Every weakness exposed before your pitch",
        "Deal-killing red flags surfaced first",
        "Specific fixes to strengthen your position",
        "1 memo generation included (€8.99/extra)",
        "Company profile shared to VC network (optional)"
      ],
      cta: "Get the Memo →",
      highlight: true,
      color: "green" as const
    },
    {
      title: "VIP Package",
      subtitle: "Premium + Network Access",
      price: `€${(networkPricing?.base_price ?? 159.99).toFixed(2)}`,
      features: [
        "Everything in Premium, plus:",
        "Unlimited memo regenerations",
        "Direct push to 400+ global investors",
        "Personal introductions when there's interest"
      ],
      cta: "Coming Soon",
      highlight: false,
      color: "accent" as const,
      badge: "Coming Soon",
      comingSoon: true
    }
  ];

  const handleSelectPlan = (option: typeof pricingOptions[0]) => {
    if (option.isPermanentlyFree) {
      navigate('/auth');
    } else {
      navigate(`/auth?plan=${encodeURIComponent(option.title)}&price=${encodeURIComponent(option.price)}`);
    }
  };

  if (isLoading) {
    return (
      <section id="pricing-section" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading pricing...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing-section" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Flexible Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Start Free, Upgrade When Ready
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get full access to resources and frameworks for free. Pay only when you want the personalized memo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingOptions.map((option, index) => (
            <ModernCard 
              key={index}
              className={option.highlight ? 'ring-2 ring-primary shadow-xl' : ''}
            >
              <div className="space-y-6">
                {option.highlight && (
                  <Badge className="gradient-primary text-white border-0">Most Popular</Badge>
                )}
                {option.badge && (
                  <Badge className="bg-accent text-white border-0">{option.badge}</Badge>
                )}
                {option.isPermanentlyFree && (
                  <Badge className="bg-green-500 text-white border-0">Always Free</Badge>
                )}
                
                <div>
                  <h3 className="text-2xl font-serif mb-2">{option.subtitle}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-foreground">{option.price}</span>
                    {option.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">{option.originalPrice}</span>
                    )}
                  </div>
                  {option.discount && (
                    <Badge variant="secondary" className="mt-2">
                      {option.discount}
                    </Badge>
                  )}
                </div>
                
                <ul className="space-y-3 min-h-[180px]">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => !option.comingSoon && handleSelectPlan(option)}
                  className={option.highlight ? "w-full gradient-primary hover-neon-pulse" : "w-full hover-neon-pulse"}
                  variant={option.highlight ? "default" : "outline"}
                  size="lg"
                  disabled={option.comingSoon}
                >
                  {option.cta}
                </Button>
              </div>
            </ModernCard>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            All plans include access to future updates and improvements
          </p>
        </div>
      </div>
    </section>
  );
};
