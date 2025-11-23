import { Win98Card } from "../Win98Card";
import { Win98StartButton } from "../Win98StartButton";

export const PricingSection = () => {
  const pricingOptions = [
    {
      title: "Early_Access.exe",
      subtitle: "Discounted Early Access",
      price: "€59.99",
      originalPrice: "€119.99",
      discount: "50% OFF",
      features: [
        "Get your memo when platform launches",
        "50% discount for early joiners",
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
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl mb-4">Select_Package.exe</h2>
          <p className="font-sans text-base text-muted-foreground">Choose the option that fits your timeline</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {pricingOptions.map((option, index) => (
            <Win98Card 
              key={index}
              title={option.title}
              accentColor={option.color}
              className={option.highlight ? 'ring-2 ring-primary ring-offset-2' : ''}
            >
              <div className="space-y-6">
                <div className="text-center pb-4 win98-inset p-3 bg-muted/30">
                  <p className="font-sans text-sm font-semibold mb-2">{option.subtitle}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-pixel text-xl text-primary">{option.price}</span>
                    {option.originalPrice && (
                      <span className="font-sans text-xs text-muted-foreground line-through">{option.originalPrice}</span>
                    )}
                  </div>
                  {option.discount && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-pixel">
                      {option.discount}
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3 font-sans text-xs min-h-[140px]">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Win98StartButton 
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full text-xs"
                  variant={option.highlight ? "primary" : "default"}
                >
                  {option.cta}
                </Win98StartButton>
              </div>
            </Win98Card>
          ))}
        </div>
      </div>
    </section>
  );
};
