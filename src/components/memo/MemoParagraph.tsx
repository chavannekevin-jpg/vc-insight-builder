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
        emphasis === "high" && "text-foreground font-semibold text-lg bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border-l-4 border-primary",
        emphasis === "medium" && "text-foreground font-medium text-base pl-4 border-l-2 border-muted",
        emphasis === "normal" && "text-muted-foreground text-base"
      )}
    >
      {text}
    </div>
  );
};
