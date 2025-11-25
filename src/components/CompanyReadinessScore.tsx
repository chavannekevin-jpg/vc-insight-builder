import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface Section {
  name: string;
  completed: boolean;
}

interface CompanyReadinessScoreProps {
  sections: Section[];
  variant?: "compact" | "full";
}

export function CompanyReadinessScore({ sections, variant = "full" }: CompanyReadinessScoreProps) {
  const completedCount = sections.filter(s => s.completed).length;
  const totalCount = sections.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreLabel = () => {
    if (percentage >= 80) return "Ready";
    if (percentage >= 50) return "Getting There";
    return "Needs Work";
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Profile Readiness</span>
            <span className={`text-xs font-bold ${getScoreColor()}`}>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <Badge variant={percentage >= 80 ? "default" : "secondary"} className="text-xs">
          {getScoreLabel()}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Profile Readiness</h3>
          <p className="text-sm text-muted-foreground">
            Complete your profile to unlock full memo generation
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor()}`}>{percentage}%</div>
          <Badge variant={percentage >= 80 ? "default" : "secondary"}>
            {getScoreLabel()}
          </Badge>
        </div>
      </div>
      
      <Progress value={percentage} className="h-3" />
      
      <div className="grid grid-cols-2 gap-2">
        {sections.map((section) => (
          <div
            key={section.name}
            className="flex items-center gap-2 text-xs"
          >
            {section.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={section.completed ? "text-foreground" : "text-muted-foreground"}>
              {section.name}
            </span>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground italic">
        {completedCount} of {totalCount} sections completed
      </p>
    </div>
  );
}
