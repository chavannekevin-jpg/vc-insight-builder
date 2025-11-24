import { ModernCard } from "../ModernCard";

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
    <section className="py-24 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-hero opacity-50 -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
            Why This Memo
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Active VCs who've evaluated thousands of European startups. They all fail at the same thing:
          </p>
        </div>

        <div className="space-y-10">
            
            <ModernCard className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 shadow-xl">
              <p className="text-xl md:text-2xl font-bold text-center text-foreground p-6">
                They don't know how investors evaluate their company.
              </p>
            </ModernCard>

          <ModernCard className="shadow-xl border-2 border-destructive/30">
            <div className="space-y-4">
              <p className="text-lg font-bold text-foreground">
                The questions that separate fundable companies:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {confrontations.map((question, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <span className="text-destructive font-bold mt-0.5">•</span>
                    <span className="text-sm font-semibold text-foreground">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </ModernCard>

          <ModernCard className="shadow-xl border-2 border-success/30 bg-gradient-to-br from-success/5 to-transparent">
            <div className="space-y-4">
              <p className="text-lg font-bold text-foreground">
                What you get:
              </p>
              <div className="space-y-3">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                    <span className="text-success font-bold mt-0.5">✓</span>
                    <span className="text-sm font-semibold text-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </section>
  );
};
