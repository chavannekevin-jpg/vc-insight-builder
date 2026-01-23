import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompanyProfileCardProps {
  name: string;
  stage: string;
  sector?: string;
  completedQuestions: number;
  totalQuestions: number;
}

export const CompanyProfileCard = memo(({
  name,
  stage,
  sector,
  completedQuestions,
  totalQuestions
}: CompanyProfileCardProps) => {
  const navigate = useNavigate();
  const percentage = useMemo(
    () => Math.round((completedQuestions / totalQuestions) * 100),
    [completedQuestions, totalQuestions]
  );

  return (
    <div className="bg-card/60 backdrop-blur-2xl border border-primary/20 rounded-2xl p-6 space-y-4 shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.15)] hover:shadow-[0_25px_60px_-12px_hsl(var(--primary)/0.2)] transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Company Profile</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-muted/40 backdrop-blur-sm">
                {stage}
              </Badge>
              {sector && (
                <Badge variant="outline" className="text-xs border-border/40">
                  {sector}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/company-profile")}
          className="gap-2 rounded-xl border-border/40 hover:bg-muted/50"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="pt-4 border-t border-border/30 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Profile Completion</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="h-2 bg-muted/40 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {completedQuestions} of {totalQuestions} questions answered
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/company-profile")}
        className="w-full gap-2 text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
      >
        <TrendingUp className="w-4 h-4" />
        Complete Your Profile
      </Button>
    </div>
  );
});

CompanyProfileCard.displayName = "CompanyProfileCard";