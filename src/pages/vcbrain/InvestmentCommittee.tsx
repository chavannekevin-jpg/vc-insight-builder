import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function InvestmentCommittee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/how-vcs-work/investment-committee");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-4">
        The Investment Committee: Where Deals Get Decided
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        Understanding how Investment Committees work helps you prepare your champion and 
        anticipate the objections that might kill your deal.
      </p>

      <Callout type="info">
        <strong>The Core Reality:</strong> By the time you reach IC, someone at the firm 
        believes in you. Your job is to arm them with the ammunition they need to convince 
        their skeptical partners.
      </Callout>

      {/* What is IC */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What is the Investment Committee?</h2>
        <p className="text-muted-foreground mb-6">
          The Investment Committee (IC) is the formal decision-making body of a VC firm. 
          It's where partners debate and ultimately approve or reject investments.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">IC Composition</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>All General Partners (required)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Partners (usually required)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Principals (sometimes invited)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Sponsoring partner presents</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">IC Frequency</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Weekly:</strong> Most active seed/early-stage firms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Bi-weekly:</strong> Many growth/late-stage firms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Ad hoc:</strong> For hot deals that can't wait</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Summer/holidays:</strong> Often delayed or email-only</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* How IC Works */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">How Investment Committee Works</h2>
        
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">Pre-IC Memo</h3>
                <p className="text-muted-foreground mb-3">
                  The sponsoring partner prepares a detailed memo summarizing the opportunity, 
                  due diligence findings, and investment thesis. This is circulated 24-48 hours before IC.
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Typical IC Memo Contents:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Company overview and investment thesis</li>
                    <li>• Market size and dynamics</li>
                    <li>• Team background and references</li>
                    <li>• Traction and key metrics</li>
                    <li>• Competitive landscape</li>
                    <li>• Key risks and mitigations</li>
                    <li>• Proposed terms and ownership</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">2</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">IC Presentation</h3>
                <p className="text-muted-foreground mb-3">
                  The sponsoring partner presents the deal (15-30 minutes), followed by Q&A 
                  and debate (15-45 minutes). Some firms bring founders in; most don't.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">What Partners Ask:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Why will this win? What's the moat?</li>
                      <li>• Who else is investing? At what terms?</li>
                      <li>• What did customers actually say?</li>
                      <li>• What kills this company?</li>
                      <li>• How does this fit our portfolio?</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Founder Participation:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Some firms invite founders to present</li>
                      <li>• Others have a separate "founder meeting"</li>
                      <li>• Most decide without founder present</li>
                      <li>• Always ask what to expect</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">Decision Process</h3>
                <p className="text-muted-foreground mb-3">
                  Different firms have different decision rules. Understanding this helps 
                  you gauge your odds.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Consensus (Most Common)</p>
                    <p className="text-xs text-muted-foreground">
                      All partners must agree. One strong objection can kill a deal.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Majority Vote</p>
                    <p className="text-xs text-muted-foreground">
                      More than half must approve. Allows investment despite objections.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Champion Model</p>
                    <p className="text-xs text-muted-foreground">
                      Sponsoring partner can proceed unless there are strong objections.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">4</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">Post-IC Outcomes</h3>
                <p className="text-muted-foreground mb-3">
                  IC doesn't always result in a clean yes or no. Understanding the outcomes 
                  helps you interpret feedback.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm font-bold text-primary mb-1">✓ Approved</p>
                    <p className="text-xs text-muted-foreground">
                      Term sheet follows within 24-72 hours. Congrats!
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-bold text-foreground mb-1">→ Conditional</p>
                    <p className="text-xs text-muted-foreground">
                      Need more info, references, or updated terms. Still in play.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-bold text-foreground mb-1">⏸ Deferred</p>
                    <p className="text-xs text-muted-foreground">
                      Revisit after milestone (more traction, key hire, etc.).
                    </p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="text-sm font-bold text-destructive mb-1">✗ Declined</p>
                    <p className="text-xs text-muted-foreground">
                      No investment. Ask for feedback; it's valuable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* What Kills Deals in IC */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">What Kills Deals in IC</h2>
        <p className="text-muted-foreground mb-6">
          Understanding common objections helps you anticipate and address them before 
          your champion faces the committee.
        </p>

        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-r from-destructive/10 to-transparent border-destructive/30">
            <h3 className="text-lg font-bold text-foreground mb-3">Top IC Deal-Killers</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">1. Market Size Concerns</p>
                  <p className="text-xs text-muted-foreground">
                    "This market isn't big enough for our fund size. Even if they win, 
                    it doesn't move our returns."
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">2. Competitive Dynamics</p>
                  <p className="text-xs text-muted-foreground">
                    "There's a well-funded competitor or a big tech company already here. 
                    Why will this team win?"
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">3. Founder Concerns</p>
                  <p className="text-xs text-muted-foreground">
                    "Reference checks came back mixed. Not sure this team can scale 
                    or recruit an A-team."
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">4. Valuation/Terms</p>
                  <p className="text-xs text-muted-foreground">
                    "At this valuation, even with a great outcome, our returns don't 
                    justify the risk."
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">5. Timing/Thesis Fit</p>
                  <p className="text-xs text-muted-foreground">
                    "This doesn't fit our current thesis, or we've already made a 
                    similar bet in this space."
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">6. Traction Uncertainty</p>
                  <p className="text-xs text-muted-foreground">
                    "The metrics are too early or inconsistent. Let's see another 
                    quarter of growth."
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Arming Your Champion */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Arming Your Champion for IC</h2>
        <p className="text-muted-foreground mb-6">
          Your sponsoring partner will face tough questions. Give them the ammunition 
          to defend your company effectively.
        </p>

        <ComparisonTable
          good={[
            "Proactively share likely objections and your counter-arguments",
            "Provide concrete data points that are hard to argue with",
            "Have customer references ready to validate claims",
            "Explain your 'unfair advantages' clearly",
            "Address competitive threats head-on with differentiation",
            "Show momentum (MoM growth, pipeline, waitlist)"
          ]}
          bad={[
            "Leave your champion to discover objections in IC",
            "Make vague claims without supporting evidence",
            "Be defensive about weaknesses instead of addressing them",
            "Assume your champion knows your business as well as you",
            "Ignore competitive dynamics or dismiss competitors",
            "Present stale metrics from 3 months ago"
          ]}
        />

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30 mt-6">
          <h3 className="text-lg font-bold text-foreground mb-4">The Pre-IC Preparation Call</h3>
          <p className="text-muted-foreground mb-4">
            Ask your champion for a call before IC. Use this to understand their concerns 
            and provide ammunition.
          </p>
          <Checklist items={[
            "What are the likely objections from other partners?",
            "Which partners are skeptical and why?",
            "What additional data would strengthen the case?",
            "Are there customer references they want to speak with?",
            "What's the decision process (consensus, majority, etc.)?",
            "Will I be invited to present or answer questions?",
            "When will IC happen and when should I expect to hear back?"
          ]} />
        </Card>
      </section>

      {/* If You're Invited to IC */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">If You're Invited to IC</h2>
        <p className="text-muted-foreground mb-6">
          Some firms invite founders to present or answer questions. This is high-stakes 
          but also an opportunity.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Do</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Be concise—partners are busy and time is limited</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Show conviction but acknowledge honest risks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Know your numbers cold (metrics, projections, cap table)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Have specific answers for "why you?" and "why now?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Engage each partner who asks a question</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Don't</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Be defensive when challenged—stay curious</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Dismiss competitive threats or market risks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Waffle on questions—say "I don't know, but I'll find out"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Contradict things you told the sponsoring partner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">✗</span>
                <span>Overstay your welcome—read the room</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Post-IC Behavior */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">After IC: What to Expect</h2>
        
        <div className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Timeline Expectations</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-foreground">Positive outcome</span>
                <span className="text-muted-foreground">24-72 hours to term sheet</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-foreground">Conditional (need more info)</span>
                <span className="text-muted-foreground">1-2 weeks with clear asks</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-foreground">Deferred</span>
                <span className="text-muted-foreground">Revisit after milestone (1-6 months)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-foreground">Pass</span>
                <span className="text-muted-foreground">Usually within 24-48 hours</span>
              </div>
            </div>
          </Card>

          <Callout type="warning">
            <strong>If You Haven't Heard Back:</strong> After 5-7 business days of silence 
            post-IC, follow up once. If you still don't hear back, that's usually a soft pass. 
            Don't chase—move on and leave the door open for future.
          </Callout>
        </div>
      </section>

      {/* Turning a No into a Future Yes */}
      <section className="mt-12">
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-4">Turning Today's No into Tomorrow's Yes</h2>
          <p className="text-muted-foreground mb-6">
            Most VCs want to say yes but can't. If you get a pass, handle it gracefully—
            you may see this firm again.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">Ask for Feedback</h4>
              <p className="text-sm text-muted-foreground">
                "I really appreciate the time you spent. Would you be open to sharing what 
                held the partnership back? I'm always looking to improve."
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">Keep Them Updated</h4>
              <p className="text-sm text-muted-foreground">
                Add them to your investor update list. When you hit milestones they mentioned, 
                circle back. "You mentioned wanting to see X—we just hit it."
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-bold text-foreground mb-2">Thank Your Champion</h4>
              <p className="text-sm text-muted-foreground">
                Your sponsoring partner spent political capital on you. Thank them regardless 
                of outcome. They may champion you again in the future.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <div className="mt-12 flex justify-center">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get Your Investment Memo
        </Button>
      </div>
    </ContentBlock>
  );
}