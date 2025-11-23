import { Win98Window } from "../Win98Window";

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
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-2xl mb-4">SELECT YOUR PACKAGE</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingOptions.map((option, index) => (
            <Win98Window key={index} title={option.title} className={option.highlight ? "ring-4 ring-primary" : ""}>
              <div className="space-y-4">
                <div className="win98-title-bar text-center mb-4">
                  {option.subtitle}
                </div>
                
                <ul className="space-y-3 font-retro text-lg min-h-[200px]">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0">▶</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full win98-border px-4 py-3 font-retro text-xl bg-card hover:bg-card/90 active:win98-border-inset transition-all"
                >
                  {option.cta}
                </button>
              </div>
            </Win98Window>
          ))}
        </div>
      </div>
    </section>
  );
};
