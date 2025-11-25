import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function AngelStage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Angel Stage: Stop Pretending You're Ready for VCs
        </h1>
        <p className="text-xl text-muted-foreground">
          Angels invest in people and potential. VCs invest in traction and proof. Know the difference.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> If you're pre-product or pre-revenue, you're not ready for institutional VCs. 
        Stop wasting everyone's time. Angels are your play.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Angels Actually Look For</h2>
        <p>
          Angels aren't looking for perfect metrics. They're betting on your ability to figure it out. 
          Here's what actually matters:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Domain expertise:</strong> Do you understand this problem deeply?</li>
          <li><strong>Obsession:</strong> Are you solving this no matter what?</li>
          <li><strong>Early signal:</strong> Is there ANY proof people want this?</li>
          <li><strong>Clarity of thought:</strong> Can you explain your thesis in 2 minutes?</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "Clear problem you've personally experienced",
          "Simple demo or prototype that works",
          "3-5 user interviews with strong feedback",
          "Honest about what you don't know yet",
          "Reasonable ask ($50k-$250k)",
        ]}
        bad={[
          "Perfect pitch deck with zero product",
          "10-slide market analysis with no customers",
          "Asking for $2M without revenue",
          "Vague 'we're building a platform' language",
          "5-year financial projections",
        ]}
      />

      <ConversionBanner message="Wondering if you're actually ready for angels? The Investment Memo breaks down exactly what stage you're at and what to focus on." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Common Angel Stage Failures</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Over-Engineering Before Validation</h3>
            <p>
              You spent 6 months building features nobody asked for. Angels see through this. 
              They want to know if anyone actually wants your thing, not if you can code.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. Fake Traction</h3>
            <p>
              "We have 1,000 signups!" from your Product Hunt launch doesn't count. Angels know 
              the difference between curiosity and commitment.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Co-Founder Drama</h3>
            <p>
              If your co-founder equity split isn't sorted or you're "still looking for a technical 
              co-founder," you're not ready. Full stop.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I have a working prototype or MVP",
          "I've talked to at least 10 potential customers",
          "I can explain my business in under 2 minutes",
          "My co-founder equity is locked in with vesting",
          "I know exactly what I'm raising and why",
          "I have a 12-month plan that's actually achievable",
        ]}
      />

      <Callout type="warning">
        <strong>Consequences of Skipping Angel Stage:</strong> You'll waste 6 months chasing VCs who 
        won't take your meeting. Or worse—they'll take the meeting, waste your time, and pass anyway.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Great Founders Do Instead</h2>
        <p>
          They focus on the only things that matter at this stage:
        </p>
        <ul className="space-y-2 my-4">
          <li>Build something people actually use (even if it's ugly)</li>
          <li>Talk to users obsessively</li>
          <li>Get 3-5 paying customers (even if it's $100/month)</li>
          <li>Document everything so you can tell a compelling story</li>
          <li>Network with angels who know your space</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Ready to Build a Real Angel Strategy?
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum Template shows you exactly how to position yourself for angels, 
          what traction actually matters, and how to avoid the mistakes that kill 90% of seed attempts.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get the Investment Memo
        </Button>
      </div>
    </div>
  );
}
