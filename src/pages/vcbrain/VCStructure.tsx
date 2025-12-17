import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VCStructure() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/how-vcs-work/structure");
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
        Inside a VC Firm: Structure, Roles & Decision-Making
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Understanding who does what at a VC firm helps you navigate conversations, 
        set realistic expectations, and build relationships strategically.
      </p>

      <Callout type="info">
        <strong>Why This Matters:</strong> The person you're talking to determines what 
        can happen next. An enthusiastic analyst can't write a check; a distracted partner 
        can still say yes. Know who has what power.
      </Callout>

      {/* The VC Hierarchy */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">The VC Firm Hierarchy</h2>
        
        <div className="space-y-6">
          {/* Managing Partner / General Partner */}
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-transparent border-primary/30">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                GP
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">General Partner (GP)</h3>
                <p className="text-sm text-primary font-medium mb-3">Decision-Maker</p>
                <p className="text-muted-foreground mb-4">
                  The ultimate decision-makers. GPs raise the fund from LPs, make final investment 
                  decisions, take board seats, and are legally responsible for the fund.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What They Can Do:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Approve investments unilaterally (small checks) or via IC</li>
                      <li>• Set terms and valuations</li>
                      <li>• Commit to board seats</li>
                      <li>• Champion deals through IC</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Compensation:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Management fee share (2% of fund)</li>
                      <li>• Carried interest (20% of profits)</li>
                      <li>• Personal investment in fund (1-5%)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Partner */}
          <Card className="p-6 bg-gradient-to-r from-primary/15 to-transparent border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/80 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                P
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Partner</h3>
                <p className="text-sm text-primary font-medium mb-3">Senior Decision-Maker</p>
                <p className="text-muted-foreground mb-4">
                  Senior investors who source deals, lead due diligence, and sponsor investments 
                  to IC. May or may not have full GP economics depending on tenure.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What They Can Do:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Lead deals and take board seats</li>
                      <li>• Vote in investment committee</li>
                      <li>• Negotiate terms with founders</li>
                      <li>• Represent firm externally</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Common Paths to Partner:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Internal promotion (Associate → Principal → Partner)</li>
                      <li>• Successful founder joins as Partner</li>
                      <li>• Lateral hire from another firm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Principal */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/60 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                Pr
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Principal</h3>
                <p className="text-sm text-muted-foreground font-medium mb-3">Senior Associate / Pre-Partner</p>
                <p className="text-muted-foreground mb-4">
                  Experienced investors on the path to Partner. They lead deals but typically 
                  need partner sponsorship for IC. Often the most active in sourcing.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What They Can Do:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Source and champion deals</li>
                      <li>• Lead due diligence</li>
                      <li>• May have small check authority ($50-100K)</li>
                      <li>• Take observer board seats</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What They Can't Do:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Unilaterally approve large investments</li>
                      <li>• Set fund strategy</li>
                      <li>• Full carry participation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Senior Associate / Associate */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-muted-foreground font-bold text-lg shrink-0">
                SA
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Senior Associate / Associate</h3>
                <p className="text-sm text-muted-foreground font-medium mb-3">Investment Team</p>
                <p className="text-muted-foreground mb-4">
                  Junior investors who screen inbound, support due diligence, and help Partners 
                  manage portfolio. Often your first point of contact.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What They Can Do:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Advance you to partner meetings</li>
                      <li>• Conduct initial research</li>
                      <li>• Provide feedback on deck/pitch</li>
                      <li>• Block deals (by not advancing)</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What They Can't Do:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Make investment decisions</li>
                      <li>• Commit to terms</li>
                      <li>• Take board seats</li>
                      <li>• Override partner decisions</li>
                    </ul>
                  </div>
                </div>
                <Callout type="warning">
                  <strong>Key Insight:</strong> Associates can't say yes, but they can say no. 
                  Treat them respectfully—they control access to partners.
                </Callout>
              </div>
            </div>
          </Card>

          {/* Analyst */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground font-bold text-lg shrink-0">
                An
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Analyst</h3>
                <p className="text-sm text-muted-foreground font-medium mb-3">Research & Support</p>
                <p className="text-muted-foreground mb-4">
                  Entry-level role focused on market research, financial modeling, and supporting 
                  the investment team. Often right out of undergrad or MBA.
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Typical Responsibilities:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Market sizing and research</li>
                    <li>• Competitive analysis</li>
                    <li>• Financial model review</li>
                    <li>• Portfolio reporting support</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Non-Investment Roles */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Non-Investment Roles</h2>
        <p className="text-muted-foreground mb-6">
          Many VC firms have substantial non-investment teams. These roles don't make 
          investment decisions but can influence and support your journey.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Scouts</h3>
            <p className="text-muted-foreground text-sm mb-4">
              External operators (often founders) who get paid to refer deals. May have 
              small check authority ($25-100K).
            </p>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Value to you:</strong> Warm intro and insider perspective on firm. 
                But remember, they can't make investment decisions.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Venture Partners</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Part-time investors (executives, operators) who source deals in their domain 
              and may take board roles.
            </p>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Value to you:</strong> Deep domain expertise, may sponsor deals, 
                but need GP approval for investments.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Platform Team</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Non-investment staff who support portfolio companies: recruiting, marketing, 
              operations, finance.
            </p>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Value to you:</strong> Post-investment support. A strong platform 
                team is a real differentiator.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Operations / Back Office</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Fund administration, legal, finance, and LP relations. They keep the fund 
              running but don't engage with founders.
            </p>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Value to you:</strong> Limited direct contact, but they process 
                your wire transfers.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Decision-Making Authority */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Decision-Making Authority</h2>
        
        <Card className="p-6 bg-card border-border mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Who Can Say Yes?</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Small checks ($25-100K)</span>
              <span className="text-muted-foreground">Individual GP, sometimes Principal</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Standard deals ($100K-2M)</span>
              <span className="text-muted-foreground">Investment Committee (majority or consensus)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Large deals ($2M+)</span>
              <span className="text-muted-foreground">Full partnership consensus, often unanimous</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Follow-on investments</span>
              <span className="text-muted-foreground">Lead partner + IC approval</span>
            </div>
          </div>
        </Card>

        <ComparisonTable
          good={[
            "Ask who makes the investment decision for your deal size",
            "Build relationships with multiple people at the firm",
            "Treat associates with respect—they control access",
            "Ask about the IC process and typical timeline",
            "Understand who would take the board seat"
          ]}
          bad={[
            "Assume the first person you meet can write the check",
            "Bypass associates to reach partners (disrespectful)",
            "Ignore platform team who could help post-investment",
            "Push for faster decisions without understanding process",
            "Treat junior team members dismissively"
          ]}
        />
      </section>

      {/* Firm Types */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Types of VC Firms</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Solo GP / Micro VC</h3>
            <p className="text-muted-foreground text-sm mb-4">
              One or two partners with smaller funds ($10-50M). Faster decisions, 
              more personal, but limited follow-on capacity.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Structure:</strong> GP + maybe 1 analyst. Quick IC = just the GP.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Multi-Stage Platform</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Large firms ($500M-$5B+) investing across stages. More resources, 
              but more process and potentially less attention.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Structure:</strong> 5-15 partners, 10-30 investment team, large platform.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Seed Specialist</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Focused on early stage ($50-150M funds). High volume, smaller checks, 
              less hands-on post-investment.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Structure:</strong> 2-4 partners, lean team, fast decisions.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Corporate VC (CVC)</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Investment arm of large corporations. Strategic value but potential 
              conflicts and slower decisions.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Structure:</strong> May require corporate approval above IC.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Strategic Implications */}
      <section className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Strategic Takeaways</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Always identify the decision-maker.</strong> Ask 
              early: "Who would need to approve this investment, and what does that process look like?"
            </p>
            <p>
              <strong className="text-foreground">Build broad relationships.</strong> The associate 
              today might be a partner in 5 years. The platform team might save your company.
            </p>
            <p>
              <strong className="text-foreground">Understand the IC dynamic.</strong> A deal needs 
              a champion (usually a Partner) who will fight for you in IC.
            </p>
            <p>
              <strong className="text-foreground">Match firm type to your needs.</strong> Solo GPs 
              for speed and attention; large firms for resources and follow-on.
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