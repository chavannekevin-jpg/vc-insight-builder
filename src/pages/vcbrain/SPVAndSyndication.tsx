import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SPVAndSyndication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/vc-operations/spv-syndication");
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
        SPVs & Angel Syndication: How Smart Money Organizes
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Understanding Special Purpose Vehicles and syndication—the mechanics that let angels 
        invest together and why it matters for your cap table.
      </p>

      <Callout type="info">
        <strong>Why This Matters:</strong> As a founder, you'll likely encounter angel syndicates 
        and SPVs during your raise. Understanding how they work helps you evaluate term sheets, 
        manage your cap table, and leverage the collective value of organized angel capital.
      </Callout>

      {/* What is an SPV */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What is a Special Purpose Vehicle (SPV)?</h2>
        <p className="text-muted-foreground mb-6">
          An SPV is a legal entity created for a single purpose: to pool capital from multiple 
          investors and invest it into one specific company. Think of it as a "mini-fund" that 
          exists solely to make one investment.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">How SPVs Work</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">1</div>
                <p className="text-muted-foreground text-sm">Lead investor identifies a deal they want to invest in</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">2</div>
                <p className="text-muted-foreground text-sm">SPV is created (usually an LLC) to aggregate capital</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">3</div>
                <p className="text-muted-foreground text-sm">Multiple investors commit capital to the SPV</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">4</div>
                <p className="text-muted-foreground text-sm">SPV invests the pooled capital as a single line on cap table</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">5</div>
                <p className="text-muted-foreground text-sm">Lead manages the investment and distributes returns</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">SPV Economics</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>Carry (profit share)</span>
                <span className="font-medium text-foreground">15-20%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>Management fee</span>
                <span className="font-medium text-foreground">0-2%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>Setup costs</span>
                <span className="font-medium text-foreground">$5K-$15K</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <span>Admin fees</span>
                <span className="font-medium text-foreground">$500-$2K/year</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Platforms like AngelList, Assure, or SPV Hub handle legal and admin.
            </p>
          </Card>
        </div>
      </section>

      {/* What is Syndication */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What is Angel Syndication?</h2>
        <p className="text-muted-foreground mb-6">
          A syndicate is an organized group of angel investors who regularly invest together, 
          led by an experienced investor who sources and leads deals. Unlike one-off SPVs, 
          syndicates have an ongoing relationship and shared investment thesis.
        </p>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Key Syndicate Players</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-foreground mb-2">Syndicate Lead</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sources and vets deals</li>
                <li>• Leads due diligence</li>
                <li>• Negotiates terms</li>
                <li>• Takes board/advisor role</li>
                <li>• Earns carry on profits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-2">Backers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Passive investors</li>
                <li>• Follow lead's judgment</li>
                <li>• Invest smaller checks</li>
                <li>• Access to deal flow</li>
                <li>• Pay carry to lead</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-2">Platform</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Facilitates mechanics</li>
                <li>• Handles legal/admin</li>
                <li>• Provides infrastructure</li>
                <li>• Manages capital calls</li>
                <li>• Examples: AngelList, Republic</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* Why Founders Should Care */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why Founders Should Care About Syndicates</h2>
        
        <Callout type="success">
          <strong>The Smart Capital Advantage:</strong> A well-organized syndicate can bring 
          $50K-$500K while only taking one line on your cap table, plus the collective expertise 
          and networks of dozens of angels.
        </Callout>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-primary mb-3">Benefits</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Clean Cap Table:</strong> 50 investors appear as 1 line</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Larger Checks:</strong> Aggregate capital you couldn't get individually</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Social Proof:</strong> Notable lead attracts more investors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Network Effects:</strong> Access entire backer network</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Single Point of Contact:</strong> Lead manages investor relations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Faster Closes:</strong> Coordinated decision-making</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-destructive mb-3">Risks to Consider</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">⚠</span>
                <span><strong>Lead Risk:</strong> If lead disengages, you lose access to backers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">⚠</span>
                <span><strong>Hidden Conflicts:</strong> Lead's incentives may not align with yours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">⚠</span>
                <span><strong>Secondary Drama:</strong> SPV can make follow-on rounds complex</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">⚠</span>
                <span><strong>Information Leakage:</strong> More people see your updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">⚠</span>
                <span><strong>Platform Fees:</strong> Costs reduce effective investment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">⚠</span>
                <span><strong>Pro Rata Complexity:</strong> Who gets follow-on rights?</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Evaluating a Syndicate */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How to Evaluate a Syndicate Lead</h2>
        <p className="text-muted-foreground mb-6">
          Not all syndicates are equal. The value you get depends almost entirely on the 
          quality of the lead investor and their backer base.
        </p>

        <Checklist items={[
          "What's the lead's track record? Ask for portfolio and returns.",
          "How engaged are they post-investment? Board seat, advisor, or ghost?",
          "Who are the backers? Operators, executives, domain experts?",
          "What's their typical check size and how much do they co-invest personally?",
          "How do they handle pro rata in follow-on rounds?",
          "What's their communication style with portfolio companies?",
          "Can they provide customer intros, hiring help, or strategic advice?",
          "What's their relationship with downstream VCs?"
        ]} />

        <Callout type="warning">
          <strong>Red Flag:</strong> Syndicate leads who won't invest their own money alongside 
          backers. If they're not willing to risk their capital, why should you trust their judgment?
        </Callout>
      </section>

      {/* Smart Capital Value */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The Smart Capital Multiplier</h2>
        <p className="text-muted-foreground mb-6">
          The real value of angel syndication isn't just money—it's the concentrated expertise 
          and network effects of organized investors.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Domain Expertise</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Syndicates often specialize: healthcare, fintech, climate, B2B SaaS. 
              Backers bring deep industry knowledge.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-foreground">Value Add:</p>
              <p className="text-xs text-muted-foreground">Product feedback, market insights, regulatory guidance</p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Customer Access</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Backers are often executives who can become customers, make intros, 
              or provide pilot opportunities.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-foreground">Value Add:</p>
              <p className="text-xs text-muted-foreground">Revenue, case studies, reference customers</p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Hiring Networks</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Angels often have extensive networks of talent they've worked with 
              or managed in their careers.
            </p>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-foreground">Value Add:</p>
              <p className="text-xs text-muted-foreground">Executive hires, team referrals, culture shaping</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Structuring SPV Investments */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Structuring SPV Investments: Founder Checklist</h2>
        
        <Card className="p-6 bg-card border-border mb-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Term Considerations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Cap Table Mechanics</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Confirm SPV will be single line on cap table</li>
                <li>• Clarify who signs on behalf of SPV</li>
                <li>• Understand voting rights structure</li>
                <li>• Define information rights clearly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Pro Rata Rights</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Who holds pro rata—SPV or individual backers?</li>
                <li>• Can pro rata be assigned or transferred?</li>
                <li>• What happens if SPV doesn't exercise?</li>
                <li>• Minimum thresholds for participation</li>
              </ul>
            </div>
          </div>
        </Card>

        <ComparisonTable
          good={[
            "SPV lead co-invests personal capital (skin in the game)",
            "Clear pro rata structure agreed upfront",
            "Lead has relevant domain expertise",
            "Backers include potential customers or partners",
            "Single point of contact for investor communications",
            "Reasonable carry (15-20%) and minimal fees"
          ]}
          bad={[
            "Lead only takes carry, doesn't invest",
            "Ambiguous pro rata terms create future conflict",
            "Backers are random with no strategic value",
            "Multiple contacts required for approvals",
            "Excessive fees eat into effective investment",
            "Lead has no track record or portfolio"
          ]}
        />
      </section>

      {/* When to Seek Syndicate Capital */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">When to Seek Syndicate Capital</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
            <h3 className="text-lg font-bold text-primary mb-3">Good Fit</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Pre-seed/Seed stage with $250K-$1M target</li>
              <li>• Need strategic angels, not just capital</li>
              <li>• Want to keep cap table clean</li>
              <li>• Industry-specific syndicate with domain expertise</li>
              <li>• Lead investor adds clear value beyond money</li>
              <li>• Round is coming together but need to fill gaps</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-muted/50 to-transparent border-muted">
            <h3 className="text-lg font-bold text-muted-foreground mb-3">Less Ideal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Raising institutional round (VCs may prefer direct caps)</li>
              <li>• Need quick capital (syndicate setup takes time)</li>
              <li>• Highly competitive round with VC demand</li>
              <li>• Lead investor has no relevant experience</li>
              <li>• Already have 20+ angels on cap table</li>
              <li>• Extremely price-sensitive round</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Local Focus */}
      <section className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Start Local, Expand Strategically</h2>
          <p className="text-muted-foreground mb-6">
            For early-stage founders, local angel syndicates often provide more value than 
            remote capital. Proximity enables deeper engagement.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">Local Advantages</h4>
              <p className="text-sm text-muted-foreground">Face-to-face meetings, local market knowledge, easier follow-ups</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">Regional Networks</h4>
              <p className="text-sm text-muted-foreground">Local syndicates often know other investors in the ecosystem</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">Community Signal</h4>
              <p className="text-sm text-muted-foreground">Local investor backing signals ecosystem support to VCs</p>
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
          Get Your VC Analysis
        </Button>
      </div>
    </ContentBlock>
  );
}