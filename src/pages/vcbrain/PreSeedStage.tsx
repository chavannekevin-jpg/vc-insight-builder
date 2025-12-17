import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function PreSeedStage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/pre-seed");
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
          Pre-Seed: Getting Your First Institutional Capital
        </h1>
        <p className="text-xl text-muted-foreground">
          Pre-seed is about getting the first cash to iterate on a working product and test commercialization. 
          Seed is about proving commercial viability. Know the difference.
        </p>
      </div>

      <Callout type="info">
        <strong>The Pre-Seed Purpose:</strong> You're raising to discover whether your product can become a business. 
        This isn't scaling capital—it's iteration capital. Angels and pre-seed funds both play here, 
        often investing together or in syndicates.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Do I Need Revenue to Raise Pre-Seed?</h2>
        <p>
          No. Pre-seed is explicitly designed for pre-revenue or early-revenue startups. Most pre-seed rounds 
          are raised with zero revenue. What matters is:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>A clear problem worth solving</strong> that you understand deeply</li>
          <li><strong>Evidence you can build</strong>—a prototype, MVP, or demonstrated technical capability</li>
          <li><strong>Founder-market fit</strong>—why are YOU the right person to solve this?</li>
          <li><strong>A plausible path to revenue</strong>—you don't need revenue, but you need a credible plan to get there</li>
        </ul>
        <p>
          If you're pre-revenue, lean into your unique insight about the problem, your early user conversations, 
          and your unfair advantage. Revenue is a "nice to have" at pre-seed, not a requirement.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How Much Validation is "Enough"?</h2>
        <p>
          Validation at pre-seed isn't about proving product-market fit—that's seed territory. 
          Pre-seed validation is about proving the problem exists and people care. Here's what counts:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Customer conversations:</strong> 20-50 deep problem interviews showing consistent pain</li>
          <li><strong>LOIs or pilots:</strong> Yes, they count—especially signed letters of intent from potential customers</li>
          <li><strong>Waitlists:</strong> They count if people actively signed up (not just collected emails from a viral post)</li>
          <li><strong>Early usage:</strong> Even 10-20 active users showing retention signals</li>
          <li><strong>Expert validation:</strong> Industry experts confirming the problem and your approach</li>
        </ul>
      </div>

      <Callout type="warning">
        <strong>Does a waitlist count?</strong> It depends. A waitlist of 5,000 people from a Product Hunt launch 
        is weaker than 50 people who proactively found you and signed up because they desperately need your solution. 
        Quality of intent matters more than quantity.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Can I Raise Without a Product?</h2>
        <p>
          Yes, but it's harder and typically reserved for experienced founders. If you're a first-time founder, 
          you'll likely need at least:
        </p>
        <ul className="space-y-2 my-4">
          <li>A working prototype or MVP (even if it's held together with duct tape)</li>
          <li>Evidence that you can ship—past projects, open source contributions, anything</li>
          <li>A compelling demo that shows your vision</li>
        </ul>
        <p>
          Repeat founders with strong track records can raise on a deck and reputation alone. 
          First-timers need to show they can execute, which usually means having something tangible.
        </p>
      </div>

      <ComparisonTable
        good={[
          "We have 30 signed LOIs from enterprise customers",
          "Our MVP has 50 users with 60% weekly retention",
          "We've done 40+ customer interviews confirming the pain",
          "Raising $400K to reach first $10K MRR in 8 months",
          "Two technical co-founders who've shipped products before",
        ]}
        bad={[
          "We have 10,000 signups from a viral tweet",
          "People love the idea when we describe it",
          "We'll figure out the product after raising",
          "Raising $2M to build the MVP",
          "We need funding to find a technical co-founder",
        ]}
      />

      <ConversionBanner message="Not sure if your validation is strong enough? The VC Analysis helps you articulate your evidence in a way that resonates with pre-seed investors." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Is Retention More Important Than Growth?</h2>
        <p>
          At pre-seed, absolutely yes. Investors know you haven't figured out acquisition yet—that's fine. 
          What they want to see is that once users try your product, they come back. This signals:
        </p>
        <ul className="space-y-2 my-4">
          <li>You're solving a real, recurring problem</li>
          <li>The product delivers enough value to warrant continued use</li>
          <li>There's a foundation to build a business on</li>
        </ul>
        <p>
          A product with 50 users and 70% weekly retention is more fundable than one with 5,000 signups 
          and 5% monthly retention. Growth can be bought; retention cannot.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How Much Should I Raise?</h2>
        <p>
          Pre-seed rounds typically range from <strong>$250K to $1M</strong>, with most falling in the $400K-$750K range. 
          The right amount depends on:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>12-18 months of runway:</strong> Calculate your burn rate and multiply</li>
          <li><strong>Key milestones:</strong> What do you need to achieve to raise seed? Work backwards from there</li>
          <li><strong>Your geography:</strong> SF/NYC companies often raise more; other markets may raise less</li>
        </ul>
        <p>
          A good rule: raise enough to hit seed-stage metrics (usually $30K-$100K MRR, strong retention, 
          repeatable acquisition channel) with 6 months of buffer. Don't over-raise—dilution matters.
        </p>
      </div>

      <Callout type="info">
        <strong>Pre-Seed Valuation Benchmarks:</strong> Pre-seed valuations typically range from $3M to $10M, 
        with most falling between $4M-$7M. Your valuation depends on: team experience, market size, 
        traction (if any), and local market norms. Don't optimize for valuation—optimize for 
        getting the right investors and enough capital.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">SAFE or Equity?</h2>
        <p>
          At pre-seed, <strong>SAFEs dominate</strong> for good reason:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Speed:</strong> No negotiating governance terms, board seats, or complex documents</li>
          <li><strong>Cost:</strong> Legal fees are minimal ($2K-$5K vs $15K-$30K for priced rounds)</li>
          <li><strong>Simplicity:</strong> Standard YC SAFE docs are well understood by everyone</li>
          <li><strong>Flexibility:</strong> You defer the valuation discussion to when you have more data</li>
        </ul>
        <p>
          Use a <strong>post-money SAFE</strong> (the current YC standard) so everyone knows exactly what 
          ownership looks like. Typical caps range from $4M-$10M. Some investors may ask for a discount 
          (15-20% is common) instead of or in addition to a cap.
        </p>
        <p>
          When might you do a priced round instead? If you have a lead investor who insists, 
          or if you're raising over $1.5M and want to establish governance early.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Who Should I Approach First?</h2>
        <p>
          Your pre-seed investor mix will likely include:
        </p>
        <ul className="space-y-2 my-4">
          <li>
            <strong>Angel investors:</strong> Individual investors writing $10K-$100K checks. 
            Angels invest across all early stages—from pre-seed through seed—often syndicating together. 
            They move fast and often invest based on founder conviction.
          </li>
          <li>
            <strong>Pre-seed funds:</strong> Institutional funds specifically focused on pre-seed 
            (Precursor, Hustle Fund, Calm, etc.). They write $100K-$500K checks and often lead rounds.
          </li>
          <li>
            <strong>Accelerators:</strong> Y Combinator, Techstars, and others provide capital plus 
            structure. Great for first-time founders who want guidance.
          </li>
        </ul>
      </div>

      <Callout type="danger">
        <strong>Start Local:</strong> Focus on investors in your geography first. Local investors understand 
        your market, can meet you in person, and are more likely to take a bet on a pre-seed company they 
        can monitor closely. International investors rarely lead pre-seed rounds—they typically come in at 
        seed or later when there's more traction to evaluate remotely.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How Long Does a Round Take?</h2>
        <p>
          Plan for <strong>3-6 months</strong> of active fundraising:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Month 1:</strong> Prep materials, build target list, warm intros</li>
          <li><strong>Months 2-3:</strong> First meetings, follow-ups, building momentum</li>
          <li><strong>Months 3-5:</strong> Term discussions, closing committed investors</li>
          <li><strong>Month 5-6:</strong> Final closes, stragglers, admin</li>
        </ul>
        <p>
          Some founders close in 4-6 weeks. Others take 9 months. The difference usually comes down to: 
          (1) strength of warm intros, (2) quality of materials, (3) compelling story, and (4) luck of timing.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How Many Investors Should I Pitch?</h2>
        <p>
          Build a pipeline of <strong>50-100 potential investors</strong>. Here's why:
        </p>
        <ul className="space-y-2 my-4">
          <li>Expect 20-30% response rate on warm intros</li>
          <li>Of those meetings, maybe 10-15% convert to real interest</li>
          <li>Of real interest, 50% might actually invest</li>
          <li>A typical pre-seed round has 5-15 investors</li>
        </ul>
        <p>
          This means you need a large top-of-funnel. Prioritize warm intros over cold outreach. 
          One investor who knows you or your work is worth 20 cold emails.
        </p>
      </div>

      <Checklist
        items={[
          "I can clearly articulate the problem and why it matters",
          "I have some form of validation (interviews, LOIs, pilots, waitlist, or early users)",
          "I have a prototype or MVP that demonstrates our approach",
          "I know my 18-month milestones and what I need to hit for seed",
          "I've researched local angels and pre-seed funds in my market",
          "I have a realistic raise target ($250K-$1M) with clear use of funds",
          "I understand the difference between discovery (pre-seed) and scaling (seed)",
          "I'm mentally prepared for a 3-6 month process",
        ]}
      />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Discovery vs. Scaling: Know Where You Are</h2>
        <p>
          The biggest pre-seed mistake is thinking you're raising to scale. You're not. Pre-seed is <strong>discovery capital</strong>:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Pre-seed:</strong> "We're figuring out if this product can become a business"</li>
          <li><strong>Seed:</strong> "We've proven the model works; now we need to scale it"</li>
        </ul>
        <p>
          If you're raising pre-seed but talking like you're ready to scale, investors will question 
          your self-awareness. Be honest about where you are. Investors respect founders who understand 
          their stage and what needs to be true for the next stage.
        </p>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Build Your Pre-Seed Case
        </h3>
        <p className="text-muted-foreground">
          The VC Analysis helps you frame your validation, articulate your milestones, 
          and present your company the way institutional investors expect to see it.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your VC Analysis
        </Button>
      </div>
    </div>
  );
}
