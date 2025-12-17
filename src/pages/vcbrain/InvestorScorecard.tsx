import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentBlock, Callout, ComparisonTable, Checklist, ConversionBanner } from "@/components/vcbrain/ContentBlock";
import { Button } from "@/components/ui/button";

export default function InvestorScorecard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/vcbrain/tools/scorecard");
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

  const scorecardCategories = [
    {
      category: "Responsiveness",
      questions: [
        "Do they respond to emails within 48 hours?",
        "Do they show up to meetings on time?",
        "Do they follow through on commitments?",
        "Are they accessible when you have questions?"
      ],
      redFlags: ["Ghosting for weeks", "Constantly rescheduling", "Takes 2+ weeks to make decisions"]
    },
    {
      category: "Value-Add Potential",
      questions: [
        "Do they have relevant portfolio companies?",
        "Can they make meaningful customer introductions?",
        "Do they have operational experience in your space?",
        "Are they known for helping with recruiting?"
      ],
      redFlags: ["No relevant portfolio", "'We're hands-off investors'", "No track record of helping companies grow"]
    },
    {
      category: "Terms & Structure",
      questions: [
        "Are their standard terms founder-friendly?",
        "Are they flexible on negotiation?",
        "Do they require board seats at seed stage?",
        "What's their approach to pro-rata rights?"
      ],
      redFlags: ["Aggressive terms compared to market", "Excessive control provisions", "Complex side letters"]
    },
    {
      category: "Reputation",
      questions: [
        "What do other founders say about them?",
        "How did they behave in down rounds?",
        "Do they lead or follow?",
        "Have they ever removed a founder?"
      ],
      redFlags: ["Multiple founder conflicts", "Known for being difficult in tough times", "Bad-mouthing other investors"]
    },
    {
      category: "Fund Stage & Fit",
      questions: [
        "Is your check size appropriate for their fund?",
        "Are they actively deploying or near end of fund?",
        "Do they have reserves for follow-on?",
        "Is your stage their sweet spot?"
      ],
      redFlags: ["Too small for their fund size", "Fund is 3+ years old (deployment slows)", "No reserves for follow-on"]
    }
  ];

  return (
    <ContentBlock>
      <h1 className="text-4xl font-bold text-foreground mb-2">Investor Scorecard</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Not all money is created equal. Here's how to evaluate the people giving you capital.
      </p>

      <Callout type="warning">
        Founders spend months evaluating product features but often take investor money after 
        one good meeting. Bad investors can sink your company faster than bad product decisions. 
        Do your diligence.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Investor Evaluation Framework</h2>
      <p className="text-muted-foreground mb-6">
        Use this scorecard to evaluate potential investors. Rate each category 1-5 and look 
        for patterns. A great investor should score 4+ in at least 3 categories.
      </p>

      <div className="space-y-8 my-6">
        {scorecardCategories.map((cat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-lg">{cat.category}</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="w-8 h-8 rounded border border-border flex items-center justify-center text-sm text-muted-foreground">
                    {n}
                  </div>
                ))}
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm mb-4">
              {cat.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <div className="bg-red-500/5 border border-red-500/20 rounded p-3">
              <p className="text-sm font-semibold text-red-400 mb-1">Red Flags:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-xs">
                {cat.redFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Do Investor Diligence</h2>

      <ComparisonTable
        good={[
          "Talk to 3+ founders from their portfolio",
          "Ask specifically about down-round behavior",
          "Check how they act when things go wrong",
          "Research their social media and public statements",
          "Ask about their involvement level honestly"
        ]}
        bad={[
          "Only talk to founders they introduced you to",
          "Assume good terms mean good partnership",
          "Skip diligence because you're excited",
          "Take their self-description at face value",
          "Ignore pattern of founder conflicts"
        ]}
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Questions to Ask Portfolio Founders</h2>
      
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-6">
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>"What happened when you missed a quarter? How did they respond?"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>"How often do you actually talk to them?"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>"Have they made introductions that resulted in customers or hires?"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>"How did they behave during your last fundraise?"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>"If you were starting over, would you take their money again?"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">→</span>
            <span>"What's something that surprised you about working with them?"</span>
          </li>
        </ul>
      </div>

      <Callout type="danger">
        "Investor-friendly in good times" is easy. The real test is how they behave when your 
        company is struggling. Always ask about down-round behavior—that's when true colors show.
      </Callout>

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Red Flags in Investor Behavior</h2>
      
      <div className="grid md:grid-cols-2 gap-4 my-6">
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚩 During Fundraising</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Takes weeks to make decisions</li>
            <li>Constantly moving goalposts</li>
            <li>Asking for excessive information</li>
            <li>Bad-mouthing other investors</li>
            <li>Pressuring you to take their terms</li>
          </ul>
        </div>
        <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">🚩 Post-Investment</h4>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-sm">
            <li>Never responds to emails</li>
            <li>Only shows up to complain</li>
            <li>Tries to micromanage operations</li>
            <li>Threatens board action over disagreements</li>
            <li>Shares confidential info with others</li>
          </ul>
        </div>
      </div>

      <ConversionBanner 
        message="Preparing to meet investors? The VC Analysis helps you present your company professionally—so you can attract the best partners."
        buttonText="Get Your Analysis"
      />

      <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Investor Diligence Checklist</h2>
      <Checklist
        items={[
          "Talked to 3+ portfolio founders (not just their references)",
          "Asked specifically about down-round behavior",
          "Researched their fund size and stage focus",
          "Verified they have reserves for follow-on",
          "Checked their social media and public statements",
          "Asked about their actual involvement level",
          "Understood their decision-making timeline",
          "Reviewed their standard terms vs market",
          "Assessed founder-conflict history",
          "Evaluated strategic value beyond capital"
        ]}
      />

      <Callout type="success">
        The best investor relationships feel like partnerships, not transactions. Take time 
        to find investors who genuinely believe in your vision and will support you through 
        the inevitable hard times.
      </Callout>

      <div className="mt-10 flex justify-center">
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Prepare for Investors
        </Button>
      </div>
    </ContentBlock>
  );
}
