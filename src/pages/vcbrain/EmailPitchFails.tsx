import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function EmailPitchFails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/mistakes/email-fails");
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

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-2">Email Pitch Fails</h1>
      <p className="text-xl text-muted-foreground mb-8">
        VCs get 100+ cold emails a week. Here's why 95% get deleted without reading.
      </p>

      <Callout type="danger">
        Most cold emails fail before the VC even opens them. Bad subject line? Deleted. 
        First sentence is a wall of text? Deleted. No warm intro mentioned? Probably deleted. 
        You have about 3 seconds to earn the next 30 seconds.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Subject Lines That Get Deleted</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-3">❌ Instant Delete</h4>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>"Investment Opportunity"</li>
            <li>"The Next Uber of X"</li>
            <li>"Disrupting a $50B Market"</li>
            <li>"Quick Question"</li>
            <li>"Intro Request"</li>
            <li>"Following Up" (on nothing)</li>
          </ul>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-3">✓ Gets Opened</h4>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>"[Mutual connection] suggested I reach out"</li>
            <li>"[Company] - $X ARR, raising seed"</li>
            <li>"YC W24 founder, [one-liner]"</li>
            <li>"Former [notable company] building in [your thesis area]"</li>
            <li>"[Specific metric] in [timeframe]"</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Perfect Cold Email Structure</h2>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-primary">Line 1: Why you specifically</p>
            <p className="text-muted-foreground text-sm">Why this VC? Investment thesis fit, portfolio company connection, or warm intro mention.</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Line 2-3: What you do</p>
            <p className="text-muted-foreground text-sm">One sentence: "[Company] helps [customer] do [outcome]."</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Line 4-5: Why you're credible</p>
            <p className="text-muted-foreground text-sm">Team background OR traction metrics. Pick your strongest proof point.</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Line 6: The ask</p>
            <p className="text-muted-foreground text-sm">Clear, specific: "Would 20 minutes next week work to discuss?"</p>
          </div>
        </div>
      </div>

      <ComparisonTable
        good={[
          "Under 150 words",
          "Mentions specific reason for this VC",
          "One clear metric or proof point",
          "Specific ask with timeframe",
          "Deck attached or Docsend link"
        ]}
        bad={[
          "500+ word essay",
          "Generic 'I saw you invest in startups'",
          "No numbers, just claims",
          "'Let me know if interested'",
          "'Can I send you our deck?'"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Real Email Examples</h2>
      
      <div className="space-y-6 my-6">
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-3">❌ The Essay Nobody Reads</h4>
          <p className="text-muted-foreground text-sm italic">
            "Dear Sir/Madam, I hope this email finds you well. My name is John and I am the 
            founder and CEO of TechStartup Inc. We are building a revolutionary AI-powered 
            blockchain platform that will disrupt the $500 billion enterprise software market. 
            Our team has over 50 years of combined experience..." [continues for 400 more words]
          </p>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-3">✓ Gets a Response</h4>
          <p className="text-muted-foreground text-sm italic">
            "Hi Sarah,
            <br/><br/>
            Mike Chen (your portfolio company Acme) suggested I reach out—he thought there might be fit.
            <br/><br/>
            We're Streamline, helping mid-market companies automate procurement. $400K ARR, 
            3x YoY, 94% retention. Former Amazon supply chain team.
            <br/><br/>
            Raising a $2M seed. Would 20 min Thursday or Friday work?
            <br/><br/>
            Deck attached.
            <br/><br/>
            Thanks,
            Alex"
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Follow-Up Cadence That Works</h2>
      
      <div className="bg-card border border-border rounded-lg p-6 my-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-primary/20 text-primary rounded px-2 py-1 text-sm font-bold">Day 0</span>
            <span className="text-muted-foreground">Initial email</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-primary/20 text-primary rounded px-2 py-1 text-sm font-bold">Day 5</span>
            <span className="text-muted-foreground">First follow-up (short, add new info if possible)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-primary/20 text-primary rounded px-2 py-1 text-sm font-bold">Day 12</span>
            <span className="text-muted-foreground">Second follow-up (if you have meaningful update)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-sm font-bold">Day 20+</span>
            <span className="text-muted-foreground">Move on. Try different contact or different approach.</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          More than 3 follow-ups without response = they're not interested. Move on.
        </p>
      </div>

      <Callout type="warning">
        Never, ever follow up with "Just checking in" or "Bumping this to the top of your inbox." 
        Each follow-up should add value: a new metric, a new customer, a relevant piece of news.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Why Warm Intros Matter</h2>
      <p className="text-muted-foreground mb-4">
        Cold emails have roughly a 1-3% response rate. Warm intros? 20-40%. The math is brutal:
      </p>

      <div className="bg-card border border-border rounded-lg p-6 my-6">
        <div className="space-y-3">
          <div className="flex justify-between text-muted-foreground">
            <span>Cold email to 100 VCs:</span>
            <span>~2 meetings</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Warm intro to 100 VCs:</span>
            <span>~30 meetings</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Time spent getting warm intros almost always has better ROI than cold outreach volume.
        </p>
      </div>

      <ConversionBanner 
        message="Need compelling content for your investor outreach? The Investment Memo Template gives you the exact structure and proof points VCs want to see."
        buttonText="Get the Template"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Email Pitch Checklist</h2>
      <Checklist
        items={[
          "Subject line includes one hook (intro, metric, or credibility)",
          "Under 150 words total",
          "Specific reason why THIS investor",
          "One clear metric or proof point",
          "Clear ask with specific timeframe",
          "Deck attached or linked (don't make them ask)",
          "Follow-ups add new information",
          "No more than 3 follow-ups without response",
          "Prioritized warm intros over cold volume",
          "No 'checking in' or 'bumping this' language"
        ]}
      />

      <Callout type="success">
        The founders who get responses respect VCs' time. Short, specific, credible. 
        If your email takes more than 30 seconds to read, it probably won't get read at all.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Perfect Your Pitch
        </Button>
      </div>
    </ContentBlock>
  );
}
