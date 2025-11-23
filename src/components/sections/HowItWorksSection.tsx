import { Win98Window } from "../Win98Window";

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
    <section className="py-16 px-4 bg-background/50">
      <div className="max-w-5xl mx-auto">
        <Win98Window title="How_It_Works.exe">
          <div className="space-y-8">
            <h2 className="font-pixel text-xl text-center mb-8">PROCESS FLOWCHART</h2>
            
            <div className="grid gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="win98-border bg-primary text-primary-foreground w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="font-pixel text-sm">{step.number}</span>
                  </div>
                  <div className="flex-1 win98-border-inset bg-input p-4">
                    <h3 className="font-pixel text-sm mb-2">{step.title}</h3>
                    <p className="font-retro text-xl">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="font-retro text-xl text-muted-foreground">
                → Later: Request pitch decks, scripts, data room structures, and more
              </p>
            </div>
          </div>
        </Win98Window>
      </div>
    </section>
  );
};
