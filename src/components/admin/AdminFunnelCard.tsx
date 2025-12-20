import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "@/components/ModernCard";
import { ArrowRight, Users, Building2, FileText, DollarSign, CheckCircle } from "lucide-react";

interface FunnelData {
  totalSignups: number;
  companiesCreated: number;
  startedQuestionnaire: number;
  purchasedMemo: number;
  generatedMemo: number;
}

export const AdminFunnelCard = () => {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      // Total signups (profiles)
      const { count: signupsCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // Companies created
      const { count: companiesCount } = await supabase
        .from("companies")
        .select("id", { count: "exact", head: true });

      // Companies with at least one response (started questionnaire)
      const { data: responsesData } = await supabase
        .from("memo_responses")
        .select("company_id")
        .not("answer", "is", null);

      const uniqueCompaniesWithResponses = new Set(
        (responsesData || []).map(r => r.company_id)
      ).size;

      // Unique users who purchased
      const { data: purchasesData } = await supabase
        .from("memo_purchases")
        .select("user_id");

      const uniquePurchasers = new Set(
        (purchasesData || []).map(p => p.user_id)
      ).size;

      // Companies with generated memos
      const { count: memosCount } = await supabase
        .from("memos")
        .select("id", { count: "exact", head: true })
        .eq("status", "generated");

      setData({
        totalSignups: signupsCount || 0,
        companiesCreated: companiesCount || 0,
        startedQuestionnaire: uniqueCompaniesWithResponses,
        purchasedMemo: uniquePurchasers,
        generatedMemo: memosCount || 0,
      });
    } catch (error) {
      console.error("Error fetching funnel data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ModernCard className="col-span-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </ModernCard>
    );
  }

  if (!data) {
    return null;
  }

  const stages = [
    { label: "Signups", value: data.totalSignups, icon: Users, color: "text-primary" },
    { label: "Created Company", value: data.companiesCreated, icon: Building2, color: "text-chart-2" },
    { label: "Started Questionnaire", value: data.startedQuestionnaire, icon: FileText, color: "text-amber-500" },
    { label: "Purchased", value: data.purchasedMemo, icon: DollarSign, color: "text-green-500" },
    { label: "Generated Memo", value: data.generatedMemo, icon: CheckCircle, color: "text-purple-500" },
  ];

  const calculateConversion = (from: number, to: number) => {
    if (from === 0) return "0%";
    return `${((to / from) * 100).toFixed(1)}%`;
  };

  return (
    <ModernCard className="col-span-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Conversion Funnel</h2>
          <p className="text-sm text-muted-foreground">User journey from signup to memo generation</p>
        </div>

        {/* Funnel Visualization */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {stages.map((stage, index) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`p-3 rounded-full bg-muted/50 mb-2 ${stage.color}`}>
                  <stage.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stage.value}</p>
                <p className="text-xs text-muted-foreground text-center">{stage.label}</p>
              </div>
              {index < stages.length - 1 && (
                <div className="flex flex-col items-center mx-2">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {calculateConversion(stages[index].value, stages[index + 1].value)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {calculateConversion(data.totalSignups, data.companiesCreated)}
            </p>
            <p className="text-xs text-muted-foreground">Signup → Company</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {calculateConversion(data.companiesCreated, data.startedQuestionnaire)}
            </p>
            <p className="text-xs text-muted-foreground">Company → Started</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {calculateConversion(data.startedQuestionnaire, data.purchasedMemo)}
            </p>
            <p className="text-xs text-muted-foreground">Started → Purchase</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-500 font-semibold">
              {calculateConversion(data.totalSignups, data.purchasedMemo)}
            </p>
            <p className="text-xs text-muted-foreground">Overall Conversion</p>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};
