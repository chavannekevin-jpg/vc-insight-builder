import { AlertCircle, FileText, Target, Eye, Lightbulb, Network } from "lucide-react";

export const ProblemSolutionSection = () => {
  return (
    <section className="py-20 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-muted/20 -z-10" />
      
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Problem Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-destructive/10 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
          <div className="relative bg-card/80 backdrop-blur-xl border-2 border-destructive/40 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/40 shadow-glow">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">The Problem</h2>
            </div>
            
            <p className="text-base text-foreground/90 leading-relaxed font-semibold mb-6">
              The problem isn't just features or traction—it's misalignment with how VCs evaluate startups.
            </p>
            
            <ul className="space-y-4 mb-6">
              {[
                "Traction ≠ VC traction – Your growth looks great on paper, but it doesn't map to the metrics VCs care about.",
                "Features over fundamentals – You obsess over product details, while investors are scanning for market potential, defensibility, and scalability.",
                "Small deals, small impact – Low ACV means growth looks slow, even if adoption is strong."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all duration-300">
                  <span className="text-destructive mt-0.5 font-bold">✗</span>
                  <span className="text-sm text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 backdrop-blur-sm">
              <p className="text-sm text-foreground/80 italic">
                VCs won't waste time teaching you. They'll just pass.
              </p>
            </div>
          </div>
        </div>

        {/* What You Get Card */}
        <div className="relative group">
          <div className="absolute inset-0 gradient-primary opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
          <div className="relative bg-card/80 backdrop-blur-xl border-2 border-primary/40 rounded-2xl p-8 shadow-glow hover:shadow-glow-strong transition-all duration-300">
            <h2 className="text-2xl font-bold mb-6 neon-pink">What You Get</h2>
            
            <div className="space-y-5">
              {[
                {
                  icon: FileText,
                  title: "Your Personalized VC Memo",
                  description: "a multi-page, VC-style document that investors actually use to decide on funding. Objective, unbiased, and designed to reveal strengths, risks, and growth potential — giving you the same insights VCs rely on."
                },
                {
                  icon: Target,
                  title: "Actionable Feedback",
                  description: "clear, practical guidance on blind spots, weaknesses, and potential objections so you can fix them before pitching."
                },
                {
                  icon: Eye,
                  title: "VC Lens on Your Story",
                  description: "your startup reframed as a VC-ready investment case, making your value and growth potential obvious."
                },
                {
                  icon: Lightbulb,
                  title: "Your Investment Thesis",
                  description: "the core narrative a VC would pitch to other investors, forming the backbone of every deal discussion."
                },
                {
                  icon: Network,
                  title: "Optional Exposure",
                  description: "the ability to share your profile with our VC network for early visibility (optional, at your discretion)."
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 group/item">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                        <p className="text-xs text-foreground/70 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
