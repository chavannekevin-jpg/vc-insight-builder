import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Clock, Building2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const LiquidityNotCustomer = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/vcbrain">
          <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to VC Brain
          </Button>
        </Link>

        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Insider Take
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            A VC Is Not Your Customer. Liquidity Is.
          </h1>
          <p className="text-xl text-muted-foreground">
            Why exits, not revenue, drive decision-making.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Here's a truth most founders don't fully internalize: <strong>Your VC doesn't make money from your revenue. They make money from your exit.</strong> This single fact explains almost every "confusing" thing VCs do.
            </p>
          </div>

          <p>
            When a VC invests in your company, they're not buying a share of your profits. They're buying the right to participate in a future liquidity event — an acquisition, an IPO, or a secondary sale.
          </p>

          <p>
            Until that event happens, their investment is worth exactly €0 in realizable cash. They can't pay their <Link to="/vcbrain/vc-mechanics/limited-partners" className="text-primary hover:underline">LPs</Link> with paper valuations. They can't pay their team with "we own 15% of a growing company."
          </p>

          <p>
            Cash on cash. That's the only metric that ultimately matters.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            The Fund Lifecycle Reality
          </h2>

          <p>
            Every VC fund has a finite lifespan — typically 10-12 years. After that, the fund must liquidate its positions and return capital to LPs. This creates a countdown clock that shapes every investment decision.
          </p>

          <p>
            Let me tell you about "ProcessFlow," a company in our portfolio. Great company — €8M ARR, growing 50% year-over-year, healthy margins. The founder, Katya, was building something real.
          </p>

          <p>
            In year 7 of our fund, a strategic acquirer offered €60M for ProcessFlow. Not a life-changing outcome for our fund (we owned 12%, so €7.2M back on a €1.5M investment — a solid 4.8x). But not a fund-maker either.
          </p>

          <p>
            Katya wanted to reject the offer and keep building. She believed ProcessFlow could be worth €200M+ in 3-4 more years.
          </p>

          <p>
            Here's the uncomfortable conversation I had to have with her:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8 italic text-muted-foreground">
            <p>
              "Katya, I believe you. I think you could get to €200M. But our fund closes in 4 years. If you're still growing in 4 years and haven't exited, we have a problem. We'll have to sell our position somehow — maybe at a discount, maybe to a secondary buyer who will pressure you differently."
            </p>
            <p className="m-0">
              "The €60M offer today is certain. The €200M in 4 years is uncertain, and it might not even be liquid when we need it. I have to think about what's best for my LPs, not just what's best for ProcessFlow's ultimate potential."
            </p>
          </div>

          <p>
            Katya was frustrated. Rightfully so. But she understood.
          </p>

          <p>
            We didn't force her to sell (we didn't have the power to), but we did have a frank conversation about our constraints. She ended up selling two years later for €90M — a better outcome, and one that fit our timeline.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <DollarSign className="h-6 w-6 text-primary" />
            Why This Changes Everything
          </h2>

          <p>
            Understanding that liquidity is the ultimate customer explains many VC behaviors:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Why VCs Push for Fast Growth</h4>
              <p className="text-muted-foreground m-0">
                Not because fast growth is inherently better for your business — sometimes it's worse. But because fast growth creates exit optionality sooner. A company growing 100% YoY will have exit opportunities in 5 years. A company growing 30% might take 10 years to reach the same point.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Why VCs Care About "Exit Comparables"</h4>
              <p className="text-muted-foreground m-0">
                When we do <Link to="/vcbrain/how-vcs-work/selection-process" className="text-primary hover:underline">due diligence</Link>, we're not just evaluating your company. We're evaluating who will buy your company. If there's no clear acquirer universe, we have a liquidity problem regardless of how good the business is.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Why VCs Sometimes Prefer Acquisition Over IPO</h4>
              <p className="text-muted-foreground m-0">
                IPOs create liquidity, but not immediately (lock-up periods) and not certainly (stock price volatility). A clean acquisition with cash consideration is actual money in the bank. Sometimes we'll prefer a smaller certain acquisition over a potentially larger but uncertain IPO path.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Why VCs Have "Pro-Rata" Rights</h4>
              <p className="text-muted-foreground m-0">
                We want the right to invest more in future rounds to maintain ownership. Not because we love giving you money, but because if you're a winner, we want our share of the eventual liquidity to be as large as possible.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Building2 className="h-6 w-6 text-primary" />
            The Acquirer Universe Question
          </h2>

          <p>
            In every <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link> I've ever been in, someone asks: "Who buys this company?"
          </p>

          <p>
            It's not a hypothetical question. It's a risk assessment.
          </p>

          <p>
            If we can name 5-10 realistic acquirers who would pay a premium for your company, that's liquidity comfort. If we struggle to name even 3, that's liquidity risk.
          </p>

          <p>
            Let me give you an example. "SecureAuth" was building identity management software. Great product, solid traction. But the acquirer universe was limited — essentially Okta, Microsoft, and maybe Ping Identity. That's three potential buyers, two of which are giants that could just build instead of buy.
          </p>

          <p>
            "RetailTech," by contrast, was building commerce enablement tools. Their acquirer universe? Shopify, BigCommerce, SAP, Oracle, Salesforce, Adobe, dozens of mid-sized e-commerce platforms, private equity firms rolling up the space. 20+ realistic acquirers.
          </p>

          <p>
            Same quality of company. Very different liquidity profiles.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Target className="h-6 w-6 text-primary" />
            How to Think About This as a Founder
          </h2>

          <p>
            Understanding liquidity dynamics should inform your fundraising strategy:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Match Fund Age to Your Timeline</h4>
              <p className="text-muted-foreground m-0">
                A fund that just raised (year 1-3) has time to wait for your big exit. A fund in year 7-9 might pressure you toward earlier liquidity. Ask when the fund was raised — it tells you their incentive structure.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Paint the Exit Picture</h4>
              <p className="text-muted-foreground m-0">
                In your pitch, don't just talk about revenue projections. Talk about who will buy you and why. "Salesforce acquired Slack for €27B because of X. We have the same strategic value because of Y." This signals you understand the game.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Understand M&A Trends in Your Space</h4>
              <p className="text-muted-foreground m-0">
                Who's been acquiring? At what multiples? What did acquirers value? This isn't just strategic intelligence for your business — it's the liquidity thesis for your investors.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Exit Strategy in Your Investment Memo</h4>
            <p className="text-muted-foreground mb-4">
              Your investment memo should have a section on exit paths. Not because you're planning to sell tomorrow, but because investors need to see that their liquidity path is clear.
            </p>
            <p className="text-muted-foreground m-0">
              List potential acquirers, comparable transactions, and why your company would be strategic for them. This isn't selling out — it's showing you understand how the game is played.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Alignment Challenge
          </h2>

          <p>
            Here's the uncomfortable truth: founder and VC incentives around liquidity aren't always aligned.
          </p>

          <p>
            You might want to build a generational company over 20 years. Your VC needs returns in 10. You might want to stay private and retain control. Your VC needs an exit to return capital.
          </p>

          <p>
            This isn't malicious. It's structural. Understanding it helps you:
          </p>

          <ul>
            <li>Choose investors whose fund timelines match your vision</li>
            <li>Have honest conversations about exit expectations before you take money</li>
            <li>Structure deals that account for different liquidity needs</li>
            <li>Avoid being surprised when your VC starts pushing for an exit you're not ready for</li>
          </ul>

          <p>
            Remember: you are not our customer. Our LPs are. And our LPs are customers of liquidity, not revenue growth.
          </p>

          <p>
            Understand this, and you'll understand almost everything about how VCs think and act.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/after-pitch-room" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">What Happens After the Pitch Room</h4>
              <p className="text-sm text-muted-foreground">Internal partner meetings revealed</p>
            </Link>
            <Link to="/vcbrain/vc-mechanics/fundraising-cycles" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">VC Fundraising Cycles</h4>
              <p className="text-sm text-muted-foreground">Understanding the fund lifecycle</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityNotCustomer;
