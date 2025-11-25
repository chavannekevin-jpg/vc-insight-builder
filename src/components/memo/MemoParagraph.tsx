import { cn } from "@/lib/utils";

interface MemoParagraphProps {
  text: string;
  emphasis?: "high" | "medium" | "normal";
}

export const MemoParagraph = ({ text, emphasis = "normal" }: MemoParagraphProps) => {
  return (
    <div
      className={cn(
        "leading-relaxed transition-all duration-200",
        emphasis === "high" && "text-foreground font-semibold text-lg bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-xl border-l-4 border-primary shadow-sm",
        emphasis === "medium" && "text-foreground font-medium text-base pl-6 border-l-2 border-primary/50",
        emphasis === "normal" && "text-muted-foreground text-base"
      )}
    >
      {text}
    </div>
  );
};
