import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function FounderMarketFit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/guides/founder-fit");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Founder-Market Fit</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Why YOU? The most important question VCs ask (but rarely say out loud).
      </p>

      <Callout type="warning">
        Founder-market fit isn't about having 20 years of industry experience. It's about having 
        a unique insight or advantage that makes you the right person to solve this specific 
        problem. VCs invest in people, not just ideas—and they need to believe YOU will figure it out.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What Founder-Market Fit Actually Means</h2>
      <p className="text-muted-foreground mb-6">
        It's the answer to: "Why are you uniquely positioned to win in this market?" Strong 
        founder-market fit means you have unfair advantages that others don't.
      </p>

      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <h3 className="font-bold text-foreground">Types of Founder-Market Fit:</h3>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-primary">Domain Expertise</span>
            <p className="text-muted-foreground text-sm">You've worked in this industry for years. You know the problems, the players, the distribution channels, and where the bodies are buried.</p>
          </div>
          <div>
            <span className="font-semibold text-primary">Technical Expertise</span>
            <p className="text-muted-foreground text-sm">You invented the technology or have rare technical skills that make your solution possible.</p>
          </div>
          <div>
            <span className="font-semibold text-primary">Lived Experience</span>
            <p className="text-muted-foreground text-sm">You've personally suffered from this problem. You're building what you desperately wanted but couldn't find.</p>
          </div>
          <div>
            <span className="font-semibold text-primary">Network Advantage</span>
            <p className="text-muted-foreground text-sm">You have unique access to customers, partners, or talent that others can't replicate.</p>
          </div>
          <div>
            <span className="font-semibold text-primary">Contrarian Insight</span>
            <p className="text-muted-foreground text-sm">You see something about this market that others don't. Your insight is your edge.</p>
          </div>
        </div>
      </div>

      <ComparisonTable
        good={[
          "'I spent 8 years running supply chain at [Company]—I know exactly where the inefficiencies are'",
          "'I was the first engineer at [Startup] that solved this for enterprises; now I'm solving it for SMBs'",
          "'I struggled with this problem for 3 years and built 4 failed internal tools before starting this company'",
          "'My PhD research is the foundation of our core technology'",
          "'I have relationships with 50 potential customers from my previous role'"
        ]}
        bad={[
          "'I'm passionate about this space'",
          "'I did some research and saw a gap in the market'",
          "'I'm a quick learner and can figure out any industry'",
          "'My MBA taught me about this sector'",
          "'I've used competing products and think I can do better'"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Articulate Your Unique Insight</h2>
      <p className="text-muted-foreground mb-4">
        Your "unique insight" is the thing you know or believe that most people don't. It's 
        the foundation of your company. Structure it like this:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <p className="text-foreground font-semibold mb-3">The Unique Insight Formula:</p>
        <p className="text-muted-foreground mb-4">
          "Most people think [conventional wisdom]. But I've learned that [contrarian insight] 
          because [evidence/experience]. This means [opportunity]."
        </p>
        <div className="border-t border-primary/20 pt-4 mt-4">
          <p className="text-sm text-foreground font-medium">Example:</p>
          <p className="text-sm text-muted-foreground italic">
            "Most people think enterprise sales requires a large sales team. But I've learned that 
            product-led growth works even for $100K+ deals—because I saw it happen at Slack. 
            This means we can build an enterprise company with 80% lower sales costs."
          </p>
        </div>
      </div>

      <Callout type="danger">
        "I'm passionate" is not founder-market fit. Neither is "I did a lot of research." 
        VCs want evidence that you have an unfair advantage—not just enthusiasm.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">When Lack of Industry Experience Is OK</h2>
      <p className="text-muted-foreground mb-4">
        Not having traditional industry experience isn't a dealbreaker if you have:
      </p>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Fresh perspective:</strong> Sometimes outsiders see opportunities that insiders miss due to "this is how we've always done it" thinking</li>
        <li><strong>Adjacent expertise:</strong> You solved a similar problem in a different industry and are applying those learnings</li>
        <li><strong>Technical breakthrough:</strong> Your technology enables something that wasn't possible before, regardless of industry knowledge</li>
        <li><strong>Obsessive learning:</strong> You've talked to 200+ potential customers and understand the space better than most insiders</li>
        <li><strong>Strong team complement:</strong> You lack domain expertise but your co-founder or early hires fill that gap</li>
      </ul>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Building Credibility When You're Not an "Insider"</h2>
      
      <div className="space-y-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Customer interviews:</span>
          <span className="text-muted-foreground ml-2">200+ conversations with potential customers shows commitment and generates real insight.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Advisory board:</span>
          <span className="text-muted-foreground ml-2">Industry experts as advisors adds credibility and fills knowledge gaps.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Pilot customers:</span>
          <span className="text-muted-foreground ml-2">Real customers paying you proves you understand their needs well enough to serve them.</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-semibold text-foreground">Public expertise:</span>
          <span className="text-muted-foreground ml-2">Writing, speaking, or open-source contributions that demonstrate deep understanding.</span>
        </div>
      </div>

      <ConversionBanner 
        message="Need to articulate your founder-market fit for investors? The Investment Memo Template includes a Team section showing exactly how to position your unique advantages."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Founder-Market Fit Checklist</h2>
      <Checklist
        items={[
          "Can articulate your unique insight in 2-3 sentences",
          "Have at least one type of unfair advantage",
          "Can explain why YOU will win, not just why the opportunity is big",
          "Have evidence to back up your claims (experience, customers, data)",
          "Address any obvious gaps in expertise proactively",
          "Team composition complements individual weaknesses",
          "Can answer 'why now' with a clear market timing argument",
          "Have done the work (customer interviews, pilots, research) to prove commitment"
        ]}
      />

      <Callout type="success">
        The strongest founder-market fit stories make VCs think: "Of course they're the ones to 
        build this." Your job is to make your advantage obvious—not just claim it exists.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Build Your Founder Story
        </Button>
      </div>
    </ContentBlock>
  );
}
