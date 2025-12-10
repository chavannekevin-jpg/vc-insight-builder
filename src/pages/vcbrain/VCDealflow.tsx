import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VCDealflow() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/how-vcs-work/dealflow");
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
        Dealflow, Scouting & Sourcing: How VCs Find Startups
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Understanding how VCs discover and evaluate deals helps you position yourself 
        to be found—and to stand out when you are.
      </p>

      <Callout type="info">
        <strong>The Sourcing Reality:</strong> Top-tier VCs see 3,000-5,000 companies per year 
        and invest in 10-20. Understanding their discovery process helps you engineer 
        warm introductions and avoid the cold email graveyard.
      </Callout>

      {/* How VCs Source Deals */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The Dealflow Pyramid</h2>
        <p className="text-muted-foreground mb-6">
          VCs categorize incoming deals by source quality. Your path to a meeting depends 
          on which tier you enter from.
        </p>

        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-r from-primary/20 to-transparent border-primary/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">1</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Portfolio Founder Referrals</h3>
                <p className="text-sm text-muted-foreground">
                  The highest quality source. When a successful portfolio founder recommends 
                  another founder, VCs pay immediate attention. These get meetings within days.
                </p>
                <div className="mt-2 text-xs text-primary font-medium">~90% response rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-primary/15 to-transparent border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold">2</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Co-Investor & Partner Referrals</h3>
                <p className="text-sm text-muted-foreground">
                  Referrals from other VCs, angels, or trusted advisors in their network. 
                  These carry social proof and professional reputation.
                </p>
                <div className="mt-2 text-xs text-primary font-medium">~70% response rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/60 rounded-full flex items-center justify-center text-primary-foreground font-bold">3</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Proactive Outbound by VC</h3>
                <p className="text-sm text-muted-foreground">
                  VCs actively scout for deals through Twitter, Product Hunt, conferences, 
                  university networks, and industry research. Being visible matters.
                </p>
                <div className="mt-2 text-xs text-primary font-medium">VC-initiated contact</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-muted/50 to-transparent border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold">4</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Warm Introductions (Indirect)</h3>
                <p className="text-sm text-muted-foreground">
                  Connections through LinkedIn, mutual contacts, or weak ties. Better than 
                  cold outreach but less compelling than strong referrals.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">~30-40% response rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-muted/30 to-transparent border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground font-bold">5</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Cold Inbound</h3>
                <p className="text-sm text-muted-foreground">
                  Direct emails, contact forms, or DMs without introduction. Most are ignored, 
                  but exceptional pitches occasionally break through.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">~2-5% response rate</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* VC Scouting Teams */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How VC Scouting Works</h2>
        <p className="text-muted-foreground mb-6">
          Many VCs employ scouts, venture partners, or dedicated sourcing teams. Understanding 
          these roles helps you navigate initial conversations.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Scouts</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Independent operators (often founders or executives) paid to refer deals. 
              They typically get small check-writing authority ($25K-$100K).
            </p>
            <div className="space-y-2">
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can do:</span>
                <span className="text-muted-foreground"> Make intros, provide initial feedback</span>
              </div>
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can't do:</span>
                <span className="text-muted-foreground"> Lead rounds, commit firm capital</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Venture Partners</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Part-time investors (often experienced operators or executives) who source 
              deals in their domain and may take board seats.
            </p>
            <div className="space-y-2">
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can do:</span>
                <span className="text-muted-foreground"> Sponsor deals, join boards, champion you</span>
              </div>
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can't do:</span>
                <span className="text-muted-foreground"> Unilaterally approve investments</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Analysts & Associates</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Junior team members who screen inbound, conduct research, and prepare 
              materials for partner review. First point of contact for many founders.
            </p>
            <div className="space-y-2">
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can do:</span>
                <span className="text-muted-foreground"> Advance you to partner meetings</span>
              </div>
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can't do:</span>
                <span className="text-muted-foreground"> Make investment decisions</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Platform Teams</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Non-investment staff focused on portfolio support (recruiting, marketing, etc.). 
              They sometimes surface deals from their networks.
            </p>
            <div className="space-y-2">
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can do:</span>
                <span className="text-muted-foreground"> Internal referrals, showcase portfolio</span>
              </div>
              <div className="p-2 bg-muted/30 rounded text-sm">
                <span className="text-foreground font-medium">What they can't do:</span>
                <span className="text-muted-foreground"> Invest, make partner intros directly</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* What a First Conversation Looks Like */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What Speaking to a VC Looks Like</h2>
        <p className="text-muted-foreground mb-6">
          Understanding the typical meeting progression helps you prepare appropriately 
          for each stage.
        </p>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20"></div>
          
          <div className="space-y-8">
            <div className="relative pl-20">
              <div className="absolute left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">First Call (15-30 min)</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Usually with analyst/associate. Quick overview: What do you do? Why now? 
                  What's traction? Why you?
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">They're evaluating:</p>
                  <p className="text-xs text-muted-foreground">Can I understand this quickly? Is this in our thesis? Is there enough here for a partner meeting?</p>
                </div>
              </Card>
            </div>

            <div className="relative pl-20">
              <div className="absolute left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">2</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Partner Meeting (45-60 min)</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Deeper dive with decision-makers. Full pitch, Q&A, discussion of market, 
                  team, and competition.
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">They're evaluating:</p>
                  <p className="text-xs text-muted-foreground">Is this founder compelling? Can this be huge? What are the risks? Would I fight for this in IC?</p>
                </div>
              </Card>
            </div>

            <div className="relative pl-20">
              <div className="absolute left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Follow-Up Deep Dive</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Technical/product deep dive, customer references, financial model review, 
                  team interviews.
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">They're evaluating:</p>
                  <p className="text-xs text-muted-foreground">Does this hold up under scrutiny? What do customers actually say? Can this team execute?</p>
                </div>
              </Card>
            </div>

            <div className="relative pl-20">
              <div className="absolute left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">4</div>
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-2">Investment Committee</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Sponsoring partner presents to full partnership. You may or may not attend.
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">They're evaluating:</p>
                  <p className="text-xs text-muted-foreground">Should we commit capital? What are terms? How does this fit portfolio? Who takes the board?</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Found */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How to Get Found by VCs</h2>

        <ComparisonTable
          good={[
            "Build relationships with portfolio founders in your space",
            "Be visible: write content, speak at events, ship publicly",
            "Get warm intros from angels who've invested",
            "Engage authentically with VCs on Twitter/LinkedIn",
            "Apply to accelerators VCs scout from (YC, Techstars)",
            "Win competitions or get press that VCs track"
          ]}
          bad={[
            "Spray-and-pray cold emails to 200 VCs",
            "Generic 'I'd love to pick your brain' messages",
            "Requesting coffee without clear ask or context",
            "Pitching at inappropriate venues (funerals, etc.)",
            "LinkedIn connection requests with no message",
            "Asking for referrals before demonstrating value"
          ]}
        />
      </section>

      {/* Engineering Warm Intros */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Engineering Warm Introductions</h2>
        
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30 mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">The Forwardable Email Framework</h3>
          <p className="text-muted-foreground mb-4">
            When asking for intros, make it easy for your connector. Write the email they'll forward.
          </p>
          <div className="p-4 bg-background/50 rounded-lg font-mono text-sm">
            <p className="text-muted-foreground mb-2">Subject: Intro request: [Your Name] → [VC Name]</p>
            <div className="space-y-2 text-muted-foreground">
              <p>Hi [Connector],</p>
              <p>Would you be open to introducing me to [VC Name]? I'm raising [$X] for [Company].</p>
              <p><strong>Quick context:</strong> [1 sentence on what you do]</p>
              <p><strong>Why them:</strong> [1 sentence on thesis fit]</p>
              <p><strong>Traction:</strong> [1 sentence on metrics]</p>
              <p>Below is a forwardable blurb if you're comfortable making the intro.</p>
              <p className="mt-4 border-t border-border pt-4">
                [Forwardable section for the VC with your pitch summary]
              </p>
            </div>
          </div>
        </Card>

        <Checklist items={[
          "Research who the VC has invested in—those founders are your best path",
          "Map your network: who knows who? Use LinkedIn + fundraising CRM",
          "Prioritize connectors who have leverage (successful founders, co-investors)",
          "Time asks strategically—don't batch intro requests recklessly",
          "Follow up graciously, but don't pester",
          "Thank connectors regardless of outcome—they're putting reputation on line"
        ]} />
      </section>

      {/* Cold Outreach That Works */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">When Cold Outreach Works</h2>
        
        <Callout type="warning">
          <strong>Reality Check:</strong> Cold outreach has a ~2-5% success rate. It should 
          be a complement to warm intros, not a replacement. That said, some deals do come 
          from cold inbound when done exceptionally.
        </Callout>

        <Card className="p-6 bg-card border-border mt-6">
          <h3 className="text-lg font-bold text-foreground mb-4">What Makes Cold Outreach Work</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Content</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Subject line with specific hook (not "intro" or "opportunity")</li>
                <li>• Opening line that shows you researched them</li>
                <li>• One clear metric or proof point</li>
                <li>• Why you're reaching out to them specifically</li>
                <li>• Clear ask (meeting, not vague chat)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Targeting</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• They've publicly stated thesis fit with your space</li>
                <li>• They've invested in adjacent companies</li>
                <li>• They're actively deploying from new fund</li>
                <li>• Right stage and geography match</li>
                <li>• They've engaged with your content before</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* Summary */}
      <section className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Key Takeaways</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Source quality matters enormously.</strong> A warm 
              intro from a portfolio founder is worth 50 cold emails.
            </p>
            <p>
              <strong className="text-foreground">Understand who you're talking to.</strong> Scouts, 
              associates, and partners have different roles and decision-making power.
            </p>
            <p>
              <strong className="text-foreground">Be visible before you raise.</strong> The best 
              VCs find you through your work, not your outreach.
            </p>
            <p>
              <strong className="text-foreground">Make it easy to forward you.</strong> Warm intros 
              work when the connector can copy-paste your blurb.
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
          Get Your Investment Memo
        </Button>
      </div>
    </ContentBlock>
  );
}