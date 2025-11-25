import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle,
  Euro,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";

export default function RaiseCalculator() {
  const navigate = useNavigate();
  
  // Inputs
  const [monthlyBurn, setMonthlyBurn] = useState(40000);
  const [oneOffCosts, setOneOffCosts] = useState(50000);
  const [revenueStartMonth, setRevenueStartMonth] = useState(6);
  const [currentMRR, setCurrentMRR] = useState(0);
  const [monthlyMRRGrowth, setMonthlyMRRGrowth] = useState(15);
  const [arrTarget, setARRTarget] = useState(1000000);
  const [milestone, setMilestone] = useState("mvp");
  const [marketRisk, setMarketRisk] = useState("b2b-saas");
  const [executionSpeed, setExecutionSpeed] = useState("normal");
  const [dilution, setDilution] = useState([15]);
  const [bufferMode, setBufferMode] = useState("vc-ready");

  // Calculated outputs
  const [recommendedRaise, setRecommendedRaise] = useState(0);
  const [impliedValuation, setImpliedValuation] = useState(0);
  const [projectedARR, setProjectedARR] = useState(0);
  const [projectedMRR, setProjectedMRR] = useState(0);
  const [totalRunway, setTotalRunway] = useState(0);
  const [arrStatus, setARRStatus] = useState("");
  const [milestoneReady, setMilestoneReady] = useState(false);

  // Market risk multipliers
  const marketMultipliers: Record<string, number> = {
    "b2b-saas": 1.0,
    "fintech": 1.2,
    "deeptech": 1.3,
    "health": 1.5,
    "hardware": 1.4,
    "consumer": 1.25
  };

  // Execution multipliers
  const executionMultipliers: Record<string, number> = {
    "fast": 0.9,
    "normal": 1.0,
    "slow": 1.2
  };

  // Milestone runway recommendations
  const milestoneRunways: Record<string, number> = {
    "mvp": 12,
    "first-customers": 15,
    "early-traction": 18,
    "repeatable-sales": 18
  };

  useEffect(() => {
    calculateRaise();
  }, [
    monthlyBurn,
    oneOffCosts,
    revenueStartMonth,
    currentMRR,
    monthlyMRRGrowth,
    arrTarget,
    milestone,
    marketRisk,
    executionSpeed,
    dilution,
    bufferMode
  ]);

  const calculateRaise = () => {
    // Determine base runway
    const baseRunway = milestoneRunways[milestone] || 15;
    
    // Apply multipliers
    const marketMultiplier = marketMultipliers[marketRisk] || 1.0;
    const execMultiplier = executionMultipliers[executionSpeed] || 1.0;
    const adjustedRunway = baseRunway * marketMultiplier * execMultiplier;
    
    setTotalRunway(Math.round(adjustedRunway));
    
    // Calculate total burn
    const totalBurn = monthlyBurn * adjustedRunway;
    
    // Calculate revenue projection
    const monthsToProject = Math.max(0, adjustedRunway - revenueStartMonth);
    let finalMRR = currentMRR;
    
    if (monthsToProject > 0 && revenueStartMonth <= adjustedRunway) {
      finalMRR = currentMRR * Math.pow(1 + (monthlyMRRGrowth / 100), monthsToProject);
    }
    
    const finalARR = finalMRR * 12;
    setProjectedMRR(Math.round(finalMRR));
    setProjectedARR(Math.round(finalARR));
    
    // Assess ARR status
    if (finalARR < 700000) {
      setARRStatus("below-target");
      setMilestoneReady(false);
    } else if (finalARR >= 700000 && finalARR < 1000000) {
      setARRStatus("borderline");
      setMilestoneReady(true);
    } else if (finalARR >= 1000000 && finalARR <= 1200000) {
      setARRStatus("on-track");
      setMilestoneReady(true);
    } else {
      setARRStatus("above-expectations");
      setMilestoneReady(true);
    }
    
    // Calculate buffer
    const bufferPercent = bufferMode === "conservative" ? 0.15 : 0.25;
    const buffer = totalBurn * bufferPercent;
    
    // Recommended raise
    const raise = totalBurn + oneOffCosts + buffer;
    setRecommendedRaise(Math.round(raise));
    
    // Implied valuation
    const dilutionPercent = dilution[0] / 100;
    const valuation = raise / dilutionPercent - raise;
    setImpliedValuation(Math.round(valuation));
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    }
    return `€${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/raise-education")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Model
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Raise Estimator</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: INPUTS */}
          <div className="space-y-6">
            {/* Burn & Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operational Burn</CardTitle>
                <CardDescription>Your monthly expenses and one-off costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="burn">Monthly Burn (€)</Label>
                  <Input
                    id="burn"
                    type="number"
                    value={monthlyBurn}
                    onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                    min={0}
                    step={5000}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="oneoff">One-Off Costs (€)</Label>
                  <Input
                    id="oneoff"
                    type="number"
                    value={oneOffCosts}
                    onChange={(e) => setOneOffCosts(Number(e.target.value))}
                    min={0}
                    step={10000}
                  />
                  <p className="text-xs text-muted-foreground">Legal, compliance, equipment, etc.</p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Projection</CardTitle>
                <CardDescription>When revenue starts and how it grows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revstart">Revenue Start Month</Label>
                  <Input
                    id="revstart"
                    type="number"
                    value={revenueStartMonth}
                    onChange={(e) => setRevenueStartMonth(Number(e.target.value))}
                    min={0}
                    max={24}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentmrr">Current MRR (€)</Label>
                  <Input
                    id="currentmrr"
                    type="number"
                    value={currentMRR}
                    onChange={(e) => setCurrentMRR(Number(e.target.value))}
                    min={0}
                    step={1000}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="growth">Monthly MRR Growth (%)</Label>
                  <Input
                    id="growth"
                    type="number"
                    value={monthlyMRRGrowth}
                    onChange={(e) => setMonthlyMRRGrowth(Number(e.target.value))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="arrtarget">Seed ARR Target (€)</Label>
                  <Input
                    id="arrtarget"
                    type="number"
                    value={arrTarget}
                    onChange={(e) => setARRTarget(Number(e.target.value))}
                    min={0}
                    step={100000}
                  />
                  <p className="text-xs text-muted-foreground">Default: €700k–€1.2M</p>
                </div>
              </CardContent>
            </Card>

            {/* Milestone & Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Milestone & Risk Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="milestone">Milestone Goal</Label>
                  <Select value={milestone} onValueChange={setMilestone}>
                    <SelectTrigger id="milestone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mvp">MVP Readiness</SelectItem>
                      <SelectItem value="first-customers">First Paying Customers</SelectItem>
                      <SelectItem value="early-traction">Early Traction</SelectItem>
                      <SelectItem value="repeatable-sales">Repeatable Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="market">Market Risk</Label>
                  <Select value={marketRisk} onValueChange={setMarketRisk}>
                    <SelectTrigger id="market">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b-saas">B2B SaaS (baseline)</SelectItem>
                      <SelectItem value="fintech">Fintech (+20%)</SelectItem>
                      <SelectItem value="deeptech">Deeptech/AI (+30%)</SelectItem>
                      <SelectItem value="health">Health/Medtech (+50%)</SelectItem>
                      <SelectItem value="hardware">Hardware (+40%)</SelectItem>
                      <SelectItem value="consumer">Consumer (+25%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="execution">Execution Speed</Label>
                  <Select value={executionSpeed} onValueChange={setExecutionSpeed}>
                    <SelectTrigger id="execution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast Execution (–10%)</SelectItem>
                      <SelectItem value="normal">Normal Execution</SelectItem>
                      <SelectItem value="slow">Slower Execution (+20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Dilution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dilution & Buffer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Dilution</Label>
                    <span className="text-sm font-bold">{dilution[0]}%</span>
                  </div>
                  <Slider
                    value={dilution}
                    onValueChange={setDilution}
                    min={10}
                    max={20}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">EU standard: 10%–20% per round</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buffer">Buffer Mode</Label>
                  <Select value={bufferMode} onValueChange={setBufferMode}>
                    <SelectTrigger id="buffer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (15%)</SelectItem>
                      <SelectItem value="vc-ready">VC-Ready (25%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: OUTPUTS */}
          <div className="space-y-6">
            {/* Recommended Raise */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  Recommended Raise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary mb-2">
                  {formatCurrency(recommendedRaise)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {totalRunway} months runway + {bufferMode === "conservative" ? "15%" : "25%"} buffer
                </p>
              </CardContent>
            </Card>

            {/* Implied Valuation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implied Pre-Money Valuation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {formatCurrency(impliedValuation)}
                </div>
                <p className="text-sm text-muted-foreground">
                  At {dilution[0]}% dilution
                </p>
              </CardContent>
            </Card>

            {/* ARR Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Projection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projected MRR</span>
                  <span className="text-lg font-bold">{formatCurrency(projectedMRR)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projected ARR</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(projectedARR)}</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Seed Target</span>
                  <span className="text-sm font-medium">{formatCurrency(arrTarget)}</span>
                </div>
                
                <div className="mt-4">
                  {arrStatus === "below-target" && (
                    <Badge variant="destructive" className="w-full justify-center py-2">
                      <XCircle className="w-4 h-4 mr-2" />
                      Below Seed Target
                    </Badge>
                  )}
                  {arrStatus === "borderline" && (
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      <Info className="w-4 h-4 mr-2" />
                      Borderline
                    </Badge>
                  )}
                  {arrStatus === "on-track" && (
                    <Badge className="w-full justify-center py-2">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      On Track
                    </Badge>
                  )}
                  {arrStatus === "above-expectations" && (
                    <Badge className="w-full justify-center py-2 bg-green-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Above Expectations
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Milestone Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next-Round Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                {milestoneReady ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Likely Fundable</p>
                      <p className="text-xs text-muted-foreground">
                        Your projected ARR meets or exceeds the seed benchmark. You're on track to raise your next round.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Milestone Risk</p>
                      <p className="text-xs text-muted-foreground">
                        Your current trajectory won't hit the seed ARR benchmark. Consider extending runway, accelerating MRR growth, or adjusting your target.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Full Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Runway</span>
                  <span className="font-medium">{milestoneRunways[milestone]} months</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Market Multiplier</span>
                  <span className="font-medium">×{marketMultipliers[marketRisk]}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Execution Multiplier</span>
                  <span className="font-medium">×{executionMultipliers[executionSpeed]}</span>
                </div>
                
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Adjusted Runway</span>
                  <span className="font-bold">{totalRunway} months</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Burn</span>
                  <span className="font-medium">{formatCurrency(monthlyBurn * totalRunway)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">One-Off Costs</span>
                  <span className="font-medium">{formatCurrency(oneOffCosts)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Buffer</span>
                  <span className="font-medium">{formatCurrency(recommendedRaise - (monthlyBurn * totalRunway) - oneOffCosts)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
