import { ModernCard } from "../ModernCard";
import { FileText, Lightbulb, Target, Users } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Dump Your Data",
      description: "Answer the questions investors actually care about. Not the fluff you put in your deck.",
      icon: FileText
    },
    {
      number: "02",
      title: "Get Your Memo",
      description: "We'll turn your answers into an investment memo built on 10+ years of writing them for actual deals.",
      icon: Lightbulb
    },
    {
      number: "03",
      title: "Face the Hard Questions",
      description: "Get the diagnostic feedback VCs think but don't tell you. Fix your model before the meeting.",
      icon: Target
    },
    {
      number: "04",
      title: "Skip to Real Investors",
      description: "Pay extra. Get fast-tracked to our network of 100+ European VCs who actually write checks.",
      icon: Users
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Stop Guessing. Start Speaking VC</h2>
          <p className="text-lg text-muted-foreground">Built by active VCs who write checks at pre-seed and seed stage</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ModernCard key={index} hover>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center border-2 border-primary/30 shadow-md">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-primary mb-2 tracking-wider">{step.number}</div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
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
              <span className="font-semibold text-foreground">Coming later:</span> Pitch decks that don't suck, scripts, data rooms—the whole arsenal
            </p>
          </ModernCard>
        </div>
      </div>
    </section>
  );
};
