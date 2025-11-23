import { ModernCard } from "../ModernCard";
import { FileText, Lightbulb, Target, Users } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Answer Real Questions",
      description: "What investors care about. Not deck fluff.",
      icon: FileText
    },
    {
      number: "02",
      title: "Get Your Memo",
      description: "10+ years of VC memos. Now yours.",
      icon: Lightbulb
    },
    {
      number: "03",
      title: "Fix Your Model",
      description: "Brutal feedback before the meeting.",
      icon: Target
    },
    {
      number: "04",
      title: "Meet Real VCs",
      description: "Fast-track to 100+ European investors.",
      icon: Users
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
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
