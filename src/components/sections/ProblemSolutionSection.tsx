export const ProblemSolutionSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="retro-card p-8">
          <div className="space-y-6">
            <div>
              <span className="font-pixel text-xs text-destructive mb-3 block">ERROR</span>
              <h2 className="font-pixel text-lg mb-4">The Problem</h2>
            </div>
            <p className="font-sans text-lg leading-relaxed">
              Most startups fail before they even become startups. Why?
            </p>
            <ul className="space-y-3 font-sans text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>They don't speak the VC language</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>They build wrong investment models</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>They over-complexify their product</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>They get rejected without clarity</span>
              </li>
            </ul>
            <p className="text-muted-foreground font-sans text-sm italic pt-2">
              Founders don't understand how VCs actually evaluate their companies.
            </p>
          </div>
        </div>

        <div className="retro-card p-8">
          <div className="space-y-6">
            <div>
              <span className="font-pixel text-xs text-primary mb-3 block">SUCCESS</span>
              <h2 className="font-pixel text-lg mb-4">The Solution</h2>
            </div>
            <p className="font-sans text-lg leading-relaxed">
              A tool that translates 10+ years of VC cognitive experience into actionable outputs.
            </p>
            <ul className="space-y-3 font-sans text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Generate investor-grade memorandums</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Get model-improving feedback</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Receive diagnostic questions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Align with real VC expectations</span>
              </li>
            </ul>
            <p className="text-accent font-sans text-sm font-semibold pt-2">
              → View your company through an investor lens
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
