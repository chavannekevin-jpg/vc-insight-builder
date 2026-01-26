import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ValidationReport } from "@/hooks/useWorkshopData";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkshopValidationReportProps {
  report: ValidationReport;
}

function getGradeStyles(grade: string): { 
  bgColor: string; 
  textColor: string; 
  borderColor: string;
  icon: React.ReactNode;
} {
  switch (grade) {
    case 'A':
      return { 
        bgColor: 'bg-green-500/10', 
        textColor: 'text-green-600', 
        borderColor: 'border-green-500/20',
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
      };
    case 'B':
      return { 
        bgColor: 'bg-blue-500/10', 
        textColor: 'text-blue-600', 
        borderColor: 'border-blue-500/20',
        icon: <TrendingUp className="w-5 h-5 text-blue-600" />
      };
    case 'C':
      return { 
        bgColor: 'bg-yellow-500/10', 
        textColor: 'text-yellow-600', 
        borderColor: 'border-yellow-500/20',
        icon: <Target className="w-5 h-5 text-yellow-600" />
      };
    default:
      return { 
        bgColor: 'bg-red-500/10', 
        textColor: 'text-red-600', 
        borderColor: 'border-red-500/20',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      };
  }
}

function getDimensionColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-blue-500";
  if (score >= 30) return "bg-yellow-500";
  return "bg-red-400";
}

export function WorkshopValidationReport({ report }: WorkshopValidationReportProps) {
  const gradeStyles = getGradeStyles(report.grade.overall);

  return (
    <div className="space-y-6">
      {/* Overall Grade Card */}
      <Card className={cn(
        "border-2",
        gradeStyles.borderColor,
        gradeStyles.bgColor
      )}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-background border-2",
              gradeStyles.borderColor
            )}>
              <span className={cn("text-3xl font-bold", gradeStyles.textColor)}>
                {report.grade.overall}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {gradeStyles.icon}
                <h3 className={cn("text-lg font-semibold", gradeStyles.textColor)}>
                  {report.grade.label}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {report.grade.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Dimensions */}
      {report.dimensions && report.dimensions.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Validation Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.dimensions.map((dim, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dim.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {dim.score}/100 • {dim.label}
                  </Badge>
                </div>
                <Progress 
                  value={dim.score} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">{dim.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Discovery Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Gaps */}
        {report.gaps && report.gaps.length > 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-4 h-4" />
                Discovery Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-500 mt-0.5">-</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps Roadmap */}
      {report.nextSteps && report.nextSteps.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <ArrowRight className="w-4 h-4" />
              Validation Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {report.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
