import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function EarlyTraction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/traction");
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
          Early Traction That Actually Matters: Signups Don't Count
        </h1>
        <p className="text-xl text-muted-foreground">
          If you're celebrating vanity metrics, you're celebrating the wrong things.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Hard Truth:</strong> 10,000 signups from Product Hunt is not traction. 
        It's marketing theater. Real traction is usage, retention, and revenue.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Actually Counts as Traction</h2>
        <p>
          Early traction isn't about big numbers. It's about proof that you've built something people 
          want and will use repeatedly. Here's what matters:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Active usage:</strong> People using your product daily/weekly, not just signing up.</li>
          <li><strong>Retention:</strong> 40%+ of users coming back after 30 days.</li>
          <li><strong>Word of mouth:</strong> Organic growth from users telling their friends.</li>
          <li><strong>Early revenue:</strong> Even $1K MRR proves someone values this enough to pay.</li>
          <li><strong>Product-market fit signals:</strong> Users complaining when features break.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "500 active users, 60% come back weekly",
          "$2K MRR from 20 paying customers in first 8 weeks",
          "35% of signups come from referrals",
          "Average user spends 20 minutes per session",
          "Users emailing us asking for new features",
        ]}
        bad={[
          "10,000 email signups from our launch",
          "We got featured on Product Hunt",
          "100,000 website visitors last month",
          "Our social media following is growing fast",
          "We have 50 beta testers who gave positive feedback",
        ]}
      />

      <ConversionBanner message="Confused about what traction signals actually matter? The VC Analysis breaks down real vs. vanity metrics at every stage." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Why Most Founders Get This Wrong</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Confusing Interest with Commitment</h3>
            <p>
              Someone giving you their email is interest. Someone using your product 3x per week is commitment. 
              Investors fund commitment, not curiosity.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Celebrating Launch Spikes</h3>
            <p>
              You got 5,000 signups on launch day. Cool. How many are still active 30 days later? 
              If the answer is 50, you have a retention problem, not traction.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Ignoring Retention Cohorts</h3>
            <p>
              If 80% of your users churn after one week, you don't have PMF. You have a leaky bucket. 
              Fix retention before scaling acquisition.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. No Path to Monetization</h3>
            <p>
              "We'll figure out monetization later" is code for "we have no idea if anyone will pay for this." 
              Test pricing EARLY. Even $10/month tells you something.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I track daily/weekly active users, not just signups",
          "My 30-day retention is above 40%",
          "I have organic growth from word of mouth",
          "I've tested monetization (even if it's just a few customers)",
          "Users actively engage with the product (not just login once)",
          "I can show cohort retention curves that prove PMF",
          "Users complain when the product is down",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Chase Vanity Metrics:</strong> You'll scale a broken product, burn cash, 
        and have nothing to show for it. Fix retention before you scale.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How to Build Real Traction</h2>
        <p>Focus on depth, not breadth:</p>
        <ul className="space-y-2 my-4">
          <li>Get 10 users who LOVE your product, not 1,000 who tried it once</li>
          <li>Obsess over retention—talk to churned users and fix the leaks</li>
          <li>Test monetization early—even if it's ugly and manual</li>
          <li>Build features based on what active users request</li>
          <li>Track the right metrics: DAU, retention, revenue</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Build Traction That Actually Matters
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum shows you exactly what early traction looks like, how to measure it, 
          and how to communicate it to investors who've seen it all.
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
