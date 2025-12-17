import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LimitedPartners() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/vc-operations/limited-partners");
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
        Limited Partners: The Investors Behind Your Investors
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Understanding who funds VCs—and why it shapes every investment decision they make about your startup.
      </p>

      <Callout type="info">
        <strong>The Hidden Truth:</strong> VCs are not spending their own money. They are fund managers 
        under enormous pressure from their own investors. Understanding this dynamic is crucial for 
        founders who want to navigate fundraising strategically.
      </Callout>

      {/* What Are Limited Partners */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What Are Limited Partners?</h2>
        <p className="text-muted-foreground mb-6">
          Limited Partners (LPs) are the institutions and individuals who provide capital to venture capital funds. 
          They are called "limited" because their liability is limited to their investment—they don't make 
          investment decisions or manage the fund.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Institutional LPs</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Pension Funds:</strong> CalPERS, Teacher retirement systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>University Endowments:</strong> Yale, Harvard, Stanford</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Sovereign Wealth Funds:</strong> Government investment vehicles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Insurance Companies:</strong> Seeking long-term returns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Family Offices:</strong> Wealthy family investment arms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Fund of Funds:</strong> Firms that invest in multiple VC funds</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Individual LPs</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>High Net Worth Individuals:</strong> Accredited investors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Successful Entrepreneurs:</strong> Founders who exited</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>GP Personal Capital:</strong> The VCs themselves invest</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Most funds require GPs to invest 1-5% of the fund size 
                with their own money. This "skin in the game" aligns GP and LP interests.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Why LPs Matter to Founders */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why LPs Matter to You as a Founder</h2>
        
        <Callout type="warning">
          <strong>Critical Insight:</strong> When a VC says "we need to see more traction" or "the 
          valuation doesn't work for us," they're often translating LP pressure into founder-facing language. 
          The constraints are real—just not always explained.
        </Callout>

        <div className="space-y-6 mt-6">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary rounded-r-lg">
            <h3 className="text-lg font-bold text-foreground mb-2">1. Return Expectations Shape Everything</h3>
            <p className="text-muted-foreground">
              LPs expect 3x net returns on their VC allocation. This means VCs need portfolio companies 
              that can return 10-100x to offset the failures. If your startup can't theoretically 
              become a billion-dollar outcome, most institutional VCs literally cannot invest—regardless 
              of how much they like you.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary rounded-r-lg">
            <h3 className="text-lg font-bold text-foreground mb-2">2. Fund Timelines Create Urgency</h3>
            <p className="text-muted-foreground">
              VC funds typically have 10-year lifespans with extensions. VCs must show LPs progress 
              through markups and eventually exits. A company that's "doing fine" but not growing 
              explosively becomes a problem—not because it's bad, but because it doesn't fit the 
              return profile LPs expect.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary rounded-r-lg">
            <h3 className="text-lg font-bold text-foreground mb-2">3. LP Reporting Drives Behavior</h3>
            <p className="text-muted-foreground">
              VCs report to LPs quarterly. They need to show activity, progress, and portfolio updates. 
              This creates pressure to deploy capital, announce deals, and demonstrate momentum. 
              Understanding this helps you time your fundraise and communications.
            </p>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary rounded-r-lg">
            <h3 className="text-lg font-bold text-foreground mb-2">4. LP Mandates Restrict Flexibility</h3>
            <p className="text-muted-foreground">
              Many LPs have specific mandates: only invest in climate tech, only Series A, only 
              in certain geographies. VCs must honor these constraints. A VC might love your 
              company but be structurally unable to invest if it doesn't fit LP guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* The VC Fund Lifecycle */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The VC Fund Lifecycle: What It Means for Founders</h2>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20"></div>
          
          <div className="space-y-8 ml-12">
            <div className="relative">
              <div className="absolute -left-12 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">1</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Fundraising Phase (Year 0-1)</h3>
                <p className="text-muted-foreground mb-3">
                  VCs spend 12-18 months raising their fund from LPs. During this time, they're 
                  pitching their own track record and strategy.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground font-medium">Impact on Founders:</p>
                  <p className="text-sm text-muted-foreground">
                    VCs in fundraising mode may delay commitments, provide smaller checks, or 
                    be distracted. They're essentially running their own startup.
                  </p>
                </div>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -left-12 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">2</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Investment Period (Years 1-4)</h3>
                <p className="text-muted-foreground mb-3">
                  The "deployment" phase where VCs actively make new investments. They typically 
                  must deploy 70-80% of the fund in this window.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground font-medium">Impact on Founders:</p>
                  <p className="text-sm text-muted-foreground">
                    This is when VCs are most eager to invest. End of investment period creates 
                    pressure to deploy—sometimes leading to faster decisions.
                  </p>
                </div>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -left-12 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">3</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Value Creation (Years 3-7)</h3>
                <p className="text-muted-foreground mb-3">
                  VCs support portfolio companies, reserve capital for follow-ons, and work 
                  toward exits. New investments slow dramatically.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground font-medium">Impact on Founders:</p>
                  <p className="text-sm text-muted-foreground">
                    VCs from older funds may not lead new rounds but could participate in 
                    follow-ons. They're focused on existing portfolio, not new deals.
                  </p>
                </div>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -left-12 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">4</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Harvest Period (Years 7-10+)</h3>
                <p className="text-muted-foreground mb-3">
                  The exit phase. VCs push for liquidity through IPOs, M&A, or secondary sales 
                  to return capital to LPs.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground font-medium">Impact on Founders:</p>
                  <p className="text-sm text-muted-foreground">
                    VCs may pressure for exits that benefit fund returns, even if founders 
                    prefer to keep building. Understanding this tension is critical.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How LP Pressure Manifests */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How LP Pressure Shows Up in Your Fundraise</h2>

        <ComparisonTable
          good={[
            "VC explains fund stage and how you fit their strategy",
            "Transparent about check size constraints",
            "Clear on timeline and decision process",
            "Honest about what would make this investable",
            "Introduces you to better-fit funds when passing"
          ]}
          bad={[
            "Vague 'we need more traction' without specifics",
            "Ghosting after multiple positive meetings",
            "Changing terms or valuation expectations suddenly",
            "Pressure to close faster than comfortable",
            "Pushing for control terms beyond market norms"
          ]}
        />

        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30 mt-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Red Flags: When LP Pressure Creates Problems</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-destructive">⚠️</span>
              <span><strong>Fund is near end of investment period:</strong> May invest hastily or with aggressive terms to deploy remaining capital</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">⚠️</span>
              <span><strong>VC is raising a new fund:</strong> Your success becomes a marketing tool; they may push for premature metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">⚠️</span>
              <span><strong>Fund is underperforming:</strong> Pressure for quick wins can lead to short-term thinking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">⚠️</span>
              <span><strong>LP concentration risk:</strong> If one LP dominates, their agenda may override good judgment</span>
            </li>
          </ul>
        </Card>
      </section>

      {/* Questions to Ask VCs */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Questions to Ask VCs About Their Fund</h2>
        <p className="text-muted-foreground mb-6">
          Smart founders do reverse due diligence. These questions help you understand the 
          constraints and incentives your potential investor operates under.
        </p>

        <Checklist items={[
          "What year of the fund are you in?",
          "How much of the fund have you deployed?",
          "What's your typical follow-on reserve strategy?",
          "When are you planning to raise your next fund?",
          "What percentage do GPs commit personally?",
          "Who are your anchor LPs (if you can share)?",
          "What's your fund's typical hold period?",
          "How do you think about exits for portfolio companies?"
        ]} />

        <Callout type="success">
          <strong>Pro Tip:</strong> VCs who openly discuss fund dynamics are usually more 
          transparent partners. Evasiveness here often signals evasiveness elsewhere.
        </Callout>
      </section>

      {/* Strategic Implications */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Strategic Implications for Founders</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Timing Your Raise</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Target funds in years 1-3 (active deployment)</li>
              <li>• Avoid funds raising their next vehicle (distracted GPs)</li>
              <li>• End of fund deployment = potential urgency (use carefully)</li>
              <li>• Q4 can be slow due to LP reporting cycles</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Choosing Investors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• New funds may be hungrier but less experienced</li>
              <li>• Established funds have LP relationships that help</li>
              <li>• Check if LP base aligns with your industry</li>
              <li>• Consider GP commitment level (skin in the game)</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Negotiating Terms</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Understand that some terms are LP-mandated</li>
              <li>• Liquidation preferences often non-negotiable</li>
              <li>• Information rights protect LP transparency</li>
              <li>• Anti-dilution is standard, not personal</li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Building Relationships</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Some LPs make direct co-investments</li>
              <li>• Family offices may invest at multiple stages</li>
              <li>• Corporate LPs can become customers/partners</li>
              <li>• Endowments often have founder networks</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* The Founder Perspective */}
      <section className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">The Bottom Line for Founders</h2>
          <p className="text-muted-foreground mb-6">
            VCs are not your friends, and they're not your enemies. They're fund managers with 
            a fiduciary duty to their LPs. Understanding this doesn't make them adversaries—it 
            makes you a more informed partner.
          </p>
          <div className="space-y-4">
            <p className="text-foreground">
              <strong>When a VC passes:</strong> It's often about fund fit, not company quality.
            </p>
            <p className="text-foreground">
              <strong>When a VC pushes for exits:</strong> They're responding to LP timeline pressure.
            </p>
            <p className="text-foreground">
              <strong>When terms feel aggressive:</strong> Some are LP-mandated, others negotiable.
            </p>
            <p className="text-foreground">
              <strong>When you get a quick yes:</strong> Check if deployment pressure is driving speed.
            </p>
          </div>
        </Card>
      </section>

      <div className="mt-12 flex justify-center">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your VC Analysis
        </Button>
      </div>
    </ContentBlock>
  );
}