import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function PitchingWithoutHype() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/pitching");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Pitching Without Hype</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Credibility beats excitement. Data beats adjectives. Every time.
      </p>

      <Callout type="danger">
        VCs have finely-tuned BS detectors. Years of seeing thousands of pitches mean they 
        instantly recognize hollow hype. The founders who stand out are the ones who let 
        their numbers do the talking—not their adjectives.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Credibility > Excitement Framework</h2>
      <p className="text-muted-foreground mb-6">
        Excitement fades. Credibility compounds. When you make a claim, VCs are immediately 
        asking: "Can they prove this?" If the answer is no, you've lost them.
      </p>

      <ComparisonTable
        good={[
          "'We grew 40% month-over-month for 6 months'",
          "'3 of our 5 pilot customers converted to paid'",
          "'Customer X reduced processing time by 73%'",
          "'We've interviewed 200 potential customers'",
          "'Our CAC has dropped from $500 to $180 since launch'"
        ]}
        bad={[
          "'We're experiencing explosive growth'",
          "'Customers love our product'",
          "'We're disrupting a massive industry'",
          "'Our technology is revolutionary'",
          "'We're the Uber of X'"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Replacing Adjectives with Data</h2>
      
      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <p className="text-muted-foreground text-sm mb-4">
          Every vague claim can be replaced with a specific, verifiable one:
        </p>
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2 border-b border-border pb-3">
            <span className="text-red-400 line-through">"Fast growth"</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-green-400">"3x revenue in 6 months"</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 border-b border-border pb-3">
            <span className="text-red-400 line-through">"High retention"</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-green-400">"94% monthly retention, 115% NRR"</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 border-b border-border pb-3">
            <span className="text-red-400 line-through">"Large market"</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-green-400">"$4B spent annually on this problem"</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 border-b border-border pb-3">
            <span className="text-red-400 line-through">"Strong team"</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-green-400">"3 exits, 15 years in the space"</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-red-400 line-through">"Early traction"</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-green-400">"$45K MRR from 12 paying customers"</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The "Quiet Confidence" Approach</h2>
      <p className="text-muted-foreground mb-4">
        The best founders don't need to tell you how great they are—their results speak for them. 
        This is the tone to aim for:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <p className="text-foreground italic mb-4">
          "We launched 4 months ago. We're at $30K MRR with 8 customers, all from cold outreach. 
          Retention is 95%. We think we can get to $100K MRR by Q2 if we can add 2 salespeople. 
          That's why we're raising."
        </p>
        <p className="text-sm text-muted-foreground">
          No adjectives. No claims of disruption. Just facts that let the VC form their own conclusion.
        </p>
      </div>

      <Callout type="warning">
        If you find yourself using words like "revolutionary," "disruptive," "game-changing," 
        or "exponential"—stop. Replace each one with a specific number or fact.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Confident vs Arrogant: The Line</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-2">✓ Confident</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>"We believe we can win because..."</li>
            <li>"Our data suggests..."</li>
            <li>"We're testing the hypothesis that..."</li>
            <li>"We've learned that our advantage is..."</li>
            <li>Acknowledges risks and how you'll address them</li>
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">✗ Arrogant</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>"We will definitely dominate..."</li>
            <li>"No one else can do what we do..."</li>
            <li>"It's obvious that..."</li>
            <li>"We're guaranteed to..."</li>
            <li>Dismisses risks or competition</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Handling "What If" Questions</h2>
      <p className="text-muted-foreground mb-4">
        VCs will probe your claims. The credible response vs the hype response:
      </p>

      <div className="space-y-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-foreground font-medium mb-2">Q: "What if Google enters your market?"</p>
          <p className="text-red-400 text-sm mb-1">❌ Hype: "They can't catch us, we're too far ahead."</p>
          <p className="text-green-400 text-sm">✓ Credible: "It's a real risk. Here's why we think we can still win: [specific defensibility] + [execution speed]. If they enter, we'll likely need to [specific strategy]."</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-foreground font-medium mb-2">Q: "How do you know customers will pay?"</p>
          <p className="text-red-400 text-sm mb-1">❌ Hype: "Everyone we've talked to said they'd definitely pay."</p>
          <p className="text-green-400 text-sm">✓ Credible: "We have 5 letters of intent totaling $120K ARR. 3 have already converted to pilots at $2K/month. We're not certain about price elasticity yet—that's what we're testing next."</p>
        </div>
      </div>

      <ConversionBanner 
        message="Want to structure your pitch with data-driven credibility? The Investment Memo Template shows exactly what evidence VCs want to see."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Pitching Credibility Checklist</h2>
      <Checklist
        items={[
          "Every claim is backed by a specific number or fact",
          "No adjectives without accompanying data",
          "Risks acknowledged and addressed",
          "Competition respected (not dismissed)",
          "Uncertainties stated honestly",
          "Projections labeled as targets, not certainties",
          "Tone is confident but not arrogant",
          "You'd believe your pitch if you were the investor"
        ]}
      />

      <Callout type="success">
        The founders VCs trust most are the ones who underpromise and overdeliver. Let your 
        metrics speak for themselves. Quiet confidence beats loud claims every time.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Build Your Credible Pitch
        </Button>
      </div>
    </ContentBlock>
  );
}
