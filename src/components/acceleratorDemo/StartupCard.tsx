import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { DemoStartup } from "@/data/acceleratorDemo/demoStartups";

interface StartupCardProps {
  startup: DemoStartup;
}

const statusConfig = {
  "demo-ready": {
    label: "Demo Ready",
    icon: CheckCircle2,
    bgColor: "bg-success/10",
    borderColor: "border-success/40",
    textColor: "text-success",
  },
  "on-track": {
    label: "On Track",
    icon: TrendingUp,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    textColor: "text-primary",
  },
  "needs-work": {
    label: "Needs Work",
    icon: Clock,
    bgColor: "bg-warning/10",
    borderColor: "border-warning/40",
    textColor: "text-warning",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/40",
    textColor: "text-destructive",
  },
};

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-destructive";
};

const getProgressIcon = (progress: number) => {
  if (progress > 2) return <TrendingUp className="w-3 h-3 text-success" />;
  if (progress < -2) return <TrendingDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export const StartupCard = ({ startup }: StartupCardProps) => {
  const navigate = useNavigate();
  const status = statusConfig[startup.status];
  const StatusIcon = status.icon;

  const handleMemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/accelerator-demo/startup/${startup.id}/memo`);
  };

  return (
    <div
      onClick={() => navigate(`/accelerator-demo/startup/${startup.id}`)}
      className={cn(
        "group bg-card border-2 rounded-xl p-5 cursor-pointer transition-all duration-300",
        "hover:shadow-lg hover:border-primary/50 hover:-translate-y-1",
        status.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate text-foreground">{startup.name}</h3>
            {getProgressIcon(startup.weeklyProgress)}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{startup.tagline}</p>
        </div>
        <div className={cn("text-2xl font-bold", getScoreColor(startup.fundabilityScore))}>
          {startup.fundabilityScore}
        </div>
      </div>

      {/* Status Badge & Memo Button Row */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.bgColor, status.textColor)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
        
        {/* Prominent Memo Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleMemoClick}
          className="h-7 px-3 text-xs font-medium border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <FileText className="w-3 h-3 mr-1.5" />
          View Memo
        </Button>
      </div>

      {/* Section Scores Mini Bar */}
      <div className="grid grid-cols-4 gap-1 mb-4">
        {Object.entries(startup.sectionScores).slice(0, 4).map(([section, score]) => (
          <div key={section} className="flex flex-col items-center">
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  score >= 75 ? "bg-success" : score >= 60 ? "bg-primary" : score >= 45 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 capitalize">
              {section.slice(0, 4)}
            </span>
          </div>
        ))}
      </div>

      {/* Top Concern */}
      {startup.topConcerns[0] && (
        <div className="text-xs text-muted-foreground mb-3 p-2 bg-destructive/5 rounded-lg border border-destructive/10">
          <span className="text-destructive">⚠</span> {startup.topConcerns[0]}
        </div>
      )}

      {/* Founders */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {startup.founders.slice(0, 2).map((founder, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-foreground"
              >
                {founder.name.split(" ").map(n => n[0]).join("")}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {startup.founders.length} founder{startup.founders.length > 1 ? "s" : ""}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
};
