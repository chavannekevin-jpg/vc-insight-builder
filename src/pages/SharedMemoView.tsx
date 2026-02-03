/**
 * SharedMemoView - Public shareable page for investment memos
 * 
 * This page allows admins to share full investment analysis with partners
 * via a secure token-based link without requiring authentication.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, Target, TrendingUp, Users, Lightbulb,
  DollarSign, BarChart3, CheckCircle2, AlertTriangle, Copy,
  Globe, Sparkles, Eye, Lock, Calendar, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MemoSection } from "@/components/memo/MemoSection";
import { MemoHeroStatement } from "@/components/memo/MemoHeroStatement";
import { MemoCollapsibleOverview } from "@/components/memo/MemoCollapsibleOverview";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoStructuredContent, MemoParagraph } from "@/types/memo";
import { safeTitle, sanitizeMemoContent } from "@/lib/stringUtils";
import { format } from "date-fns";

interface SharedMemoData {
  token: string;
  company_id: string;
  company_name: string;
  category: string | null;
  stage: string;
  description: string | null;
  public_score: number | null;
  vc_verdict_json: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  structured_content: any;
  memo_created_at: string | null;
  is_active: boolean;
  expires_at: string | null;
}

export default function SharedMemoView() {
  const { token } = useParams<{ token: string }>();
  
  const [loading, setLoading] = useState(true);
  const [memoData, setMemoData] = useState<SharedMemoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedMemo = async () => {
      if (!token) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        // Fetch from the public view
        const { data, error: fetchError } = await supabase
          .from("shared_memo_view")
          .select("*")
          .eq("token", token)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching shared memo:", fetchError);
          setError("Failed to load memo");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("This share link is invalid or has expired");
          setLoading(false);
          return;
        }

        setMemoData(data as unknown as SharedMemoData);

        // Increment view count (fire and forget)
        supabase.rpc("increment_share_link_views", { p_token: token });

      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedMemo();
  }, [token]);

  const memoContent = useMemo(() => {
    if (!memoData?.structured_content) return null;
    return sanitizeMemoContent(memoData.structured_content as any);
  }, [memoData]);

  const copyShareLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !memoData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">{error || "This memo is not available"}</p>
          <div className="p-4 rounded-lg bg-muted/30 border border-border text-left">
            <p className="text-sm text-muted-foreground">
              This link may have expired or been deactivated. Please contact the person who shared this link for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">Shared Analysis</span>
              </div>
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
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--muted) / 0.3) 100%)',
          }}
        >
          <div className="absolute inset-0 rounded-2xl border border-primary/10" />
          
          <div className="relative p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">Investment Analysis</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{memoData.company_name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline">{memoData.category || "Uncategorized"}</Badge>
                  <Badge variant="secondary">{memoData.stage}</Badge>
                  {memoData.memo_created_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(memoData.memo_created_at), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                {memoData.description && (
                  <p className="text-foreground/80 leading-relaxed">{memoData.description}</p>
                )}
              </div>
              
              {memoData.public_score && (
                <div className="text-center shrink-0">
                  <div className={cn("text-5xl font-bold mb-1", getScoreColor(memoData.public_score))}>
                    {memoData.public_score}
                  </div>
                  <p className="text-xs text-muted-foreground">Fundability Score</p>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                      className={cn("h-full rounded-full transition-all", getScoreBg(memoData.public_score))}
                      style={{ width: `${memoData.public_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* VC Quick Take */}
        {memoContent?.vcQuickTake && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <MemoVCQuickTake 
              quickTake={memoContent.vcQuickTake} 
              showTeaser={false}
            />
          </motion.div>
        )}

        {/* AI Conclusion */}
        {(memoContent as any)?.aiConclusion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <MemoAIConclusion text={(memoContent as any).aiConclusion} />
          </motion.div>
        )}

        {/* Memo Sections */}
        {memoContent?.sections && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {memoContent.sections.map((section, index) => {
              const narrative = section.narrative || {
                paragraphs: section.paragraphs,
                highlights: section.highlights,
                keyPoints: section.keyPoints
              };

              const heroParagraph = narrative.paragraphs?.find((p: MemoParagraph) => p.emphasis === "high");
              const otherParagraphs = narrative.paragraphs?.filter((p: MemoParagraph) => p.emphasis !== "high") || [];

              return (
                <MemoSection key={section.title} title={section.title} index={index}>
                  {heroParagraph && (
                    <MemoHeroStatement text={heroParagraph.text} />
                  )}
                  <MemoCollapsibleOverview
                    paragraphs={otherParagraphs}
                    highlights={narrative.highlights}
                    keyPoints={narrative.keyPoints}
                    defaultOpen={true}
                  />
                </MemoSection>
              );
            })}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-border text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>This analysis was shared via a private link</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Generated by Kontrol • Confidential investment analysis
          </p>
        </motion.div>
      </main>
    </div>
  );
}
