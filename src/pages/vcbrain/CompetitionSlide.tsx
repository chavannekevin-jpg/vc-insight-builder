import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function CompetitionSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/competition");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">The Competition Slide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        "We have no competitors" is the fastest way to lose credibility.
      </p>

      <Callout type="danger">
        If you say "we have no competitors," VCs hear: "I haven't done my research" or 
        "I don't understand my market." Every startup has competition—even if it's just 
        the status quo or doing nothing.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">What VCs Actually Want to See</h2>
      <p className="text-muted-foreground mb-6">
        The competition slide isn't about proving you're alone. It's about proving you 
        understand your market AND have a defensible position within it. VCs want to see 
        market validation (competitors prove demand exists) combined with clear differentiation.
      </p>

      <ComparisonTable
        good={[
          "Clear competitive landscape with 4-6 relevant players",
          "Honest assessment of competitor strengths",
          "Specific, defensible differentiation (not 'better UX')",
          "Showing why you will win specific customer segments",
          "Including indirect competitors and status quo"
        ]}
        bad={[
          "'We have no competitors'",
          "Only listing tiny, irrelevant startups",
          "Generic axes like 'price vs. quality'",
          "Claiming you're better at everything",
          "Ignoring obvious big players in the space"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Competitive Matrix That Works</h2>
      <p className="text-muted-foreground mb-4">
        Forget the 2x2 matrix with you in the top-right corner. VCs have seen it a thousand 
        times and know it's usually BS. Instead, try these approaches:
      </p>

      <div className="bg-card border border-border rounded-lg p-6 my-6 space-y-4">
        <h3 className="font-bold text-foreground">1. Feature Comparison Table</h3>
        <p className="text-muted-foreground text-sm">
          A simple table showing specific features/capabilities. Be honest—if a competitor 
          beats you somewhere, show it. Credibility &gt; perfection.
        </p>
        
        <h3 className="font-bold text-foreground">2. Customer Segment Map</h3>
        <p className="text-muted-foreground text-sm">
          Show which competitors serve which customer segments. Then show the underserved 
          segment you're targeting and why.
        </p>
        
        <h3 className="font-bold text-foreground">3. The "Why Now" Differentiator</h3>
        <p className="text-muted-foreground text-sm">
          Show what changed in the market that makes your approach possible NOW when it 
          wasn't before. This is powerful because it explains why incumbents can't just copy you.
        </p>
      </div>

      <Callout type="warning">
        Never put yourself in the top-right corner of a 2x2 matrix. VCs know you cherry-picked 
        the axes to make yourself look good. It screams "I'm not being honest about my position."
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Types of Competition to Include</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Direct competitors:</strong> Companies solving the same problem for the same customer</li>
        <li><strong>Indirect competitors:</strong> Different solution to the same problem (spreadsheets, manual processes)</li>
        <li><strong>Status quo:</strong> What happens if customers do nothing? This is often your biggest competitor</li>
        <li><strong>Potential future competitors:</strong> Big players who could enter your space</li>
      </ul>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Show Differentiation Without Bashing</h2>
      <p className="text-muted-foreground mb-4">
        Trashing competitors makes you look insecure. Instead, acknowledge their strengths 
        while highlighting your unique approach:
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <p className="text-foreground italic">
          "Competitor X is excellent for enterprise customers with complex needs. We're taking 
          a different approach—focused on SMBs who need to get started in minutes, not months. 
          Different customer, different product, different go-to-market."
        </p>
      </div>

      <ConversionBanner 
        message="Want to see how top founders position against competition? The VC Analysis shows you exactly how to frame your competitive advantage."
        buttonText="Get Your Analysis"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Competition Slide Checklist</h2>
      <Checklist
        items={[
          "Includes 4-6 relevant competitors (not too few, not too many)",
          "Shows both direct and indirect competition",
          "Acknowledges competitor strengths honestly",
          "Differentiates on specific, verifiable criteria",
          "Explains why your differentiation matters to customers",
          "Addresses the 'why can't big player X just copy you?' question",
          "Avoids the cliché 2x2 matrix with you in top-right"
        ]}
      />

      <Callout type="success">
        The best competition slides make VCs think: "This founder really understands their market 
        and has a clear, defensible position." That's the goal—not pretending you're alone.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your VC Analysis
        </Button>
      </div>
    </ContentBlock>
  );
}
