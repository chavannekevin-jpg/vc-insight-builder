export interface VCFramingExplanation {
  technique: string;
  whyItWorks: string;
  keyElements: string[];
  icon: string;
}

export const VC_FRAMING_EXPLANATIONS: Record<string, VCFramingExplanation> = {
  "Problem": {
    technique: "Stakeholder Pain Ladder",
    whyItWorks: "VCs see 1,000 pitches claiming 'this is a huge problem.' This technique maps exactly WHO feels the pain, HOW it impacts them financially, and WHY they'd pay to fix it—proving you've done the work to understand buyer psychology.",
    keyElements: [
      "Names 3+ specific stakeholders affected",
      "Quantifies the pain in dollars, time, or risk",
      "Shows urgency drivers (deadlines, mandates, competition)"
    ],
    icon: "AlertTriangle"
  },
  "Solution": {
    technique: "ROI Proof Stack",
    whyItWorks: "VCs want to see how your solution creates measurable value, not a feature list. This framing connects every capability to a specific pain point and quantifies the return on investment for customers.",
    keyElements: [
      "Links each feature to a stakeholder pain point",
      "Shows before/after metrics (time saved, cost reduced)",
      "Demonstrates clear differentiation from alternatives"
    ],
    icon: "Lightbulb"
  },
  "Market": {
    technique: "Math-to-$100M",
    whyItWorks: "Top-down TAM numbers are meaningless. This technique builds a bottoms-up market sizing that shows VCs the math works—how many customers × what price point = venture-scale opportunity.",
    keyElements: [
      "Bottoms-up calculation (customers × price × frequency)",
      "Identifies specific buyer segments you can reach",
      "Shows market timing and growth tailwinds"
    ],
    icon: "TrendingUp"
  },
  "Competition": {
    technique: "Competitive Archetype Mapping",
    whyItWorks: "Saying 'we have no competition' is a red flag. This framing shows strategic thinking by mapping where competitors excel, where they fall short, and why your positioning creates sustainable differentiation.",
    keyElements: [
      "Acknowledges real alternatives customers consider",
      "Shows specific weaknesses you exploit",
      "Explains why your moat compounds over time"
    ],
    icon: "Swords"
  },
  "Team": {
    technique: "Right-to-Win Narrative",
    whyItWorks: "VCs invest in teams, not just ideas. This framing explains why THIS specific team has unfair advantages—domain expertise, previous exits, unique insights—that make them the right founders for this problem.",
    keyElements: [
      "Connects each founder's background to the problem",
      "Highlights relevant wins and lessons learned",
      "Shows complementary skills that cover blind spots"
    ],
    icon: "Users"
  },
  "Business Model": {
    technique: "Unit Economics Transparency",
    whyItWorks: "VCs need to see that you understand the fundamental economics of your business. This framing shows LTV:CAC, gross margins, and payback periods—even if early-stage, it demonstrates financial sophistication.",
    keyElements: [
      "Shows customer lifetime value calculation",
      "Breaks down acquisition cost components",
      "Demonstrates path to profitability at scale"
    ],
    icon: "DollarSign"
  },
  "Traction": {
    technique: "Forward Indicators",
    whyItWorks: "Lagging metrics (revenue, users) matter, but VCs want leading indicators that predict future growth. This framing highlights engagement depth, expansion signals, and momentum trends that de-risk the investment.",
    keyElements: [
      "Shows month-over-month growth trajectory",
      "Highlights retention and expansion metrics",
      "Includes qualitative signals (waitlists, partnerships, press)"
    ],
    icon: "BarChart"
  },
  "Vision": {
    technique: "Milestone Credibility Chain",
    whyItWorks: "Grand visions are cheap. This framing connects today's reality to the exit opportunity through a credible chain of milestones—each one de-risking the next and showing VCs how their capital creates value.",
    keyElements: [
      "Maps 18-month milestones to funding needs",
      "Shows how each milestone de-risks the business",
      "Connects to realistic exit scenarios and multiples"
    ],
    icon: "Rocket"
  },
  "Investment Thesis": {
    technique: "Milestone Credibility Chain",
    whyItWorks: "Grand visions are cheap. This framing connects today's reality to the exit opportunity through a credible chain of milestones—each one de-risking the next and showing VCs how their capital creates value.",
    keyElements: [
      "Maps 18-month milestones to funding needs",
      "Shows how each milestone de-risks the business",
      "Connects to realistic exit scenarios and multiples"
    ],
    icon: "Rocket"
  }
};

export const getFramingExplanation = (sectionTitle: string): VCFramingExplanation | null => {
  // Normalize the section title to match our keys
  const normalizedTitle = sectionTitle.toLowerCase();
  
  for (const [key, value] of Object.entries(VC_FRAMING_EXPLANATIONS)) {
    if (normalizedTitle.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};
