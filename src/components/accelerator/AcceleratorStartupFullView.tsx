import { motion } from "framer-motion";
import {
  Target, TrendingUp, Users, Lightbulb, DollarSign, 
  BarChart3, Building2, AlertTriangle, CheckCircle2, 
  Zap, FileText, Brain, Layers, Award, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemoContentData, findSectionTools } from "@/hooks/useMemoContent";
import { MemoAnchoredAssumptions } from "@/components/memo/MemoAnchoredAssumptions";
import { MemoParagraph } from "@/types/memo";
import { ARCClassificationCard } from "@/components/memo/ARCClassificationCard";
import { MemoStructuredSection, EnhancedSectionTools } from "@/types/memo";

interface AcceleratorStartupFullViewProps {
  companyName: string;
  companyId: string;
  category?: string | null;
  stage: string;
  score: number | null;
  createdAt: string;
  memoData: MemoContentData;
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

type VCQuickTakeItem =
  | string
  | { text?: string; category?: string; teaserLine?: string; vcQuote?: string };

const getItemText = (item: VCQuickTakeItem): string => {
  if (typeof item === "string") return item;
  return item.teaserLine || item.text || item.vcQuote || "";
};

export function AcceleratorStartupFullView({
  companyName,
  companyId,
  category,
  stage,
  score,
  createdAt,
  memoData,
}: AcceleratorStartupFullViewProps) {
  const { 
    memoContent, 
    sectionTools, 
    anchoredAssumptions, 
    holisticVerdicts,
    arcClassification,
    companyInsightContext 
  } = memoData;

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

  // Extract section scores from tools
  const sectionScores: Record<string, number> = {};
  Object.entries(sectionTools).forEach(([section, tools]) => {
    const scoreData = (tools as any)?.sectionScore;
    if (scoreData?.score) {
      sectionScores[section] = scoreData.score;
    }
  });

  // Get vcQuickTake from memo content
  const vcQuickTake = memoContent?.vcQuickTake;

  // Normalize verdict text
  const verdictText = (() => {
    const v = vcQuickTake?.verdict;
    if (!v) return "";
    return typeof v === "string" ? v : getItemText(v as VCQuickTakeItem);
  })();

  const readinessLevelText = (() => {
    const v = vcQuickTake?.readinessLevel;
    if (!v) return "";
    return typeof v === "string" ? v : getItemText(v as VCQuickTakeItem);
  })();

  return (
    <div className="space-y-8">
      {/* Hero Section with Score and Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.3) 100%)',
        }}
      >
        <div className="absolute inset-0 rounded-2xl border border-border/50" />
        
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Full Investment Analysis</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{companyName}</h1>
              <p className="text-muted-foreground mt-1">{category || "Uncategorized"} • {stage}</p>
              
              {readinessLevelText && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {readinessLevelText}
                </div>
              )}
            </div>
            
            {/* Score Display */}
            <div className="text-center">
              <div className={cn("text-6xl font-bold", getScoreColor(score))}>
                {score || "—"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Fundability Score</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2 w-24 mx-auto">
                <div
                  className={cn("h-full rounded-full transition-all", getScoreBg(score))}
                  style={{ width: `${score || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Anchored Assumptions - Key Metrics */}
      {anchoredAssumptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MemoAnchoredAssumptions 
            assumptions={anchoredAssumptions}
            companyName={companyName}
          />
        </motion.div>
      )}

      {/* Score Grid + VC Quick Take */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Section Scores Grid */}
        {Object.keys(sectionScores).length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Section Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sectionOrder.map((section) => {
                const sScore = sectionScores[section];
                const Icon = sectionIcons[section] || Target;
                return (
                  <div key={section} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{section}</span>
                    </div>
                    <div className={cn("text-xl font-bold", getScoreColor(sScore || null))}>
                      {sScore || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VC Quick Take */}
        {vcQuickTake && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              VC Quick Take
            </h3>
            
            {verdictText && (
              <p className="text-foreground mb-4 italic border-l-2 border-primary/30 pl-3">
                "{verdictText}"
              </p>
            )}

            <div className="grid gap-4">
              {vcQuickTake.strengths && vcQuickTake.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-2">Strengths</h4>
                  <ul className="space-y-1.5">
                    {(vcQuickTake.strengths as VCQuickTakeItem[]).slice(0, 4).map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{getItemText(s)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {vcQuickTake.concerns && vcQuickTake.concerns.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">Concerns</h4>
                  <ul className="space-y-1.5">
                    {(vcQuickTake.concerns as VCQuickTakeItem[]).slice(0, 4).map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <span>{getItemText(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ARC Classification */}
      {arcClassification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ARCClassificationCard classification={arcClassification} companyName={companyName} />
        </motion.div>
      )}

      {/* Section-by-Section Analysis */}
      {memoContent?.sections && memoContent.sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Detailed Section Analysis
          </h2>
          
          {memoContent.sections.map((section: MemoStructuredSection, index: number) => {
            const tools = findSectionTools(section.title, sectionTools);
            const sectionScore = (tools as any)?.sectionScore;
            const holisticVerdict = holisticVerdicts[section.title];
            const Icon = sectionIcons[section.title] || Target;
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Section Header */}
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      {sectionScore?.score && (
                        <span className={cn("text-sm font-medium", getScoreColor(sectionScore.score))}>
                          Score: {sectionScore.score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {sectionScore?.score && (
                    <div className="flex items-center gap-2">
                      <div className={cn("text-2xl font-bold", getScoreColor(sectionScore.score))}>
                        {sectionScore.score}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Section Content */}
                <div className="p-5 space-y-4">
                  {/* Holistic Verdict */}
                  {holisticVerdict?.verdict && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-foreground italic">
                        "{holisticVerdict.verdict}"
                      </p>
                      {holisticVerdict.stageContext && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Stage Context: {holisticVerdict.stageContext}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Narrative Content */}
                  {section.narrative?.paragraphs && section.narrative.paragraphs.length > 0 && (
                    <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
                      {section.narrative.paragraphs.map((para: MemoParagraph, pIdx: number) => (
                        <p key={pIdx} className={cn(
                          "text-sm",
                          (para.emphasis === "high" || para.emphasis === "hero") && "font-semibold text-foreground",
                          para.emphasis === "quote" && "italic border-l-2 border-primary/30 pl-3"
                        )}>
                          {typeof para.text === 'string' ? para.text : ''}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {/* Section Score Details */}
                  {sectionScore && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {sectionScore.rationale && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Score Rationale</h4>
                          <p className="text-sm text-foreground">{sectionScore.rationale}</p>
                        </div>
                      )}
                      {sectionScore.whatWouldChange && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">What Would Improve Score</h4>
                          <p className="text-sm text-foreground">{sectionScore.whatWouldChange}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* VC Investment Logic if available */}
                  {(tools as any)?.vcInvestmentLogic && (
                    <div className="border-t border-border pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-secondary" />
                        VC Investment Logic
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-2">
                        {(tools as any).vcInvestmentLogic.investmentDecision && (
                          <p><strong>Decision:</strong> {(tools as any).vcInvestmentLogic.investmentDecision}</p>
                        )}
                        {(tools as any).vcInvestmentLogic.reasoning && (
                          <p><strong>Reasoning:</strong> {(tools as any).vcInvestmentLogic.reasoning}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Section Scores Grid (Fallback if no sections) */}
      {(!memoContent?.sections || memoContent.sections.length === 0) && Object.keys(sectionScores).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Section Scores
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sectionOrder.map((section) => {
              const sectionScore = sectionScores[section];
              const Icon = sectionIcons[section] || Target;
              return (
                <div
                  key={section}
                  className="p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{section}</span>
                  </div>
                  <div className={cn("text-2xl font-bold", getScoreColor(sectionScore || null))}>
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
        </motion.div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        <p className="flex items-center justify-center gap-2">
          <Clock className="w-3 h-3" />
          Analysis generated for {companyName} • Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
