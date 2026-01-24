/**
 * AcceleratorStartupPreview - Read-only view of a founder's ecosystem
 * 
 * This page allows accelerators to "peek" into a startup's dashboard
 * exactly as the founder sees it, but in read-only mode (no editing).
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Eye, Lock, Loader2, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useMemoContent } from "@/hooks/useMemoContent";
import { DashboardScorecard } from "@/components/memo/DashboardScorecard";
import { MemoVCQuickTake } from "@/components/memo/MemoVCQuickTake";
import { MemoAnchoredAssumptions } from "@/components/memo/MemoAnchoredAssumptions";
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

export default function AcceleratorStartupPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the same hook founders use for full data fidelity
  const { data: memoData, isLoading: memoLoading } = useMemoContent(id);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id || !isAuthenticated || authLoading) return;

      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name, description, category, stage, public_score, created_at")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (error: any) {
        console.error("Error fetching company:", error);
        toast.error("Failed to load startup data");
        navigate("/accelerator");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id, isAuthenticated, authLoading, navigate]);

  const hasMemoContent = useMemo(() => {
    return memoData?.memoContent && Object.keys(memoData.sectionTools || {}).length > 0;
  }, [memoData]);

  if (isLoading || authLoading || memoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading startup ecosystem...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Startup Not Found</h2>
          <Button onClick={() => navigate("/accelerator")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with read-only indicator */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/accelerator/startup/${id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Startup
              </Button>
              
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">{company.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {company.category || "Uncategorized"} • {company.stage}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Tool Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/accelerator/startup/${id}/market-lens`)}
                className="gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Market Lens</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/accelerator/startup/${id}/investors`)}
                className="gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Investor Network</span>
              </Button>
            </div>
            
            {/* Read-only badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30">
              <Eye className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-secondary">Read-Only Preview</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!hasMemoContent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-12 text-center"
          >
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Analysis Not Available</h3>
            <p className="text-muted-foreground">
              This startup hasn't generated their investment analysis yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Anchored Assumptions (Key Metrics) */}
            {memoData?.anchoredAssumptions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MemoAnchoredAssumptions 
                  assumptions={memoData.anchoredAssumptions}
                  companyName={company.name}
                />
              </motion.div>
            )}

            {/* Full Dashboard Scorecard - same as founder sees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DashboardScorecard
                sectionTools={memoData!.sectionTools}
                companyName={company.name}
                companyDescription={company.description || undefined}
                stage={company.stage}
                category={company.category || undefined}
                companyId={company.id}
                onNavigate={navigate}
                memoContent={memoData?.memoContent}
                arcClassification={memoData?.arcClassification}
                isDemo={true} // This enables read-only mode
              />
            </motion.div>

            {/* VC Quick Take */}
            {memoData?.memoContent?.vcQuickTake && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MemoVCQuickTake 
                  quickTake={memoData.memoContent.vcQuickTake}
                  companyInsightContext={memoData.companyInsightContext}
                />
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
