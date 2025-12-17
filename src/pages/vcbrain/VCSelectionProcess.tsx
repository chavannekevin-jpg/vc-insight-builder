import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VCSelectionProcess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/how-vcs-work/selection-process");
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
        The VC Selection Process: From First Meeting to Term Sheet
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Understanding how VCs evaluate, diligence, and decide helps you navigate the 
        process strategically—and avoid common founder mistakes.
      </p>

      <Callout type="info">
        <strong>The Funnel Reality:</strong> For every 100 companies a VC seriously evaluates, 
        they'll invest in 1-3. Understanding each stage helps you survive the cuts.
      </Callout>

      {/* The Selection Funnel */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The Investment Selection Funnel</h2>
        
        <div className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Stage 1: Initial Screen</h3>
              <span className="text-sm text-muted-foreground">~3,000 companies/year</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">What VCs Ask:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Is this in our thesis/stage/geography?</li>
                  <li>• Does the team look credible on paper?</li>
                  <li>• Is there enough signal to warrant a call?</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Typical Outcome:</p>
                <p className="text-sm text-muted-foreground">80% rejected without meeting. 20% get first call.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Stage 2: First Meeting</h3>
              <span className="text-sm text-muted-foreground">~600 meetings/year</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">What VCs Evaluate:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Can founder explain this clearly?</li>
                  <li>• Is there genuine insight or differentiation?</li>
                  <li>• Does traction match the story?</li>
                  <li>• Would I want to work with this person?</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Typical Outcome:</p>
                <p className="text-sm text-muted-foreground">70% get a polite pass. 30% advance to partner meeting.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Stage 3: Partner Deep Dive</h3>
              <span className="text-sm text-muted-foreground">~180 companies/year</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">What VCs Evaluate:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Market size and dynamics</li>
                  <li>• Competitive landscape and moat</li>
                  <li>• Unit economics potential</li>
                  <li>• Team depth and capability</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Typical Outcome:</p>
                <p className="text-sm text-muted-foreground">50% pass after deep dive. 50% enter due diligence.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Stage 4: Due Diligence</h3>
              <span className="text-sm text-muted-foreground">~90 companies/year</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">What VCs Do:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Customer reference calls</li>
                  <li>• Founder background checks</li>
                  <li>• Financial model review</li>
                  <li>• Technical/product assessment</li>
                  <li>• Market research and expert calls</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Typical Outcome:</p>
                <p className="text-sm text-muted-foreground">60% fall out during DD. 40% reach IC.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Stage 5: Investment Committee</h3>
              <span className="text-sm text-muted-foreground">~36 companies/year</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">What Happens:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sponsoring partner presents the deal</li>
                  <li>• Full partnership debates and challenges</li>
                  <li>• Terms and ownership discussed</li>
                  <li>• Final decision made (often consensus)</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Typical Outcome:</p>
                <p className="text-sm text-muted-foreground">50-70% get term sheets. Final investments: 15-25/year.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* What VCs Actually Evaluate */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What VCs Actually Evaluate (Not What They Say)</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">On the Founder</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Clarity of thought:</strong> Can they explain complex things simply?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Conviction + coachability:</strong> Strong opinions, loosely held?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Resilience signals:</strong> How did they handle past failures?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Obsession:</strong> Do they know this space better than anyone?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Recruiting ability:</strong> Can they attract talent?</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">On the Business</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Market magnitude:</strong> Can this be $100M+ revenue?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Timing:</strong> Why is now the right moment?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Defensibility trajectory:</strong> Does moat grow over time?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Path to dominance:</strong> Can they own the category?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span><strong>Exit potential:</strong> Who buys this for 10x+?</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Due Diligence Deep Dive */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">The Due Diligence Process</h2>
        <p className="text-muted-foreground mb-6">
          Due diligence is where deals die or accelerate. Understanding what VCs dig into 
          helps you prepare and avoid surprises.
        </p>

        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Customer Reference Calls</h3>
            <p className="text-muted-foreground mb-4">
              VCs will ask to speak with 3-5 customers. They're looking for genuine enthusiasm, 
              not just satisfaction.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Questions They Ask:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• How did you find this product?</li>
                  <li>• What were you using before?</li>
                  <li>• What happens if they shut down tomorrow?</li>
                  <li>• Would you recommend to a peer?</li>
                </ul>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">What They Listen For:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Unprompted enthusiasm</li>
                  <li>• "Can't live without it" language</li>
                  <li>• Willingness to make intros</li>
                  <li>• Plans to expand usage</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Founder Background Checks</h3>
            <p className="text-muted-foreground mb-4">
              VCs will speak with former colleagues, co-founders, and anyone who's worked 
              closely with you. Transparency is your friend.
            </p>
            <Callout type="warning">
              <strong>Warning:</strong> Discovering inconsistencies during reference checks is 
              an immediate deal-killer. Better to address any concerns proactively.
            </Callout>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Financial & Legal Review</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Financial Items:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Historical financial statements</li>
                  <li>• Revenue recognition policies</li>
                  <li>• Burn rate and runway</li>
                  <li>• Financial projections and assumptions</li>
                  <li>• Cap table and previous terms</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Legal Items:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Corporate structure</li>
                  <li>• IP ownership and assignments</li>
                  <li>• Employment agreements</li>
                  <li>• Outstanding litigation</li>
                  <li>• Key contracts and obligations</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Technical/Product Diligence</h3>
            <p className="text-muted-foreground mb-4">
              For technical products, VCs may bring in experts or have technical partners 
              evaluate the architecture, code quality, and technical debt.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Common Areas of Focus:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Scalability of current architecture</li>
                <li>• Security practices and vulnerabilities</li>
                <li>• Technical team capabilities</li>
                <li>• Development velocity and processes</li>
                <li>• Key technical risks and mitigations</li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* Why Deals Die */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why Deals Die in Due Diligence</h2>

        <ComparisonTable
          good={[
            "Proactively share known issues with context",
            "Have data room ready and organized",
            "Customer references are coached and enthusiastic",
            "Consistent story from deck to diligence",
            "Quick, thorough responses to requests",
            "Cap table is clean and well-documented"
          ]}
          bad={[
            "Inconsistencies between pitch and reality",
            "Customer references lukewarm or unavailable",
            "Slow or incomplete responses signal chaos",
            "Undisclosed issues discovered externally",
            "Legal or IP complications surface",
            "Founders contradict each other on key points"
          ]}
        />

        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30 mt-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Top Deal-Killers (Ranked)</h3>
          <ol className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-destructive font-bold">1.</span>
              <span><strong>Founder integrity issues:</strong> Discovered exaggerations, undisclosed conflicts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-destructive font-bold">2.</span>
              <span><strong>Customer reality check:</strong> References don't match the pitch</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-destructive font-bold">3.</span>
              <span><strong>Market size concerns:</strong> TAM smaller than presented</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-destructive font-bold">4.</span>
              <span><strong>Competitive dynamics:</strong> Stronger players discovered</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-destructive font-bold">5.</span>
              <span><strong>Team gaps:</strong> Key roles unfilled, co-founder conflicts</span>
            </li>
          </ol>
        </Card>
      </section>

      {/* Preparing for Due Diligence */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Preparing for Due Diligence</h2>
        
        <Checklist items={[
          "Clean, organized data room with clear folder structure",
          "Cap table reconciled and reviewed by lawyer",
          "IP assignments from all founders and early employees",
          "Customer list with context on each relationship",
          "3-5 references prepped and expecting calls",
          "Financial model with clear assumptions documented",
          "Known issues documented with mitigation plans",
          "Key contracts accessible (customers, vendors, employees)"
        ]} />

        <Callout type="success">
          <strong>Pro Tip:</strong> Build your data room before you start fundraising. 
          The delay in providing materials kills more deals than the content itself.
        </Callout>
      </section>

      {/* Timeline Expectations */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Realistic Timeline Expectations</h2>
        
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium">First meeting → Partner meeting</span>
              <span className="text-muted-foreground">1-2 weeks</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium">Partner meeting → Due diligence start</span>
              <span className="text-muted-foreground">1-2 weeks</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium">Due diligence process</span>
              <span className="text-muted-foreground">2-4 weeks</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium">IC → Term sheet</span>
              <span className="text-muted-foreground">1 week</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-foreground font-medium">Term sheet → Close</span>
              <span className="text-muted-foreground">2-4 weeks</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
              <span className="text-foreground font-bold">Total: First meeting → Cash</span>
              <span className="text-primary font-bold">6-12 weeks</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            * These are optimistic timelines. Holidays, partner schedules, and process 
            complications can extend significantly.
          </p>
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