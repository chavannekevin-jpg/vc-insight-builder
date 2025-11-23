import { Win98Card } from "../Win98Card";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Input Your Company Data",
      description: "Fill in structured information about your startup, business model, traction, and vision.",
      color: "blue" as const
    },
    {
      number: "02",
      title: "Generate Your Investment Memorandum",
      description: "Our system creates a professional VC-grade memorandum using 10+ years of investment expertise.",
      color: "purple" as const
    },
    {
      number: "03",
      title: "Receive Diagnostics & Feedback",
      description: "Get questions that VCs would ask, identify model weaknesses, and discover improvement areas.",
      color: "yellow" as const
    },
    {
      number: "04",
      title: "Get Showcased to Investors (Optional)",
      description: "Pay extra to be presented to our network of 100+ European investors.",
      color: "pink" as const
    }
  ];

  return (
    <section className="py-16 px-4 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-xl mb-4">How_It_Works.exe</h2>
          <p className="font-sans text-base text-muted-foreground">Simple process, powerful results</p>
        </div>
        
        <div className="grid gap-6">
          {steps.map((step, index) => (
            <Win98Card key={index} accentColor={step.color}>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 win98-raised flex items-center justify-center pastel-${step.color}`}>
                    <span className="font-pixel text-xs">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-bold text-sm mb-2">{step.title}</h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </Win98Card>
          ))}
        </div>

        <div className="text-center pt-8">
          <Win98Card accentColor="teal">
            <p className="font-sans text-xs text-center">
              → Later: Request pitch decks, scripts, data room structures, and more
            </p>
          </Win98Card>
        </div>
      </div>
    </section>
  );
};
