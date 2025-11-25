import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function PreSeedStage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/pre-seed");
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
          Pre-Seed: The Stage Where Most Founders Die Without Knowing Why
        </h1>
        <p className="text-xl text-muted-foreground">
          Pre-seed isn't about being "early." It's about proving you're not delusional.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> If you're raising pre-seed, you're not selling potential anymore. 
        You're selling proof that you can execute. Angels bet on people. Pre-seed investors bet on traction.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Pre-Seed Investors Actually Look For</h2>
        <p>
          Pre-seed is the awkward middle child of fundraising. You're too developed for angels, 
          but not mature enough for seed VCs. Here's what actually gets funded:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Real traction:</strong> Not signups. Not waitlists. Paying users or undeniable usage.</li>
          <li><strong>Product-market fit signals:</strong> Retention numbers that don't make investors cringe.</li>
          <li><strong>Repeatable acquisition:</strong> You found a channel. It works. You can prove it.</li>
          <li><strong>Team that ships:</strong> You've built something real, not just decks and landing pages.</li>
          <li><strong>Clear path to seed:</strong> Investors need to see how you hit seed metrics in 12-18 months.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "5,000 active users with 40% weekly retention",
          "$10K MRR with 3 month payback period",
          "Clear unit economics: CAC $50, LTV $300",
          "Founder previously shipped products at scale",
          "Raising $500K to hit $50K MRR in 12 months",
        ]}
        bad={[
          "We have 50,000 signups (all from Product Hunt)",
          "Our beta users love us (no actual usage data)",
          "We're raising $1M to figure out monetization",
          "We need money to build the MVP",
          "Our projections show $1M ARR next year (with zero revenue today)",
        ]}
      />

      <ConversionBanner message="Not sure if you're actually ready for pre-seed? The Investment Memo breaks down the exact traction thresholds and what 'good enough' really means." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Common Pre-Seed Killers</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Confusing Activity with Traction</h3>
            <p>
              You have users. Great. Do they come back? Do they pay? Do they tell their friends? 
              If the answer is "not really," you don't have traction. You have tire-kickers.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Raising Too Much Too Early</h3>
            <p>
              Asking for $2M at pre-seed signals you don't understand capital efficiency. 
              Pre-seed rounds are $300K-$1M. Any more and you're actually trying to raise seed.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. No Credible Seed Plan</h3>
            <p>
              "We'll use this to grow" isn't a plan. Investors want to see: with $500K, we'll go from 
              $5K MRR to $50K MRR by doing X, Y, Z. Be specific. Be realistic.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Ignoring Unit Economics</h3>
            <p>
              If you can't articulate CAC, LTV, and payback period, you're not ready. These aren't 
              "later" problems. They're pre-seed fundamentals.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I have real users (not just signups)",
          "I can show retention metrics that prove PMF",
          "I have revenue OR crystal-clear path to monetization",
          "My unit economics are defensible (or I have a plan to get there)",
          "I know exactly what metrics I need to hit for seed",
          "My raise amount matches realistic 12-18 month milestones",
          "I can prove we're capital efficient",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Raise Too Early:</strong> You'll burn the round figuring out what 
        you should've figured out pre-raise. Then you'll run out of money with nothing to show, and 
        no one will fund your next round. Pre-seed is expensive. Make sure you're ready.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Pre-Seed Founders Do</h2>
        <p>They don't raise until they have to. Here's what that looks like:</p>
        <ul className="space-y-2 my-4">
          <li>Bootstrap to prove the model works</li>
          <li>Get to $5K-$20K MRR before raising (or undeniable usage if pre-revenue)</li>
          <li>Know their numbers cold: CAC, LTV, churn, cohort retention</li>
          <li>Raise only what they need to hit seed metrics</li>
          <li>Use angels and micro-funds who move fast</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Build a Bulletproof Pre-Seed Strategy
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template shows you exactly how to position for pre-seed, 
          what traction actually matters, and how to avoid the mistakes that kill 80% of pre-seed raises.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get the Investment Memo
        </Button>
      </div>
    </div>
  );
}
