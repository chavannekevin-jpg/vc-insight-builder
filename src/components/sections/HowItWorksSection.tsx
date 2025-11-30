import { BookOpen, Lightbulb, Target, Zap } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in 30 seconds. Zero payment info required. Full access, immediately.",
      icon: Zap
    },
    {
      number: "02",
      title: "Access the Framework",
      description: "Learn how VCs actually think. The real criteria. The unspoken rules. The patterns behind every rejection.",
      icon: BookOpen
    },
    {
      number: "03",
      title: "Use the Tools",
      description: "Guides, templates, and resources built from reviewing thousands of pitches. The stuff that actually works.",
      icon: Target
    },
    {
      number: "04",
      title: "Stop Wasting Time",
      description: "Fix your pitch before the meeting. Know what investors want before you ask for their money.",
      icon: Lightbulb
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Your Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, learn the framework, upgrade when ready
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="group relative">
                <div className="relative bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <div className="flex gap-5 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-primary" />
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

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Completely free. Forever. No catch.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            Unlock the VC Brain →
          </button>
        </div>
      </div>
    </section>
  );
};
