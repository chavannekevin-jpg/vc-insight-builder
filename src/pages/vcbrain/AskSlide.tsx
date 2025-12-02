import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function AskSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/ask");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">The Ask Slide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        How much you're raising—and whether it makes any sense.
      </p>

      <Callout type="warning">
        The ask slide reveals whether you've actually thought through your business or are just 
        throwing out numbers. VCs can instantly tell the difference between a thoughtful raise 
        and "we want $2M because that sounds like a good amount."
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How Much Should You Actually Raise?</h2>
      <p className="text-muted-foreground mb-4">
        The right amount is: enough to hit meaningful milestones that unlock your next round, 
        plus 6 months buffer. Not more, not less.
      </p>

      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <h3 className="font-bold text-foreground">Stage-Appropriate Raises (US Market):</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-foreground font-medium">Pre-Seed</span>
            <span className="text-muted-foreground">$500K - $2M</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-foreground font-medium">Seed</span>
            <span className="text-muted-foreground">$2M - $5M</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground font-medium">Series A</span>
            <span className="text-muted-foreground">$10M - $20M</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Note: These ranges vary significantly by geography, sector, and market conditions.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Use of Funds That Actually Works</h2>
      <p className="text-muted-foreground mb-4">
        VCs want to see how the money translates into progress. Vague categories like "growth" 
        or "marketing" don't cut it.
      </p>

      <ComparisonTable
        good={[
          "Engineering: 3 senior hires to ship v2 ($450K)",
          "Sales: Build initial sales team + infrastructure ($300K)",
          "Marketing: Paid acquisition tests in 3 channels ($150K)",
          "Ops: Legal, finance, office ($100K)",
          "18-month runway at projected burn"
        ]}
        bad={[
          "'Growth' - 40%",
          "'Product' - 30%",
          "'Operations' - 30%",
          "No connection to specific hires or milestones",
          "Runway unclear or unrealistic"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Runway Question</h2>
      <p className="text-muted-foreground mb-4">
        VCs will calculate your runway themselves. They want to see 18-24 months, which gives you:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>12 months</strong> to hit your milestones</li>
        <li><strong>6 months</strong> to fundraise for the next round</li>
        <li><strong>6 months</strong> buffer for things that go wrong (they will)</li>
      </ul>

      <Callout type="danger">
        Raising for 12 months of runway is a red flag. It means you'll be fundraising again in 
        6 months, distracted from building, and potentially desperate. VCs avoid desperate founders.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Valuation Expectations by Stage</h2>
      <p className="text-muted-foreground mb-4">
        Don't put your valuation on the Ask slide (let them anchor first), but know what's reasonable:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-foreground">Pre-Seed</span>
            <span className="text-muted-foreground">$3M - $10M pre-money</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground">Seed</span>
            <span className="text-muted-foreground">$8M - $20M pre-money</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground">Series A</span>
            <span className="text-muted-foreground">$30M - $60M pre-money</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Hot markets and exceptional traction can push these higher. Tough markets push lower.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What You'll Achieve With This Round</h2>
      <p className="text-muted-foreground mb-4">
        The most important part of your ask slide: what milestones will you hit? Be specific:
      </p>

      <div className="bg-card border border-border rounded-lg p-6 my-6">
        <h4 className="font-bold text-foreground mb-3">Example Milestones for a Seed Round:</h4>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>$1M ARR (from current $150K)</li>
          <li>100 paying customers (from current 15)</li>
          <li>Net revenue retention above 110%</li>
          <li>Team of 12 (from current 4)</li>
          <li>V2 product with enterprise features shipped</li>
          <li>Positioned for $10-15M Series A</li>
        </ul>
      </div>

      <ConversionBanner 
        message="Need help structuring your ask? The Investment Memo Template includes a complete fundraising framework with use of funds and milestone planning."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Ask Slide Checklist</h2>
      <Checklist
        items={[
          "Raise amount is stage-appropriate for your market",
          "Use of funds is specific (roles, costs, timelines)",
          "Runway is 18-24 months at projected burn",
          "Clear milestones tied to next round requirements",
          "No valuation stated (let them anchor first)",
          "Amount backed by bottoms-up budget, not round numbers",
          "Buffer built in for things going slower than planned"
        ]}
      />

      <Callout type="success">
        The best ask slides make VCs think: "This founder knows exactly what they need and why." 
        It shows operational maturity and makes them confident you'll use their money wisely.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Plan Your Fundraise
        </Button>
      </div>
    </ContentBlock>
  );
}
