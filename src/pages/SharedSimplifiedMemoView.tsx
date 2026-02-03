/**
 * SharedSimplifiedMemoView - Public shareable page for simplified VC memos
 * 
 * This page allows founders to share their VC Memorandum with their network
 * via a secure token-based link without requiring authentication.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, Copy, Calendar, Shield, CheckCircle2, Lock, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { SimplifiedMemoViewer } from "@/components/templates/SimplifiedMemoViewer";
import type { SectionToolData, SimplifiedMemoSection, HolisticVerdict } from "@/components/templates/SimplifiedMemoViewer";

interface SharedMemoData {
  token: string;
  company_id: string;
  company_name: string;
  description: string | null;
  category: string | null;
  stage: string;
  share_created_at: string;
}

export default function SharedSimplifiedMemoView() {
  const { token } = useParams<{ token: string }>();
  
  const [loading, setLoading] = useState(true);
  const [memoData, setMemoData] = useState<SharedMemoData | null>(null);
  const [memoContent, setMemoContent] = useState<any>(null);
  const [sectionTools, setSectionTools] = useState<Record<string, SectionToolData>>({});
  const [holisticVerdicts, setHolisticVerdicts] = useState<Record<string, HolisticVerdict>>({});
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
        // 1. Fetch from the simplified share view
        const { data, error: fetchError } = await supabase
          .from("shared_simplified_memo_view")
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

        // 2. Fetch memo content from memos table using the company_id
        const { data: memoRow } = await supabase
          .from("memos")
          .select("structured_content")
          .eq("company_id", data.company_id)
          .maybeSingle();

        if (memoRow?.structured_content) {
          setMemoContent(memoRow.structured_content);
        }

        // 3. Fetch section tools from shareable_section_scores view
        const { data: toolData } = await supabase
          .from("shareable_section_scores")
          .select("*")
          .eq("company_id", data.company_id);

        if (toolData && toolData.length > 0) {
          const toolsMap: Record<string, SectionToolData> = {};
          const verdictsMap: Record<string, HolisticVerdict> = {};
          
          toolData.forEach((tool: any) => {
            const sectionName = tool.section_name;
            
            // Extract holistic verdicts separately
            if (tool.tool_name === 'holisticVerdict') {
              const aiData = tool.ai_generated_data as Record<string, any> || {};
              const verdictText = aiData.holisticVerdict || aiData.verdict;
              if (verdictText) {
                verdictsMap[sectionName] = {
                  verdict: verdictText,
                  stageContext: aiData.stageContext || ''
                };
              }
              return;
            }
            
            if (!toolsMap[sectionName]) {
              toolsMap[sectionName] = {};
            }
            
            let aiData = tool.ai_generated_data as Record<string, any> || {};
            const userOverrides = tool.user_overrides as Record<string, any> || {};
            
            // Unwrap double-wrapped data
            if (aiData.aiGenerated !== undefined && typeof aiData.aiGenerated === 'object') {
              aiData = aiData.aiGenerated;
            }
            
            if (tool.tool_name === "sectionScore") {
              toolsMap[sectionName].sectionScore = aiData.score || userOverrides.score;
            } else if (tool.tool_name === "vcInvestmentLogic") {
              toolsMap[sectionName].vcInvestmentLogic = {
                primaryQuestions: aiData.primaryQuestions || [],
                keyMetrics: aiData.keyMetrics || [],
                redFlags: aiData.redFlags || [],
                greenFlags: aiData.greenFlags || [],
                ...userOverrides
              };
            } else if (tool.tool_name === "actionPlan90Day") {
              const actions = aiData.actions || aiData.milestones || [];
              toolsMap[sectionName].actionPlan90Day = {
                milestones: actions.map((action: any) => ({
                  title: action.action || action.title || '',
                  description: action.metric || action.description || '',
                  priority: action.priority === 'critical' ? 'high' : 
                           action.priority === 'important' ? 'medium' : 
                           action.priority === 'nice-to-have' ? 'low' : 'medium',
                })),
              };
            } else if (tool.tool_name === "benchmarks") {
              const metrics = Array.isArray(aiData) ? aiData : aiData.metrics || [];
              toolsMap[sectionName].benchmarks = {
                metrics: metrics.map((bm: any) => ({
                  label: bm.metric || bm.label || '',
                  yourValue: bm.yourValue || '',
                  benchmark: bm.benchmark || '',
                  status: (bm.percentile?.includes('Top') || bm.status === 'above') ? 'above' as const : 
                         bm.status === 'below' ? 'below' as const : 'at' as const,
                })),
              };
            }
          });
          
          setSectionTools(toolsMap);
          setHolisticVerdicts(verdictsMap);
        }

        // 4. Increment view count (fire and forget)
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

  const copyShareLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading memo...</p>
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

  // Transform memo content to SimplifiedMemoViewer format
  const sections: SimplifiedMemoSection[] = (memoContent?.sections || []).map((section: any) => {
    let narrativeText = '';
    if (section.paragraphs?.length) {
      narrativeText = section.paragraphs.map((p: any) => typeof p === 'string' ? p : p.text).join(' ');
    } else if (typeof section.narrative === 'string') {
      narrativeText = section.narrative;
    } else if (section.narrative && typeof section.narrative === 'object') {
      const narrativeObj = section.narrative as any;
      if (narrativeObj.paragraphs?.length) {
        narrativeText = narrativeObj.paragraphs.map((p: any) => typeof p === 'string' ? p : p.text).join(' ');
      }
    }
    
    return {
      title: section.title,
      narrative: narrativeText,
      keyPoints: section.keyPoints || [],
    };
  });

  // Get hero statement from VC quick take
  const heroStatement = memoContent?.vcQuickTake?.verdict || 
                        memoContent?.vcQuickTake?.readinessRationale ||
                        memoContent?.sections?.[0]?.paragraphs?.[0]?.text || '';

  // Note: AI Action Plan and Strategic Analysis tools are excluded from the shared view

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">Shared Memo</span>
              </div>
              {memoData.share_created_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Shared {format(new Date(memoData.share_created_at), "MMM d, yyyy")}
                </span>
              )}
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

      {/* Main Content */}
      <main>
        <div className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative">
            <SimplifiedMemoViewer
              companyName={memoData.company_name}
              companyDescription={memoData.description || ""}
              heroStatement={heroStatement}
              sections={sections}
              sectionTools={{}}
              holisticVerdicts={holisticVerdicts}
              showBackButton={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
