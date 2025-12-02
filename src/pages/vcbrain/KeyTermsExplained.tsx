import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function KeyTermsExplained() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/deals/terms");
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

  const terms = [
    {
      term: "Valuation vs. Price",
      explanation: "Valuation is what your company is 'worth.' Price per share is what investors pay. They're related but different.",
      details: [
        "Pre-money valuation: Company value BEFORE new investment",
        "Post-money valuation: Pre-money + new investment",
        "Price per share: Post-money ÷ total shares outstanding",
        "Ownership %: Investment ÷ Post-money valuation"
      ],
      example: "$8M pre-money + $2M investment = $10M post-money. Investor owns 20% ($2M/$10M)",
      trap: "High pre-money looks good but may mean investors expect more progress before next round"
    },
    {
      term: "Dilution",
      explanation: "When new shares are issued, existing shareholders own a smaller percentage of the company. This is normal—but you need to understand how much.",
      details: [
        "Dilution happens at every funding round",
        "Typical dilution: 15-25% per round",
        "Founders often own <20% by Series B",
        "Dilution also comes from option pool expansion"
      ],
      example: "You own 100% pre-seed. Raise at 20% dilution → own 80%. Raise again at 20% → own 64%. And so on.",
      trap: "Stacking SAFEs without tracking dilution. You might give away 40% before your priced round."
    },
    {
      term: "Liquidation Preferences",
      explanation: "Investors get paid back FIRST in a sale or liquidation, before common shareholders (founders, employees) get anything.",
      details: [
        "1x non-participating: Investors get their money back OR their ownership %, whichever is higher",
        "1x participating: Investors get their money back AND their ownership % (double-dip)",
        "2x+: Investors get 2x (or more) their investment before anyone else"
      ],
      example: "$10M invested with 1x participating pref, company sells for $30M, investors own 30%: They get $10M + 30% of remaining $20M = $16M total",
      trap: "Participating preferences dramatically reduce founder upside in moderate exits"
    },
    {
      term: "Option Pool",
      explanation: "Shares reserved for future employee equity grants. Usually created from the pre-money valuation, which effectively dilutes founders, not investors.",
      details: [
        "Typical size: 10-20% of post-money",
        "Created from pre-money (founders bear dilution)",
        "VCs want larger pools to avoid future dilution",
        "Pool should match your actual hiring plan"
      ],
      example: "$8M pre-money, but $1.5M goes to option pool = effective $6.5M pre-money for founders",
      trap: "Agreeing to 20% pool when you only need 10% means giving away equity you didn't need to"
    },
    {
      term: "Vesting",
      explanation: "Shares or options earned over time. Standard is 4 years with 1-year cliff. Protects company if people leave early.",
      details: [
        "4-year vesting: Earn 25% each year",
        "1-year cliff: Nothing vests until 12 months",
        "Monthly vesting: After cliff, vest 1/48th per month",
        "Acceleration: Faster vesting on acquisition or termination"
      ],
      example: "100,000 shares, 4-year vesting, 1-year cliff: 0 shares at month 11, 25,000 at month 12, then ~2,083/month after",
      trap: "Not having founder vesting can make future fundraising difficult—VCs want protection"
    },
    {
      term: "Control Rights",
      explanation: "Who gets to make decisions? Board seats, voting rights, and protective provisions determine this.",
      details: [
        "Board composition: Who has seats and votes",
        "Protective provisions: Things that require investor approval",
        "Voting rights: Per-share voting power",
        "Information rights: Access to financials and metrics"
      ],
      example: "3-person board: 2 founders, 1 investor = founder control. 2 founders, 2 investors, 1 independent = balanced",
      trap: "Losing board control at seed stage makes it very hard to ever get it back"
    },
    {
      term: "Investor Protections",
      explanation: "Rights that protect investors' interests, especially in bad scenarios. Some are standard; some are aggressive.",
      details: [
        "Anti-dilution: Price protection if future round is lower (down round)",
        "Pro-rata rights: Right to invest in future rounds to maintain ownership %",
        "Information rights: Regular financial and operational updates",
        "Drag-along: Force minority shareholders to agree to acquisition"
      ],
      example: "Full ratchet anti-dilution: If next round is 50% lower price, previous investors' shares reprice to match. Very founder-unfriendly.",
      trap: "Full ratchet anti-dilution can devastate founder ownership in a down round"
    }
  ];

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-2">Key Terms Explained</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The concepts you MUST understand before signing anything. No jargon, just clarity.
      </p>

      <Callout type="danger">
        Founders who don't understand these terms end up signing away control, ownership, or 
        upside without realizing it. This isn't complex—but it IS important. Take the time 
        to understand what you're agreeing to.
      </Callout>

      <div className="space-y-8 my-10">
        {terms.map((item, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-bold text-primary text-xl mb-3">{item.term}</h3>
            <p className="text-muted-foreground mb-4">{item.explanation}</p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Key points:</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
                  {item.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm mb-2">Example:</p>
                <p className="text-muted-foreground text-sm bg-muted/30 p-3 rounded">{item.example}</p>
              </div>
            </div>
            
            <div className="bg-red-500/5 border border-red-500/20 rounded p-3">
              <p className="text-sm">
                <span className="text-red-400 font-semibold">⚠️ Trap to avoid:</span>{" "}
                <span className="text-muted-foreground">{item.trap}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Standard vs. Aggressive Terms</h2>

      <ComparisonTable
        good={[
          "1x non-participating liquidation preference",
          "Broad-based weighted average anti-dilution",
          "10-15% option pool sized to actual hiring needs",
          "Board control stays with founders through seed",
          "Standard information rights (quarterly updates)"
        ]}
        bad={[
          "Participating liquidation preferences",
          "Full ratchet anti-dilution",
          "20%+ option pool without justification",
          "Investor board control at seed stage",
          "Weekly board observer + extensive veto rights"
        ]}
      />

      <Callout type="warning">
        "Market standard" depends on your leverage. Hot companies get better terms. Companies 
        raising in tough markets may need to accept worse ones. Know what's normal so you 
        can negotiate effectively.
      </Callout>

      <ConversionBanner 
        message="Understanding terms is essential, but presenting your company professionally gets you better terms. The Investment Memo Template helps you do both."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Term Sheet Reading Checklist</h2>
      <Checklist
        items={[
          "I understand the pre-money and post-money valuation",
          "I've calculated my ownership post-round including option pool",
          "I know what the liquidation preference means for my exit scenarios",
          "I understand the anti-dilution provisions",
          "I know who controls the board after this round",
          "I've reviewed the protective provisions (investor veto rights)",
          "I understand when and how vesting works",
          "I've modeled the cap table with all terms applied",
          "My lawyer has reviewed the full docs",
          "I'm comfortable signing this"
        ]}
      />

      <Callout type="success">
        The best founders negotiate from understanding, not emotion. Know what each term means, 
        know what's standard, and know what matters most to you. Then negotiate confidently.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Prepare for Your Term Sheet
        </Button>
      </div>
    </ContentBlock>
  );
}
