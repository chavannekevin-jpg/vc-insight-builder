import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  Calendar,
  Percent,
  Euro
} from "lucide-react";

export default function RaiseEducation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <Calculator className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">The Milestone-Driven Fundraising Model</h1>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Stop guessing. Learn how European VCs calculate what you should raise — and why valuation at pre-seed and seed is driven by dilution norms, not fantasy multiples.
          </p>
        </div>

        {/* Core Concept */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              What This Model Actually Does
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Determining your round size isn't arbitrary. It's a function of <span className="font-bold">operational burn</span>, <span className="font-bold">hiring plans</span>, <span className="font-bold">one-off costs</span>, <span className="font-bold">revenue timing</span>, and <span className="font-bold">market-specific risk</span>. This model helps you calculate exactly how much capital you need to reach your next fundable milestone — not just survive.
            </p>
            <p className="text-foreground leading-relaxed">
              European pre-seed and seed rounds follow predictable patterns. Founders typically raise for <span className="font-bold text-primary">12 to 18 months of runway</span>. The goal isn't to extend survival — it's to hit the milestones that unlock the next round.
            </p>
          </CardContent>
        </Card>

        {/* Milestone Logic */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Milestone-Driven, Not Survival-Driven
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">Pre-Seed</Badge>
                  <div>
                    <p className="font-semibold mb-1">Goal: MVP + Early Traction</p>
                    <p className="text-sm text-muted-foreground">
                      Complete your MVP, secure your first paying customers, and prove the core value proposition works.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">Seed</Badge>
                  <div>
                    <p className="font-semibold mb-1">Goal: Repeatability + ARR Benchmark</p>
                    <p className="text-sm text-muted-foreground">
                      Demonstrate repeatable sales motion and hit an ARR target of <span className="font-bold">€700k–€1.2M</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg mt-6">
              <p className="text-sm text-foreground">
                <AlertCircle className="w-4 h-4 inline mr-2 text-orange-500" />
                <span className="font-semibold">The ARR benchmark matters.</span> Most European seed investors expect to see €700k–€1.2M ARR as a baseline before they'll seriously consider writing a check. This tool embeds that target to help you aim for a realistic next-round objective.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dilution Standards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              European Dilution Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              In the EU, founders are expected to dilute between <span className="font-bold text-primary">10% and 20% per round</span>. This isn't negotiable — it's market standard. Your dilution percentage implicitly defines your valuation range.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">10% Dilution</span>
                </div>
                <p className="text-xs text-muted-foreground">Lower dilution = higher valuation, but you raise less capital relative to your needs.</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">15% Dilution</span>
                </div>
                <p className="text-xs text-muted-foreground">Sweet spot for most pre-seed and seed rounds. Balanced ownership and capital.</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">20% Dilution</span>
                </div>
                <p className="text-xs text-muted-foreground">Higher dilution = lower valuation, but you secure more capital to de-risk execution.</p>
              </div>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg mt-6">
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Valuation is a Function of Dilution
              </p>
              <p className="text-sm text-muted-foreground">
                At pre-seed and seed, your valuation is driven by ownership norms and milestone credibility — not by revenue multiples or fantasy models. The calculator will show you the implied pre-money valuation based on your selected dilution.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              What You'll Provide in the Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">Operational Burn</p>
                    <p className="text-xs text-muted-foreground">Monthly expenses and projected burn rate</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">Hiring Plans</p>
                    <p className="text-xs text-muted-foreground">Expected team growth and costs</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">One-Off Costs</p>
                    <p className="text-xs text-muted-foreground">Legal, compliance, equipment, etc.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">Revenue Expectations</p>
                    <p className="text-xs text-muted-foreground">When revenue starts and projected MRR growth</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">ARR Target</p>
                    <p className="text-xs text-muted-foreground">Your seed round ARR goal (default €700k–€1.2M)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">Milestone Goal</p>
                    <p className="text-xs text-muted-foreground">MVP, first customers, traction, or repeatability</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">Market Risk</p>
                    <p className="text-xs text-muted-foreground">B2B SaaS, Fintech, Deeptech, Health, Hardware, Consumer</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-semibold text-sm">Dilution Preference</p>
                    <p className="text-xs text-muted-foreground">10%–20% to calculate implied valuation</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-3">Ready to Calculate?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get your recommended raise amount, implied valuation, and milestone readiness in seconds. All calculations happen in real time.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/raise-calculator")}
            className="gradient-primary shadow-glow hover-neon-pulse font-bold"
          >
            Open the Raise Estimator
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
