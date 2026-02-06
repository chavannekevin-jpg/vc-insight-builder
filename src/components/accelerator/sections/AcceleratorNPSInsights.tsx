import { motion } from "framer-motion";
import { BarChart3, Users, TrendingUp, MessageSquare, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAcceleratorNpsResponses } from "@/hooks/useWorkshopNps";
import { toast } from "@/hooks/use-toast";

interface AcceleratorNPSInsightsProps {
  acceleratorId: string | null;
}

const NPS_QUESTIONS = [
  { key: "recommend_lecture", label: "Recommend Lecture" },
  { key: "investor_understanding", label: "Investor Understanding" },
  { key: "strengths_weaknesses", label: "Self-Awareness" },
  { key: "actionable_confidence", label: "Actionable Confidence" },
  { key: "mini_memo_usefulness", label: "Mini Memo Usefulness" },
  { key: "mentoring_usefulness", label: "Mentoring Usefulness" },
] as const;

type QuestionKey = typeof NPS_QUESTIONS[number]["key"];

function getScoreColor(score: number): string {
  if (score >= 86) return "bg-primary";
  if (score >= 71) return "bg-success";
  if (score >= 51) return "bg-warning";
  if (score >= 31) return "bg-orange-500";
  return "bg-destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 86) return "Excellent";
  if (score >= 71) return "Good";
  if (score >= 51) return "Average";
  if (score >= 31) return "Below Average";
  return "Poor";
}

// Premium glass card component
const GlassCard = ({ 
  children, 
  className = "",
  delay = 0,
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={cn("relative group", className)}
  >
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/15 via-secondary/15 to-primary/15 rounded-3xl opacity-40" />
    
    <div className="relative bg-card/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/8 to-transparent rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-secondary/8 to-transparent rounded-br-3xl" />
      
      <div className="relative z-10">{children}</div>
    </div>
  </motion.div>
);

export function AcceleratorNPSInsights({ acceleratorId }: AcceleratorNPSInsightsProps) {
  const { data: responses = [], isLoading } = useAcceleratorNpsResponses(acceleratorId);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/auth?redirect=/hub?openNps=true`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with workshop participants to collect their feedback.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate aggregated stats
  const totalResponses = responses.length;
  const submittedResponses = responses.filter((r: any) => r.submitted_at).length;
  
  const calculateAverage = (key: QuestionKey): number => {
    const validScores = responses
      .map((r: any) => r[key])
      .filter((s: any): s is number => typeof s === "number");
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length);
  };

  const averages = NPS_QUESTIONS.map(q => ({
    ...q,
    average: calculateAverage(q.key),
  }));

  const overallAverage = averages.length > 0
    ? Math.round(averages.reduce((a, b) => a + b.average, 0) / averages.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Link Generator */}
      <GlassCard delay={0.1}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">NPS Survey Link</h3>
              <p className="text-sm text-muted-foreground">Share this link with participants</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-muted/30 border border-border/50 font-mono text-sm text-muted-foreground overflow-x-auto">
              {window.location.origin}/auth?redirect=/hub?openNps=true
            </div>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Responses", value: totalResponses, icon: Users },
          { label: "Submitted", value: submittedResponses, icon: MessageSquare },
          { label: "Response Rate", value: totalResponses > 0 ? `${Math.round((submittedResponses / totalResponses) * 100)}%` : "—", icon: TrendingUp },
          { label: "Overall Score", value: overallAverage || "—", icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl opacity-30" />
            
            <div className="relative bg-card/40 backdrop-blur-2xl rounded-2xl p-5 border border-border/50 overflow-hidden">
              <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground/70">{stat.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {totalResponses === 0 ? (
        <GlassCard delay={0.3}>
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Responses Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Share the NPS survey link above with your workshop participants to start collecting feedback.
            </p>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Score Distribution */}
          <GlassCard delay={0.25}>
            <div className="p-6">
              <h3 className="font-semibold text-foreground mb-5">Score Distribution by Question</h3>
              <div className="space-y-4">
                {averages.map((q, i) => (
                  <motion.div 
                    key={q.key} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-40 text-sm text-muted-foreground/70 truncate">{q.label}</div>
                    <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${q.average}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                        className={cn("h-full rounded-lg", getScoreColor(q.average))}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground/80">
                        {getScoreLabel(q.average)}
                      </span>
                    </div>
                    <div className="w-12 text-right text-sm font-bold text-foreground">{q.average}%</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Individual Responses */}
          <GlassCard delay={0.35}>
            <div className="p-6">
              <h3 className="font-semibold text-foreground mb-5">Individual Responses</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {responses.map((response: any, idx: number) => {
                  const companyName = response.companies?.name || "Unknown Company";
                  const avgScore = Math.round(
                    [
                      response.recommend_lecture,
                      response.investor_understanding,
                      response.strengths_weaknesses,
                      response.actionable_confidence,
                      response.mini_memo_usefulness,
                      response.mentoring_usefulness,
                    ].filter((s): s is number => typeof s === "number")
                      .reduce((a, b) => a + b, 0) / 6
                  );
                  
                  return (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.03 }}
                      className="p-4 rounded-xl bg-muted/20 border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{companyName}</span>
                        <span className={cn("text-sm font-bold", 
                          avgScore >= 71 ? "text-success" : 
                          avgScore >= 51 ? "text-warning" : "text-destructive"
                        )}>
                          {avgScore}% avg
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-2 mb-2">
                        {NPS_QUESTIONS.map(q => (
                          <div key={q.key} className="text-center">
                            <span className="text-[10px] text-muted-foreground/60 block truncate">
                              {q.label.split(" ")[0]}
                            </span>
                            <span className={cn(
                              "text-xs font-bold",
                              getScoreColor(response[q.key] || 0).replace("bg-", "text-")
                            )}>
                              {response[q.key] ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {response.additional_feedback && (
                        <p className="text-sm text-muted-foreground italic border-t border-border/30 pt-2 mt-2">
                          "{response.additional_feedback}"
                        </p>
                      )}
                      
                      {response.submitted_at && (
                        <span className="text-xs text-muted-foreground/50 block mt-2">
                          Submitted {new Date(response.submitted_at).toLocaleDateString()}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
