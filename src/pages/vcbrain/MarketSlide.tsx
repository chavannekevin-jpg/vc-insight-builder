import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function MarketSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/market");
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
          Market Slide: Where Founders Lie to Themselves Most
        </h1>
        <p className="text-xl text-muted-foreground">
          Your TAM isn't $500B. Stop pretending it is.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Hard Truth:</strong> Huge TAM numbers impress no one. VCs want to see a wedge you can 
        actually dominate, not a fantasy about capturing 1% of a massive market you'll never touch.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What VCs Actually Look For</h2>
        <p>
          Market slides are where founders reveal whether they understand their business or are just 
          regurgitating Gartner reports. Here's what actually matters:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Narrow, defensible wedge:</strong> Show the specific segment you'll dominate first.</li>
          <li><strong>Bottom-up TAM:</strong> How many potential customers × realistic price × penetration rate.</li>
          <li><strong>Market timing:</strong> Why is this market ready NOW and not 3 years ago or 3 years from now?</li>
          <li><strong>Proof of demand:</strong> Early adopters, pilot programs, or clear behavioral shifts in the market.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "50,000 mid-market SaaS companies spend $10K/year on this problem = $500M addressable market",
          "We're targeting Series A startups (2,000/year in US) who each spend $50K on recruiting",
          "100K independent consultants in the US, 30% would pay $200/month = $72M SAM",
        ]}
        bad={[
          "The global enterprise software market is $500B",
          "We're going after SMBs, mid-market, and enterprise",
          "If we capture just 1% of this $100B market...",
          "The market is growing at 40% CAGR according to McKinsey",
          "Everyone needs our product",
        ]}
      />

      <ConversionBanner message="Confused about how to calculate TAM without bullshitting? The VC Analysis shows you the exact bottom-up methodology VCs actually believe." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Market Slide Disasters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Top-Down TAM Theater</h3>
            <p>
              "Healthcare is a $4 trillion market" tells me you Googled "healthcare market size" and copied 
              the first number you saw. VCs don't care about macro markets. They care about YOUR market.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Claiming Every Customer Segment</h3>
            <p>
              "We serve SMBs, mid-market, and enterprise." Translation: we have no go-to-market focus. 
              Pick one wedge and own it before expanding.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. No Proof of Market Pull</h3>
            <p>
              You claim there's massive demand, but have zero customers. If the market is so big and ready, 
              why isn't anyone buying yet?
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Ignoring Competition</h3>
            <p>
              "This market is wide open!" No, it's not. Every market has incumbents, substitutes, or 
              workarounds. Pretending they don't exist makes you look naive.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "My TAM is calculated bottom-up (# of customers × price × penetration)",
          "I focus on a specific, defensible segment first",
          "I can explain why this market is ready NOW",
          "I have proof of demand (customers, pilots, or clear market shifts)",
          "I acknowledge competition and explain how we win",
          "My TAM/SAM/SOM makes sense and isn't aspirational nonsense",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Get This Wrong:</strong> VCs will think you're unfocused, naive, or lying. 
        All three kill your chances. A tight, believable market slide signals you actually understand your business.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do</h2>
        <p>They prove the market is real, not aspirational:</p>
        <ul className="space-y-2 my-4">
          <li>Start with a narrow, specific segment they can dominate</li>
          <li>Use bottom-up math that VCs can verify</li>
          <li>Show early customers as proof the market is ready</li>
          <li>Explain the "why now" with behavioral or regulatory shifts</li>
          <li>Acknowledge competition and articulate a clear wedge strategy</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Build a Credible Market Story
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template shows you how to size your market the way VCs do—bottom-up, 
          defensible, and grounded in reality, not fantasy.
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
