import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function FundingInstruments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deals/instruments");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Funding Instruments</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Equity, Convertibles, and SAFEs—what they are and when to use each.
      </p>

      <Callout type="warning">
        The funding instrument you choose affects your cap table, your control, and your future 
        fundraising options. Most first-time founders don't understand the trade-offs until 
        it's too late.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Three Main Instruments</h2>

      <div className="space-y-6 my-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-primary text-xl mb-3">1. Priced Equity Round</h3>
          <p className="text-muted-foreground mb-4">
            Investors buy shares at a specific price, establishing a company valuation. 
            This is the "traditional" way to raise and gives everyone clarity on ownership.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">How it works:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
                <li>Company valued at $X million (pre-money)</li>
                <li>Investor puts in $Y</li>
                <li>Post-money = pre-money + investment</li>
                <li>Investor owns: $Y ÷ post-money</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Example:</p>
              <p className="text-muted-foreground text-sm">
                $8M pre-money valuation<br/>
                $2M investment<br/>
                $10M post-money<br/>
                Investor owns: 20%
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Clear ownership</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">No conversion math</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Higher legal costs</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Slower to close</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-primary text-xl mb-3">2. Convertible Notes</h3>
          <p className="text-muted-foreground mb-4">
            Debt that converts to equity at a future financing round. Includes interest and 
            usually a discount or cap on conversion price.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Key terms:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
                <li><strong>Interest rate:</strong> Usually 4-8% annual</li>
                <li><strong>Maturity date:</strong> When debt is due (18-24 months)</li>
                <li><strong>Discount:</strong> 10-20% discount to next round price</li>
                <li><strong>Cap:</strong> Maximum valuation for conversion</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Example:</p>
              <p className="text-muted-foreground text-sm">
                $500K note, 20% discount, $6M cap<br/>
                Next round at $10M valuation<br/>
                Converts at: min($10M × 0.8, $6M) = $6M cap<br/>
                Much better for investor than $8M
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Fast to close</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Lower legal fees</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Accruing interest</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Maturity risk</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-primary text-xl mb-3">3. SAFEs (Simple Agreement for Future Equity)</h3>
          <p className="text-muted-foreground mb-4">
            Created by Y Combinator. Similar to convertible notes but NOT debt—no interest, 
            no maturity date. The most founder-friendly instrument for early stage.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">SAFE Variants:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
                <li><strong>Cap only:</strong> Converts at capped valuation</li>
                <li><strong>Discount only:</strong> Converts at X% discount to next round</li>
                <li><strong>Cap + Discount:</strong> Investor gets better of both</li>
                <li><strong>MFN (Most Favored Nation):</strong> Gets best terms of any future SAFE</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Post-Money SAFE (YC standard):</p>
              <p className="text-muted-foreground text-sm">
                $500K SAFE at $5M post-money cap<br/>
                Investor guaranteed: $500K ÷ $5M = 10%<br/>
                Regardless of how much you raise on SAFEs<br/>
                More dilutive but clearer math
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">No interest</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">No maturity</span>
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Very fast</span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Can stack dilution</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">When to Use Each</h2>

      <ComparisonTable
        good={[
          "SAFE for pre-seed: fastest, cheapest, most founder-friendly",
          "Convertible note if investors insist on debt structure",
          "Priced round for seed if you have strong traction",
          "Priced round for Series A (standard)",
          "Match instrument to investor expectations"
        ]}
        bad={[
          "Priced round for tiny pre-seed raises (legal costs eat capital)",
          "Stacking too many SAFEs without tracking dilution",
          "Convertible note with short maturity you can't meet",
          "Mixing multiple instrument types in one round",
          "Accepting terms you don't understand"
        ]}
      />

      <Callout type="danger">
        The most common mistake: raising $2M on SAFEs without realizing you've already given 
        away 40% of your company before your seed round. Always model your cap table with ALL 
        outstanding SAFEs converting.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Common Mistakes by Instrument</h2>
      
      <div className="space-y-4 my-6">
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">SAFE Mistakes</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Not understanding post-money vs pre-money SAFEs</li>
            <li>Stacking multiple SAFEs without tracking total dilution</li>
            <li>Setting caps too low, leaving no room for seed round</li>
            <li>Not having a lawyer review non-standard terms</li>
          </ul>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">Convertible Note Mistakes</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Agreeing to short maturity dates (12 months or less)</li>
            <li>High interest rates that compound significantly</li>
            <li>Not negotiating automatic extension provisions</li>
            <li>Forgetting that maturity creates legal obligation</li>
          </ul>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">Priced Round Mistakes</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Accepting excessive liquidation preferences</li>
            <li>Giving up too much board control too early</li>
            <li>Not negotiating anti-dilution provisions</li>
            <li>Ignoring participation rights impact</li>
          </ul>
        </div>
      </div>

      <ConversionBanner 
        message="Understanding funding instruments is just the start. The Investment Memo Template helps you structure your entire fundraise professionally."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Instrument Selection Checklist</h2>
      <Checklist
        items={[
          "Understand the total dilution from all instruments",
          "Model your cap table with all SAFEs/notes converting",
          "Know what triggers conversion",
          "Understand maturity dates and what happens if not met",
          "Have a lawyer review any non-standard terms",
          "Match instrument to round size and stage",
          "Consider investor preferences and market norms",
          "Plan for how this affects future rounds"
        ]}
      />

      <Callout type="success">
        The right instrument is the one that gets you funded quickly with terms you understand 
        and can live with. Don't optimize for perfect terms if it means months of negotiation.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Master Your Fundraise
        </Button>
      </div>
    </ContentBlock>
  );
}
