import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function FakeTAMs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/tam");
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Fake TAMs Exposed: How Founders Lie to Themselves
        </h1>
        <p className="text-xl text-muted-foreground">
          Your $500B TAM is bullshit. Here's how VCs calculate what you're actually going after.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Brutal Truth:</strong> Every founder says "if we capture just 1% of this massive market..." 
        That sentence alone tells VCs you don't understand your business.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Why TAM Math Is Always Wrong</h2>
        <p>
          Founders Google "healthcare market size" and slap "$4 trillion" on a slide. VCs roll their eyes. 
          Here's why your TAM is fake:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>You're not going after the whole market:</strong> You're going after a tiny wedge.</li>
          <li><strong>Top-down TAM is fiction:</strong> "Healthcare is $4T" tells me nothing about YOUR opportunity.</li>
          <li><strong>You haven't accounted for competition:</strong> That $4T isn't sitting there waiting for you.</li>
          <li><strong>Willingness to pay ≠ market size:</strong> Just because a market exists doesn't mean they'll pay YOU.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "25,000 mid-market SaaS companies × $8K/year contract = $200M SAM",
          "1,500 Series A startups/year × $40K recruiting spend = $60M addressable",
          "80,000 independent consultants × $150/month × 20% penetration = $29M realistic TAM",
        ]}
        bad={[
          "The global enterprise software market is $650B",
          "Healthcare is a $4 trillion market",
          "SMB software spending is $200B annually",
          "If we get 1% of this $100B market...",
          "Our TAM is everyone who uses email",
        ]}
      />

      <ConversionBanner message="Confused about how to calculate TAM the way VCs do? The Investment Memo shows you the exact bottom-up methodology that actually works." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">The Anatomy of a Fake TAM</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. The "Just 1%" Fallacy</h3>
            <p>
              "If we capture just 1% of this $50B market, we'd have a $500M business." Cool story. 
              Why would 1% choose you over incumbents with 100x your resources?
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Ignoring Real Competition</h3>
            <p>
              You size the market as if it's empty. It's not. Incumbents own 80% of it. You're fighting for 
              a slice of the remaining 20%—if you're lucky.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Counting Non-Customers</h3>
            <p>
              "There are 30 million small businesses in the US." How many of those can actually afford and 
              would benefit from your solution? Probably 1% of that.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Assuming 100% Penetration</h3>
            <p>
              Even in a perfect world, you won't capture 100% of your addressable market. 20-30% penetration 
              in a defined segment is wildly optimistic.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I calculated TAM bottom-up (# customers × price × penetration)",
          "I focused on a specific segment I can actually dominate",
          "I accounted for existing competition and market share",
          "My TAM reflects realistic penetration rates (10-30%)",
          "I avoided Googling 'market size' and using the first number",
          "I can defend every assumption in my TAM calculation",
          "My SAM (serviceable addressable market) is specific and defensible",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens When You Fake Your TAM:</strong> VCs immediately know you're full of shit. 
        It signals you don't understand your market, your customer, or basic business math.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How to Calculate Real TAM</h2>
        <p>Start narrow, build credibility:</p>
        <ul className="space-y-2 my-4">
          <li>Define your SPECIFIC target customer (not "SMBs" or "enterprises")</li>
          <li>Count how many of those customers actually exist</li>
          <li>Estimate realistic willingness to pay based on current spending</li>
          <li>Assume 10-20% penetration in your wedge (not 50%+)</li>
          <li>Show the path to expand into adjacent segments later</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Build a Defensible Market Story
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template shows you how to size markets the way VCs do—bottom-up, 
          defensible, and grounded in reality, not delusion.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get the Full Framework
        </Button>
      </div>
    </div>
  );
}
