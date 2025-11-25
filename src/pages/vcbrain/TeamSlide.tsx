import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function TeamSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deck/team");
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
          Team Slide: Why Your LinkedIn Headline Doesn't Matter
        </h1>
        <p className="text-xl text-muted-foreground">
          VCs don't invest in resumes. They invest in proof you can ship.
        </p>
      </div>

      <Callout type="danger">
        <strong>The Brutal Truth:</strong> "Stanford MBA, ex-Google, 10 years in tech" means nothing if you've 
        never built a product from scratch. VCs want evidence you can execute in chaos, not polish corporate decks.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What VCs Actually Look For</h2>
        <p>
          Team slides are where founders flex credentials that don't matter. Here's what VCs actually evaluate:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Founder-market fit:</strong> Have you lived this problem? Do you deeply understand this customer?</li>
          <li><strong>Evidence of shipping:</strong> Have you built and launched products before (even if they failed)?</li>
          <li><strong>Complementary skills:</strong> Do you have the core skills covered (tech, product, growth)?</li>
          <li><strong>Commitment signals:</strong> Are you full-time? Did you quit cushy jobs? Have you invested your own money?</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "Founder spent 5 years as fintech compliance officer, saw this problem daily",
          "CTO built and scaled infrastructure at Stripe to 10M TPS",
          "Both founders quit Google to go full-time on this 18 months ago",
          "Team previously launched 2 products together (one acquired, one failed)",
        ]}
        bad={[
          "MBA from Harvard, consultant at McKinsey",
          "Worked at 3 Fortune 500 companies",
          "Founder is still employed full-time elsewhere",
          "We're recruiting a technical co-founder",
          "Advisor network includes 10 Fortune 500 execs",
        ]}
      />

      <ConversionBanner message="Not sure how to position your team for maximum credibility? The Investment Memo shows you exactly what signals matter and which ones are noise." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Team Slide Disasters</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Resume Dumping</h3>
            <p>
              10 lines of every job you've ever had. VCs don't care that you were an analyst at Goldman in 2015. 
              They care about what you've BUILT that's relevant to this startup.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Still Looking for a Co-Founder</h3>
            <p>
              "We're recruiting a technical co-founder." Translation: I haven't convinced anyone to quit their 
              job and bet on this with me. If YOU don't believe enough to commit, why should a VC?
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Advisor Theater</h3>
            <p>
              Listing 15 advisors with fancy titles doesn't impress anyone. Advisors don't build companies. 
              Founders do. Show me YOUR ability to execute, not your Rolodex.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. No Founder-Market Fit</h3>
            <p>
              You're building a healthcare product but have zero healthcare experience. That's not impossible, 
              but you better have a compelling story about why you're the right person to solve this.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I can articulate clear founder-market fit",
          "I've shown evidence of shipping products before",
          "My co-founders complement my skills (tech + product + growth)",
          "We're all full-time on this startup",
          "I highlight relevant accomplishments, not job titles",
          "I avoid advisor name-dropping",
          "I explain WHY this team can win in this market",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If Your Team Is Weak:</strong> VCs will pass, no matter how good the idea is. 
        Execution beats ideas 100 times out of 100. A strong team with a mediocre idea beats a weak team with a great idea.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do</h2>
        <p>They prove they're obsessed and capable:</p>
        <ul className="space-y-2 my-4">
          <li>Lead with founder-market fit—why they're uniquely positioned to win</li>
          <li>Show they've built things before (products, companies, side projects)</li>
          <li>Highlight complementary skill sets that cover all critical areas</li>
          <li>Demonstrate full commitment (quit jobs, invested savings, years of work)</li>
          <li>Keep it short—2-3 bullets per founder, focused on what matters</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Position Your Team for Maximum Credibility
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template shows you how to present your team the way VCs evaluate founders—
          focus on execution, commitment, and founder-market fit, not credentials.
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
