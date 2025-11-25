import { CheckCircle2 } from "lucide-react";

interface MemoKeyPointsProps {
  points: string[];
}

export const MemoKeyPoints = ({ points }: MemoKeyPointsProps) => {
  return (
    <div className="space-y-3 mt-4">
      {points.map((point, index) => (
        <div key={index} className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-foreground leading-relaxed">{point}</p>
        </div>
      ))}
    </div>
  );
};
