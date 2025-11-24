import { AlertCircle, Zap, TrendingUp } from "lucide-react";

export const WhyYouNeedThisSection = () => {
  const confrontations = [
    "Is your market VC-scale?",
    "Is your traction meaningful?",
    "Are you defensible?",
    "Does your narrative make sense?"
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
            Active VCs who've evaluated thousands of European startups. They all fail at the same thing:
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
                They don't know how investors evaluate their company.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 gradient-secondary opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-1 gradient-primary rounded-full" />
                The questions that separate fundable companies
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {confrontations.map((question, idx) => (
                  <div key={idx} className="group/item flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                    <div className="mt-1 w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover/item:shadow-glow transition-shadow duration-300">
                      <span className="text-primary font-bold text-sm">{idx + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground/90 leading-relaxed">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-primary/20 opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative bg-card/80 backdrop-blur-xl border-2 border-success/40 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-success/20 border border-success/30">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold">What you get</h3>
              </div>
              <div className="space-y-3">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-success/5 border border-success/20 hover:bg-success/10 hover:border-success/30 transition-all duration-300 group/outcome">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 group-hover/outcome:bg-success/30 transition-colors duration-300">
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
