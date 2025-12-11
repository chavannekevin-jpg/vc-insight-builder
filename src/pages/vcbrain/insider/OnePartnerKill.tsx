import { Link } from "react-router-dom";
import { ArrowLeft, UserX, Shield, AlertTriangle, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const OnePartnerKill = () => {
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
            Why One Partner Can Kill Your Round
          </h1>
          <p className="text-xl text-muted-foreground">
            Politics inside funds.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Most founders think VC decisions are democratic. They're not. <strong>In most funds, a single partner with strong objections can effectively kill a deal — even if everyone else is enthusiastic.</strong>
            </p>
          </div>

          <p>
            Let me tell you a story that still frustrates me years later.
          </p>

          <p>
            "Meridian Health" was one of the best companies I've ever brought to <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link>. Digital health platform, €2.5M ARR growing 200%, founder named Anika with a perfect background — former physician turned product leader at Oscar Health.
          </p>

          <p>
            I was a Level 5 champion. Two other partners were Level 4. One partner, Marcus, was Level 3.
          </p>

          <p>
            And one partner — I'll call him Viktor — was a Level 0.
          </p>

          <p>
            Viktor had been burned badly on a healthcare investment three years prior. Lost €8M. He'd developed what I can only describe as "healthcare PTSD." His objection to Meridian wasn't analytical. It was emotional dressed up as analytical.
          </p>

          <p>
            "The regulatory risks are too high," he said. "We don't have the expertise to evaluate healthcare companies properly."
          </p>

          <p>
            Three of us argued for an hour. We had experts lined up. We had a regulatory strategy documented. Anika had navigated this exact landscape before.
          </p>

          <p>
            Viktor wouldn't budge. And because our fund operated on implicit consensus, his hard "no" was effectively a veto.
          </p>

          <p>
            We passed. Meridian raised from a top-tier firm two weeks later. Last I checked, they'd hit €30M ARR.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <UserX className="h-6 w-6 text-primary" />
            The Veto Structures
          </h2>

          <p>
            Different funds have different decision-making structures. Here's the spectrum:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Explicit Veto</h4>
              <p className="text-muted-foreground m-0">
                Some funds have formal veto rights — any partner can kill any deal. Usually reserved for smaller, highly aligned partnerships. The upside: clear rules. The downside: single points of failure.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Implicit Veto</h4>
              <p className="text-muted-foreground m-0">
                More common. No formal veto, but if a senior partner strongly objects, deals typically don't proceed. The social cost of overriding a colleague is too high. This is how Viktor killed Meridian.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Champion Override</h4>
              <p className="text-muted-foreground m-0">
                Some funds let a champion proceed despite objections if they're willing to "own" the deal completely. This requires a confident champion with political capital to spend.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Majority Vote</h4>
              <p className="text-muted-foreground m-0">
                Rare in my experience. Most partnerships don't want the social tension of outvoting colleagues. Investments are long-term relationships; starting with internal conflict is problematic.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            Why Veto Power Exists
          </h2>

          <p>
            Before you curse the Viktor of the world, understand why veto power exists:
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-3">The Downside Protection Argument</h4>
            <p className="text-muted-foreground m-0">
              One terrible investment can damage a fund's returns for a decade. <Link to="/vcbrain/vc-mechanics/limited-partners" className="text-primary hover:underline">LPs</Link> don't just evaluate returns — they evaluate judgment. A spectacular failure that multiple partners objected to looks worse than a missed opportunity. Veto power is a risk management tool.
            </p>
          </div>

          <p>
            It's also a partnership harmony tool. VC partnerships are marriages — long-term relationships where people need to work together for years. Overriding colleagues creates resentment. Sometimes it's better to miss a deal than fracture the partnership.
          </p>

          <p>
            I understand the logic. I still think about Meridian.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <AlertTriangle className="h-6 w-6 text-primary" />
            The Patterns That Trigger Vetoes
          </h2>

          <p>
            In my experience, certain patterns disproportionately trigger veto behavior:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Sector Trauma</h4>
              <p className="text-muted-foreground m-0">
                If a partner has lost money in your sector, they may oppose on pattern-match alone. "I've seen this movie before" is a common veto rationale. It's not always rational, but it's real.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Founder Archetype Concerns</h4>
              <p className="text-muted-foreground m-0">
                Partners develop mental models of "founders who succeed" and "founders who fail." If you trigger someone's failure pattern — maybe you remind them of a founder who burned them — that's dangerous.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Valuation Anchoring</h4>
              <p className="text-muted-foreground m-0">
                Some partners have strong opinions about "reasonable" valuations at different stages. If your valuation triggers "this is too expensive," they may veto on price alone, regardless of other merits.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Competitive Concerns</h4>
              <p className="text-muted-foreground m-0">
                If you're competing with a portfolio company — even tangentially — you may face automatic veto. Conflict of interest concerns are taken seriously.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">Reference Red Flags</h4>
              <p className="text-muted-foreground m-0">
                A single bad reference can give a skeptical partner all the ammunition they need. During <Link to="/vcbrain/insider/managed-pessimists" className="text-primary hover:underline">diligence</Link>, one damaging data point can become a veto catalyst.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Handshake className="h-6 w-6 text-primary" />
            Navigating Partner Politics
          </h2>

          <p>
            As a founder, you can't control internal politics. But you can be strategic:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Research the Partnership</h4>
              <p className="text-muted-foreground m-0">
                Before pitching, understand who has influence, who's been burned by what, and where natural alignment might exist. Talk to founders in their portfolio. LinkedIn stalk thoughtfully. Know the <Link to="/vcbrain/how-vcs-work/structure" className="text-primary hover:underline">firm structure</Link>.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Identify Potential Blockers Early</h4>
              <p className="text-muted-foreground m-0">
                Ask your champion: "Who in the partnership might have concerns about a deal like ours?" Good champions will tell you. Then you can address those concerns preemptively.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Request Multiple Partner Meetings</h4>
              <p className="text-muted-foreground m-0">
                If possible, meet with multiple partners before IC. Build relationships beyond your champion. It's harder to veto a founder you've sat across from and liked.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Prepare for Objections</h4>
              <p className="text-muted-foreground m-0">
                Work with your champion to anticipate every objection. For each one, prepare a clear, concise response. If Viktor had a regulatory concern, I should have had a world-class regulatory strategy to defuse it.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">5. Consider Fund Fit</h4>
              <p className="text-muted-foreground m-0">
                If a fund has no healthcare investments and a partner burned by healthcare, maybe they're not the right fund for your digital health startup. Target firms where your sector has champions, not detractors.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Arm Your Champion Against Vetoes</h4>
            <p className="text-muted-foreground mb-4">
              Your investment memo should anticipate objection patterns. If regulatory risk is a concern, address it explicitly. If competition is a worry, defuse it preemptively. If valuation might trigger resistance, justify it thoroughly.
            </p>
            <p className="text-muted-foreground m-0">
              When a potential veto-holder raises an objection, your champion should be able to say: "They anticipated that — here's their answer." A thorough memo can neutralize veto ammunition before it's deployed.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Uncomfortable Reality
          </h2>

          <p>
            Sometimes you'll do everything right and still get killed by one partner. It happens. The game isn't fair.
          </p>

          <p>
            What you can control:
          </p>

          <ul>
            <li>Choosing funds where your deal has natural fit</li>
            <li>Building relationships beyond a single champion</li>
            <li>Preparing comprehensive responses to likely objections</li>
            <li>Moving fast — the longer a deal sits, the more time for objections to crystallize</li>
            <li>Having backup options so one "no" isn't catastrophic</li>
          </ul>

          <p>
            What you can't control:
          </p>

          <ul>
            <li>A partner's past traumas</li>
            <li>Internal political dynamics</li>
            <li>Whether your deal triggers someone's pattern-matching</li>
            <li>Partnership relationship histories</li>
          </ul>

          <p>
            Understand the system. Play the game as well as you can. And when you hit an irrational veto, move on quickly to the next fund.
          </p>

          <p>
            Anika didn't waste a day mourning our pass. She was signing her new term sheet before I'd finished writing our internal "pass memo."
          </p>

          <p>
            That's the right energy.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/why-vcs-ghost" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Why VCs "Ghost" Founders</h4>
              <p className="text-sm text-muted-foreground">It's not personal. It's structural.</p>
            </Link>
            <Link to="/vcbrain/insider/follow-on-capital" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">How Follow-On Capital Decisions Get Made</h4>
              <p className="text-sm text-muted-foreground">Why today's yes doesn't guarantee tomorrow's check</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnePartnerKill;
