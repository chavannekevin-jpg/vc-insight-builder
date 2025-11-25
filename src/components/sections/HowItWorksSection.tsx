import { BookOpen, Lightbulb, FileText, Zap } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Start with Free Resources",
      description: "Access guides, templates, and frameworks immediately. No payment required.",
      icon: BookOpen
    },
    {
      number: "02",
      title: "Learn the VC Framework",
      description: "Understand how VCs think, what they look for, and why most pitches get rejected.",
      icon: Lightbulb
    },
    {
      number: "03",
      title: "Build Your Foundation",
      description: "Use the methodology to strengthen your pitch, business model, and narrative.",
      icon: Zap
    },
    {
      number: "04",
      title: "Get Your Premium Memo",
      description: "When you're ready, get a personalized VC-quality investment memo for your startup.",
      icon: FileText
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
            No commitment required. Start learning today.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
};
