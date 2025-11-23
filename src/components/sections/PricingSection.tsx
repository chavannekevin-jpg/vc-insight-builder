export const PricingSection = () => {
  const pricingOptions = [
    {
      title: "Early Access",
      subtitle: "Waitlist",
      features: [
        "Join the waitlist",
        "Discounted early access",
        "Be first to generate your memo",
        "Receive product updates"
      ],
      cta: "Register to Waitlist",
      highlight: false
    },
    {
      title: "Priority Access",
      subtitle: "Skip the Line",
      features: [
        "Skip the waiting period",
        "Immediate access when launched",
        "Priority support",
        "Early adopter benefits"
      ],
      cta: "Get Priority Access",
      highlight: true
    },
    {
      title: "Manual Memorandum",
      subtitle: "Premium Service",
      features: [
        "Manually created by experts",
        "Available immediately",
        "Personalized consultation",
        "10+ years of VC experience"
      ],
      cta: "Request Manual Memo",
      highlight: false
    }
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl mb-4">Select Your Package</h2>
          <p className="font-sans text-lg text-muted-foreground">Choose the option that fits your timeline</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingOptions.map((option, index) => (
            <div 
              key={index} 
              className={`retro-card p-8 ${option.highlight ? 'border-2 border-primary' : ''} hover:translate-y-[-4px] transition-all`}
            >
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-border">
                  <h3 className="font-pixel text-sm mb-2">{option.title}</h3>
                  <p className="font-sans text-base text-muted-foreground">{option.subtitle}</p>
                </div>
                
                <ul className="space-y-3 font-sans text-sm min-h-[160px]">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary flex-shrink-0 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full px-6 py-3 font-sans font-semibold text-sm rounded-lg border-2 border-foreground hover:border-primary bg-card hover:bg-card/80 transition-all shadow-[3px_3px_0_hsl(var(--retro-shadow))] hover:shadow-[5px_5px_0_hsl(var(--retro-shadow))] hover:translate-y-[-2px] active:translate-y-0"
                >
                  {option.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
