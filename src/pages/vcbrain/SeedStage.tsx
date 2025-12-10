import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { HelpCircle, Users, TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react";

export default function SeedStage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/seed");
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
          Seed Stage: Where Uncertainty Shifts From Product to Scale
        </h1>
        <p className="text-xl text-muted-foreground">
          Seed isn't about having all the answers. It's about proving you've found something worth scaling—and that you can execute.
        </p>
      </div>

      {/* Conceptual Definition */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">What Seed Actually Means</h2>
        </div>
        <p className="text-foreground leading-relaxed">
          At Pre-seed, investors are betting on your ability to <strong>discover</strong> something valuable. 
          At Seed, that bet shifts: they're now underwriting your ability to <strong>scale</strong> what you've found.
        </p>
        <p className="text-muted-foreground">
          This is a fundamental mental shift. You're no longer asking "Does this work?" You're asking 
          "Can this become a large, repeatable business?" The uncertainty moves from product-market fit 
          to go-to-market execution. VCs at this stage aren't looking for perfection—they're looking for 
          <strong> evidence that the machine can run</strong>.
        </p>
      </div>

      <Callout type="info">
        <strong>The Core Question Seed Investors Ask:</strong> "If I give this team $2-3M, can they 
        prove this business can scale to Series A metrics in 18 months?" Everything else—metrics, 
        team, market—feeds into that single question.
      </Callout>

      {/* Investor Thinking Model */}
      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          How Seed Investors Actually Think
        </h2>
        <p>
          Understanding investor psychology gives you an unfair advantage. Here's what's really happening 
          when a VC evaluates your seed pitch:
        </p>
        
        <div className="grid gap-4 my-6">
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">1. They're Underwriting Growth Potential</h4>
            <p className="text-muted-foreground text-sm">
              Product viability is table stakes at Seed. They've already assumed your product works. 
              Now they're asking: "Does this market allow for 10x growth? Does this team have the 
              velocity to capture it?"
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">2. They're Evaluating Execution Strength</h4>
            <p className="text-muted-foreground text-sm">
              VCs look at your past 6 months as a preview of the next 18. How fast did you move? 
              How efficiently did you spend? Did you hit milestones you said you would? Execution 
              history predicts execution future.
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">3. They're Pattern-Matching to Winners</h4>
            <p className="text-muted-foreground text-sm">
              Every VC has a mental model of "what a Series A company looks like." They're asking: 
              "In 18 months, will this company look like our best portfolio companies did at that stage?" 
              Your job is to make that path visible.
            </p>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">4. They're Stress-Testing Your Thinking</h4>
            <p className="text-muted-foreground text-sm">
              VCs will probe your assumptions, challenge your market sizing, and push on your 
              competitive positioning. They're not trying to catch you out—they're testing whether 
              you've done the work. Founders who get defensive lose. Founders who engage thoughtfully win.
            </p>
          </div>
        </div>
      </div>

      {/* What VCs Review Before Investing */}
      <div className="bg-card border-2 border-border rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-foreground">What Investors Actually Review Before Committing</h3>
        <p className="text-muted-foreground">
          Before writing a check, Seed investors will dig into every aspect of your business. Here's what they examine:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <strong className="text-foreground">Product Quality:</strong>
                <span className="text-muted-foreground text-sm block">They'll use your product, check reviews, talk to customers</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <strong className="text-foreground">Metrics & Data Room:</strong>
                <span className="text-muted-foreground text-sm block">Cohort analysis, unit economics, growth rates, churn</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <strong className="text-foreground">Customer References:</strong>
                <span className="text-muted-foreground text-sm block">They'll call 3-5 customers without telling you</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <strong className="text-foreground">Founder References:</strong>
                <span className="text-muted-foreground text-sm block">Past colleagues, investors, anyone who's worked with you</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <strong className="text-foreground">Market Analysis:</strong>
                <span className="text-muted-foreground text-sm block">Competitive landscape, market timing, regulatory risks</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <strong className="text-foreground">Cap Table & Terms:</strong>
                <span className="text-muted-foreground text-sm block">Previous round structure, option pool, founder ownership</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-seed vs Seed Distinction */}
      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Pre-Seed vs Seed: The Real Distinction</h2>
        <p>
          Founders constantly misclassify themselves. Here's the mental model that actually works:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-bold text-foreground border-b pb-2">Pre-Seed</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">→</span>
              <span><strong>Purpose:</strong> Discover if this can be a business</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">→</span>
              <span><strong>Key Question:</strong> Does this product solve a real problem?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">→</span>
              <span><strong>Evidence:</strong> Early signals, pilots, LOIs, waitlists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">→</span>
              <span><strong>Revenue:</strong> Optional, but monetization thesis required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">→</span>
              <span><strong>Outcome:</strong> First cash to iterate toward commercial model</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-bold text-foreground border-b border-primary/30 pb-2">Seed</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span><strong>Purpose:</strong> Prove the business can scale</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span><strong>Key Question:</strong> Can we build a repeatable growth engine?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span><strong>Evidence:</strong> Working channels, strong retention, unit economics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span><strong>Revenue:</strong> Expected, or equivalent usage proving PMF</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span><strong>Outcome:</strong> Capital to prove commercial model viability</span>
            </li>
          </ul>
        </div>
      </div>

      <Callout type="warning">
        <strong>The In-Between Zone:</strong> If you have strong usage but no revenue, or revenue but 
        weak retention, you might be in "late Pre-seed" territory. That's not a bad place—but be honest 
        about it. Investors respect founders who accurately self-assess.
      </Callout>

      {/* Founder FAQ Section */}
      <div className="bg-card border-2 border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Real Founder Questions, Honest Answers</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border-b border-border pb-4">
            <h4 className="font-semibold text-foreground mb-2">"Am I too early for Seed?"</h4>
            <p className="text-muted-foreground text-sm">
              If you're still figuring out who your customer is or whether they'll pay, yes. Seed assumes 
              you've found something. The question is no longer "will this work?" but "how fast can this grow?"
            </p>
          </div>
          
          <div className="border-b border-border pb-4">
            <h4 className="font-semibold text-foreground mb-2">"How much traction is enough?"</h4>
            <p className="text-muted-foreground text-sm">
              There's no magic number. $30K MRR with 5% weekly growth and 80% retention is more compelling 
              than $100K MRR that's flat with 50% churn. VCs care about trajectory and retention more than 
              absolute numbers. Show that the machine is working.
            </p>
          </div>
          
          <div className="border-b border-border pb-4">
            <h4 className="font-semibold text-foreground mb-2">"What if I have usage but no revenue?"</h4>
            <p className="text-muted-foreground text-sm">
              This can work if your usage metrics are exceptional (10K+ DAU, strong retention, high engagement). 
              But you need a clear monetization thesis and evidence that users would pay. A freemium model 
              converting at 3-5% is signal. 100K users who've never seen a paywall is not.
            </p>
          </div>
          
          <div className="border-b border-border pb-4">
            <h4 className="font-semibold text-foreground mb-2">"How much should I raise?"</h4>
            <p className="text-muted-foreground text-sm">
              Raise 18-24 months of runway to hit clear Series A milestones. For most companies, that's 
              $1.5-3M. Don't over-raise—higher valuations mean higher expectations. Under-raising is equally 
              dangerous. Model your burn, add 30% buffer, and back-calculate.
            </p>
          </div>
          
          <div className="border-b border-border pb-4">
            <h4 className="font-semibold text-foreground mb-2">"Is retention more important than growth?"</h4>
            <p className="text-muted-foreground text-sm">
              <strong>Yes.</strong> High growth with poor retention is a leaky bucket—you're paying to acquire 
              users who leave. VCs know this. 40%+ monthly retention (or 80%+ annual for SaaS) is the foundation. 
              Growth without retention is just expensive churn.
            </p>
          </div>
          
          <div className="pb-4">
            <h4 className="font-semibold text-foreground mb-2">"SAFE or equity round?"</h4>
            <p className="text-muted-foreground text-sm">
              SAFEs are faster and cheaper legally, but they defer the valuation conversation. If you're 
              confident in your metrics and have competitive interest, a priced equity round gives you 
              cleaner cap table and sets clear expectations. Most Seed rounds today are priced.
            </p>
          </div>
        </div>
      </div>

      {/* Bridge Round Explanation Card */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-bold text-foreground">Understanding Bridge Rounds</h3>
        </div>
        <p className="text-foreground">
          A <strong>bridge round</strong> is a smaller financing meant to "bridge" a company to its next 
          major milestone or funding round. It's typically raised from existing investors when you need 
          more runway but aren't ready for a full round.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">When Bridges Make Sense:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 3-6 months from hitting key milestones</li>
              <li>• Market conditions are temporarily unfavorable</li>
              <li>• Need time to close a major customer/partnership</li>
              <li>• Existing investors believe in the trajectory</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Warning Signs:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multiple bridges without hitting milestones</li>
              <li>• Existing investors declining to participate</li>
              <li>• Bridge becomes a substitute for real progress</li>
              <li>• Terms become increasingly unfavorable</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Pro tip:</strong> A bridge should be a tactical decision, not a sign of desperation. 
          If your existing investors won't bridge you, that's a strong signal to reassess.
        </p>
      </div>

      {/* VC Co-Investment Reality */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">The Reality of Seed Syndication</h3>
        </div>
        <p className="text-muted-foreground">
          At Seed stage, VCs frequently co-invest. Unlike Pre-seed where angels might invest solo, 
          Seed rounds often involve 2-4 institutional investors sharing the allocation. Here's why:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-1" />
            <span><strong>Risk Distribution:</strong> Larger checks mean funds want to share risk with other smart money</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-1" />
            <span><strong>Signal Value:</strong> Multiple VCs validating a deal strengthens the narrative</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-1" />
            <span><strong>Network Effects:</strong> Each VC brings different connections, expertise, and follow-on potential</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-1" />
            <span><strong>Founder Benefit:</strong> More investors = more advocates in future rounds</span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          <strong>What this means for you:</strong> When you get interest from one VC, ask who they like 
          to co-invest with. A strong lead investor will help you fill out the round with complementary partners.
        </p>
      </div>

      <ConversionBanner message="Wondering how VCs will actually evaluate your company? The Investment Memo breaks down exactly what top-tier investors look for at each stage." />

      {/* What Good Looks Like */}
      <ComparisonTable
        good={[
          "$50K+ MRR with clear path to $100K",
          "Multiple acquisition channels showing early repeatability",
          "70%+ monthly retention or 90%+ annual (SaaS)",
          "Unit economics that work (LTV:CAC > 3:1)",
          "Clear narrative connecting traction to Series A",
        ]}
        bad={[
          "Revenue exists but flat or declining",
          "All growth from one paid channel with poor CAC",
          "High churn masked by constant new user acquisition",
          "Pricing strategy still unclear or untested",
          "Raising Seed because Pre-seed money ran out",
        ]}
      />

      <Checklist
        items={[
          "I can explain why we're raising Seed (not just 'we need money')",
          "Our metrics show trajectory, not just snapshots",
          "I understand what Series A will require and have a plan",
          "Our retention proves product-market fit, not just acquisition",
          "I can articulate our growth engine in 2 sentences",
          "I know which VCs invest at our stage and sector",
          "My data room is ready for diligence",
          "I've talked to at least 10 target customers about pricing",
        ]}
      />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Winning Seed Founders Do Differently</h2>
        <ul className="space-y-2 my-4">
          <li><strong>They sell the next stage, not just the current one.</strong> VCs invest in Series A potential, not Seed adequacy.</li>
          <li><strong>They know their numbers cold.</strong> Hesitation on metrics kills deals. Own your data.</li>
          <li><strong>They run tight processes.</strong> 3-4 weeks of focused meetings, not 6 months of scattered conversations.</li>
          <li><strong>They create optionality.</strong> Multiple term sheets let you choose partners, not beg for one.</li>
          <li><strong>They're honest about weaknesses.</strong> VCs respect self-awareness. They'll find the flaws anyway.</li>
        </ul>
      </div>

      <Callout type="danger">
        <strong>The Biggest Seed Mistake:</strong> Raising before you're ready. A failed Seed round is 
        worse than not raising—it burns relationships, wastes 3-6 months, and signals weakness to the 
        market. If you're not confident in your metrics, spend 3 more months building before 3 months 
        of rejection.
      </Callout>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          See How VCs Actually Evaluate Seed Companies
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum shows you exactly how top-tier investors analyze Seed-stage 
          companies—what they look for, what they flag, and how they make decisions.
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
