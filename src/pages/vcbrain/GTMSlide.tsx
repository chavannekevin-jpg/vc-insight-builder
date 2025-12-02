import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function GTMSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/gtm");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">The Go-To-Market Slide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        "We'll do content, paid ads, partnerships, and virality" = we have no idea.
      </p>

      <Callout type="danger">
        The GTM slide is where founders expose their lack of focus. Listing every possible 
        channel isn't a strategy—it's a confession that you haven't figured out how you'll 
        actually acquire customers.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Early-Stage GTM Reality</h2>
      <p className="text-muted-foreground mb-6">
        At pre-seed and seed, you don't need 10 channels. You need 1-2 channels that you 
        deeply understand and can execute better than anyone. The goal is proving you can 
        acquire customers profitably—not building a marketing empire.
      </p>

      <ComparisonTable
        good={[
          "One primary channel with proven early results",
          "Clear unit economics for that channel",
          "Specific tactics, not just channel names",
          "Founded insight into why this channel works for you",
          "Realistic CAC targets based on actual data"
        ]}
        bad={[
          "Listing 6+ channels you'll 'pursue'",
          "'We'll go viral' as a strategy",
          "No data on any channel performance",
          "'We'll hire a growth person to figure it out'",
          "Generic tactics that apply to any company"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Three GTM Archetypes</h2>
      
      <div className="space-y-4 my-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-foreground text-lg mb-2">🎯 Sales-Led (High ACV)</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Best for: B2B with $10K+ ACV, complex products, enterprise buyers
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Outbound prospecting (email, LinkedIn, events)</li>
            <li>Inbound from content/SEO → sales qualification</li>
            <li>Longer sales cycles, higher touch</li>
            <li>Focus: pipeline generation, conversion rates, deal size</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-foreground text-lg mb-2">🔄 Product-Led (Low ACV, High Volume)</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Best for: SMB SaaS, developer tools, prosumer products
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Self-serve signup, freemium or free trial</li>
            <li>In-product growth loops and virality</li>
            <li>Content marketing for organic acquisition</li>
            <li>Focus: activation rate, time-to-value, expansion revenue</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-bold text-foreground text-lg mb-2">🤝 Community-Led (Trust-Dependent)</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Best for: Developer tools, creator economy, niche B2B
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
            <li>Community building before product</li>
            <li>Thought leadership and education</li>
            <li>Word-of-mouth and referrals</li>
            <li>Focus: community engagement, NPS, organic mentions</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Channel Prioritization Framework</h2>
      <p className="text-muted-foreground mb-4">
        For each potential channel, ask:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li><strong>Where do our customers already hang out?</strong> Go to them, don't make them find you.</li>
          <li><strong>What's our unfair advantage in this channel?</strong> Domain expertise? Existing audience? Technical capability?</li>
          <li><strong>What's the CAC potential?</strong> Can we acquire customers profitably here?</li>
          <li><strong>What's the scalability ceiling?</strong> Will this channel support 10x growth?</li>
          <li><strong>What evidence do we have?</strong> Even early signals beat pure hypothesis.</li>
        </ol>
      </div>

      <Callout type="warning">
        "We'll do paid acquisition" is not a GTM strategy. Which platform? What targeting? 
        What creative? What's your current CAC and target? VCs want specifics.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Paid vs Organic vs Product-Led</h2>
      <p className="text-muted-foreground mb-4">
        The honest truth about each:
      </p>

      <div className="space-y-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Paid:</span>
          <span className="text-muted-foreground ml-2">Fast to test, expensive to scale. Great for validation, dangerous for unit economics if you're not careful.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Organic/Content:</span>
          <span className="text-muted-foreground ml-2">Slow to build, compounds over time. Best if you have genuine expertise. Takes 6-12 months to see results.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Product-Led:</span>
          <span className="text-muted-foreground ml-2">Requires product investment upfront. Works best when your product naturally creates value for multiple users.</span>
        </div>
      </div>

      <ConversionBanner 
        message="Need to structure your GTM strategy for investors? The Investment Memo Template includes a complete GTM framework with channel analysis and unit economics."
        buttonText="Get the Framework"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">GTM Slide Checklist</h2>
      <Checklist
        items={[
          "Identifies 1-2 primary channels (not 6+)",
          "Shows early evidence or data from those channels",
          "Includes realistic CAC targets with rationale",
          "Explains why these channels work for YOUR business",
          "Clear customer acquisition funnel (awareness → activation)",
          "Addresses how you'll scale if early channels work",
          "Honest about what you don't know yet"
        ]}
      />

      <Callout type="success">
        The best GTM slides show VCs that you've done the work: you've talked to customers, 
        you've tested channels, and you have a focused plan based on evidence—not hope.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Build Your GTM Strategy
        </Button>
      </div>
    </ContentBlock>
  );
}
