import { cn } from "@/lib/utils";

interface MemoParagraphProps {
  text: string;
  emphasis?: "high" | "medium" | "normal" | "hero" | "narrative" | "quote";
}

export const MemoParagraph = ({ text, emphasis = "normal" }: MemoParagraphProps) => {
  // Guard against objects being passed instead of strings
  const safeText = typeof text === 'string' ? text : String(text || '');
  
  return (
    <div
      className={cn(
        "leading-relaxed transition-all duration-200",
        (emphasis === "high" || emphasis === "hero") && "text-foreground font-semibold text-lg bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-xl border-l-4 border-primary shadow-sm",
        emphasis === "medium" && "text-foreground font-medium text-base pl-6 border-l-2 border-primary/50",
        emphasis === "quote" && "text-foreground/80 italic text-base pl-6 border-l-4 border-primary bg-muted/30 p-4 rounded-r-lg",
        (emphasis === "normal" || emphasis === "narrative") && "text-muted-foreground text-base"
      )}
    >
      {safeText}
    </div>
  );
};
