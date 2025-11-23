import { ModernCard } from "../ModernCard";

export const WhyYouNeedThisSection = () => {
  const confrontations = [
    "Is your market actually VC-scale?",
    "Is your traction meaningful or noise?",
    "Do your economics survive first contact with reality?",
    "Are you defensible or just another feature?",
    "Does your narrative actually make sense?",
    "Are you even a venture-backable company?"
  ];

  const outcomes = [
    "Remove 90% of the blind spots that kill deals",
    "Answer investor objections before they destroy the meeting",
    "Sound like someone who understands the venture game",
    "Stop pitching with wishful thinking and start pitching with clarity",
    "Stand out from the thousands of founders repeating the same mistakes"
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-hero -z-10" />
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">
            Why You Can't Afford NOT to Have This Memo
          </h2>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          <ModernCard className="shadow-xl border-2">
            <div className="space-y-6">
              <p className="text-lg text-foreground leading-relaxed font-semibold">
                I've met thousands of founders across Europe.
                Different industries, different stages, different personalities — but they all fail at the exact same thing:
              </p>
              
              <p className="text-2xl font-serif font-bold text-primary text-center py-4">
                They have no idea how investors actually evaluate their company.
              </p>

              <p className="text-base text-foreground leading-relaxed">
                Every founder asks me the same questions.
                Every founder makes the same mistakes.
                And nobody will ever tell them why — because nobody wants to tell a founder their baby is ugly.
              </p>

              <div className="py-4 space-y-2">
                <p className="text-base text-muted-foreground">VCs won't say it.</p>
                <p className="text-base text-muted-foreground">Accelerators won't say it.</p>
                <p className="text-base text-muted-foreground">Mentors sugarcoat it.</p>
                <p className="text-lg font-bold text-foreground pt-2">But the truth is simple:</p>
              </div>

              <div className="p-6 rounded-lg gradient-accent border-2 border-primary/30 shadow-md">
                <p className="text-lg font-bold text-center text-foreground">
                  If your story doesn't fit how VCs think, you're done before you even start.
                </p>
              </div>
            </div>
          </ModernCard>

          <ModernCard className="shadow-xl border-2 border-destructive/30">
            <div className="space-y-6">
              <p className="text-lg font-bold text-foreground">
                An Investment Memorandum isn't a document.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                It's the filter VCs use to decide whether you're worth five minutes or file 13.
              </p>

              <div className="space-y-4 pt-4">
                <p className="font-bold text-foreground">
                  It forces you to confront the stuff founders avoid:
                </p>
                {confrontations.map((question, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <span className="text-destructive font-bold mt-0.5">•</span>
                    <span className="text-sm font-semibold text-foreground">{question}</span>
                  </div>
                ))}
              </div>

              <p className="text-base text-muted-foreground italic pt-4">
                Most founders never pressure-test their thinking at this level.
                Then they wonder why their pitch deck doesn't "hit."
              </p>
            </div>
          </ModernCard>

          <ModernCard className="shadow-xl border-2 border-success/30 bg-gradient-to-br from-success/5 to-transparent">
            <div className="space-y-6">
              <p className="text-lg font-bold text-foreground">
                When you build your IM, you're not just producing a document —
                you're rebuilding your startup the way a VC sees it.
              </p>

              <div className="space-y-4 pt-4">
                <p className="font-bold text-foreground">
                  If you use this memo as the base for your pitch, deck, and fundraising narrative, you will:
                </p>
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                    <span className="text-success font-bold mt-0.5">✓</span>
                    <span className="text-sm font-semibold text-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/40 shadow-2xl">
            <div className="text-center space-y-4 p-6">
              <h3 className="text-2xl font-serif font-bold text-foreground">
                Most founders never get honest, investor-level feedback.
              </h3>
              <p className="text-xl font-bold text-primary">
                This is the first time someone actually tells you the truth.
              </p>
            </div>
          </ModernCard>
        </div>
      </div>
    </section>
  );
};
