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
  HelpCircle,
  Zap,
  ChevronRight
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
    strong: { label: "Strong", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    moderate: { label: "Moderate", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    weak: { label: "Weak", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    unclear: { label: "Unclear", className: "bg-muted text-muted-foreground border-border" },
  };
  
  const c = config[assessment] || config.unclear;
  
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", c.className)}>
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
    <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 transition-all hover:shadow-md hover:border-border/50">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">{label}</h3>
        </div>
        <AssessmentBadge assessment={section.assessment} />
      </div>

      {/* Analyst Notes */}
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {section.analyst_notes}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        {section.strengths.length > 0 && (
          <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Strengths
            </p>
            <ul className="space-y-2">
              {section.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-emerald-500 mt-1 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {section.concerns.length > 0 && (
          <div className="space-y-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              Concerns
            </p>
            <ul className="space-y-2">
              {section.concerns.map((c, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-amber-500 mt-1 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Inconsistencies */}
      {section.inconsistencies.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 mb-3 uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" />
            Inconsistencies Found
          </p>
          <ul className="space-y-2">
            {section.inconsistencies.map((inc, i) => (
              <li key={i} className="text-sm text-rose-700/80 flex items-start gap-2">
                <span className="text-rose-500">•</span>
                {inc}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DataRoomMemoView({ memo }: DataRoomMemoViewProps) {
  const sectionEntries = Object.entries(memo.sections) as [string, DataRoomMemoSection][];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "from-emerald-500/20 to-emerald-500/5";
    if (score >= 50) return "from-amber-500/20 to-amber-500/5";
    return "from-rose-500/20 to-rose-500/5";
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header with Score */}
        <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 shadow-lg">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight">{memo.company_name}</h2>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Due Diligence Memo • {new Date(memo.analysis_date).toLocaleDateString()}
              </p>
            </div>
            <div className={cn(
              "text-center p-4 rounded-2xl bg-gradient-to-br",
              getScoreBg(memo.overall_score)
            )}>
              <div className={cn("text-4xl font-bold", getScoreColor(memo.overall_score))}>
                {memo.overall_score}
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1">/ 100</div>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "mb-6 px-4 py-1.5 text-sm font-medium",
              memo.overall_score >= 70 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
              memo.overall_score >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
              "bg-rose-500/10 text-rose-600 border-rose-500/30"
            )}
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            {memo.verdict}
          </Badge>

          <Separator className="my-6 bg-border/30" />

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Executive Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {memo.executive_summary}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Investment Thesis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {memo.investment_thesis}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {memo.key_metrics.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Key Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {memo.key_metrics.slice(0, 8).map((metric, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors"
                >
                  <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                  <p className="text-xl font-bold mt-1 text-foreground">{metric.value}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate mt-1" title={metric.source_file}>
                    📄 {metric.source_file}
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
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">
            <h3 className="font-semibold text-lg text-rose-600 flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5" />
              Red Flags ({memo.red_flags.length})
            </h3>
            <ul className="space-y-3">
              {memo.red_flags.map((flag, i) => (
                <li key={i} className="text-sm text-rose-700/80 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-rose-600 text-xs font-bold">{i + 1}</span>
                  </div>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diligence Questions */}
        {memo.diligence_questions.length > 0 && (
          <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              Suggested Diligence Questions
            </h3>
            <ul className="space-y-3">
              {memo.diligence_questions.map((q, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">{i + 1}</span>
                  </div>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Document Coverage */}
        {memo.document_coverage.length > 0 && (
          <div className="rounded-2xl border border-border/30 bg-muted/20 backdrop-blur-sm p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Document Coverage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memo.document_coverage.map((doc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/50">
                  <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {doc.topics_covered.join(" • ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-4 pb-2">
          This analysis was generated by AI. Verify all information before making investment decisions.
        </p>
      </div>
    </ScrollArea>
  );
}
