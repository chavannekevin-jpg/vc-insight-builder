import { motion } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, Target, TrendingUp, Users, Lightbulb,
  DollarSign, BarChart3, Building2, Clock, Zap, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StrengthConcernItem {
  text?: string;
  category?: string;
  teaserLine?: string;
  vcQuote?: string;
}

interface VCQuickTake {
  verdict?: string | StrengthConcernItem;
  strengths?: (string | StrengthConcernItem)[];
  concerns?: (string | StrengthConcernItem)[];
  readinessLevel?: string | StrengthConcernItem;
  rationale?: string;
  readinessRationale?: string;
}

interface StartupPreviewCardProps {
  companyName: string;
  description?: string | null;
  category?: string | null;
  stage: string;
  score: number | null;
  sectionScores: Record<string, number>;
  vcQuickTake?: VCQuickTake | null;
  createdAt: string;
}

const sectionIcons: Record<string, any> = {
  Team: Users,
  Market: Target,
  Problem: AlertTriangle,
  Solution: Lightbulb,
  Traction: TrendingUp,
  "Business Model": DollarSign,
  Competition: BarChart3,
  Vision: Building2,
};

const sectionOrder = ["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction", "Vision"];

export function StartupPreviewCard({
  companyName,
  description,
  category,
  stage,
  score,
  sectionScores,
  vcQuickTake,
  createdAt,
}: StartupPreviewCardProps) {
  const getScoreColor = (s: number | null) => {
    if (!s) return "text-muted-foreground";
    if (s >= 75) return "text-success";
    if (s >= 60) return "text-primary";
    if (s >= 45) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (s: number | null) => {
    if (!s) return "bg-muted";
    if (s >= 75) return "bg-success";
    if (s >= 60) return "bg-primary";
    if (s >= 45) return "bg-warning";
    return "bg-destructive";
  };

  const getReadinessConfig = (level?: string) => {
    const normalizedLevel = level?.toLowerCase();
    if (normalizedLevel === "high" || normalizedLevel === "ready" || normalizedLevel === "funding ready") {
      return { color: "text-success", bg: "bg-success/10", icon: CheckCircle2 };
    }
    if (normalizedLevel === "medium" || normalizedLevel === "getting there" || normalizedLevel === "almost ready") {
      return { color: "text-primary", bg: "bg-primary/10", icon: TrendingUp };
    }
    if (normalizedLevel === "low" || normalizedLevel === "needs work") {
      return { color: "text-warning", bg: "bg-warning/10", icon: Clock };
    }
    return { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle };
  };

  // Helper to extract string from strength/concern item
  const getItemText = (item: string | StrengthConcernItem): string => {
    if (typeof item === 'string') return item;
    return item.teaserLine || item.text || '';
  };

  const readinessLevelText = (() => {
    const v = vcQuickTake?.readinessLevel;
    if (!v) return undefined;
    return typeof v === "string" ? v : getItemText(v);
  })();

  const verdictText = (() => {
    const v = vcQuickTake?.verdict;
    if (!v) return "";
    return typeof v === "string" ? v : getItemText(v);
  })();

  const readinessConfig = getReadinessConfig(readinessLevelText);
  const ReadinessIcon = readinessConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.9) 0%, hsl(330 20% 8% / 0.8) 100%)',
        backdropFilter: 'blur(40px)',
      }}
    >
      <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
      
      {/* Header with Score */}
      <div className="relative p-6 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Investment Preview</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground truncate">{companyName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {category || "Uncategorized"} • {stage}
            </p>
          </div>
          
          <div className="text-center">
            <div className={cn("text-4xl font-bold", getScoreColor(score))}>
              {score || "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fundability</p>
          </div>
        </div>
        
        {description && (
          <p className="text-muted-foreground mt-4 line-clamp-2">{description}</p>
        )}
      </div>

      {/* VC Quick Take */}
      {vcQuickTake && (
        <div className="relative p-6 border-b border-white/[0.06] bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">VC Quick Take</h3>
              {readinessLevelText && (
                <div className={cn("inline-flex items-center gap-1.5 text-xs mt-0.5", readinessConfig.color)}>
                  <ReadinessIcon className="w-3 h-3" />
                  {readinessLevelText}
                </div>
              )}
            </div>
          </div>
          
          {verdictText && <p className="text-foreground mb-4 italic">"{verdictText}"</p>}

          <div className="grid md:grid-cols-2 gap-4">
            {vcQuickTake.strengths && vcQuickTake.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-success uppercase tracking-wider">Strengths</h4>
                <ul className="space-y-1.5">
                  {vcQuickTake.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{getItemText(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {vcQuickTake.concerns && vcQuickTake.concerns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider">Concerns</h4>
                <ul className="space-y-1.5">
                  {vcQuickTake.concerns.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{getItemText(c)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Scores Grid */}
      <div className="relative p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Section Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sectionOrder.map((section) => {
            const sectionScore = sectionScores[section];
            const Icon = sectionIcons[section] || Target;
            return (
              <div
                key={section}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{section}</span>
                </div>
                <div className={cn("text-xl font-bold", getScoreColor(sectionScore || null))}>
                  {sectionScore || "—"}
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className={cn("h-full rounded-full transition-all", getScoreBg(sectionScore || null))}
                    style={{ width: `${sectionScore || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
        <p className="text-xs text-muted-foreground">
          Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </motion.div>
  );
}
