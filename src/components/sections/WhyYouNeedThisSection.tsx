import { AlertCircle, Zap, TrendingUp } from "lucide-react";

export const WhyYouNeedThisSection = () => {
  const questions = [
    {
      icon: AlertCircle,
      number: "01",
      title: "Can this company reach €100M+ ARR?",
      description: "Level up your growth story.",
      detail: "VCs don't care about your current numbers. They care about trajectory to massive scale. Our memo maps your path to €100M+ ARR with the milestones that matter."
    },
    {
      icon: Zap,
      number: "02",
      title: "What's their unfair advantage?",
      description: "Unlock your competitive edge.",
      detail: "It's not what you do—it's why competitors can't copy you. We help you articulate your defensibility in language that investors understand and remember."
    },
    {
      icon: TrendingUp,
      number: "03",
      title: "How does the economic engine work at scale?",
      description: "Transform your unit economics.",
      detail: "From CAC to LTV, margin expansion to capital efficiency—we structure your economics to show exactly how you become a capital-efficient growth machine."
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-subtle -z-10" />
      
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm mb-4">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Reality Check</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Think like an investor, win investors.
          </h2>
        </div>

        {/* Core issue card */}
        <div className="mb-12 p-8 bg-card/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-glow">
          <h3 className="text-2xl font-bold mb-4 text-primary">The Core Issue</h3>
          <p className="text-lg text-foreground/90 leading-relaxed">
            You think VCs evaluate on execution. They evaluate on <span className="text-primary font-bold">economics at scale, market structure, and defensibility</span>. 
            Your pitch is answering questions they're not asking.
          </p>
        </div>

        {/* Questions section with enhanced styling */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center">
            The questions that separate fundable companies:
          </h3>
          
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const Icon = q.icon;
              return (
                <div 
                  key={idx} 
                  className="group relative p-6 bg-card/80 backdrop-blur-xl border-2 border-primary/50 rounded-2xl shadow-glow hover:shadow-glow-strong hover:scale-[1.02] hover:border-primary/80 transition-all duration-300"
                >
                  {/* Neon glow effect that pulses on hover */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                  
                  <div className="relative flex items-start gap-6">
                    {/* Number badge with pulse animation */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:animate-pulse">
                      <span className="text-2xl font-bold text-primary-foreground">{q.number}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-xl font-bold mb-1">{q.title}</h4>
                          <p className="text-primary font-semibold text-lg mb-2">→ {q.description}</p>
                          <p className="text-muted-foreground leading-relaxed">{q.detail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What you get section */}
        <div className="p-8 bg-card/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-glow">
          <h3 className="text-2xl font-bold mb-6 text-primary">What you get</h3>
          
          <div className="space-y-4">
            {[
              "Remove blind spots that kill deals before the first meeting",
              "Answer objections before they're raised",
              "Differentiate where competitors all sound the same"
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
              >
                <span className="text-primary mt-0.5 font-bold text-lg">✓</span>
                <span className="text-foreground/90 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl gradient-accent border-2 border-primary/50 shadow-glow backdrop-blur-sm text-center">
            <p className="text-lg font-bold text-foreground mb-2">
              Ready to see your startup through a VC lens?
            </p>
            <button 
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:gap-3 transition-all duration-300"
            >
              Unlock Your VC Insights →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
