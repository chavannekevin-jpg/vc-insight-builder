import { AlertCircle, CheckCircle2 } from "lucide-react";

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
                <strong>I won't waste time in meetings teaching you</strong>—and neither will other VCs. We'll just pass and move on to the next pitch.
              </p>
            </div>
          </div>
        </div>

        {/* Solution Card */}
        <div className="relative group">
          <div className="absolute inset-0 gradient-primary opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
          <div className="relative bg-card/80 backdrop-blur-xl border-2 border-primary/40 rounded-2xl p-8 shadow-glow hover:shadow-glow-strong transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl gradient-primary shadow-glow">
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">The Solution</h2>
            </div>
            
            <p className="text-base text-foreground/90 leading-relaxed font-semibold mb-6">
              Brutal clarity. Immediate impact.
            </p>
            
            <ul className="space-y-4 mb-6">
              {[
                "a memo a VC would present to the IC",
                "structured to be the backbone of your narrative",
                "Fix your pitch before it fails"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
                  <span className="text-primary mt-0.5 font-bold">✓</span>
                  <span className="text-sm text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-xl gradient-accent border-2 border-primary/40 shadow-glow backdrop-blur-sm">
              <p className="text-sm font-bold text-foreground">
                → See your company the way they do, before they reject you
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
