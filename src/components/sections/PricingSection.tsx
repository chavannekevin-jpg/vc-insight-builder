import { ModernCard } from "../ModernCard";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const PricingSection = () => {
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
        "Priority access to new features",
        "Email support included"
      ],
      cta: "Join Early Access",
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
        "Priority support",
        "Early adopter benefits"
      ],
      cta: "Skip the Line",
      highlight: false,
      color: "blue" as const
    }
  ];

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif mb-6 font-bold tracking-tight">Choose Your Plan</h2>
          <p className="text-lg md:text-xl text-muted-foreground">Select the option that fits your timeline</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {pricingOptions.map((option, index) => (
            <ModernCard 
              key={index}
              className={option.highlight ? 'ring-2 ring-primary shadow-xl' : ''}
            >
              <div className="space-y-6">
                {option.highlight && (
                  <Badge className="gradient-primary text-white border-0">Most Popular</Badge>
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
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className={option.highlight ? "w-full gradient-primary" : "w-full"}
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
