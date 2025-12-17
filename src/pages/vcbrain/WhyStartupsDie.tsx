import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function WhyStartupsDie() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/death");
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
          Why Startups Actually Die: It's Not What TechCrunch Says
        </h1>
        <p className="text-xl text-muted-foreground">
          Most founders die slowly, convincing themselves they're still building something that matters.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> Startups don't die because they ran out of money. 
        They die because they ran out of money AFTER failing to find product-market fit.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">The Real Reasons Startups Die</h2>
        <p>
          TechCrunch will write about "market timing" or "competitive pressure." That's PR speak. 
          Here's what actually kills startups:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>No one wants what you're building:</strong> You built a solution looking for a problem.</li>
          <li><strong>Founders give up:</strong> It's harder than they thought. They quit before PMF.</li>
          <li><strong>Co-founder breakups:</strong> Team dysfunction kills more startups than bad ideas.</li>
          <li><strong>Slow execution:</strong> You moved too slowly. Someone else shipped faster.</li>
          <li><strong>Premature scaling:</strong> Hired too fast, spent too much, died before finding fit.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "Shipped 10 iterations in 3 months based on user feedback",
          "Stayed lean: 2 founders, no office, $5K/month burn",
          "Pivoted 3 times before finding what worked",
          "Founders aligned on vision, equity, and work ethic",
        ]}
        bad={[
          "Spent 18 months perfecting the MVP before launch",
          "Raised $2M, hired 15 people, burned $150K/month",
          "Refused to pivot despite zero traction",
          "Co-founders fighting over equity and strategy",
        ]}
      />

      <ConversionBanner message="Want to avoid the mistakes that kill 90% of startups? The VC Analysis breaks down the death traps and how to navigate around them." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">The Startup Death Spiral</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Building in a Vacuum</h3>
            <p>
              You spend 12 months building features no one asked for. You launch. Crickets. 
              You're confused because YOU love the product. Users don't.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Ignoring the Retention Problem</h3>
            <p>
              You have users, but 90% churn after one week. Instead of fixing retention, you pour money 
              into acquisition. You're filling a leaky bucket.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Hiring Too Early</h3>
            <p>
              You raise money and immediately hire a team. Now you have $200K/month burn with no PMF. 
              Six months later, you're out of cash and pivoting with a bloated team.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Founder Burnout</h3>
            <p>
              Two years in, no real traction, living on ramen. One founder wants out. The other is 
              exhausted. You shut down not because it couldn't work, but because you couldn't keep going.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I'm talking to users weekly (not building in isolation)",
          "I ship fast and iterate based on feedback",
          "My burn rate is sustainable for 18+ months",
          "Co-founder relationship is strong (clear roles, aligned vision)",
          "I'm focused on retention before scaling acquisition",
          "I haven't hired prematurely (still lean and scrappy)",
          "I have clear milestones and pivot triggers",
        ]}
      />

      <Callout type="warning">
        <strong>The Most Common Death:</strong> You never find PMF but convince yourself you're "almost there" 
        for 2 years. By the time you admit it's not working, you're out of time, money, and energy.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How to Not Die</h2>
        <p>Survival is about discipline, not luck:</p>
        <ul className="space-y-2 my-4">
          <li>Stay lean until you find PMF—don't hire, don't scale, don't spend</li>
          <li>Ship fast, get feedback, iterate weekly</li>
          <li>Set clear pivot triggers—if X doesn't happen in Y months, pivot</li>
          <li>Protect the co-founder relationship—align early and communicate constantly</li>
          <li>Focus on retention metrics before anything else</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Avoid the Death Traps
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum breaks down the exact patterns that kill startups and how to 
          recognize when you're heading toward one of them.
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
