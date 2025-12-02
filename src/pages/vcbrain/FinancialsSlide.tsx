import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function FinancialsSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/financials");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-2">The Financials Slide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        VCs don't believe your projections. They want to see how you think.
      </p>

      <Callout type="warning">
        Your 5-year financial projections are fiction. VCs know this. What they're really 
        evaluating is: Do you understand your unit economics? Do your assumptions make sense? 
        Are you delusional or grounded?
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What to Show at Each Stage</h2>
      
      <div className="space-y-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-foreground text-lg mb-3">Pre-Seed (Pre-Revenue)</h3>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Burn rate and runway (how long until you need more money)</li>
            <li>Use of funds breakdown</li>
            <li>Key assumptions about pricing and customer acquisition</li>
            <li>Path to first revenue and timeline</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-foreground text-lg mb-3">Seed (Early Revenue)</h3>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>MRR/ARR and growth rate</li>
            <li>Unit economics: CAC, LTV, LTV:CAC ratio, payback period</li>
            <li>Gross margin</li>
            <li>12-18 month projection with clear assumptions</li>
            <li>Path to Series A milestones</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Unit Economics That Matter</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">CAC (Customer Acquisition Cost)</h4>
          <p className="text-sm text-muted-foreground">
            Total sales & marketing spend ÷ new customers acquired. Include ALL costs: ads, 
            salaries, tools, content. VCs will ask how you calculated this.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">LTV (Lifetime Value)</h4>
          <p className="text-sm text-muted-foreground">
            ARPU × Gross Margin × Customer Lifetime. Be conservative on lifetime estimates. 
            If you're early, use cohort data from your first customers.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">LTV:CAC Ratio</h4>
          <p className="text-sm text-muted-foreground">
            Target: 3:1 or higher. Below 3:1 means you're likely losing money on each customer. 
            Above 5:1 might mean you're underinvesting in growth.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">CAC Payback Period</h4>
          <p className="text-sm text-muted-foreground">
            Months to recoup CAC. Under 12 months is good for SaaS. Under 18 months is acceptable 
            at seed. Above 24 months is a red flag.
          </p>
        </div>
      </div>

      <ComparisonTable
        good={[
          "Clear, labeled assumptions you can defend",
          "Conservative base case with upside scenarios",
          "Unit economics based on actual data",
          "Showing path to profitability (even if far out)",
          "Monthly detail for Year 1, quarterly for Year 2"
        ]}
        bad={[
          "Hockey stick with no explanation of inflection points",
          "'We'll hit $100M ARR in 3 years' with no rationale",
          "Gross margins that seem too good to be true",
          "No sensitivity analysis or scenario planning",
          "Projections that require 10x better execution than peers"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Hockey Stick Myth</h2>
      <p className="text-muted-foreground mb-4">
        Every pitch deck shows hockey stick growth. VCs know most of them are fantasy. 
        What actually impresses them:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Explainable inflection points:</strong> "Growth accelerates here because we're launching in 3 new markets"</li>
        <li><strong>Comparable benchmarks:</strong> "Company X in our space grew at this rate post-seed"</li>
        <li><strong>Leading indicators:</strong> Current pipeline, waitlist, or demand signals that support projections</li>
        <li><strong>Honest uncertainty:</strong> "This is our target, but here's our floor case if things go slower"</li>
      </ul>

      <Callout type="danger">
        If your projections show you reaching $100M ARR faster than Slack, Zoom, or Datadog, 
        you better have a damn good explanation. Most founders don't—and VCs notice.
      </Callout>

      <ConversionBanner 
        message="Need help structuring your financials for investors? The Investment Memo Template includes a complete financial framework VCs actually respect."
        buttonText="Get the Framework"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Financials Slide Checklist</h2>
      <Checklist
        items={[
          "Shows current burn rate and runway clearly",
          "Includes key unit economics (CAC, LTV, margins)",
          "Projections have labeled, defensible assumptions",
          "Includes at least base and upside scenarios",
          "Path to profitability is visible (even if years away)",
          "Growth rates comparable to realistic benchmarks",
          "Use of funds tied to specific milestones"
        ]}
      />

      <Callout type="success">
        The best financials slides make VCs think: "This founder understands their business model 
        and isn't just making up numbers." Show your work, show your assumptions, and be ready 
        to defend every number.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Build Your Financial Framework
        </Button>
      </div>
    </ContentBlock>
  );
}
