import { Win98Card } from "../Win98Card";

export const ProblemSolutionSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <Win98Card title="The_Problem.exe" accentColor="pink">
          <div className="space-y-6">
            <div>
              <span className="font-pixel text-xs text-destructive mb-3 block">⚠ ERROR</span>
            </div>
            <p className="font-sans text-base leading-relaxed">
              Most startups fail before they even become startups. Why?
            </p>
            <ul className="space-y-3 font-sans text-sm leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">✗</span>
                <span>They don't speak the VC language</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">✗</span>
                <span>They build wrong investment models</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">✗</span>
                <span>They over-complexify their product</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">✗</span>
                <span>They get rejected without clarity</span>
              </li>
            </ul>
            <div className="win98-inset p-3 bg-muted/50 mt-4">
              <p className="text-muted-foreground font-sans text-xs italic">
                Founders don't understand how VCs actually evaluate their companies.
              </p>
            </div>
          </div>
        </Win98Card>

        <Win98Card title="The_Solution.exe" accentColor="green">
          <div className="space-y-6">
            <div>
              <span className="font-pixel text-xs text-primary mb-3 block">✓ SUCCESS</span>
            </div>
            <p className="font-sans text-base leading-relaxed">
              A tool that translates 10+ years of VC cognitive experience into actionable outputs.
            </p>
            <ul className="space-y-3 font-sans text-sm leading-relaxed">
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
            <div className="win98-inset p-3 bg-win98-teal/10 mt-4">
              <p className="font-sans text-xs font-semibold">
                → View your company through an investor lens
              </p>
            </div>
          </div>
        </Win98Card>
      </div>
    </section>
  );
};
