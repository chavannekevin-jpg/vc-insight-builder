import { Link } from "react-router-dom";
import { ArrowLeft, Ghost, Clock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhyVCsGhost = () => {
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
            Why VCs "Ghost" Founders
          </h1>
          <p className="text-xl text-muted-foreground">
            It's not personal. It's structural.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              Every founder has experienced it: the promising meeting, the enthusiastic follow-up, and then... silence. No response. No closure. Just the void. <strong>I'm going to explain why this happens, and I'm not going to pretend it's okay — but I will explain the structural forces that make it inevitable.</strong>
            </p>
          </div>

          <p>
            First, a confession: I have ghosted founders. Not proudly. Not intentionally. But I have. And if you're reading this and you pitched me and never heard back — I'm sorry. Let me explain what happened on my end.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            The Asymmetry of Attention
          </h2>

          <p>
            The math is brutal. A typical VC sees 1,000+ deals a year. We invest in maybe 10. That's a 1% conversion rate.
          </p>

          <p>
            Now, 1,000 deals means roughly 1,000 first meetings, at least 500 follow-up conversations, 200 deeper dives, 100 diligence processes, and 10 completed investments.
          </p>

          <p>
            That means 990 conversations that end in "no."
          </p>

          <p>
            If I spent 20 minutes crafting a thoughtful rejection email for each of those 990 nos, that's 330 hours per year — eight full work weeks — just writing rejection emails.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-3">The Time Math</h4>
            <ul className="text-muted-foreground m-0 space-y-2">
              <li>990 passes × 20 min thoughtful rejection = 330 hours</li>
              <li>330 hours = 8.25 weeks at 40 hours/week</li>
              <li>That's 16% of working time just saying no</li>
            </ul>
          </div>

          <p>
            Most VCs don't have that bandwidth. So corners get cut. And "later" becomes "never."
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Ghost className="h-6 w-6 text-primary" />
            The Slow No vs. The Ghost
          </h2>

          <p>
            There's a spectrum of non-commitment that founders experience:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">The Polite Pass</h4>
              <p className="text-muted-foreground m-0">
                "Thank you for presenting. After careful consideration, we've decided not to proceed at this time. Best of luck with your raise."
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">Reality: This is the gold standard. Clean. Clear. Rare.</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">The Slow No</h4>
              <p className="text-muted-foreground m-0">
                "Let's reconnect when you have more traction." "Keep us posted on your progress." "We're interested but the timing isn't right."
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">Reality: Often this is a no dressed up as a maybe. We're keeping the door technically open while signaling disinterest.</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">The Ghost</h4>
              <p className="text-muted-foreground m-0">
                [Silence]
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">Reality: The worst, but often the default. No response is the response.</p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            What's Actually Happening
          </h2>

          <p>
            Let me walk you through the internal mechanics of a ghost:
          </p>

          <p>
            <strong>Week 1:</strong> We meet. I'm interested but not blown away. I tell you I'll follow up with thoughts. I mean it when I say it.
          </p>

          <p>
            <strong>Week 2:</strong> I get back to the office. Three deals that were higher priority need attention. Your follow-up email sits in my inbox. I flag it for "later."
          </p>

          <p>
            <strong>Week 3:</strong> Partnership meeting. Someone brings a deal in your space that's further along. Now I'm comparing you to them. You've mentally moved from "maybe" to "probably not."
          </p>

          <p>
            <strong>Week 4:</strong> You send a ping. I see it. I know I should respond. But now I'd have to explain why I went quiet, and that feels awkward. I'll respond "tomorrow."
          </p>

          <p>
            <strong>Week 6:</strong> At this point, I'm embarrassed. The longer I wait, the more awkward any response becomes. I convince myself you've probably found another investor and moved on.
          </p>

          <p>
            <strong>Week 10:</strong> You ping again. Your email is now buried in a thread I barely remember. I don't have a good reason to give you. I genuinely feel bad, but responding now feels worse than not responding.
          </p>

          <p>
            This isn't malice. It's organizational entropy combined with human awkwardness.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <AlertCircle className="h-6 w-6 text-primary" />
            The Option Value Problem
          </h2>

          <p>
            There's another dynamic at play: VCs hate closing doors.
          </p>

          <p>
            What if you go on to build something huge? What if your next round is oversubscribed and we wish we'd stayed in touch? What if the market shifts and suddenly your space is hot?
          </p>

          <p>
            Saying a clear "no" closes the door. Staying silent keeps a theoretical option open. It's cowardly, but it's rational (from a selfish perspective).
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-8">
            <h4 className="font-semibold text-foreground mb-3">The Uncomfortable Truth</h4>
            <p className="text-muted-foreground m-0">
              Some VCs actively maintain ambiguity so they can reenter later if you succeed. "We never said no" gives them an opening to reconnect when you're raising a larger round at a higher valuation. It's not a strategy I endorse, but it exists.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            How to Interpret Silence
          </h2>

          <p>
            After 10 years of being on the VC side, here's how I'd interpret common patterns:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">No response after 1 week</h4>
              <p className="text-muted-foreground m-0">
                Could be anything. Follow up once. Keep it light and add value.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">No response after 2 follow-ups (2-3 weeks)</h4>
              <p className="text-muted-foreground m-0">
                You're not a priority. Doesn't mean dead, but you're not in their active pipeline.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">No response after 3+ attempts (4+ weeks)</h4>
              <p className="text-muted-foreground m-0">
                This is a pass. They just didn't tell you. Move on but don't burn bridges.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">"Let's reconnect later" then silence</h4>
              <p className="text-muted-foreground m-0">
                95% of the time, this is a pass. 5% of the time, they meant it. Test with one update email in 3 months with genuine progress. If no response, it was a pass.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            What You Can Do
          </h2>

          <p>
            You can't eliminate ghosting, but you can make it less likely:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Create Forced Decision Points</h4>
              <p className="text-muted-foreground m-0">
                "Our round is closing in 3 weeks. We'd love to have your answer by [date] so we can finalize allocation." Deadlines force action.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Make It Easy to Say No</h4>
              <p className="text-muted-foreground m-0">
                "I'd appreciate knowing either way — a quick 'pass' is totally fine and won't affect our future relationship." Some VCs are more likely to respond if you explicitly give them permission to pass.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Have Strong Alternatives</h4>
              <p className="text-muted-foreground m-0">
                Running a competitive process (multiple VCs interested simultaneously) creates FOMO. VCs who might ghost will respond when they think they might lose access.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Follow Up with Value</h4>
              <p className="text-muted-foreground m-0">
                Don't just ping "checking in." Share a customer win, a metric milestone, a press hit. Give them a reason to engage, not just an obligation to respond.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">5. Get an Intro from Portfolio Founders</h4>
              <p className="text-muted-foreground m-0">
                Harder to ghost when a founder I've backed makes an introduction. There's social accountability.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Making Your <Link to="/vcbrain/how-vcs-work/dealflow" className="text-primary hover:underline">Dealflow</Link> Position Stronger</h4>
            <p className="text-muted-foreground mb-4">
              VCs are less likely to ghost founders who seem "in demand." A strong VC analysis that you can share with multiple investors simultaneously signals professionalism and creates competitive dynamics.
            </p>
            <p className="text-muted-foreground m-0">
              When I see a founder running a tight, professional process with a clear <Link to="/vcbrain/how-vcs-work/data-room" className="text-primary hover:underline">data room</Link> and structured timeline, I know they won't wait around for me. That makes me respond faster.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            A Note to My Fellow VCs
          </h2>

          <p>
            We can do better. A quick "no" is a kindness. Founders have businesses to run, and waiting for answers that never come is cruel.
          </p>

          <p>
            I've tried to implement a rule for myself: respond within 2 weeks, even if it's a pass. I don't always succeed. But the founders who've heard "no" from me directly have almost universally appreciated the clarity.
          </p>

          <p>
            The ecosystem would be better if we all committed to this standard.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Bottom Line
          </h2>

          <p>
            VCs ghost because of volume, awkwardness, option value, and organizational chaos — not because of you.
          </p>

          <p>
            It's still unprofessional. It's still frustrating. But understanding why it happens can help you not take it personally, interpret signals correctly, and move on to investors who will actually engage.
          </p>

          <p>
            The best investors respect your time. If someone ghosts you repeatedly, that tells you something about how they'd treat you as a portfolio company.
          </p>

          <p>
            Maybe the ghost is actually doing you a favor.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/follow-on-capital" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">How Follow-On Capital Decisions Get Made</h4>
              <p className="text-sm text-muted-foreground">Why today's yes doesn't guarantee tomorrow's check</p>
            </Link>
            <Link to="/vcbrain/insider/ownership-vs-valuation" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Ownership vs. Valuation</h4>
              <p className="text-sm text-muted-foreground">Why VCs care more about one</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyVCsGhost;
