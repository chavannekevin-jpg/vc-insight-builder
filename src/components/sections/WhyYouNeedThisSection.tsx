import { AlertCircle, Zap, TrendingUp, Target, Shield, Users, DollarSign } from "lucide-react";

export const WhyYouNeedThisSection = () => {
  const confrontations = [
    {
      question: "Can this company reach €100M+ ARR?",
      challenge: "Level up your growth story.",
      icon: TrendingUp
    },
    {
      question: "What unfair advantage makes this team win?",
      challenge: "Sharpen your competitive edge.",
      icon: Target
    },
    {
      question: "What compounding defensibility grows with you?",
      challenge: "Build your moat strategy.",
      icon: Shield
    },
    {
      question: "Does the economic engine make sense at scale?",
      challenge: "Master your unit economics.",
      icon: DollarSign
    }
  ];

  const outcomes = [
    "Remove blind spots that kill deals",
    "Answer objections before the meeting",
    "Stand out from founders repeating mistakes"
  ];

  return (
    <section className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-hero -z-10" />
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl mb-6">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">The Reality Check</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Why This Memo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Think like an investor, win investors.
          </p>
        </div>

        <div className="space-y-6">
            
          <div className="relative group">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative bg-card/80 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-8 shadow-glow hover:shadow-glow-strong transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl gradient-primary shadow-glow">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold">The Core Issue</h3>
              </div>
              <p className="text-xl text-foreground/90 leading-relaxed">
                Startups have no idea how VCs evaluate their company.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-8 h-1 gradient-primary rounded-full" />
              The questions that separate fundable companies
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {confrontations.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="relative group/card">
                    <div className="absolute inset-0 gradient-primary opacity-20 blur-lg group-hover/card:opacity-40 transition-opacity duration-300" />
                    <div className="relative bg-card/90 backdrop-blur-xl border-2 border-primary/40 rounded-xl p-6 shadow-glow hover:shadow-glow-strong transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-lg gradient-primary shadow-glow flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-bold text-foreground mb-2 leading-snug">
                            {item.question}
                          </p>
                          <p className="text-sm text-primary font-semibold">
                            {item.challenge}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-success/20 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative bg-card/80 backdrop-blur-xl border-2 border-success/40 rounded-2xl p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_50px_rgba(34,197,94,0.4)] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-success/20 border border-success/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">What you get</h3>
              </div>
              <div className="space-y-3">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-success/5 border border-success/30 hover:bg-success/10 hover:border-success/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 group/outcome">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-success/30 flex items-center justify-center flex-shrink-0 group-hover/outcome:bg-success/40 group-hover/outcome:shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all duration-300">
                      <span className="text-success font-bold text-xs">✓</span>
                    </div>
                    <span className="text-sm font-medium text-foreground/90 leading-relaxed">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
