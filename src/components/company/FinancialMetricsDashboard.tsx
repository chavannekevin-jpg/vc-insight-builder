import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Target, Clock, ArrowRight, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MemoResponse {
  question_key: string;
  answer: string | null;
  source?: string | null;
}

interface FinancialMetricsDashboardProps {
  responses: MemoResponse[];
}

export function FinancialMetricsDashboard({ responses }: FinancialMetricsDashboardProps) {
  const navigate = useNavigate();
  
  const getResponse = (key: string) => responses.find(r => r.question_key === key)?.answer;
  
  // Parse financial data
  const raiseAmount = getResponse("raise_amount");
  const valuationPreMoney = getResponse("valuation_pre_money");
  const runwayMonths = getResponse("runway_months");
  const projectedArr = getResponse("projected_arr");
  const currentMrr = getResponse("financial_current_mrr");
  const monthlyBurn = getResponse("financial_monthly_burn");
  
  // Parse unit economics JSON if available
  let unitEconomics: any = null;
  const unitEconomicsJson = getResponse("unit_economics_json");
  if (unitEconomicsJson) {
    try {
      unitEconomics = JSON.parse(unitEconomicsJson);
    } catch {}
  }

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const hasFinancialData = raiseAmount || valuationPreMoney || runwayMonths || projectedArr || currentMrr || monthlyBurn || unitEconomics;

  if (!hasFinancialData) {
    return (
      <Card className="border-dashed border-2 border-border/50">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">No Financial Data Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use our calculators to model your raise and track key metrics
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/raise-calculator")}>
                Raise Calculator
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/valuation-calculator")}>
                Valuation Calculator
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Target Raise",
      value: formatCurrency(raiseAmount),
      icon: <Target className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-500/10"
    },
    {
      label: "Pre-Money",
      value: formatCurrency(valuationPreMoney),
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-500/10"
    },
    {
      label: "Runway",
      value: runwayMonths ? `${runwayMonths} mo` : null,
      icon: <Clock className="w-4 h-4" />,
      color: "text-amber-600 bg-amber-500/10"
    },
    {
      label: "Projected ARR",
      value: formatCurrency(projectedArr),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-purple-600 bg-purple-500/10"
    },
    {
      label: "Current MRR",
      value: formatCurrency(currentMrr),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-pink-600 bg-pink-500/10"
    },
    {
      label: "Monthly Burn",
      value: formatCurrency(monthlyBurn),
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-red-600 bg-red-500/10"
    }
  ].filter(m => m.value);

  // Add unit economics metrics if available
  if (unitEconomics) {
    if (unitEconomics.ltv) {
      metrics.push({
        label: "LTV",
        value: formatCurrency(unitEconomics.ltv.toString()),
        icon: <DollarSign className="w-4 h-4" />,
        color: "text-cyan-600 bg-cyan-500/10"
      });
    }
    if (unitEconomics.cac) {
      metrics.push({
        label: "CAC",
        value: formatCurrency(unitEconomics.cac.toString()),
        icon: <DollarSign className="w-4 h-4" />,
        color: "text-orange-600 bg-orange-500/10"
      });
    }
    if (unitEconomics.ltv && unitEconomics.cac && unitEconomics.cac > 0) {
      const ratio = (unitEconomics.ltv / unitEconomics.cac).toFixed(1);
      metrics.push({
        label: "LTV:CAC",
        value: `${ratio}x`,
        icon: <TrendingUp className="w-4 h-4" />,
        color: parseFloat(ratio) >= 3 ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10"
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Financial Metrics
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/raise-calculator")} className="gap-1 text-xs">
            Update <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="space-y-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.color}`}>
                {metric.icon}
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
