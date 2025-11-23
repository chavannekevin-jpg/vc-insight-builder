import { ModernCard } from "../ModernCard";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const ProblemSolutionSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <ModernCard hover>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl font-serif">The Problem</h2>
            </div>
            
            <p className="text-base text-foreground leading-relaxed">
              Most startups fail before they even become startups. Why?
            </p>
            
            <ul className="space-y-4">
              {[
                "They don't speak the VC language",
                "They build wrong investment models",
                "They over-complexify their product",
                "They get rejected without clarity"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-muted-foreground italic">
                Founders don't understand how VCs actually evaluate their companies.
              </p>
            </div>
          </div>
        </ModernCard>

        <ModernCard hover>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-2xl font-serif">The Solution</h2>
            </div>
            
            <p className="text-base text-foreground leading-relaxed">
              A tool that translates 10+ years of VC cognitive experience into actionable outputs.
            </p>
            
            <ul className="space-y-4">
              {[
                "Generate investor-grade memorandums",
                "Get model-improving feedback",
                "Receive diagnostic questions",
                "Align with real VC expectations"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-lg gradient-accent border border-primary/20">
              <p className="text-sm font-medium text-foreground">
                → View your company through an investor lens
              </p>
            </div>
          </div>
        </ModernCard>
      </div>
    </section>
  );
};
