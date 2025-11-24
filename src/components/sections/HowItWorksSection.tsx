import { FileText, Lightbulb, Target, Users, Sparkles } from "lucide-react";

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
    <section className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero -z-10" />
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 backdrop-blur-xl mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">The Process</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Stop Guessing. Start Speaking VC
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Built by active VCs who write checks at pre-seed and seed stage
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="group relative">
                <div className="absolute inset-0 gradient-primary opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/50 hover:shadow-glow transition-all duration-300">
                  <div className="flex gap-5 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl gradient-primary shadow-glow group-hover:shadow-glow-strong transition-shadow duration-300 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-xs font-bold text-primary/70 mb-2 tracking-widest">{step.number}</div>
                      <h3 className="font-bold text-xl mb-2 text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-12 animate-fade-in">
          <div className="inline-block relative group">
            <div className="absolute inset-0 gradient-accent opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-accent/30 rounded-2xl px-8 py-5 hover:border-accent/50 transition-all duration-300">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-accent">Coming later:</span> Pitch decks that don't suck, scripts, data rooms—the whole arsenal
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
