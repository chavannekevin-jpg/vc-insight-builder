import { ModernCard } from "../ModernCard";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

export const PricingSection = () => {
  const navigate = useNavigate();
  
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
      subtitle: "Personalized Investment Memo",
      price: "€59.99",
      originalPrice: "€119.99",
      discount: "Early Access - 50% OFF",
      features: [
        "Everything in Free, plus:",
        "AI-powered personalized memo",
        "VC-quality analysis of your startup",
        "Actionable feedback and insights",
        "Pitch strengthening recommendations",
        "Company profile shared to VC network (optional)"
      ],
      cta: "Upgrade to Premium →",
      highlight: true,
      color: "green" as const
    },
    {
      title: "VIP Package",
      subtitle: "Premium + Network Access",
      price: "€399",
      features: [
        "Everything in Premium, plus:",
        "Priority memo delivery (1 week)",
        "Direct push to 100+ global investors",
        "Personal introductions from Kevin",
        "Priority support",
        "Early access to new features"
      ],
      cta: "Get VIP Access →",
      highlight: false,
      color: "accent" as const,
      badge: "Most Exclusive"
    }
  ];

  const handleSelectPlan = (option: typeof pricingOptions[0]) => {
    if (option.isPermanentlyFree) {
      navigate('/auth');
    } else {
      navigate(`/auth?plan=${encodeURIComponent(option.title)}&price=${encodeURIComponent(option.price)}`);
    }
  };

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
                  onClick={() => handleSelectPlan(option)}
                  className={option.highlight ? "w-full gradient-primary hover-neon-pulse" : "w-full hover-neon-pulse"}
                  variant={option.highlight ? "default" : "outline"}
                  size="lg"
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