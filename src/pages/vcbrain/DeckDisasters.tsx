import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function DeckDisasters() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/mistakes/deck-disasters");
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
      <h1 className="text-4xl font-bold text-foreground mb-2">Deck Disasters</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The pitch deck mistakes that make VCs close your file before slide 5.
      </p>

      <Callout type="danger">
        Your deck has about 3 minutes of attention—maximum. Most VCs flip through decks while 
        on calls, eating lunch, or between meetings. If your deck doesn't work at a glance, 
        you've lost before you started.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Design Mistakes That Kill Credibility</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">❌ Wall of Text</h4>
          <p className="text-muted-foreground text-sm">
            Slides with paragraphs of text. VCs don't read—they scan. If they can't get 
            your point in 3 seconds, they won't get it at all.
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">❌ Clip Art & Stock Photos</h4>
          <p className="text-muted-foreground text-sm">
            Generic business people shaking hands. Light bulbs. Puzzle pieces. It screams 
            "I made this in 30 minutes" and kills your credibility.
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">❌ Inconsistent Design</h4>
          <p className="text-muted-foreground text-sm">
            Different fonts, colors, and layouts on every slide. Shows lack of attention 
            to detail—if you can't get a deck right, can you get a product right?
          </p>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">❌ Unreadable Charts</h4>
          <p className="text-muted-foreground text-sm">
            Tiny fonts, 15 colors, no labels. If VCs can't understand your data instantly, 
            they'll assume you don't understand it either.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Content Mistakes That Lose Attention</h2>

      <ComparisonTable
        good={[
          "One idea per slide, clearly stated",
          "Data visualized simply with clear labels",
          "Real product screenshots (not mockups)",
          "Specific numbers, not vague claims",
          "10-15 slides total"
        ]}
        bad={[
          "Multiple topics crammed into each slide",
          "Complex charts that require explanation",
          "Wireframes instead of real product",
          "'We're growing fast' with no numbers",
          "30+ slides that repeat information"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The "Too Long vs Too Short" Balance</h2>
      
      <div className="bg-card border border-border rounded-lg p-6 my-6">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-foreground">For Email/Cold Outreach: 10-12 slides</p>
            <p className="text-muted-foreground text-sm">
              Cover, Problem, Solution, Why Now, Market, Traction, Team, Business Model, Competition, Ask
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">For In-Person Pitch: 12-15 slides</p>
            <p className="text-muted-foreground text-sm">
              Same as above + Product Demo, Financials detail, Appendix
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Appendix (not counted):</p>
            <p className="text-muted-foreground text-sm">
              Detailed financials, team bios, additional metrics, reference customers
            </p>
          </div>
        </div>
      </div>

      <Callout type="warning">
        A 30-slide deck doesn't make you look thorough—it makes you look unfocused. Every 
        extra slide is another chance for VCs to get bored and close your deck.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Real Examples of Terrible Slides</h2>
      
      <div className="space-y-4 my-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">The "Everything Slide"</h4>
          <p className="text-muted-foreground text-sm mb-2">
            Problem: Trying to fit problem, solution, market, and traction on one slide. 
            Text is 8pt font, there are 6 different charts, and a logo wall.
          </p>
          <p className="text-primary text-sm font-medium">
            Fix: One slide, one point. If you can't explain it simply, you don't understand it.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">The "Logo Wall of Nothing"</h4>
          <p className="text-muted-foreground text-sm mb-2">
            Problem: 20 company logos with "Our Customers" headline. No context on deal size, 
            which logos are real customers vs. "in conversations," or any actual metrics.
          </p>
          <p className="text-primary text-sm font-medium">
            Fix: Show 3-5 meaningful customers with actual revenue or impact numbers.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">The "We're in the Top Right" Matrix</h4>
          <p className="text-muted-foreground text-sm mb-2">
            Problem: 2x2 competitive matrix where you're magically in the top-right corner, 
            with obviously cherry-picked axes that make you look good.
          </p>
          <p className="text-primary text-sm font-medium">
            Fix: Use a feature comparison table with honest assessment of competitor strengths.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-bold text-foreground mb-2">The "Hockey Stick to Mars"</h4>
          <p className="text-muted-foreground text-sm mb-2">
            Problem: Revenue projection showing 100x growth in 3 years with no explanation 
            of the inflection points or how you'll achieve it.
          </p>
          <p className="text-primary text-sm font-medium">
            Fix: Show labeled assumptions. Explain what changes at each inflection point.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Quick Design Fixes</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Font size:</strong> Nothing smaller than 24pt. If VCs need to squint, you've lost.</li>
        <li><strong>Colors:</strong> 3 colors maximum. Your brand + 2 accent colors.</li>
        <li><strong>White space:</strong> Leave margins. Cramped slides feel desperate.</li>
        <li><strong>Consistency:</strong> Same layout structure, fonts, and style across all slides.</li>
        <li><strong>Real screenshots:</strong> Product photos beat mockups. Mockups beat nothing.</li>
      </ul>

      <ConversionBanner 
        message="Need a professional framework for presenting your company? The VC Analysis shows exactly how to structure information for maximum impact."
        buttonText="Get Your Analysis"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Deck Quality Checklist</h2>
      <Checklist
        items={[
          "10-15 slides maximum (not counting appendix)",
          "One main point per slide",
          "No text smaller than 24pt",
          "Consistent design throughout",
          "Real product screenshots, not mockups",
          "All data has clear labels and sources",
          "No clip art or generic stock photos",
          "3 colors maximum",
          "Can be understood in 3-minute skim",
          "No obvious typos or grammar errors"
        ]}
      />

      <Callout type="success">
        The best decks feel effortless. Every slide earns its place. Every number is clear. 
        Every design choice is intentional. That's not easy—but it's what separates funded 
        founders from everyone else.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Fix Your Deck
        </Button>
      </div>
    </ContentBlock>
  );
}
