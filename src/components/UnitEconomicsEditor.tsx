import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, TrendingUp, DollarSign, Users, Percent } from "lucide-react";

interface UnitEconomicsEditorProps {
  companyId: string;
  existingMetrics?: string;
  onSave?: (metrics: string) => void;
}

interface Metrics {
  mrr: string;
  arr: string;
  monthlyGrowth: string;
  cac: string;
  ltv: string;
  ltvCacRatio: string;
  paybackMonths: string;
  churnRate: string;
  grossMargin: string;
  burnRate: string;
  runway: string;
  customers: string;
}

const EMPTY_METRICS: Metrics = {
  mrr: "",
  arr: "",
  monthlyGrowth: "",
  cac: "",
  ltv: "",
  ltvCacRatio: "",
  paybackMonths: "",
  churnRate: "",
  grossMargin: "",
  burnRate: "",
  runway: "",
  customers: "",
};

export function UnitEconomicsEditor({ companyId, existingMetrics, onSave }: UnitEconomicsEditorProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (existingMetrics) {
      try {
        const parsed = JSON.parse(existingMetrics);
        setMetrics({ ...EMPTY_METRICS, ...parsed });
      } catch {
        // If not JSON, it's legacy text format - leave empty
      }
    }
  }, [existingMetrics]);

  const handleChange = (key: keyof Metrics, value: string) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const formatMetricsForAI = (): string => {
    const parts: string[] = [];
    
    if (metrics.mrr) parts.push(`MRR: $${metrics.mrr}`);
    if (metrics.arr) parts.push(`ARR: $${metrics.arr}`);
    if (metrics.monthlyGrowth) parts.push(`Monthly Growth: ${metrics.monthlyGrowth}%`);
    if (metrics.customers) parts.push(`Total Customers: ${metrics.customers}`);
    if (metrics.cac) parts.push(`CAC: $${metrics.cac}`);
    if (metrics.ltv) parts.push(`LTV: $${metrics.ltv}`);
    if (metrics.ltvCacRatio) parts.push(`LTV:CAC Ratio: ${metrics.ltvCacRatio}x`);
    if (metrics.paybackMonths) parts.push(`Payback Period: ${metrics.paybackMonths} months`);
    if (metrics.churnRate) parts.push(`Monthly Churn: ${metrics.churnRate}%`);
    if (metrics.grossMargin) parts.push(`Gross Margin: ${metrics.grossMargin}%`);
    if (metrics.burnRate) parts.push(`Monthly Burn: $${metrics.burnRate}`);
    if (metrics.runway) parts.push(`Runway: ${metrics.runway} months`);
    
    return parts.length > 0 ? parts.join("\n") : "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedMetrics = formatMetricsForAI();
      const jsonMetrics = JSON.stringify(metrics);
      
      // Save both the structured JSON and formatted text for AI
      const { error } = await supabase
        .from("memo_responses")
        .upsert({
          company_id: companyId,
          question_key: "unit_economics",
          answer: formattedMetrics,
          source: "metrics_editor"
        }, {
          onConflict: "company_id,question_key"
        });

      if (error) throw error;

      // Also save the raw JSON for editing
      await supabase
        .from("memo_responses")
        .upsert({
          company_id: companyId,
          question_key: "unit_economics_json",
          answer: jsonMetrics,
          source: "metrics_editor"
        }, {
          onConflict: "company_id,question_key"
        });

      setHasChanges(false);
      onSave?.(formattedMetrics);
      
      toast({
        title: "Metrics saved",
        description: "Your unit economics will be used in your investment memo.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filledCount = Object.values(metrics).filter(v => v.trim()).length;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Unit Economics</h3>
            <p className="text-sm text-muted-foreground">Add your real metrics for a stronger memo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={filledCount > 6 ? "default" : "secondary"} className="text-xs">
            {filledCount}/12 filled
          </Badge>
          {hasChanges && (
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 pb-2 border-b border-border/50">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"></span>
        The more metrics you provide, the more credible and detailed your investment memo will be
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revenue Metrics */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4 text-green-500" />
            Revenue
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">MRR ($)</Label>
              <Input
                type="text"
                placeholder="e.g., 15000"
                value={metrics.mrr}
                onChange={(e) => handleChange("mrr", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ARR ($)</Label>
              <Input
                type="text"
                placeholder="e.g., 180000"
                value={metrics.arr}
                onChange={(e) => handleChange("arr", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monthly Growth (%)</Label>
              <Input
                type="text"
                placeholder="e.g., 15"
                value={metrics.monthlyGrowth}
                onChange={(e) => handleChange("monthlyGrowth", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-blue-500" />
            Customer Economics
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Total Customers</Label>
              <Input
                type="text"
                placeholder="e.g., 150"
                value={metrics.customers}
                onChange={(e) => handleChange("customers", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">CAC ($)</Label>
              <Input
                type="text"
                placeholder="e.g., 500"
                value={metrics.cac}
                onChange={(e) => handleChange("cac", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">LTV ($)</Label>
              <Input
                type="text"
                placeholder="e.g., 3000"
                value={metrics.ltv}
                onChange={(e) => handleChange("ltv", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">LTV:CAC Ratio</Label>
              <Input
                type="text"
                placeholder="e.g., 6"
                value={metrics.ltvCacRatio}
                onChange={(e) => handleChange("ltvCacRatio", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Unit Economics */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Percent className="w-4 h-4 text-purple-500" />
            Health Metrics
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Payback Period (months)</Label>
              <Input
                type="text"
                placeholder="e.g., 8"
                value={metrics.paybackMonths}
                onChange={(e) => handleChange("paybackMonths", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monthly Churn (%)</Label>
              <Input
                type="text"
                placeholder="e.g., 3"
                value={metrics.churnRate}
                onChange={(e) => handleChange("churnRate", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Gross Margin (%)</Label>
              <Input
                type="text"
                placeholder="e.g., 70"
                value={metrics.grossMargin}
                onChange={(e) => handleChange("grossMargin", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Monthly Burn ($)</Label>
              <Input
                type="text"
                placeholder="e.g., 25000"
                value={metrics.burnRate}
                onChange={(e) => handleChange("burnRate", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Runway (months)</Label>
              <Input
                type="text"
                placeholder="e.g., 18"
                value={metrics.runway}
                onChange={(e) => handleChange("runway", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
