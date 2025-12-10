import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VCFundraisingCycles() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/vc-operations/fundraising-cycles");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-4">
        VC Fundraising Cycles: The Rhythm That Shapes Your Raise
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        VCs operate on predictable cycles. Understanding these patterns helps you time 
        your raise, interpret investor behavior, and anticipate pressure points.
      </p>

      <Callout type="info">
        <strong>The Core Insight:</strong> VCs are running their own fundraising process while 
        evaluating yours. Their fund's lifecycle directly impacts how they engage with founders—
        from appetite for risk to urgency around exits.
      </Callout>

      {/* The Four Phases */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">The Four Phases of a VC Fund</h2>
        
        <div className="space-y-6">
          {/* Phase 1: Fundraising */}
          <Card className="p-6 bg-card border-border overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Fundraising Phase</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Duration:</strong> 12-24 months | <strong>Fund Years:</strong> -1 to 0
                </p>
                <p className="text-muted-foreground mb-4">
                  VCs are pitching LPs, presenting their thesis, and proving their track record. 
                  They're essentially running their own startup—with pitch decks, roadshows, and 
                  extensive due diligence from institutional investors.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">What VCs Are Doing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Meeting with LP prospects globally</li>
                      <li>• Preparing quarterly LP reports</li>
                      <li>• Updating track record materials</li>
                      <li>• Negotiating fund terms (fees, carry)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Impact on Founders</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Partners may be distracted/traveling</li>
                      <li>• Slower decision-making</li>
                      <li>• May do smaller checks from old fund</li>
                      <li>• Looking for "proof points" for LP deck</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Phase 2: Investing */}
          <Card className="p-6 bg-card border-border overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Investment Period</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Duration:</strong> 3-5 years | <strong>Fund Years:</strong> 1-4
                </p>
                <p className="text-muted-foreground mb-4">
                  The active deployment phase. VCs must invest 70-80% of their fund during this 
                  window. This is when they're hungriest for deals and most responsive to founders.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">What VCs Are Doing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Actively sourcing deals</li>
                      <li>• Taking board seats</li>
                      <li>• Building portfolio momentum</li>
                      <li>• Reserving capital for follow-ons</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Impact on Founders</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Most receptive period for pitches</li>
                      <li>• Faster decisions (deployment pressure)</li>
                      <li>• Competitive for hot deals</li>
                      <li>• May push for larger ownership</li>
                    </ul>
                  </div>
                </div>
                <Callout type="success">
                  <strong>Best Time to Pitch:</strong> Years 1-3 of a fund's investment period. 
                  VCs have fresh capital, high energy, and mandate to deploy.
                </Callout>
              </div>
            </div>
          </Card>

          {/* Phase 3: Portfolio Management */}
          <Card className="p-6 bg-card border-border overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Portfolio Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Duration:</strong> 3-5 years | <strong>Fund Years:</strong> 3-8
                </p>
                <p className="text-muted-foreground mb-4">
                  New investments slow as VCs focus on supporting existing portfolio companies. 
                  Follow-on capital is reserved for winners. Underperformers get less attention.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">What VCs Are Doing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Board meetings and governance</li>
                      <li>• Helping with follow-on rounds</li>
                      <li>• Making strategic intros</li>
                      <li>• Triaging portfolio (winners vs. others)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Impact on Founders</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Winning companies get more support</li>
                      <li>• Struggling companies get less time</li>
                      <li>• Pressure to hit next milestone</li>
                      <li>• May introduce to later-stage VCs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Phase 4: Harvest/Exit */}
          <Card className="p-6 bg-card border-border overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Harvest/Exit Period</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Duration:</strong> 2-4 years | <strong>Fund Years:</strong> 7-12
                </p>
                <p className="text-muted-foreground mb-4">
                  VCs push for liquidity through IPOs, M&A, or secondary sales. LPs want returns 
                  distributed. The fund must return capital before it expires.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">What VCs Are Doing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pushing for exits (M&A, IPO)</li>
                      <li>• Running secondary processes</li>
                      <li>• Winding down underperformers</li>
                      <li>• Preparing final LP reports</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Impact on Founders</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pressure to sell or go public</li>
                      <li>• May prefer "good exit" over "great build"</li>
                      <li>• Conflicting timelines with founders</li>
                      <li>• Secondary transactions introduced</li>
                    </ul>
                  </div>
                </div>
                <Callout type="warning">
                  <strong>Watch Out:</strong> VCs in harvest mode may push for exits that optimize 
                  fund returns, not founder outcomes. Know your investor's fund vintage.
                </Callout>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Consequences for Founders */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How Fund Cycles Affect Your Startup</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">During Your Fundraise</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Early fund:</strong> More willing to take risk on unproven models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Mid fund:</strong> Looking for portfolio fit, less experimentation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Late fund:</strong> Only doing follow-ons, not new investments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Between funds:</strong> Distracted, slower decisions</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">During Your Growth</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Years 1-3:</strong> Active support, introductions, engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Years 4-6:</strong> Support shifts to top performers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>Years 7+:</strong> Exit conversations intensify</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">→</span>
                <span><strong>New fund raised:</strong> Attention splits to new portfolio</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Strategic Timing */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Strategic Timing: When to Approach VCs</h2>

        <ComparisonTable
          good={[
            "Fund raised in last 18 months (fresh capital, high energy)",
            "Q1-Q2 (beginning of year, budgets reset)",
            "After a notable exit (partners in good mood)",
            "When they're actively blogging/speaking (engagement signal)",
            "Post their portfolio company's success (momentum)",
            "When you have leverage (multiple interested parties)"
          ]}
          bad={[
            "Fund raising new vehicle (partners distracted)",
            "Q4 November-December (holiday slowdown, LP reports)",
            "Summer months (vacation, slower decisions)",
            "Right after a failed investment (defensive mindset)",
            "When fund is 80%+ deployed (limited capacity)",
            "When your metrics are declining (wait for inflection)"
          ]}
        />
      </section>

      {/* Questions to Ask */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Questions to Ask About Fund Status</h2>
        <p className="text-muted-foreground mb-6">
          These questions help you understand where a VC sits in their cycle—and how that 
          affects their ability and willingness to invest.
        </p>

        <Checklist items={[
          "What year of the fund are you investing from?",
          "How much of this fund have you deployed?",
          "What's your typical reserve strategy for follow-ons?",
          "Are you actively raising your next fund?",
          "How many new investments do you plan this year?",
          "What's your average hold period for portfolio companies?",
          "How do you think about exit timelines with founders?"
        ]} />
      </section>

      {/* The Overlap Challenge */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The Multi-Fund Reality</h2>
        <p className="text-muted-foreground mb-6">
          Most established VCs manage multiple funds simultaneously. This creates complexity 
          for founders to understand.
        </p>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <h3 className="text-lg font-bold text-foreground mb-4">Typical VC Fund Stack</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
              <div className="w-20 text-center">
                <span className="text-xs text-muted-foreground">Fund V</span>
                <div className="h-2 bg-blue-500 rounded-full mt-1"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-foreground">Fundraising</span>
                <p className="text-xs text-muted-foreground">Partners focused on LP meetings</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
              <div className="w-20 text-center">
                <span className="text-xs text-muted-foreground">Fund IV</span>
                <div className="h-2 bg-green-500 rounded-full mt-1"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-foreground">Active Investing</span>
                <p className="text-xs text-muted-foreground">Writing new checks, board seats</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
              <div className="w-20 text-center">
                <span className="text-xs text-muted-foreground">Fund III</span>
                <div className="h-2 bg-yellow-500 rounded-full mt-1"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-foreground">Portfolio Management</span>
                <p className="text-xs text-muted-foreground">Supporting companies, follow-ons</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
              <div className="w-20 text-center">
                <span className="text-xs text-muted-foreground">Fund II</span>
                <div className="h-2 bg-purple-500 rounded-full mt-1"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-foreground">Harvest Mode</span>
                <p className="text-xs text-muted-foreground">Pushing for exits, returning capital</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Key Insight:</strong> When talking to a VC, clarify which fund they'd 
            invest from. A partner managing 4 funds has very different capacity than one 
            focused on a single new fund.
          </p>
        </Card>
      </section>

      {/* The Founder Bottom Line */}
      <section className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">The Bottom Line for Founders</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">VCs are not neutral evaluators.</strong> They're 
              fund managers with their own pressures, timelines, and constraints. Understanding 
              this doesn't make them adversaries—it makes you a more strategic fundraiser.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Do This</h4>
                <ul className="text-sm space-y-1">
                  <li>• Research fund vintage before meetings</li>
                  <li>• Ask about deployment and reserves</li>
                  <li>• Time your raise to fund cycles</li>
                  <li>• Understand exit pressure timelines</li>
                </ul>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Avoid This</h4>
                <ul className="text-sm space-y-1">
                  <li>• Assuming all VCs operate the same</li>
                  <li>• Ignoring fund stage in targeting</li>
                  <li>• Taking passes personally</li>
                  <li>• Being surprised by exit pressure</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <div className="mt-12 flex justify-center">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your Investment Memo
        </Button>
      </div>
    </ContentBlock>
  );
}