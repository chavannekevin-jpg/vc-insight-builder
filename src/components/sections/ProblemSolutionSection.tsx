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
              You're getting ghosted, rejected, and ignored. Here's why nobody's telling you:
            </p>
            
            <ul className="space-y-4">
              {[
                "You sound like a founder, not an investment",
                "Your pitch deck is a fantasy novel, not a thesis",
                "You're solving problems VCs don't care about",
                "You think 'passion' is a business model"
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
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-2xl font-serif">The Solution</h2>
            </div>
            
            <p className="text-base text-foreground leading-relaxed">
              I've written hundreds of investment memos. Now you get the blueprint.
            </p>
            
            <ul className="space-y-4">
              {[
                "Generate memos that VCs actually read",
                "Get the brutal feedback you're not hearing",
                "Learn what questions expose weak business models",
                "Stop wasting time on pitches that'll never work"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-success mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-lg gradient-accent border border-primary/20">
              <p className="text-sm font-medium text-foreground">
                → See your company the way they do, before they reject you
              </p>
            </div>
          </div>
        </ModernCard>
      </div>
    </section>
  );
};
