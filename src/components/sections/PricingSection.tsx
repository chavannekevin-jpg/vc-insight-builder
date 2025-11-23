import { Win98Card } from "../Win98Card";
import { Win98StartButton } from "../Win98StartButton";

export const PricingSection = () => {
  const pricingOptions = [
    {
      title: "Early_Access.exe",
      subtitle: "Waitlist",
      features: [
        "Join the waitlist",
        "Discounted early access",
        "Be first to generate your memo",
        "Receive product updates"
      ],
      cta: "Register to Waitlist",
      highlight: false,
      color: "blue" as const
    },
    {
      title: "Priority_Access.exe",
      subtitle: "Skip the Line",
      features: [
        "Skip the waiting period",
        "Immediate access when launched",
        "Priority support",
        "Early adopter benefits"
      ],
      cta: "Get Priority Access",
      highlight: true,
      color: "green" as const
    },
    {
      title: "Manual_Memo.exe",
      subtitle: "Premium Service",
      features: [
        "Manually created by experts",
        "Available immediately",
        "Personalized consultation",
        "10+ years of VC experience"
      ],
      cta: "Request Manual Memo",
      highlight: false,
      color: "purple" as const
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl mb-4">Select_Package.exe</h2>
          <p className="font-sans text-base text-muted-foreground">Choose the option that fits your timeline</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingOptions.map((option, index) => (
            <Win98Card 
              key={index}
              title={option.title}
              accentColor={option.color}
              className={option.highlight ? 'ring-2 ring-primary ring-offset-2' : ''}
            >
              <div className="space-y-6">
                <div className="text-center pb-4 win98-inset p-2 bg-muted/30">
                  <p className="font-sans text-sm font-semibold">{option.subtitle}</p>
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
