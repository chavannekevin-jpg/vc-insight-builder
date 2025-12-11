import { Link } from "react-router-dom";
import { ArrowLeft, Users, MessageSquare, Vote, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AfterPitchRoom = () => {
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
            What Happens After the Pitch Room
          </h1>
          <p className="text-xl text-muted-foreground">
            Internal partner meetings, deal debates, and silent vetoes.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-lg text-foreground leading-relaxed m-0">
              You just crushed your pitch. Everyone was engaged, heads were nodding, someone even laughed at your market size joke. You walk out feeling great. <strong>What happens next is entirely invisible to you — but it determines your fate.</strong>
            </p>
          </div>

          <p>
            I've been in hundreds of these post-pitch debriefs. Let me pull back the curtain.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Users className="h-6 w-6 text-primary" />
            The Immediate Debrief (Next 5 Minutes)
          </h2>

          <p>
            The moment the door closes behind you, something interesting happens: we all look at each other.
          </p>

          <p>
            There's usually a brief silence. Then the lead partner — the one who brought in the deal — asks: "So, what did you think?"
          </p>

          <p>
            What happens next follows a predictable pattern that I've seen hundreds of times:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">The Temperature Check</h4>
              <p className="text-muted-foreground m-0">
                Often wordless. Partners exchange glances. You can feel whether energy is positive, negative, or mixed. In 10 years, I've learned to read these micro-expressions like a language. Raised eyebrows = interest. Looking at laptops = checked out. Crossed arms = skepticism.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">The "But" Avalanche</h4>
              <p className="text-muted-foreground m-0">
                Within 60 seconds, concerns start flowing. "I liked it, but the market feels crowded." "The founder was great, but the traction felt light." "Interesting space, but what about [competitor]?" These "buts" are the first draft of your kill list.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">The Champion's Defense</h4>
              <p className="text-muted-foreground m-0">
                The partner who brought the deal starts defending. "Yes, but did you notice X?" "The competitive concern — I asked them about that, and here's why it's not a problem." This is the first battle in what might be a weeks-long war.
              </p>
            </div>
          </div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            The Follow-Up Meeting (Days Later)
          </h2>

          <p>
            If you survive the initial debrief, you'll be discussed again in the weekly partnership meeting. This is where deals get serious scrutiny.
          </p>

          <p>
            Let me recreate a real conversation (anonymized) from our partnership meeting about "NexGen Commerce":
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-8 space-y-4">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Partner A (Champion):</strong> "NexGen is solving headless commerce for mid-market retailers. €1.2M ARR, 150% net retention, founder previously at Shopify in a senior PM role."
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Partner B:</strong> "What's the defensibility? Seems like Shopify could just build this as a feature."
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Partner A:</strong> "They're not building for this segment. Shopify is going upmarket to enterprise. NexGen owns the €5M-€50M retailer."
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Partner C:</strong> "I talked to a founder in the space who said their tech is actually not that differentiated. Said it's basically a UI layer."
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Partner A:</strong> "Who said that? Was it [competitor CEO]? Of course he'd say that."
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Partner D:</strong> "What's the exit path here? Who acquires a headless commerce company?"
            </p>
            <p className="text-muted-foreground m-0">
              <strong className="text-foreground">Partner A:</strong> "BigCommerce, Adobe, SAP... they're all building composable commerce stacks. This slots right in."
            </p>
          </div>

          <p>
            Notice what's happening: Partner A is fighting for the deal while others probe for weaknesses. This is how the <Link to="/vcbrain/insider/managed-pessimists" className="text-primary hover:underline">managed pessimism</Link> process works in practice.
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Vote className="h-6 w-6 text-primary" />
            The Silent Veto
          </h2>

          <p>
            Here's something founders almost never realize: most deals don't get killed by an explicit "no." They die from lack of enthusiasm.
          </p>

          <p>
            In most funds, a deal needs a champion to survive. That champion has to spend political capital pushing it through. If the resistance is too high, if too many partners are lukewarm, the champion eventually stops fighting.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">The Death by Silence</h4>
                <p className="text-muted-foreground m-0">
                  Nobody explicitly says "I veto this deal." Instead, partners say things like "I'd want to see more traction before getting comfortable" or "Let's wait for the next quarter's numbers." These aren't nos — they're slow deaths. The deal gets pushed to next week's meeting, then the week after, then it just... stops being discussed.
                </p>
              </div>
            </div>
          </div>

          <p>
            I've seen promising deals die not because anyone was against them, but because no one was <em>passionate</em> for them. In a world of <Link to="/vcbrain/insider/power-laws" className="text-primary hover:underline">power law returns</Link>, you need someone who believes your company could be exceptional — not just "interesting."
          </p>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mt-12 mb-6">
            <Users className="h-6 w-6 text-primary" />
            The Politics You Don't See
          </h2>

          <p>
            Here's another reality: partner dynamics affect your deal in ways you'll never know.
          </p>

          <p>
            Let me tell you about a deal I'll call "DataMesh." Fantastic company, great founder named Yuki, clear <Link to="/vcbrain/insider/return-profile" className="text-primary hover:underline">return profile</Link>. I was the champion. I was convinced.
          </p>

          <p>
            One of our partners — let's call him Henrik — had just had his last two deals fail spectacularly. He was in reputation-repair mode. And he had concerns about DataMesh's go-to-market, which reminded him of one of his failed companies.
          </p>

          <p>
            Henrik's concerns weren't unfounded. They were legitimate questions. But they were also amplified by his recent trauma. He pushed back harder than the concerns warranted.
          </p>

          <p>
            I could have fought harder. But Henrik and I had deals coming up where I'd need his support. So I moderated my advocacy.
          </p>

          <p>
            We passed on DataMesh. Two years later, they sold to a strategic for €120M. Not a fund-maker, but a solid outcome we missed.
          </p>

          <p>
            Yuki never knew any of this. To her, we just "decided not to proceed."
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            How to Survive the Invisible Process
          </h2>

          <p>
            Understanding what happens after you leave gives you strategic advantages:
          </p>

          <div className="space-y-4 my-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">1. Arm Your Champion</h4>
              <p className="text-muted-foreground m-0">
                The partner championing you will have to defend you when you're not there. Give them ammunition. Send follow-up materials that address likely objections. Make their job easier.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">2. Understand the Firm Dynamics</h4>
              <p className="text-muted-foreground m-0">
                Research who makes decisions, who's been successful recently, and who might be a natural ally or skeptic for your type of company. LinkedIn, portfolio company intros, and founder networks can all help you understand the <Link to="/vcbrain/how-vcs-work/structure" className="text-primary hover:underline">VC firm structure</Link>.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">3. Create Urgency (Carefully)</h4>
              <p className="text-muted-foreground m-0">
                Deals that can be pushed to "next week" forever will be pushed forever. Having other term sheets, a closing deadline, or competitive pressure forces action. But fake urgency backfires — we see through it.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">4. Ask for Direct Feedback</h4>
              <p className="text-muted-foreground m-0">
                "What concerns do your partners have?" is a legitimate question to ask your champion. Sometimes they'll tell you. Then you can address those concerns proactively.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="font-semibold text-foreground mb-2">5. Have a Ready <Link to="/vcbrain/how-vcs-work/data-room" className="text-primary hover:underline">Data Room</Link></h4>
              <p className="text-muted-foreground m-0">
                When partners raise questions, your champion needs to answer quickly. If they say "Let me ask for those customer metrics" and it takes you a week to respond, momentum dies.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-8">
            <h4 className="font-semibold text-foreground mb-3">Your Investment Memo as Champion Ammunition</h4>
            <p className="text-muted-foreground mb-4">
              A well-crafted investment memo is essentially a brief that your champion can use in partner meetings. It preemptively addresses concerns, provides data for common questions, and makes the case so clearly that defending you becomes easier.
            </p>
            <p className="text-muted-foreground m-0">
              When I champion a deal and the founder has sent me a strong memo, I sometimes literally read sections aloud in partner meetings. "Here's how they address the competitive concern..." Make it easy for me to fight for you.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">
            The Bottom Line
          </h2>

          <p>
            The pitch is just the beginning. The real decision happens in rooms you'll never see, in conversations you'll never hear, influenced by dynamics you'll never know.
          </p>

          <p>
            This isn't unfair — it's just how collaborative decision-making works. Understanding it helps you play the game more effectively.
          </p>

          <p>
            Your job isn't just to impress in the room. It's to give your champion everything they need to win the fights that happen after you're gone.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Continue Reading</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/vcbrain/insider/scored-not-in-room" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">How Your Deal is Scored</h4>
              <p className="text-sm text-muted-foreground">When you're not in the room</p>
            </Link>
            <Link to="/vcbrain/insider/one-partner-kill" className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
              <h4 className="font-medium text-foreground">Why One Partner Can Kill Your Round</h4>
              <p className="text-sm text-muted-foreground">Politics inside funds</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfterPitchRoom;
