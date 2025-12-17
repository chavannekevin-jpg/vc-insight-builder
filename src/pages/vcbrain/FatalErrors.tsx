import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function FatalErrors() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/mistakes/fatal");
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

  const fatalErrors = [
    {
      number: 1,
      title: "Building Without Talking to Customers",
      description: "Spending months (or years) building before validating that anyone wants what you're making.",
      why: "Most products fail because they solve a problem nobody has—or solve it in a way nobody wants.",
      fix: "Talk to 50 potential customers before writing a line of code. Pre-sell before you build."
    },
    {
      number: 2,
      title: "Running Out of Cash",
      description: "Failing to raise or extend runway before it's too late. The #1 technical cause of startup death.",
      why: "Desperate founders get terrible terms or no terms. Layoffs and pivots are harder when you're broke.",
      fix: "Start fundraising with 9+ months runway. Cut costs early, not when you're desperate."
    },
    {
      number: 3,
      title: "Founder Conflict",
      description: "Co-founder relationships deteriorating to the point where someone leaves or the company implodes.",
      why: "Startups are hard. If you can't resolve conflicts, every crisis becomes existential.",
      fix: "Have hard conversations early. Clear roles, clear equity splits, clear decision-making processes."
    },
    {
      number: 4,
      title: "Hiring Too Fast",
      description: "Adding headcount before you have product-market fit or the systems to manage a larger team.",
      why: "Every hire increases burn and complexity. Wrong hires are expensive to fix.",
      fix: "Stay lean until you have clear evidence of PMF. Hire slowly, fire quickly."
    },
    {
      number: 5,
      title: "Ignoring Unit Economics",
      description: "Growing revenue without understanding if you're making or losing money on each customer.",
      why: "Growth that loses money on every customer just means you'll die bigger.",
      fix: "Know your CAC, LTV, margins. If unit economics don't work at small scale, they won't work at large scale."
    },
    {
      number: 6,
      title: "Building for Investors, Not Customers",
      description: "Optimizing for metrics that impress VCs rather than value that customers pay for.",
      why: "Vanity metrics (signups, downloads, traffic) don't build businesses. Revenue and retention do.",
      fix: "Focus on willingness to pay and retention. Everything else follows."
    },
    {
      number: 7,
      title: "Not Knowing Your Competition",
      description: "Being surprised by competitors or dismissing them without understanding their strengths.",
      why: "Customers compare you to alternatives. If you don't know what you're up against, you can't win.",
      fix: "Use competitor products. Talk to their customers. Understand their strengths, not just weaknesses."
    },
    {
      number: 8,
      title: "Premature Scaling",
      description: "Scaling sales, marketing, or infrastructure before the product is ready.",
      why: "Scaling a broken product just amplifies problems. You'll churn customers and burn credibility.",
      fix: "Get retention right before acquisition. Scale what's working, not what you hope will work."
    },
    {
      number: 9,
      title: "Single Point of Failure",
      description: "Having one customer, one channel, one team member, or one technology that everything depends on.",
      why: "When that one thing fails (and it will), everything collapses.",
      fix: "Diversify customers, channels, and key knowledge. No one person or thing should be irreplaceable."
    },
    {
      number: 10,
      title: "Giving Up Too Early (or Too Late)",
      description: "Quitting when one more push would have worked, or persisting when the writing's on the wall.",
      why: "Timing is everything. Persistence without progress is just stubbornness.",
      fix: "Set clear milestones. If you hit them, persist. If you consistently miss, evaluate honestly."
    }
  ];

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-2">Top 10 Fatal Errors</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The mistakes that kill fundraises—and companies. VCs see these patterns constantly.
      </p>

      <Callout type="danger">
        These aren't theoretical risks. They're patterns VCs see repeatedly—the same mistakes, 
        made by smart founders, over and over. The founders who succeed are the ones who learn 
        from others' failures, not just their own.
      </Callout>

      <div className="space-y-8 my-10">
        {fatalErrors.map((error) => (
          <div key={error.number} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <span className="bg-red-500/20 text-red-400 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                {error.number}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-lg mb-2">{error.title}</h3>
                <p className="text-muted-foreground mb-3">{error.description}</p>
                <div className="bg-red-500/5 border border-red-500/20 rounded p-3 mb-3">
                  <p className="text-sm"><span className="text-red-400 font-semibold">Why it kills:</span> <span className="text-muted-foreground">{error.why}</span></p>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded p-3">
                  <p className="text-sm"><span className="text-green-400 font-semibold">How to avoid:</span> <span className="text-muted-foreground">{error.fix}</span></p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConversionBanner 
        message="The VC Analysis helps you avoid these fatal errors by forcing you to think through every critical aspect of your business—before VCs ask."
        buttonText="Get Your Analysis"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Common Patterns VCs See</h2>
      <p className="text-muted-foreground mb-6">
        What's frustrating is that these mistakes are predictable. VCs see the same patterns 
        because the same pressures push founders toward the same bad decisions:
      </p>

      <ComparisonTable
        good={[
          "Talk to customers obsessively",
          "Extend runway before you need to",
          "Address co-founder issues immediately",
          "Hire slowly, fire quickly",
          "Know your unit economics cold"
        ]}
        bad={[
          "Build in isolation for months",
          "Wait until desperate to fundraise",
          "Avoid hard conversations with co-founders",
          "Hire based on projected growth",
          "Focus on top-line growth only"
        ]}
      />

      <Callout type="success">
        The best founders aren't smarter—they're more paranoid. They actively look for these 
        failure modes and address them before they become fatal. Use this list as a checklist, 
        not just a warning.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Fatal Error Self-Assessment</h2>
      <Checklist
        items={[
          "I've talked to 50+ potential customers",
          "I have 6+ months of runway",
          "My co-founder relationship is healthy",
          "I'm hiring only for proven needs",
          "I know my unit economics",
          "I'm building for customers, not investors",
          "I understand my competition deeply",
          "I'm not scaling prematurely",
          "I have no single points of failure",
          "I have clear milestones for persistence vs pivot"
        ]}
      />

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Avoid Fatal Mistakes
        </Button>
      </div>
    </ContentBlock>
  );
}
