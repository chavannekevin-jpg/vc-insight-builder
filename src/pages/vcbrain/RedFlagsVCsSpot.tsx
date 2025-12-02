import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function RedFlagsVCsSpot() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/mistakes/red-flags");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Red Flags VCs Spot Instantly</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The things that make investors pass in the first 5 minutes—often without telling you why.
      </p>

      <Callout type="danger">
        VCs rarely tell you the real reason they passed. They say "not the right fit" when 
        they mean "I spotted 3 red flags in your first email." Here are the instant-pass 
        triggers that experienced investors recognize immediately.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Instant Pass Triggers</h2>
      
      <div className="space-y-4 my-6">
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚫 "We Have No Competitors"</h4>
          <p className="text-muted-foreground text-sm">
            Signals you either haven't done your research or don't understand your market. 
            Every startup has competition—even if it's the status quo.
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚫 Inflated TAM Claims</h4>
          <p className="text-muted-foreground text-sm">
            "$50B market opportunity" with no explanation of how you'll capture any of it. 
            VCs want to see realistic SAM/SOM, not made-up numbers.
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚫 Asking for an NDA</h4>
          <p className="text-muted-foreground text-sm">
            VCs don't sign NDAs—they see too many similar pitches. Asking shows you don't 
            understand how fundraising works and suggests you're more focused on secrecy than execution.
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚫 "We Just Need Marketing"</h4>
          <p className="text-muted-foreground text-sm">
            If your product isn't selling, more marketing usually isn't the answer. This 
            signals you don't understand why customers aren't buying.
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚫 Unrealistic Projections</h4>
          <p className="text-muted-foreground text-sm">
            "$100M ARR in 3 years" from a pre-revenue startup with no explanation of how. 
            Shows you either don't understand your market or aren't being honest.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Body Language & Communication Red Flags</h2>
      
      <ComparisonTable
        good={[
          "Makes eye contact, speaks clearly",
          "Admits uncertainty when appropriate",
          "Takes notes on feedback",
          "Asks thoughtful questions about the investor",
          "Responds to pushback with data, not defensiveness"
        ]}
        bad={[
          "Avoids eye contact, mumbles",
          "Has an answer for everything (even when they shouldn't)",
          "Gets defensive when challenged",
          "Doesn't know anything about the investor or fund",
          "Talks over the investor or dominates conversation"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Structural Red Flags</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">🏗️ Cap Table Issues</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Founders own less than 50% pre-Series A</li>
            <li>Dead equity from departed founders</li>
            <li>Too many investors from previous rounds</li>
            <li>Complex structures (SAFEs + notes + equity)</li>
          </ul>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">⚖️ Legal Issues</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>No clear IP ownership</li>
            <li>Pending lawsuits or disputes</li>
            <li>Regulatory issues not addressed</li>
            <li>Missing employment agreements</li>
          </ul>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">👥 Team Issues</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Solo technical founder, no business co-founder</li>
            <li>All part-time founders</li>
            <li>Recent co-founder departure unexplained</li>
            <li>No relevant experience for this market</li>
          </ul>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">💰 Financial Issues</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Less than 3 months runway</li>
            <li>Unexplained burn rate changes</li>
            <li>Revenue concentration (one customer = 80%+)</li>
            <li>Declining metrics hidden in presentation</li>
          </ul>
        </div>
      </div>

      <Callout type="warning">
        VCs do reference checks. They'll call your previous investors, former employees, 
        and customers. If there are skeletons in your closet, they'll find them. Better 
        to address issues proactively than have them discovered.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Address Red Flags Proactively</h2>
      <p className="text-muted-foreground mb-4">
        Every company has some red flags. The question is how you handle them:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6 space-y-4">
        <div>
          <p className="font-semibold text-foreground">1. Acknowledge, Don't Hide</p>
          <p className="text-muted-foreground text-sm">
            "We lost a co-founder 6 months ago. Here's what happened and why the remaining 
            team is stronger for it."
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">2. Show the Fix</p>
          <p className="text-muted-foreground text-sm">
            "Our cap table is complex from early fundraising mistakes. We've restructured it 
            and here's the current clean state."
          </p>
        </div>
        <div>
          <p className="font-semibold text-foreground">3. Reframe as Learning</p>
          <p className="text-muted-foreground text-sm">
            "Our first product failed. Here's what we learned and why this approach is different."
          </p>
        </div>
      </div>

      <ConversionBanner 
        message="The Investment Memo Template helps you identify and address potential red flags before VCs find them. Structure your story for maximum credibility."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Red Flag Self-Check</h2>
      <Checklist
        items={[
          "I can name 4+ competitors and explain my differentiation",
          "My TAM/SAM/SOM is realistic and defensible",
          "I never ask for NDAs",
          "My projections are based on specific, labeled assumptions",
          "I can explain any past failures or co-founder departures",
          "My cap table is clean and founders own majority",
          "I have 6+ months runway",
          "No single customer is more than 30% of revenue",
          "All IP is properly assigned to the company",
          "I respond to pushback with curiosity, not defensiveness"
        ]}
      />

      <Callout type="success">
        The founders who succeed are transparent about their challenges. VCs respect honesty 
        and self-awareness far more than a polished pitch that hides problems.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Fix Your Red Flags
        </Button>
      </div>
    </ContentBlock>
  );
}
