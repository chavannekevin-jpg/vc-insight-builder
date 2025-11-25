import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";

export default function WhatAngelsWant() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          What Angels Really Want: It's Not What You Think
        </h1>
        <p className="text-xl text-muted-foreground">
          Angels don't invest in your idea. They invest in whether you'll figure it out.
        </p>
      </div>

      <Callout type="danger">
        <strong>Reality Check:</strong> Angels aren't mini-VCs. They don't care about your TAM or your 
        5-year projections. They're betting on YOU as a person, not your PowerPoint.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">What Angels Actually Evaluate</h2>
        <p>
          Angels are writing $25K-$100K checks. They know most investments will die. They're looking for 
          signals that you might be the exception. Here's what matters:
        </p>
        <ul className="space-y-2 my-4">
          <li><strong>Obsession level:</strong> Are you solving this problem no matter what, or just trying stuff?</li>
          <li><strong>Domain expertise:</strong> Have you lived in this world? Do you know the customer intimately?</li>
          <li><strong>Execution velocity:</strong> How fast do you ship? How scrappy are you?</li>
          <li><strong>Coachability:</strong> Do you listen and adapt, or are you arrogant and defensive?</li>
          <li><strong>Early signal:</strong> Any proof—ANY proof—that someone wants this thing.</li>
        </ul>
      </div>

      <ComparisonTable
        good={[
          "I've spent 5 years in this industry and saw this problem daily",
          "Built and launched MVP in 6 weeks, already have 3 paying beta customers",
          "Quit my job 3 months ago to focus full-time on this",
          "Previously shipped 2 side projects that got traction",
          "Raising $50K to validate monetization with 20 customers",
        ]}
        bad={[
          "I just discovered this problem last month",
          "We're still working on the MVP, should be done in 6 months",
          "I'm keeping my day job until we raise money",
          "This is my first time building anything",
          "We need $500K to hire a team and validate the market",
        ]}
      />

      <ConversionBanner message="Not sure how to position yourself for angels? The Investment Memo shows you exactly what signals angels look for and how to demonstrate them." />

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">Common Mistakes That Kill Angel Deals</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">1. Pitching Like You're Raising from VCs</h3>
            <p>
              Angels don't care about your TAM slide or 3-year projections. They want to know if you're 
              scrappy, obsessed, and capable of figuring shit out when things go sideways.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">2. No Proof You Can Execute</h3>
            <p>
              You have beautiful slides but zero evidence you can build or ship anything. Angels want to 
              see you've DONE something, even if it's ugly and small.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">3. Asking for Too Much Money</h3>
            <p>
              Asking angels for $500K signals you don't understand angel economics. Most angels write 
              $10K-$50K checks. Raise what you actually need to hit your next milestone.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">4. Being Defensive About Feedback</h3>
            <p>
              Angels give advice. If you push back on everything, they assume you're unteachable. 
              That's a death sentence at the angel stage.
            </p>
          </div>
        </div>
      </div>

      <Checklist
        items={[
          "I have deep domain expertise in this problem space",
          "I've shipped something—anything—that proves I can execute",
          "I'm full-time on this (or have a clear plan to go full-time)",
          "I have at least ONE early signal (customer, pilot, user feedback)",
          "My ask is reasonable ($25K-$150K for clear milestones)",
          "I'm coachable and open to feedback",
          "I can articulate why I'm uniquely positioned to solve this",
        ]}
      />

      <Callout type="warning">
        <strong>What Happens If You Ignore This:</strong> You'll waste months pitching angels who pass 
        because they don't believe in YOU. Fix the signal problem before you raise.
      </Callout>

      <div className="prose prose-lg max-w-none text-foreground">
        <h2 className="text-2xl font-bold mb-4">How to Win Angels</h2>
        <p>Make it personal, not corporate:</p>
        <ul className="space-y-2 my-4">
          <li>Lead with your story—why you, why now, why this problem</li>
          <li>Show scrappy execution—MVP, early customers, rapid iteration</li>
          <li>Be transparent about what you don't know yet</li>
          <li>Ask for advice, not just money</li>
          <li>Demonstrate you're all-in on this</li>
        </ul>
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">
          Master the Angel Fundraising Game
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum breaks down exactly what angels evaluate, how to demonstrate 
          coachability, and how to position yourself for maximum credibility.
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
