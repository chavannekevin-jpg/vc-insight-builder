import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Brain, Scale, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScoredNotInRoom = () => {
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
            How Your Deal is Scored When You're Not in the Room
          </h1>
          <p className="text-xl text-muted-foreground">
            IC dynamics and partner psychology.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Every VC fund has a system — formal or informal — for evaluating deals. <strong>Understanding how we score you helps you optimize for what actually matters, not what you think matters.</strong>
            </p>
          </div>

          <p>
            When I was a junior investor, I thought <Link to="/vcbrain/how-vcs-work/investment-committee" className="text-primary hover:underline">Investment Committee</Link> was about presenting facts and letting the best deals win. Ten years later, I know it's far more complex — part analysis, part persuasion, part psychology.
          </p>

          <p>
            Let me show you how deals actually get evaluated inside the machine.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <ClipboardList className="h-6 w-6 text-primary" />
            The Scoring Framework
          </h2>

          <p>
            Most funds have some version of a scorecard. Here's a composite of what I've seen across multiple firms:
          </p>

          <div className="bg-card border border-border rounded-xl overflow-hidden my-8">
            <div className="bg-muted/50 px-6 py-4 border-b border-border">
              <h4 className="font-semibold text-foreground m-0">Deal Evaluation Scorecard</h4>
            </div>
            <div className="divide-y divide-border">
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">Team</p>
                  <p className="text-sm text-muted-foreground">Founder-market fit, track record, coachability</p>
                </div>
                <span className="text-sm font-medium text-primary">30%</span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">Market</p>
                  <p className="text-sm text-muted-foreground">TAM, timing, tailwinds</p>
                </div>
                <span className="text-sm font-medium text-primary">25%</span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">Product/Traction</p>
                  <p className="text-sm text-muted-foreground">PMF signals, metrics, retention</p>
                </div>
                <span className="text-sm font-medium text-primary">20%</span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">Business Model</p>
                  <p className="text-sm text-muted-foreground">Unit economics, scalability, margins</p>
                </div>
                <span className="text-sm font-medium text-primary">15%</span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">Deal Terms</p>
                  <p className="text-sm text-muted-foreground">Valuation, ownership, structure</p>
                </div>
                <span className="text-sm font-medium text-primary">10%</span>
              </div>
            </div>
          </div>

          <p>
            But here's the thing: the weights are a lie. Or rather, they're aspirational. In practice, different partners weight different factors based on their own experiences and biases.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Brain className="h-6 w-6 text-primary" />
            Partner Psychology
          </h2>

          <p>
            Every partner has a mental model shaped by their wins and losses. Let me introduce you to some archetypes I've worked with:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">"The Team Absolutist"</h4>
              <p className="text-muted-foreground m-0">
                Partner Thomas believes 90% of outcomes are determined by founders. He's seen mediocre markets conquered by exceptional teams and great markets wasted by poor ones. His question: "Would I bet on this founder to figure it out no matter what?" If yes, everything else is secondary.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">"The Market Maven"</h4>
              <p className="text-muted-foreground m-0">
                Partner Sarah focuses on market structure. She's seen great founders fail in bad markets and average founders succeed in great markets. Her question: "Is this wave big enough to carry imperfect execution?" She cares about the <Link to="/vcbrain/deck-building/market-slide" className="text-primary hover:underline">market slide</Link> more than anything.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">"The Metrics Monk"</h4>
              <p className="text-muted-foreground m-0">
                Partner David doesn't trust narratives. He wants to see numbers: retention cohorts, CAC payback, NRR trends. His question: "What do the metrics tell us that the pitch doesn't?" He'll find the anomaly in your <Link to="/vcbrain/how-vcs-work/data-room" className="text-primary hover:underline">data room</Link> that everyone else missed.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">"The Pattern Matcher"</h4>
              <p className="text-muted-foreground m-0">
                Partner Lisa has seen hundreds of companies and looks for patterns. "This reminds me of X, which failed because Y" or "This has the same dynamics as Z, which 10x'd." Her pattern library is both powerful and dangerous — sometimes new paradigms don't fit old patterns.
              </p>
            </div>
          </div>

          <p>
            When you pitch a fund with multiple partners, you're actually pitching to multiple evaluation frameworks simultaneously. Each partner will ask different questions because they're scoring against different mental models.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Scale className="h-6 w-6 text-primary" />
            The Conviction Threshold
          </h2>

          <p>
            Here's something crucial: a deal doesn't need unanimous approval. But it usually needs one partner with <em>high conviction</em> and no partners with <em>deal-breaking concerns</em>.
          </p>

          <p>
            I think of it as a conviction gradient:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground">Level 5</div>
                <div className="flex-1 h-3 bg-green-500 rounded-full"></div>
                <div className="w-48 text-sm text-muted-foreground">"I'll stake my reputation on this"</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground">Level 4</div>
                <div className="flex-1 h-3 bg-green-400 rounded-full"></div>
                <div className="w-48 text-sm text-muted-foreground">"I'm excited, want to lead this"</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground">Level 3</div>
                <div className="flex-1 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-48 text-sm text-muted-foreground">"Interested, would follow another partner"</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground">Level 2</div>
                <div className="flex-1 h-3 bg-orange-400 rounded-full"></div>
                <div className="w-48 text-sm text-muted-foreground">"Neutral, could go either way"</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground">Level 1</div>
                <div className="flex-1 h-3 bg-red-400 rounded-full"></div>
                <div className="w-48 text-sm text-muted-foreground">"Concerns, but wouldn't block"</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-foreground">Level 0</div>
                <div className="flex-1 h-3 bg-red-600 rounded-full"></div>
                <div className="w-48 text-sm text-muted-foreground">"Deal-breaker concern"</div>
              </div>
            </div>
          </div>

          <p>
            A deal typically needs at least one Level 5 and no Level 0s. A bunch of Level 3s won't get a deal done — that's "consensus mediocrity" which isn't how funds make returns.
          </p>

          <p>
            This is why targeting your pitch matters. If you can identify which partner is most likely to become a Level 5 champion based on their investment history and thesis, you've dramatically improved your odds.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Target className="h-6 w-6 text-primary" />
            The Questions Behind the Questions
          </h2>

          <p>
            When partners ask questions in IC, they're often not seeking information — they're testing thesis robustness. Here's a decoder:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <p className="font-medium text-foreground mb-2">"What happens if a well-funded competitor enters?"</p>
              <p className="text-muted-foreground m-0">
                <strong>Translation:</strong> "Is there any defensibility here, or is this just first-mover advantage that can be bought?"
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <p className="font-medium text-foreground mb-2">"Why hasn't this been done before?"</p>
              <p className="text-muted-foreground m-0">
                <strong>Translation:</strong> "Is this actually a good idea, or is there a reason the market hasn't solved this problem yet?"
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <p className="font-medium text-foreground mb-2">"What does the founder do when things go wrong?"</p>
              <p className="text-muted-foreground m-0">
                <strong>Translation:</strong> "Have we seen this founder under stress? Do they adapt or blame?"
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <p className="font-medium text-foreground mb-2">"What's the path from here to €100M ARR?"</p>
              <p className="text-muted-foreground m-0">
                <strong>Translation:</strong> "Can you articulate a credible <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">return profile</Link>, or is this just hand-waving?"
              </p>
            </div>
          </div>

          <p>
            Your champion needs to have answers to these questions. If they stumble, doubt creeps in. This is why thorough deal preparation matters.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Building the Scorecard in Your Favor</h4>
            <p className="text-muted-foreground mb-4">
              When you build your VC analysis, you're essentially pre-filling the scorecard. Address team strength explicitly. Make market size undeniable. Present metrics transparently. Acknowledge business model evolution.
            </p>
            <p className="text-muted-foreground m-0">
              The best memos anticipate every scorecard dimension and provide ammunition for each. When your champion walks into IC, they should be able to point to your memo and say, "They've already addressed that — look at page 7."
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Unspoken Evaluation
          </h2>

          <p>
            Beyond the formal scorecard, there are unspoken criteria that influence decisions:
          </p>

          <ul>
            <li><strong>Pattern fit:</strong> Does this feel like "our kind of deal"? Every fund has an identity.</li>
            <li><strong>Champion energy:</strong> How excited is the advocating partner? Their conviction matters.</li>
            <li><strong>Political capital:</strong> Is the champion spending their credibility on this? Partners track their batting averages.</li>
            <li><strong>Portfolio construction:</strong> Does this deal complement or compete with existing investments?</li>
            <li><strong>LP story:</strong> Can we tell our <Link to="/vcbrain/vc-mechanics/limited-partners" className="text-primary hover:underline">LPs</Link> a compelling story about why we did this deal?</li>
          </ul>

          <p>
            You'll never see these criteria on any official scorecard. But they're real, and they matter.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Takeaway
          </h2>

          <p>
            Your deal is being evaluated on multiple dimensions by multiple people with multiple frameworks. Perfect scores across every dimension are rare — and not required.
          </p>

          <p>
            What you need is excellence in a few areas that align with your champion's investment philosophy, plus "good enough" everywhere else to avoid deal-killers.
          </p>

          <p>
            Know your strengths. Know your champion's preferences. Build a narrative that plays to both.
          </p>

          <p>
            That's how deals get done.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/one-partner-kill" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Why One Partner Can Kill Your Round</h4>
              <p className="text-sm text-muted-foreground">Politics inside funds</p>
            </Link>
            <Link to="/vcbrain/insider/why-vcs-ghost" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Why VCs "Ghost" Founders</h4>
              <p className="text-sm text-muted-foreground">It's not personal. It's structural.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoredNotInRoom;
