export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Input Your Company Data",
      description: "Fill in structured information about your startup, business model, traction, and vision."
    },
    {
      number: "02",
      title: "Generate Your Investment Memorandum",
      description: "Our system creates a professional VC-grade memorandum using 10+ years of investment expertise."
    },
    {
      number: "03",
      title: "Receive Diagnostics & Feedback",
      description: "Get questions that VCs would ask, identify model weaknesses, and discover improvement areas."
    },
    {
      number: "04",
      title: "Get Showcased to Investors (Optional)",
      description: "Pay extra to be presented to our network of 100+ European investors."
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl mb-4">How It Works</h2>
          <p className="font-sans text-lg text-muted-foreground">Simple process, powerful results</p>
        </div>
        
        <div className="grid gap-6">
          {steps.map((step, index) => (
            <div key={index} className="retro-card p-6 flex gap-6 items-start hover:translate-y-[-2px] transition-transform">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 gradient-retro rounded-lg flex items-center justify-center text-white shadow-[4px_4px_0_hsl(var(--retro-shadow))]">
                  <span className="font-pixel text-sm">{step.number}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-pixel text-sm mb-3">{step.title}</h3>
                <p className="font-sans text-base text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <div className="retro-card inline-block px-6 py-3">
            <p className="font-sans text-sm text-muted-foreground">
              → Later: Request pitch decks, scripts, data room structures, and more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
