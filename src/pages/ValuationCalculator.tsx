import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  AlertTriangle,
  Euro,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

type SignalLevel = "realistic" | "aggressive" | "inflated" | "conservative";

export default function ValuationCalculator() {
  const [raiseAmount, setRaiseAmount] = useState(500000);
  const [dilution, setDilution] = useState([15]);
  const [targetPreMoney, setTargetPreMoney] = useState<number | null>(null);
  
  const [preMoney, setPreMoney] = useState(0);
  const [postMoney, setPostMoney] = useState(0);
  const [actualDilution, setActualDilution] = useState(0);
  const [signal, setSignal] = useState<SignalLevel>("realistic");
  const [interpretation, setInterpretation] = useState("");

  useEffect(() => {
    calculateValuation();
  }, [raiseAmount, dilution, targetPreMoney]);

  const calculateValuation = () => {
    if (targetPreMoney && targetPreMoney > 0) {
      // User provided target valuation - calculate dilution
      const computedPostMoney = targetPreMoney + raiseAmount;
      const computedDilution = (raiseAmount / computedPostMoney) * 100;
      
      setPreMoney(targetPreMoney);
      setPostMoney(computedPostMoney);
      setActualDilution(computedDilution);
      
      assessSignal(targetPreMoney, computedDilution);
    } else {
      // Standard calculation: valuation from raise + dilution
      const dilutionPercent = dilution[0] / 100;
      const computedPreMoney = raiseAmount / dilutionPercent - raiseAmount;
      const computedPostMoney = computedPreMoney + raiseAmount;
      
      setPreMoney(computedPreMoney);
      setPostMoney(computedPostMoney);
      setActualDilution(dilution[0]);
      
      assessSignal(computedPreMoney, dilution[0]);
    }
  };

  const assessSignal = (valuation: number, dilutionPct: number) => {
    // EU Benchmarks: Pre-seed €2.5M-€6M, Seed €6M-€12M
    let signalLevel: SignalLevel = "realistic";
    let message = "";

    if (valuation < 2000000) {
      signalLevel = "conservative";
      message = "This valuation is below typical EU pre-seed norms. You may be leaving money on the table if your team and traction justify more.";
    } else if (valuation >= 2000000 && valuation <= 6000000) {
      signalLevel = "realistic";
      if (dilutionPct >= 10 && dilutionPct <= 20) {
        message = "This valuation is typical for strong pre-seed teams in Europe. Your dilution is within standard norms.";
      } else if (dilutionPct > 20) {
        message = "Valuation seems fair but you're diluting heavily. Consider raising more at a better valuation or reducing the round size.";
      } else {
        message = "You're diluting less than typical—this may signal strong positioning or unrealistic expectations. VCs will push back if traction doesn't match.";
      }
    } else if (valuation > 6000000 && valuation <= 12000000) {
      signalLevel = "realistic";
      if (dilutionPct >= 10 && dilutionPct <= 20) {
        message = "This valuation is aligned with EU seed-stage benchmarks. Make sure you have the ARR and team to back it up.";
      } else if (dilutionPct > 20) {
        message = "Seed-range valuation but high dilution. This may indicate bridge financing or market skepticism—investigate before proceeding.";
      } else {
        message = "Low dilution at seed stage. Either you're exceptionally strong, or VCs will interpret this as inflexibility.";
      }
    } else if (valuation > 12000000 && valuation <= 20000000) {
      signalLevel = "aggressive";
      message = "This valuation is above typical EU seed norms. You'll need exceptional traction, ARR growth, or marquee investors to justify this.";
    } else {
      signalLevel = "inflated";
      message = "This valuation is significantly inflated for EU early-stage standards. Expect serious investor pushback unless you're Series A-ready.";
    }

    setSignal(signalLevel);
    setInterpretation(message);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    }
    return `€${(value / 1000).toFixed(0)}k`;
  };

  const getSignalColor = () => {
    switch (signal) {
      case "conservative": return "bg-blue-500";
      case "realistic": return "bg-green-500";
      case "aggressive": return "bg-orange-500";
      case "inflated": return "bg-red-500";
    }
  };

  const getSignalIcon = () => {
    switch (signal) {
      case "conservative": return <AlertCircle className="w-5 h-5" />;
      case "realistic": return <CheckCircle2 className="w-5 h-5" />;
      case "aggressive": return <AlertTriangle className="w-5 h-5" />;
      case "inflated": return <XCircle className="w-5 h-5" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Article Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Euro className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">The Truth About Early-Stage Valuation</h1>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground">
              <p className="text-xl font-semibold text-primary">
                Stop guessing. Start understanding how VCs actually price your company.
              </p>

              <h2 className="text-2xl font-bold mt-8">How Valuation Really Works</h2>
              <p>
                Here's what most founders get wrong: valuation at pre-seed and seed is not determined by your five-year revenue projections, 
                your "market opportunity," or what you think you deserve. It's determined by <strong>dilution norms</strong>, <strong>risk assessment</strong>, 
                <strong>team credibility</strong>, and <strong>comparable rounds</strong>. In Europe, valuation ranges are narrower and more conservative 
                than in the US. Pre-seed valuations typically fall between <strong>€2.5M and €6M pre-money</strong>. Seed rounds usually sit 
                between <strong>€6M and €12M</strong>, depending on traction, team pedigree, and sector momentum.
              </p>

              <p>
                The fundamental logic is this: founders sell between <strong>10% and 20% of their company per round</strong>. This dilution expectation 
                implicitly defines your valuation. If you need €500k and VCs expect 15% dilution, your pre-money valuation is roughly €2.8M. 
                Not because you "earned" it, but because that's the math. Valuation follows capital needs and ownership structure—not the other way around.
              </p>

              <h2 className="text-2xl font-bold mt-8">The Mistakes Founders Make</h2>
              <p>
                Most valuation failures happen because founders don't understand the game. Here are the most common traps:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Anchoring on vanity metrics:</strong> Your Instagram followers don't translate into valuation. ARR does.</li>
                <li><strong>Ignoring dilution mechanics:</strong> Raising €1M at a €10M pre-money sounds impressive until you realize you just sold 9% and 
                set impossible Series A expectations.</li>
                <li><strong>Benchmarking to US valuations:</strong> European venture capital operates differently. Lower valuations ≠ worse terms. 
                It means realistic pricing and sustainable growth.</li>
                <li><strong>Back-solving from fantasy revenue:</strong> Claiming €50M ARR in year three doesn't justify a €20M valuation today if you 
                have zero customers.</li>
                <li><strong>Valuation shopping:</strong> Asking 30 VCs for offers and picking the highest bid signals desperation, not leverage.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8">Red Flags That Kill Deals</h2>
              <p>
                VCs won't always tell you why they passed. But if your valuation conversation includes any of these, expect radio silence:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Unrealistic comps:</strong> "We're the Uber of dog walking, so we should be valued like Uber" is not a comp.</li>
                <li><strong>Inflexibility on dilution:</strong> Refusing to dilute more than 8% at pre-seed signals ego over pragmatism.</li>
                <li><strong>Mismatched ambition:</strong> Raising €5M on a €50M valuation with no product is not "ambitious." It's delusional.</li>
                <li><strong>Market ignorance:</strong> Not knowing typical EU valuation ranges tells VCs you haven't done your homework.</li>
                <li><strong>Premature Series A positioning:</strong> Trying to raise pre-seed at Series A valuations because "we're moving fast" backfires.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8">What Actually Drives Valuation</h2>
              <p>
                If dilution norms set the framework, what moves the needle within that framework? Real signals:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Team pedigree:</strong> Ex-Stripe engineers or repeat founders command premium valuations.</li>
                <li><strong>Traction velocity:</strong> 30% month-over-month MRR growth justifies aggressive pricing.</li>
                <li><strong>Sector momentum:</strong> AI infrastructure in 2024 gets higher multiples than e-commerce logistics.</li>
                <li><strong>Capital efficiency:</strong> Reaching €500k ARR on €200k raised signals execution strength.</li>
                <li><strong>Market timing:</strong> Interest rates, IPO windows, and macro sentiment all affect pricing power.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8">The Bottom Line</h2>
              <p>
                Valuation is not a popularity contest. It's a negotiation grounded in ownership structure, risk mitigation, and comparable data. 
                European VCs don't overpay because hype isn't a sustainable investment thesis. If you want a higher valuation, <strong>earn it</strong> 
                by hitting milestones, proving repeatability, and reducing risk. Or accept that your current traction justifies a lower number and 
                focus on execution instead of vanity metrics.
              </p>

              <p className="text-lg font-semibold text-primary mt-8">
                Use the calculator below to understand what your fundraising plans actually imply—and whether VCs will take you seriously.
              </p>
            </div>
          </div>

          {/* Calculator Section */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Valuation Calculator</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT: Inputs */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Round Parameters</CardTitle>
                    <CardDescription>Enter your fundraising details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="raise">Amount to Raise (€)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">The total capital you plan to raise in this round.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="raise"
                        type="number"
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        min={0}
                        step={50000}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>Target Dilution</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Percentage of equity you're willing to sell. EU standard is 10-20% per round.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className="text-sm font-bold">{dilution[0]}%</span>
                      </div>
                      <Slider
                        value={dilution}
                        onValueChange={setDilution}
                        min={10}
                        max={25}
                        step={1}
                      />
                      <p className="text-xs text-muted-foreground">
                        EU norm: 10-20% per round. Above 20% signals weak negotiating position.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alternative Mode</CardTitle>
                    <CardDescription>Test a specific target valuation (optional)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="target">Target Pre-Money (€)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">If you have a target valuation in mind, enter it here. The calculator will compute implied dilution.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="target"
                        type="number"
                        placeholder="Leave empty for auto-calculation"
                        value={targetPreMoney || ""}
                        onChange={(e) => setTargetPreMoney(e.target.value ? Number(e.target.value) : null)}
                        min={0}
                        step={100000}
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional. Leave blank to calculate valuation based on raise + dilution.
                      </p>
                    </div>
                    {targetPreMoney && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setTargetPreMoney(null)}
                        className="w-full"
                      >
                        Clear Target Valuation
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT: Results */}
              <div className="space-y-6">
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">Calculated Valuation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pre-Money Valuation</p>
                      <p className="text-4xl font-bold text-primary">{formatCurrency(preMoney)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Post-Money</p>
                        <p className="text-xl font-bold">{formatCurrency(postMoney)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dilution</p>
                        <p className="text-xl font-bold">{actualDilution.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Market Signal</CardTitle>
                    <CardDescription>How VCs will likely interpret this valuation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${getSignalColor()} text-white`}>
                        {getSignalIcon()}
                      </div>
                      <div>
                        <Badge 
                          className={`${getSignalColor()} text-white border-0`}
                        >
                          {signal.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed">
                      {interpretation}
                    </p>

                    <div className="pt-4 border-t space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">EU BENCHMARKS</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>• Pre-seed: €2.5M – €6M pre-money</p>
                        <p>• Seed: €6M – €12M pre-money</p>
                        <p>• Dilution: 10% – 20% per round</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Reality Check</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">If your valuation is aggressive or inflated:</p>
                        <p className="text-muted-foreground">
                          Expect VCs to push back hard. You'll need exceptional traction, a world-class team, or sector momentum to justify it. 
                          Consider whether defending this number is worth losing momentum in your fundraise.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">If your valuation is realistic:</p>
                        <p className="text-muted-foreground">
                          You're in the right range. Focus on execution, narrative, and picking the right investors. A fair valuation accelerates 
                          fundraising and builds credibility for future rounds.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
