import { ModernCard } from "../ModernCard";
import { FileText, Lightbulb, Target, Users } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Input Your Company Data",
      description: "Fill in structured information about your startup, business model, traction, and vision.",
      icon: FileText
    },
    {
      number: "02",
      title: "Generate Your Investment Memorandum",
      description: "Our system creates a professional VC-grade memorandum using 10+ years of investment expertise.",
      icon: Lightbulb
    },
    {
      number: "03",
      title: "Receive Diagnostics & Feedback",
      description: "Get questions that VCs would ask, identify model weaknesses, and discover improvement areas.",
      icon: Target
    },
    {
      number: "04",
      title: "Get Showcased to Investors",
      description: "Pay extra to be presented to our network of 100+ European investors.",
      icon: Users
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">Simple process, powerful results</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ModernCard key={index} hover>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center border border-primary/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-primary mb-2">{step.number}</div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </ModernCard>
            );
          })}
        </div>

        <div className="text-center pt-12">
          <ModernCard className="inline-block">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Coming soon:</span> Pitch decks, scripts, data room structures, and more
            </p>
          </ModernCard>
        </div>
      </div>
    </section>
  );
};
