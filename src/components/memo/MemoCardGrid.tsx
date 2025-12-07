import { MemoFactCard } from "./MemoFactCard";
import { MemoParagraph } from "@/types/memo";

interface MemoCardGridProps {
  paragraphs: MemoParagraph[];
}

export const MemoCardGrid = ({ paragraphs }: MemoCardGridProps) => {
  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paragraphs.map((para, index) => (
        <MemoFactCard 
          key={index} 
          text={para.text} 
          title={(para as any).title}
          category={(para as any).category}
        />
      ))}
    </div>
  );
};
