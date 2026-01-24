/**
 * StartupQuickViewModal - Large popup modal for viewing startup details from the dashboard
 * 
 * This replaces navigation to a new page when clicking on a startup from portfolio.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  X, ExternalLink, Users, Target, AlertTriangle, Lightbulb, TrendingUp,
  DollarSign, BarChart3, Building2, CheckCircle2, Share2, Loader2, UserPlus
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { SectionRecommendationModal } from "./SectionRecommendationModal";

interface Company {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  created_at: string;
}

interface StartupQuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
  acceleratorId?: string;
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

export function StartupQuickViewModal({
  open,
  onOpenChange,
  companyId,
  acceleratorId,
}: StartupQuickViewModalProps) {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({});
  const [vcQuickTake, setVcQuickTake] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSectionForRec, setSelectedSectionForRec] = useState<string | null>(null);
  const [sectionRecModalOpen, setSectionRecModalOpen] = useState(false);

  useEffect(() => {
    if (open && companyId) {
      fetchData();
    }
    return () => {
      if (!open) {
        setCompany(null);
        setSectionScores({});
        setVcQuickTake(null);
      }
    };
  }, [open, companyId]);

  const fetchData = async () => {
    if (!companyId) return;
    setIsLoading(true);
    
    try {
      const [companyResult, toolDataResult, memoResult] = await Promise.all([
        supabase.from("companies").select("*").eq("id", companyId).single(),
        supabase.from("memo_tool_data")
          .select("section_name, tool_name, ai_generated_data, user_overrides")
          .eq("company_id", companyId)
          .eq("tool_name", "sectionScore"),
        supabase.from("memos")
          .select("structured_content")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (companyResult.error) throw companyResult.error;
      setCompany(companyResult.data);

      const scores: Record<string, number> = {};
      (toolDataResult.data || []).forEach((tool: any) => {
        const data = { ...(tool.ai_generated_data || {}), ...(tool.user_overrides || {}) };
        if (data.score) {
          scores[tool.section_name] = data.score;
        }
      });
      setSectionScores(scores);

      const structuredContent = memoResult.data?.structured_content as any;
      if (structuredContent?.vcQuickTake) {
        setVcQuickTake(structuredContent.vcQuickTake);
      } else if (companyResult.data.vc_verdict_json) {
        setVcQuickTake(companyResult.data.vc_verdict_json);
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getItemText = (item: any): string => {
    if (typeof item === 'string') return item;
    return item?.teaserLine || item?.text || item?.vcQuote || '';
  };

  const handleViewFullDetails = () => {
    if (company) {
      onOpenChange(false);
      navigate(`/accelerator/startup/${company.id}${acceleratorId ? `?acceleratorId=${acceleratorId}` : ''}`);
    }
  };

  const handleSectionClick = (sectionName: string) => {
    setSelectedSectionForRec(sectionName);
    setSectionRecModalOpen(true);
  };

  const verdictText = vcQuickTake?.verdict ? getItemText(vcQuickTake.verdict) : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-white/[0.08]"
          style={{
            background: 'linear-gradient(135deg, hsl(330 20% 10%) 0%, hsl(330 20% 6%) 100%)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : company ? (
            <div className="relative">
              {/* Header */}
              <div className="sticky top-0 z-20 p-6 border-b border-white/[0.06] bg-card/80 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-white/[0.08]">
                      <span className="text-lg font-bold text-foreground">
                        {company.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {company.category || "Uncategorized"} • {company.stage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <div className={cn("text-3xl font-bold", getScoreColor(company.public_score))}>
                        {company.public_score || "—"}
                      </div>
                      <p className="text-xs text-muted-foreground">Fundability</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleViewFullDetails} className="gap-2 border-white/[0.08]">
                      <ExternalLink className="w-4 h-4" />
                      Full Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                {company.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <p className="text-muted-foreground leading-relaxed">{company.description}</p>
                  </motion.div>
                )}

                {/* VC Quick Take */}
                {vcQuickTake && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">VC Quick Take</h3>
                    </div>
                    {verdictText && <p className="text-foreground mb-4">{verdictText}</p>}
                    <div className="grid md:grid-cols-2 gap-4">
                      {vcQuickTake.strengths?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-success mb-2">Strengths</h4>
                          <ul className="space-y-1.5">
                            {vcQuickTake.strengths.slice(0, 3).map((s: any, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                <span>{getItemText(s)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {vcQuickTake.concerns?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-destructive mb-2">Concerns</h4>
                          <ul className="space-y-1.5">
                            {vcQuickTake.concerns.slice(0, 3).map((c: any, i: number) => (
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

                {/* Section Scores */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold text-foreground mb-4">Section Breakdown</h3>
                  <p className="text-xs text-muted-foreground mb-4">Click a section for improvement recommendations</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {sectionOrder.map((section) => {
                      const score = sectionScores[section];
                      const Icon = sectionIcons[section] || Target;
                      return (
                        <button
                          key={section}
                          onClick={() => handleSectionClick(section)}
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.04] transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground">{section}</span>
                              <span className={cn("font-bold", getScoreColor(score || null))}>
                                {score || "—"}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all", getScoreBg(score || null))}
                                style={{ width: `${score || 0}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3 pt-4 border-t border-white/[0.06]"
                >
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/accelerator/startup/${company.id}/preview${acceleratorId ? `?acceleratorId=${acceleratorId}` : ''}`);
                    }}
                    className="gap-2 border-white/[0.08]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Ecosystem
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/accelerator/startup/${company.id}/share`);
                    }}
                    className="gap-2 border-white/[0.08]"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/accelerator/startup/${company.id}/investors${acceleratorId ? `?acceleratorId=${acceleratorId}` : ''}`);
                    }}
                    className="gap-2 border-white/[0.08]"
                  >
                    <UserPlus className="w-4 h-4" />
                    Find Investors
                  </Button>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Startup not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Section Recommendation Modal */}
      {selectedSectionForRec && company && (
        <SectionRecommendationModal
          open={sectionRecModalOpen}
          onOpenChange={setSectionRecModalOpen}
          companyId={company.id}
          companyName={company.name}
          sectionName={selectedSectionForRec}
          sectionScore={sectionScores[selectedSectionForRec] || 50}
          sectionBenchmark={65}
          companyDescription={company.description || undefined}
        />
      )}
    </>
  );
}
