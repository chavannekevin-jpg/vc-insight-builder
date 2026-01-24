/**
 * AcceleratorShareablePreview - Public shareable page for investors
 * 
 * This page can be shared publicly with investors to give them a quick
 * introduction to the startup before they dive deeper into the case.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Building2, Target, TrendingUp, Users, Lightbulb,
  DollarSign, BarChart3, CheckCircle2, AlertTriangle, Share2, Copy,
  Globe, Sparkles, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  stage: string;
  public_score: number | null;
  created_at: string;
}

interface VCQuickTake {
  verdict?: any;
  strengths?: any[];
  concerns?: any[];
  readinessLevel?: any;
}

interface SectionScore {
  score: number;
  benchmark: number;
}

interface MemoContent {
  traction?: string;
  businessModel?: string;
  investmentThesis?: string;
  sections?: any[];
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

export default function AcceleratorShareablePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [vcQuickTake, setVcQuickTake] = useState<VCQuickTake | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({});
  const [memoContent, setMemoContent] = useState<MemoContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Direct query - the views allow anon access but fall back to regular tables
        let companyData: Company | null = null;
        
        const { data: viewData } = await supabase
          .from("companies")
          .select("id, name, description, category, stage, public_score, created_at, vc_verdict_json")
          .eq("id", id)
          .maybeSingle();

        if (viewData) {
          companyData = viewData as unknown as Company;
          if ((viewData as any).vc_verdict_json) {
            setVcQuickTake((viewData as any).vc_verdict_json as VCQuickTake);
          }
        }

        if (!companyData) {
          setIsLoading(false);
          return;
        }
        
        setCompany(companyData);

        // Fetch memo for vcQuickTake and sections
        const { data: memoData } = await supabase
          .from("memos")
          .select("structured_content")
          .eq("company_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const structuredContent = memoData?.structured_content as any;
        if (structuredContent?.vcQuickTake) {
          setVcQuickTake(structuredContent.vcQuickTake as VCQuickTake);
        }

        // Extract traction and business model from structured sections
        if (structuredContent?.sections) {
          const sections = structuredContent.sections;
          const tractionSection = sections.find((s: any) => 
            s.title?.toLowerCase().includes('traction') || s.sectionKey === 'traction'
          );
          const businessModelSection = sections.find((s: any) => 
            s.title?.toLowerCase().includes('business model') || s.sectionKey === 'businessModel'
          );
          
          setMemoContent({
            traction: tractionSection?.content || tractionSection?.narrative,
            businessModel: businessModelSection?.content || businessModelSection?.narrative,
            investmentThesis: structuredContent.investmentThesis?.summary || structuredContent.investmentThesis?.narrative,
            sections: sections,
          });
        }

        // Fetch memo responses for traction and business model
        const { data: responses } = await supabase
          .from("memo_responses")
          .select("question_key, answer")
          .eq("company_id", id)
          .in("question_key", ["traction", "traction_metrics", "revenue_model", "business_model", "monetization"]);

        if (responses && responses.length > 0) {
          const tractionResp = responses.find((r) => 
            r.question_key.toLowerCase().includes("traction")
          );
          const businessModelResp = responses.find((r) => 
            r.question_key.toLowerCase().includes("business") || 
            r.question_key.toLowerCase().includes("revenue") ||
            r.question_key.toLowerCase().includes("monetization")
          );
          
          setMemoContent(prev => ({
            ...prev,
            traction: tractionResp?.answer || prev?.traction,
            businessModel: businessModelResp?.answer || prev?.businessModel,
          }));
        }

        // Fetch section scores
        const { data: toolData } = await supabase
          .from("memo_tool_data")
          .select("section_name, tool_name, ai_generated_data, user_overrides")
          .eq("company_id", id)
          .eq("tool_name", "sectionScore");

        const scores: Record<string, number> = {};
        (toolData || []).forEach((tool) => {
          const data = { ...(tool.ai_generated_data as any || {}), ...(tool.user_overrides as any || {}) };
          if (data.score) {
            scores[tool.section_name] = data.score;
          }
        });
        setSectionScores(scores);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const copyShareLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Startup Not Found</h2>
          <p className="text-muted-foreground">This preview may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  const verdictText = vcQuickTake?.verdict ? getItemText(vcQuickTake.verdict) : "";
  const readinessText = vcQuickTake?.readinessLevel ? getItemText(vcQuickTake.readinessLevel) : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">Shareable Preview</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="gap-2"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(135deg, hsl(330 20% 12% / 0.9) 0%, hsl(330 20% 8% / 0.8) 100%)',
            backdropFilter: 'blur(40px)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
          
          <div className="relative p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Investment Opportunity</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{company.name}</h1>
                <p className="text-muted-foreground mb-4">
                  {company.category || "Uncategorized"} • {company.stage}
                </p>
                {company.description && (
                  <p className="text-foreground/80 leading-relaxed">{company.description}</p>
                )}
              </div>
              
              <div className="text-center shrink-0">
                <div className={cn("text-5xl font-bold mb-1", getScoreColor(company.public_score))}>
                  {company.public_score || "—"}
                </div>
                <p className="text-xs text-muted-foreground">Fundability Score</p>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className={cn("h-full rounded-full transition-all", getScoreBg(company.public_score))}
                    style={{ width: `${company.public_score || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* VC Quick Take */}
        {vcQuickTake && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">VC Quick Take</h3>
                {readinessText && (
                  <span className="text-xs text-primary">{readinessText}</span>
                )}
              </div>
            </div>
            
            {verdictText && (
              <p className="text-foreground mb-6 text-lg italic">"{verdictText}"</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {vcQuickTake.strengths && vcQuickTake.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-success mb-3 uppercase tracking-wider">Key Strengths</h4>
                  <ul className="space-y-2">
                    {vcQuickTake.strengths.slice(0, 3).map((s: any, i: number) => (
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
                  <h4 className="text-sm font-semibold text-destructive mb-3 uppercase tracking-wider">Areas to Explore</h4>
                  <ul className="space-y-2">
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

        {/* Investment Thesis Highlights */}
        {(memoContent?.investmentThesis || vcQuickTake?.strengths) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-success/5 to-primary/5 border border-success/20 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Investment Highlights</h3>
            </div>
            
            {memoContent?.investmentThesis && (
              <p className="text-foreground/90 leading-relaxed mb-4">{memoContent.investmentThesis}</p>
            )}
            
            {vcQuickTake?.strengths && vcQuickTake.strengths.length > 0 && !memoContent?.investmentThesis && (
              <ul className="space-y-2">
                {vcQuickTake.strengths.slice(0, 4).map((s: any, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{getItemText(s)}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Traction & Business Model */}
        {(memoContent?.traction || memoContent?.businessModel) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {memoContent?.traction && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Traction</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {memoContent.traction}
                </p>
              </div>
            )}
            {memoContent?.businessModel && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Business Model</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {memoContent.businessModel}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Section Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Investment Readiness Breakdown
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionOrder.map((section) => {
              const score = sectionScores[section];
              const Icon = sectionIcons[section] || Target;
              return (
                <div
                  key={section}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{section}</span>
                  </div>
                  <div className={cn("text-2xl font-bold mb-2", getScoreColor(score || null))}>
                    {score || "—"}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", getScoreBg(score || null))}
                      style={{ width: `${score || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Share Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500/10 to-primary/10 border border-blue-500/20 rounded-xl p-6 text-center"
        >
          <Globe className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">This is a Shareable Preview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This page can be shared publicly with potential investors. Copy the link above to share.
          </p>
          <Button onClick={copyShareLink} className="gap-2">
            <Share2 className="w-4 h-4" />
            Share This Preview
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Generated by VC Insight Builder • {new Date(company.created_at).toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  );
}
