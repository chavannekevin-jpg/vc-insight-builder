import { Check, X } from "lucide-react";

interface GoodVsBadExampleProps {
  badExample: string;
  goodExample: string;
  badLabel?: string;
  goodLabel?: string;
}

export const GoodVsBadExample = ({
  badExample,
  goodExample,
  badLabel = "Most founders say...",
  goodLabel = "Top-tier founders say..."
}: GoodVsBadExampleProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Bad Example */}
      <div className="relative rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/20">
            <X className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-sm font-medium text-destructive">{badLabel}</span>
        </div>
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          "{badExample}"
        </p>
      </div>

      {/* Good Example */}
      <div className="relative rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-sm font-medium text-emerald-500">{goodLabel}</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          "{goodExample}"
        </p>
      </div>
    </div>
  );
};
