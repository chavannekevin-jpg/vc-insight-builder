import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function RedFlagDatabase() {
  const navigate = useNavigate();

  const redFlags = [
    {
      category: "Team Red Flags",
      flags: [
        "Co-founders met less than 6 months ago",
        "Founder still working full-time elsewhere",
        "Looking for a 'technical co-founder'",
        "No relevant domain expertise",
        "Can't articulate clear role division",
        "Equity split hasn't been finalized",
        "Previous startup failed and they're defensive about it"
      ]
    },
    {
      category: "Traction Red Flags",
      flags: [
        "All traction from Product Hunt or TechCrunch",
        "Can't show retention cohorts",
        "Revenue growth is flat or declining",
        "Claiming 'viral growth' with no data",
        "Hiding churn numbers",
        "Conflating signups with active users",
        "No path to monetization after 2+ years"
      ]
    },
    {
      category: "Market Red Flags",
      flags: [
        "TAM calculated top-down ('$500B market')",
        "Claiming 'no competitors'",
        "Can't explain why now vs. 5 years ago",
        "Going after SMBs, mid-market, AND enterprise",
        "Market is shrinking or mature",
        "No proof of market demand",
        "Customer acquisition is impossibly expensive"
      ]
    },
    {
      category: "Product Red Flags",
      flags: [
        "Still in beta after 12+ months",
        "No live product yet ('launching next month')",
        "Product screenshots are clearly mockups",
        "Can't demo the core functionality",
        "Building 10 features at once",
        "Solution looking for a problem",
        "No user feedback loop"
      ]
    },
    {
      category: "Financial Red Flags",
      flags: [
        "Unit economics are broken (CAC > LTV)",
        "Burn rate is unsustainable ($200K/month pre-PMF)",
        "Less than 6 months runway",
        "Raised money and immediately hired 15 people",
        "Can't articulate use of funds",
        "Raising to 'figure things out'",
        "Valuation expectations are delusional"
      ]
    },
    {
      category: "Pitch Red Flags",
      flags: [
        "Deck has 30+ slides",
        "No traction slide",
        "Financials show hockey stick with no basis",
        "Can't explain business model clearly",
        "Overly focused on competitor bashing",
        "Using buzzwords without substance ('AI-powered blockchain')",
        "No clear ask or use of funds"
      ]
    },
    {
      category: "Behavioral Red Flags",
      flags: [
        "Defensive when given feedback",
        "Blames failure on external factors",
        "Won't admit what they don't know",
        "Pitching 3 different ideas in one meeting",
        "Name-dropping without substance",
        "Overpromising on timelines",
        "Ghosting after tough questions"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Red Flag Database: What Kills Your Chances
        </h1>
        <p className="text-xl text-muted-foreground">
          VCs see the same red flags over and over. Here's the complete list.
        </p>
      </div>

      <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-2">Why This Matters</h3>
            <p className="text-sm text-muted-foreground">
              One red flag doesn't kill you. Three red flags and VCs start doubting. Five or more and 
              you're getting a polite pass. Know what signals danger so you can fix it before you raise.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {redFlags.map((category, index) => (
          <div key={index} className="p-6 bg-card/50 border border-border/50 rounded-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">{category.category}</h3>
            <ul className="space-y-2">
              {category.flags.map((flag, flagIndex) => (
                <li key={flagIndex} className="flex items-start gap-3 text-sm">
                  <span className="text-red-500 mt-1">⚠</span>
                  <span className="text-muted-foreground">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-card border-2 border-primary/30 rounded-xl p-8 text-center space-y-4 mt-12">
        <h3 className="text-2xl font-bold text-foreground">
          Fix Your Red Flags Before You Raise
        </h3>
        <p className="text-muted-foreground">
          The Investment Memorandum shows you not just what the red flags are, but how to systematically 
          eliminate them before investors see them.
        </p>
        <Button 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          onClick={() => navigate('/pricing')}
        >
          Get the Full Framework
        </Button>
      </div>
    </div>
  );
}
