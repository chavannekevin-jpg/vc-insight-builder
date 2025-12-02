import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function NegotiationTactics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deals/negotiation");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Negotiation Tactics</h1>
      <p className="text-xl text-muted-foreground mb-8">
        How to push back on terms without losing the deal—and when to walk away.
      </p>

      <Callout type="warning">
        Negotiation is a skill, not a personality trait. The best negotiators aren't aggressive—
        they're prepared. They know what matters, what's standard, and where they have leverage. 
        You can learn this.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What's Actually Negotiable</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-3">✓ Usually Negotiable</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Valuation (within market range)</li>
            <li>Option pool size</li>
            <li>Board composition</li>
            <li>Protective provisions scope</li>
            <li>Pro-rata rights</li>
            <li>Vesting acceleration triggers</li>
            <li>Information rights frequency</li>
          </ul>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-3">✗ Rarely Negotiable</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>1x liquidation preference (industry standard)</li>
            <li>Basic anti-dilution protection</li>
            <li>Standard drag-along provisions</li>
            <li>Basic information rights</li>
            <li>Registration rights</li>
            <li>Right of first refusal</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Push Back Without Losing the Deal</h2>
      
      <div className="space-y-4 my-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">1. Use Data, Not Emotion</h4>
          <p className="text-muted-foreground text-sm">
            "Based on comparables we've seen, the typical option pool at this stage is 10-12%, 
            not 20%. Here's our hiring plan that shows we need 12%."
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">2. Trade, Don't Demand</h4>
          <p className="text-muted-foreground text-sm">
            "We can accept the lower valuation if we can reduce the option pool to 12% and 
            keep board control through Series A."
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">3. Ask Why, Not Just No</h4>
          <p className="text-muted-foreground text-sm">
            "Help me understand why participating preferred is important to you. Is there a 
            specific scenario you're worried about?"
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">4. Use Competition Carefully</h4>
          <p className="text-muted-foreground text-sm">
            "We have another term sheet at $X valuation. We'd prefer to work with you—can 
            we find a middle ground?"
          </p>
        </div>
      </div>

      <ComparisonTable
        good={[
          "Come prepared with market data and comparables",
          "Know your priorities before negotiating",
          "Trade terms rather than demand changes",
          "Stay professional and relationship-focused",
          "Have a clear walk-away point"
        ]}
        bad={[
          "Wing it without preparation",
          "Fight for every term equally",
          "Make ultimatums early in the process",
          "Get emotional or confrontational",
          "Negotiate without alternatives"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Red Flags in Term Sheets</h2>
      
      <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-6 my-6">
        <h4 className="font-bold text-red-400 mb-4">🚩 Stop and Think Carefully If You See:</h4>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-foreground">Participating preferred</p>
            <p className="text-muted-foreground text-sm">
              Investors get their money back AND their equity share. Standard in growth rounds, 
              aggressive at seed. Ask why they need it.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Full ratchet anti-dilution</p>
            <p className="text-muted-foreground text-sm">
              If you ever raise at a lower price, these shares reprice to match. Can devastate 
              founders in a down round. Broad-based weighted average is standard.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Investor board control at seed</p>
            <p className="text-muted-foreground text-sm">
              Founders should control the board through seed. Giving this up early means you 
              may never get it back.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Redemption rights</p>
            <p className="text-muted-foreground text-sm">
              Right to force company to buy back shares at a future date. Creates debt-like 
              obligation. Very unusual for early stage.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Excessive protective provisions</p>
            <p className="text-muted-foreground text-sm">
              Investor veto on routine business decisions. Some protections are standard; 
              veto on hiring, compensation, or product decisions is aggressive.
            </p>
          </div>
        </div>
      </div>

      <Callout type="danger">
        Never sign a term sheet under time pressure without having a lawyer review it. "We 
        need an answer by tomorrow" is a negotiation tactic. If they want to invest, they'll 
        wait 48 hours for you to do diligence.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">When to Walk Away</h2>
      <p className="text-muted-foreground mb-4">
        Walking away is hard, especially when you need the money. But some deals aren't worth doing:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Terms that could kill you:</strong> Full ratchet + low valuation = founders wiped out in any down round</li>
        <li><strong>Control you can't get back:</strong> Board control given up at seed is rarely recovered</li>
        <li><strong>Investor red flags:</strong> Behavior during negotiation predicts behavior as investor</li>
        <li><strong>Misaligned expectations:</strong> If they expect 10x in 3 years and you expect 5 years, trouble ahead</li>
        <li><strong>Your gut says no:</strong> You'll work with this investor for 7-10 years. Trust your instincts.</li>
      </ul>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Using Competition to Improve Terms</h2>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <h4 className="font-bold text-foreground mb-3">The Competitive Dynamic</h4>
        <div className="space-y-3 text-muted-foreground">
          <p>
            <strong>Best case:</strong> Multiple term sheets. Share terms (not full sheets) to 
            create competition. "We have another offer at $X. Can you match?"
          </p>
          <p>
            <strong>Good case:</strong> One term sheet + active conversations. "We're in late 
            stages with others. We'd like to move forward with you—can we improve X?"
          </p>
          <p>
            <strong>Weak case:</strong> One interested investor. Focus on relationship and long-term 
            partnership rather than term optimization. Get the deal done.
          </p>
        </div>
      </div>

      <Callout type="warning">
        Never lie about having other term sheets. VCs talk to each other. Getting caught in 
        a lie destroys trust and the deal. It's okay to say "we're in conversations with others" 
        if that's true.
      </Callout>

      <ConversionBanner 
        message="The best negotiation leverage is a strong company story. The Investment Memo Template helps you present your company in the most compelling way."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Negotiation Checklist</h2>
      <Checklist
        items={[
          "Know my top 3 priorities before starting",
          "Have market data on standard terms",
          "Understand what each term means for my scenarios",
          "Identified potential trade-offs",
          "Have a clear walk-away point",
          "Lawyer has reviewed the term sheet",
          "Asked why on terms I don't understand",
          "Checked investor reputation with portfolio founders",
          "Compared to any other offers I have",
          "Sleeping on it before signing anything"
        ]}
      />

      <Callout type="success">
        The goal of negotiation isn't to "win"—it's to create a deal that works for both parties. 
        VCs know that over-aggressive terms hurt founders and ultimately hurt returns. Good 
        investors want fair deals too.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Prepare Your Fundraise
        </Button>
      </div>
    </ContentBlock>
  );
}
