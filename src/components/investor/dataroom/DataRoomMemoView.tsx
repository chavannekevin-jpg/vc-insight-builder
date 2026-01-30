import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Shield,
  FileText,
  HelpCircle
} from "lucide-react";
import type { DataRoomMemo, DataRoomMemoSection } from "@/types/dataRoom";
import { cn } from "@/lib/utils";

interface DataRoomMemoViewProps {
  memo: DataRoomMemo;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  business_model: Target,
  market_opportunity: TrendingUp,
  competitive_position: Shield,
  financials: DollarSign,
  team: Users,
  traction: TrendingUp,
  risks: AlertTriangle,
  terms: FileText,
};

const SECTION_LABELS: Record<string, string> = {
  business_model: "Business Model",
  market_opportunity: "Market Opportunity",
  competitive_position: "Competitive Position",
  financials: "Financials",
  team: "Team",
  traction: "Traction & Metrics",
  risks: "Risks",
  terms: "Terms & Structure",
};

function AssessmentBadge({ assessment }: { assessment: DataRoomMemoSection['assessment'] }) {
  const config = {
    strong: { label: "Strong", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    moderate: { label: "Moderate", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    weak: { label: "Weak", className: "bg-red-500/10 text-red-600 border-red-500/20" },
    unclear: { label: "Unclear", className: "bg-muted text-muted-foreground" },
  };
  
  const c = config[assessment] || config.unclear;
  
  return (
    <Badge variant="outline" className={cn("text-xs", c.className)}>
      {c.label}
    </Badge>
  );
}

function MemoSection({ 
  sectionKey, 
  section 
}: { 
  sectionKey: string; 
  section: DataRoomMemoSection;
}) {
  const Icon = SECTION_ICONS[sectionKey] || FileText;
  const label = SECTION_LABELS[sectionKey] || section.title;

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">{label}</h3>
        </div>
        <AssessmentBadge assessment={section.assessment} />
      </div>

      {/* Analyst Notes */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {section.analyst_notes}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {section.strengths.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Strengths
            </p>
            <ul className="space-y-1">
              {section.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-500">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {section.concerns.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Concerns
            </p>
            <ul className="space-y-1">
              {section.concerns.map((c, i) => (
                <li key={i} className="text-sm text-muted-foreground pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-yellow-500">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Inconsistencies */}
      {section.inconsistencies.length > 0 && (
        <div className="mt-4 p-3 rounded-md bg-destructive/5 border border-destructive/20">
          <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-2">
            <XCircle className="w-3 h-3" />
            Inconsistencies Found
          </p>
          <ul className="space-y-1">
            {section.inconsistencies.map((inc, i) => (
              <li key={i} className="text-sm text-destructive/80">• {inc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DataRoomMemoView({ memo }: DataRoomMemoViewProps) {
  const sectionEntries = Object.entries(memo.sections) as [string, DataRoomMemoSection][];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header with Score */}
        <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold">{memo.company_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Due Diligence Memo • {new Date(memo.analysis_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{memo.overall_score}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          </div>
          
          <Badge 
            variant="secondary" 
            className={cn(
              "mb-4",
              memo.overall_score >= 70 ? "bg-green-500/10 text-green-600" :
              memo.overall_score >= 50 ? "bg-yellow-500/10 text-yellow-600" :
              "bg-red-500/10 text-red-600"
            )}
          >
            {memo.verdict}
          </Badge>

          <Separator className="my-4" />

          <div>
            <h3 className="text-sm font-medium mb-2">Executive Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {memo.executive_summary}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Investment Thesis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {memo.investment_thesis}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        {memo.key_metrics.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {memo.key_metrics.slice(0, 8).map((metric, i) => (
                <div key={i} className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-semibold mt-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground/70 truncate" title={metric.source_file}>
                    {metric.source_file}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {sectionEntries.map(([key, section]) => (
            <MemoSection key={key} sectionKey={key} section={section} />
          ))}
        </div>

        {/* Red Flags */}
        {memo.red_flags.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="font-semibold text-destructive flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5" />
              Red Flags ({memo.red_flags.length})
            </h3>
            <ul className="space-y-2">
              {memo.red_flags.map((flag, i) => (
                <li key={i} className="text-sm text-destructive/80 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-destructive">
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diligence Questions */}
        {memo.diligence_questions.length > 0 && (
          <div className="rounded-lg border bg-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              Suggested Diligence Questions
            </h3>
            <ul className="space-y-2">
              {memo.diligence_questions.map((q, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {i + 1}. {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Document Coverage */}
        {memo.document_coverage.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-5">
            <h3 className="text-sm font-medium mb-3">Document Coverage</h3>
            <div className="space-y-2">
              {memo.document_coverage.map((doc, i) => (
                <div key={i} className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.topics_covered.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-4">
          This analysis was generated by AI. Verify all information before making investment decisions.
        </p>
      </div>
    </ScrollArea>
  );
}
