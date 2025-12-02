import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function VisionSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/vision");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">The Vision Slide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The fine line between inspiring and delusional.
      </p>

      <Callout type="warning">
        Vision is tricky. Too small and VCs won't care—they need massive outcomes. Too big 
        and you sound like a lunatic who's never shipped anything. The goal: paint a compelling 
        future that feels inevitable, not impossible.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What "Vision" Actually Means to VCs</h2>
      <p className="text-muted-foreground mb-6">
        VCs aren't looking for a mission statement. They want to understand: If everything goes 
        right, how big can this become? And more importantly—is there a plausible path from 
        where you are today to that massive outcome?
      </p>

      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <h3 className="font-bold text-foreground">The Three Components of Great Vision:</h3>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-primary">1. The End State</span>
            <p className="text-muted-foreground text-sm">What does the world look like if you win? Be specific about the change you'll create.</p>
          </div>
          <div>
            <span className="font-semibold text-primary">2. The Path</span>
            <p className="text-muted-foreground text-sm">How do you get from today's product to that end state? What are the expansion vectors?</p>
          </div>
          <div>
            <span className="font-semibold text-primary">3. The "Why Us"</span>
            <p className="text-muted-foreground text-sm">Why is your team uniquely positioned to execute this vision?</p>
          </div>
        </div>
      </div>

      <ComparisonTable
        good={[
          "'We're building the financial infrastructure for the gig economy' (Stripe-style positioning)",
          "Clear expansion path: 'Start with X, expand to Y, then Z'",
          "Vision grounded in current traction: 'We've proven X, which unlocks Y'",
          "Specific outcome: 'Every SMB will have enterprise-grade security'",
          "Backed by market trends: 'As X grows, we become essential'"
        ]}
        bad={[
          "'We're going to change the world' (meaningless)",
          "'We'll be the Uber of X' (lazy comparison)",
          "Vision completely disconnected from current product",
          "'We'll do everything for everyone' (no focus)",
          "Grandiose claims with zero supporting evidence"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Connecting Vision to Today's Traction</h2>
      <p className="text-muted-foreground mb-4">
        The most common vision slide mistake: it feels like a completely different company from 
        what you're building today. VCs need to see the bridge:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6 space-y-4">
        <p className="text-foreground font-semibold">The "Wedge to Platform" Framework:</p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li><strong>Today's Wedge:</strong> "We're the best solution for [specific problem] for [specific customer]"</li>
          <li><strong>First Expansion:</strong> "This gives us access to [adjacent problem/customer]"</li>
          <li><strong>Platform Vision:</strong> "Over time, we become the [category] for [broad market]"</li>
        </ol>
        <p className="text-sm text-muted-foreground mt-4 italic">
          Example: Salesforce started as sales force automation, expanded to service, marketing, 
          and became the cloud application platform for enterprises.
        </p>
      </div>

      <Callout type="danger">
        If your vision requires 47 things to go right simultaneously, you don't have a vision—you 
        have a fantasy. Great visions feel almost inevitable given current trends.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What "10x Thinking" Actually Means</h2>
      <p className="text-muted-foreground mb-4">
        VCs talk about "10x thinking" but most founders misunderstand it. It's not about being 
        10x more delusional. It's about:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Market selection:</strong> Picking a market that can support a 10x outcome</li>
        <li><strong>Ambition scope:</strong> Not artificially limiting yourself to "safe" goals</li>
        <li><strong>Willingness to disrupt:</strong> Being okay with changing how an industry works</li>
        <li><strong>Long-term orientation:</strong> Building for where the market is going, not where it is</li>
      </ul>

      <ConversionBanner 
        message="Struggling to articulate your vision? The Investment Memo Template includes a Vision section that shows exactly how VCs evaluate long-term potential."
        buttonText="Craft Your Vision"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Vision Slide Checklist</h2>
      <Checklist
        items={[
          "Clearly states the end-state you're building toward",
          "Shows plausible expansion path from today's product",
          "Grounded in current traction or market trends",
          "Explains why your team can execute this vision",
          "Big enough to excite VCs (billion-dollar potential)",
          "Specific enough to be credible (not just 'change the world')",
          "Connected to a real market shift or 'why now'"
        ]}
      />

      <Callout type="success">
        The best vision slides make VCs think: "I can see how this becomes massive, and I can see 
        how they get there from here." That's the sweet spot—ambitious but credible.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Build Your Investment Memo
        </Button>
      </div>
    </ContentBlock>
  );
}
