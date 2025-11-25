import { cn } from "@/lib/utils";

interface MemoParagraphProps {
  text: string;
  emphasis?: "high" | "medium" | "normal";
}

export const MemoParagraph = ({ text, emphasis = "normal" }: MemoParagraphProps) => {
  return (
    <p
      className={cn(
        "leading-relaxed",
        emphasis === "high" && "text-foreground font-medium text-lg",
        emphasis === "medium" && "text-foreground",
        emphasis === "normal" && "text-muted-foreground"
      )}
    >
      {text}
    </p>
  );
};
