import { ModernCard } from "../ModernCard";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const ProblemSolutionSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <ModernCard hover>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center shadow-md">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-2xl font-serif font-bold">The Problem</h2>
            </div>
            
            <p className="text-base text-foreground leading-relaxed font-semibold">
              You're getting ghosted. Here's why:
            </p>
            
            <ul className="space-y-4">
              {[
                "Your traction doesn't translate to VC-scale",
                "You focus on features, not market dynamics",
                "Your team isn't framed as competitive advantage"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-destructive mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-muted-foreground italic">
                VCs won't waste time teaching you. They'll just pass.
              </p>
            </div>
          </div>
        </ModernCard>

        <ModernCard hover>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-2xl font-serif font-bold">The Solution</h2>
            </div>
            
            <p className="text-base text-foreground leading-relaxed font-semibold">
              Active VCs. Our framework.
            </p>
            
            <ul className="space-y-4">
              {[
                "Memos VCs actually read",
                "Brutal feedback you're not hearing",
                "Fix your pitch before it fails"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-lg gradient-accent border-2 border-primary/30 shadow-md">
              <p className="text-sm font-bold text-foreground">
                → See your company the way they do, before they reject you
              </p>
            </div>
          </div>
        </ModernCard>
      </div>
    </section>
  );
};
