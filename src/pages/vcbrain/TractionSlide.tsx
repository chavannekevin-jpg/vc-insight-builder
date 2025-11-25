import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function TractionSlide() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Traction Slide: The Only Slide That Actually Matters
        </h1>
        <p className="text-xl text-muted-foreground">
          Everything else in your deck is theater. This is where you prove you're real.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> If your traction slide is "we have 10,000 signups," you don't have 
        traction. You have a marketing gimmick. VCs want revenue, retention, or undeniable proof of PMF.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What VCs Actually Look For</h2>
        <p>
          The traction slide answers one question: are people using this, and are they coming back? 
          Everything else is noise. Here's what matters:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Revenue growth:</strong> MRR chart going up and to the right with specific numbers.</li>
          <li><strong>Cohort retention:</strong> % of users still active after 30, 60, 90 days.</li>
          <li><strong>User growth:</strong> Active users (DAU/MAU), not signups or downloads.</li>
          <li><strong>Key engagement metrics:</strong> Whatever proves people get value (sessions/week, usage depth, etc.).</li>
          <li><strong>Unit economics:</strong> CAC, LTV, payback period—prove the model works.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "$50K MRR, growing 20% month-over-month for 6 months",
          "70% of users active after 30 days, 50% after 90 days",
          "10,000 DAU with 4.5 sessions/week average",
          "CAC $150, LTV $900, 6-month payback",
          "Launched 8 months ago, now at $600K ARR",
        ]}
        bad={[
          "We have 50,000 signups",
          "Our beta users love the product",
          "We're seeing strong early interest",
          "We launched 2 weeks ago and got 1,000 downloads",
          "Projected $1M ARR by end of year",
        ]}
      />

      <ConversionBanner message="Not sure what traction metrics actually matter for your stage? The Investment Memo breaks down exactly what 'good' looks like at every level." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Traction Slide Killers</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Vanity Metrics Everywhere</h3>
            <p>
              Signups, downloads, page views—none of this matters. VCs want to know if people actually USE 
              your product and if they STICK. Show DAU, retention cohorts, or revenue.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. No Time Context</h3>
            <p>
              "We have $20K MRR" is meaningless without knowing how long it took to get there. If it took 
              3 years, that's terrible. If it took 3 months, that's interesting.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Hiding the Real Numbers</h3>
            <p>
              Showing growth % without absolute numbers is a red flag. "300% growth!" from $1K to $3K MRR 
              isn't impressive. Be transparent about actual scale.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. No Unit Economics</h3>
            <p>
              You show revenue growth but hide CAC, churn, and LTV. That tells investors you're afraid to 
              show the unit economics are broken.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I show real revenue (MRR or ARR) with growth trajectory",
          "I include cohort retention numbers (30, 60, 90 days)",
          "I show active users, not signups or downloads",
          "My time context is clear (when launched, how long to get here)",
          "I include unit economics (CAC, LTV, payback period)",
          "My metrics are auditable and honest",
          "I show consistent growth, not one-time spikes",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Don't Have Traction:</strong> You won't get funded. Period. 
        Angels might bet on you. Pre-seed investors might take a flyer. But real VCs need proof you can execute.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do</h2>
        <p>They make the numbers speak for themselves:</p>
        <ul className="space-y-2 my-4">
          <li>Lead with a clean MRR or user growth chart</li>
          <li>Show cohort retention curves that prove PMF</li>
          <li>Include 2-3 key metrics that matter most for their business</li>
          <li>Add customer logos or testimonials to prove the numbers are real</li>
          <li>Be transparent about what's working and what's not</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Master the Metrics That Matter
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template breaks down every traction metric VCs evaluate—what's real, 
          what's vanity, and exactly how to present your numbers for maximum impact.
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
