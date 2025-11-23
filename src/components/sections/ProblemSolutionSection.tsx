import { Win98Window } from "../Win98Window";

export const ProblemSolutionSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <Win98Window title="The Problem">
          <div className="space-y-4 font-retro text-xl">
            <p className="font-bold text-destructive">ERROR: STARTUP NOT FOUND</p>
            <p>
              Most startups fail before they even become startups. Why?
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>They don't speak the VC language</li>
              <li>They build wrong investment models</li>
              <li>They over-complexify their product</li>
              <li>They get rejected without clarity</li>
            </ul>
            <p className="text-muted-foreground text-lg">
              Founders don't understand how VCs actually evaluate their companies.
            </p>
          </div>
        </Win98Window>

        <Win98Window title="The Solution">
          <div className="space-y-4 font-retro text-xl">
            <p className="font-bold text-primary">SYSTEM READY ✓</p>
            <p>
              A tool that translates 10+ years of VC cognitive experience into actionable outputs.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Generate investor-grade memorandums</li>
              <li>Get model-improving feedback</li>
              <li>Receive diagnostic questions</li>
              <li>Align with real VC expectations</li>
            </ul>
            <p className="text-accent font-bold text-lg">
              → View your company through an investor lens
            </p>
          </div>
        </Win98Window>
      </div>
    </section>
  );
};
