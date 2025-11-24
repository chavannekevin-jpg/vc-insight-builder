import { ModernCard } from "../ModernCard";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

export const PricingSection = () => {
  const navigate = useNavigate();
  
  const pricingOptions = [
    {
      title: "Early_Access.exe",
      subtitle: "Early Access - 50% Off",
      price: "€29.99",
      originalPrice: "€59.99",
      discount: "50% OFF",
      features: [
        "Get your memo when platform launches",
        "Save €30 with early access pricing",
        "Company profile shared to our VC network (optional)"
      ],
      cta: "Unlock Your VC Insights →",
      highlight: true,
      color: "green" as const
    },
    {
      title: "Skip_The_Line.exe",
      subtitle: "Express Service",
      price: "€159.99",
      features: [
        "Receive your memo within one week",
        "Jump ahead of the waitlist",
        "Company profile shared to our VC network (optional)"
      ],
      cta: "Fast Track to Clarity →",
      highlight: false,
      color: "blue" as const
    },
    {
      title: "VIP_Fast_Track.exe",
      subtitle: "Ultra Premium Package",
      price: "€399",
      features: [
        "Express memo delivered within one week",
        "Memo pushed to our network of 100+ global investors",
        "Direct introductions to VCs/investors if they show interest",
        "Priority support throughout the process"
      ],
      cta: "Get VIP Access →",
      highlight: false,
      color: "accent" as const,
      badge: "Most Exclusive"
    }
  ];

  const handleSelectPlan = (planTitle: string, planPrice: string) => {
    navigate(`/auth?plan=${encodeURIComponent(planTitle)}&price=${encodeURIComponent(planPrice)}`);
  };

  return (
    <section id="pricing-section" className="py-20 px-6 sm:px-8 lg:px-12 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-serif mb-4"
            style={{ 
              textShadow: '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.2)'
            }}
          >
            Choose Your Plan
          </h2>
          <p 
            className="text-lg text-muted-foreground"
            style={{ 
              textShadow: '0 0 15px hsl(var(--primary) / 0.3), 0 0 30px hsl(var(--primary) / 0.2)'
            }}
          >
            Select the option that fits your timeline
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
                
                <ul className="space-y-3 min-h-[140px]">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSelectPlan(option.title, option.price)}
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
      </div>
    </section>
  );
};
