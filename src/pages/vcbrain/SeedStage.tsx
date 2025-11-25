import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function SeedStage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/seed");
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
          Seed Stage: Where "Good Enough" Becomes "Not Even Close"
        </h1>
        <p className="text-xl text-muted-foreground">
          Seed rounds are where real VCs separate signal from noise. Most founders are noise.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Hard Truth:</strong> If you're raising seed, you're no longer selling a vision. 
        You're selling proof of a repeatable, scalable business model. Anything less is wishful thinking.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Seed Investors Actually Look For</h2>
        <p>
          Seed rounds are competitive. Top-tier VCs see 5,000+ deals a year and fund 10-20. 
          Here's what makes the cut:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>$50K+ MRR minimum:</strong> Or equivalent usage for pre-revenue models (10K+ DAU with strong retention).</li>
          <li><strong>Proven unit economics:</strong> CAC payback under 12 months, LTV:CAC ratio above 3:1.</li>
          <li><strong>Repeatable growth:</strong> You're not guessing. You have a machine that works.</li>
          <li><strong>Defensible moat:</strong> Network effects, data advantage, or tech that's hard to replicate.</li>
          <li><strong>Path to Series A:</strong> Clear milestones to hit $100K+ MRR and 100%+ YoY growth.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "$75K MRR, growing 15% month-over-month",
          "CAC $200, LTV $1,200, 8-month payback",
          "60% gross margins with clear path to 70%+",
          "3 distinct acquisition channels working",
          "Raising $2M to scale to $1M ARR in 18 months",
        ]}
        bad={[
          "We're about to launch our monetization strategy",
          "We have users but haven't tested pricing yet",
          "We're raising $5M to hire a full team",
          "Our growth is mostly from paid ads (with terrible CAC)",
          "We're pre-revenue but projecting $10M ARR in 2 years",
        ]}
      />

      <ConversionBanner message="Wondering if your metrics are actually seed-worthy? The Investment Memo breaks down exactly what 'good' looks like across every key metric." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Why Most Seed Pitches Fail</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Vanity Metrics Everywhere</h3>
            <p>
              "We have 100K users!" Cool. How many are active? How many pay? How many churned? 
              VCs can smell vanity metrics from a mile away.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. No Clear Growth Engine</h3>
            <p>
              You grew because you got lucky with a viral post, or your co-founder's network. 
              That's not repeatable. VCs want to see systematic, predictable growth.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Delusional Market Sizing</h3>
            <p>
              "We're going after the $500B healthcare market." No, you're not. You're going after 
              a tiny wedge that might be $50M TAM if you're lucky. Be honest about your actual addressable market.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Weak Competitive Understanding</h3>
            <p>
              "We have no competitors" is the fastest way to kill your credibility. Every market has 
              competition. Show you understand it and have a real differentiation strategy.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I have $50K+ MRR or equivalent usage metrics",
          "My unit economics are strong and defensible",
          "I have multiple working acquisition channels",
          "My retention cohorts show PMF (40%+ monthly retention)",
          "I can explain our defensibility in under 30 seconds",
          "I know exactly how to get to $1M ARR",
          "My raise amount matches realistic Series A milestones",
          "I have 18+ months runway with this round",
        ]}
      />

      <Callout type="warning">
        <strong>Consequences of Raising Seed Too Early:</strong> You'll get term sheets with terrible terms, 
        or worse—no term sheets at all. Then you'll be stuck in no-man's land: too far along to raise angel, 
        not strong enough for real VCs. Don't rush seed.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Winning Seed Founders Do</h2>
        <p>They make VCs compete for their round:</p>
        <ul className="space-y-2 my-4">
          <li>Over-deliver on traction before raising</li>
          <li>Know their metrics better than the VC does</li>
          <li>Have clear, credible plans to hit Series A metrics</li>
          <li>Raise from VCs who add strategic value, not just capital</li>
          <li>Create urgency by running a tight, fast process</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Master the Seed Fundraising Game
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template breaks down seed fundraising like no one else—what metrics 
          matter, how VCs evaluate you, and exactly how to position for maximum leverage.
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
