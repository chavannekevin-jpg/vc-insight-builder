// Extract prioritized action items from memo content

import { MemoStructuredContent, MemoVCReflection } from "@/types/memo";

export interface ActionItem {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  problem: string;
  impact: string;
  howToFix: string;
  badExample?: string;
  goodExample?: string;
  category: "narrative" | "traction" | "team" | "market" | "business" | "competition";
}

export interface ActionPlanData {
  items: ActionItem[];
  overallUrgency: "critical" | "high" | "moderate";
  summaryLine: string;
}

// Keywords that indicate issues by category
const ISSUE_PATTERNS = {
  narrative: {
    keywords: ["unclear", "vague", "generic", "weak story", "confusing", "not compelling", "missing narrative", "no clear"],
    defaultProblem: "Your narrative doesn't clearly communicate why this matters",
    defaultFix: "Lead with the specific pain point and quantify the impact on your target customer"
  },
  traction: {
    keywords: ["no traction", "limited traction", "early stage", "no customers", "no revenue", "pre-revenue", "unproven", "no validation"],
    defaultProblem: "Lack of tangible proof points to validate market demand",
    defaultFix: "Get 3-5 design partners or LOIs before your next pitch"
  },
  team: {
    keywords: ["missing", "gap", "inexperience", "first-time", "no technical", "solo founder", "incomplete team", "need to hire"],
    defaultProblem: "Critical skill gaps in the founding team",
    defaultFix: "Add an advisor with domain expertise or recruit a co-founder"
  },
  market: {
    keywords: ["small market", "niche", "unclear tam", "limited scale", "narrow focus", "local only", "not scalable"],
    defaultProblem: "Market size or scalability concerns",
    defaultFix: "Reframe your market with a credible bottoms-up TAM calculation"
  },
  business: {
    keywords: ["unit economics", "margins", "ltv", "cac", "burn rate", "unsustainable", "pricing", "monetization unclear"],
    defaultProblem: "Unit economics or business model concerns",
    defaultFix: "Model your LTV:CAC ratio and path to profitability"
  },
  competition: {
    keywords: ["commoditized", "no moat", "easy to copy", "incumbent", "well-funded competitor", "differentiation", "defensibility"],
    defaultProblem: "Weak competitive positioning or defensibility",
    defaultFix: "Articulate your unfair advantage and barriers to entry"
  }
};

// Good vs Bad examples by category
const EXAMPLE_LIBRARY = {
  narrative: {
    bad: "We're building an AI-powered platform that leverages machine learning to optimize workflows.",
    good: "Construction delays cost US builders $177B annually. Our tool predicts delays 3 weeks earlier than any alternative, saving mid-size contractors $2M/year."
  },
  traction: {
    bad: "We have strong interest from potential customers and a growing waitlist.",
    good: "12 paying customers at $2K MRR each, 95% retention, 3 enterprise pilots starting Q1 with $500K combined ACV."
  },
  team: {
    bad: "Our team is passionate about solving this problem and has diverse backgrounds.",
    good: "CEO spent 8 years at target customer (Stripe), CTO built ML infrastructure at Google, combined 3 previous exits."
  },
  market: {
    bad: "The global market for our solution is worth $50 billion.",
    good: "500K US dental practices × $3K/year willingness to pay = $1.5B SAM. We're starting with the 50K practices using legacy software X."
  },
  business: {
    bad: "We plan to monetize through a freemium model with premium tiers.",
    good: "LTV: $18K (36-month avg. retention × $500 MRR). CAC: $2.4K. Ratio: 7.5:1. Payback: 5 months."
  },
  competition: {
    bad: "We're faster, cheaper, and easier to use than the competition.",
    good: "Only solution with FDA 510(k) clearance. 18-month regulatory head start. Exclusive data partnership with Johns Hopkins."
  }
};

export function extractActionPlan(
  memoContent: MemoStructuredContent,
  vcQuickTake?: { concerns: string[]; strengths: string[] }
): ActionPlanData {
  const items: ActionItem[] = [];
  let idCounter = 1;

  // Process VC Quick Take concerns first (highest signal)
  if (vcQuickTake?.concerns) {
    vcQuickTake.concerns.forEach(concern => {
      const category = categorizeIssue(concern);
      const existing = items.find(i => i.category === category);
      
      if (!existing) {
        items.push(createActionItem(
          `action-${idCounter++}`,
          concern,
          category,
          items.length + 1 as 1 | 2 | 3 | 4 | 5
        ));
      }
    });
  }

  // Process section VC reflections for additional issues
  memoContent.sections.forEach(section => {
    if (section.vcReflection) {
      const sectionIssues = extractIssuesFromReflection(section.vcReflection, section.title);
      
      sectionIssues.forEach(issue => {
        const existing = items.find(i => i.category === issue.category);
        if (!existing && items.length < 5) {
          items.push(createActionItem(
            `action-${idCounter++}`,
            issue.text,
            issue.category,
            (items.length + 1) as 1 | 2 | 3 | 4 | 5
          ));
        }
      });
    }
  });

  // Ensure we have at least 3 items, max 5
  while (items.length < 3) {
    const unusedCategory = Object.keys(ISSUE_PATTERNS).find(
      cat => !items.some(i => i.category === cat)
    ) as keyof typeof ISSUE_PATTERNS;
    
    if (unusedCategory) {
      items.push(createActionItem(
        `action-${idCounter++}`,
        ISSUE_PATTERNS[unusedCategory].defaultProblem,
        unusedCategory,
        (items.length + 1) as 1 | 2 | 3 | 4 | 5
      ));
    } else {
      break;
    }
  }

  // Limit to 5 items
  const finalItems = items.slice(0, 5);

  // Determine overall urgency
  const overallUrgency = finalItems.length >= 4 ? "critical" : 
                          finalItems.length >= 2 ? "high" : "moderate";

  const summaryLine = generateSummaryLine(finalItems, overallUrgency);

  return {
    items: finalItems,
    overallUrgency,
    summaryLine
  };
}

function categorizeIssue(text: string): ActionItem["category"] {
  const textLower = text.toLowerCase();
  
  for (const [category, patterns] of Object.entries(ISSUE_PATTERNS)) {
    if (patterns.keywords.some(keyword => textLower.includes(keyword))) {
      return category as ActionItem["category"];
    }
  }
  
  // Default category based on common terms
  if (textLower.includes("customer") || textLower.includes("revenue")) return "traction";
  if (textLower.includes("founder") || textLower.includes("hire")) return "team";
  if (textLower.includes("market") || textLower.includes("tam")) return "market";
  
  return "narrative";
}

function createActionItem(
  id: string,
  problemText: string,
  category: ActionItem["category"],
  priority: 1 | 2 | 3 | 4 | 5
): ActionItem {
  const patterns = ISSUE_PATTERNS[category];
  const examples = EXAMPLE_LIBRARY[category];
  
  return {
    id,
    priority,
    problem: cleanProblemText(problemText),
    impact: getImpactStatement(category),
    howToFix: patterns.defaultFix,
    badExample: examples.bad,
    goodExample: examples.good,
    category
  };
}

function cleanProblemText(text: string): string {
  // Remove markdown, trim, and capitalize first letter
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^[-•]\s*/, "")
    .trim();
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function getImpactStatement(category: ActionItem["category"]): string {
  const impacts = {
    narrative: "VCs will pass in the first 30 seconds if they can't understand what you do",
    traction: "Without proof of demand, VCs see you as a 'nice idea' not an investment",
    team: "Investors bet on teams first—this gap makes you a riskier bet",
    market: "If the market isn't big enough, even 100% market share won't return the fund",
    business: "Unsustainable economics means you'll need more capital at worse terms",
    competition: "Without defensibility, any traction you build can be copied by better-funded players"
  };
  return impacts[category];
}

function extractIssuesFromReflection(
  reflection: MemoVCReflection,
  sectionTitle: string
): Array<{ text: string; category: ActionItem["category"] }> {
  const issues: Array<{ text: string; category: ActionItem["category"] }> = [];
  
  // Check analysis text for negative signals
  if (reflection.analysis) {
    const analysisLower = reflection.analysis.toLowerCase();
    
    for (const [category, patterns] of Object.entries(ISSUE_PATTERNS)) {
      if (patterns.keywords.some(keyword => analysisLower.includes(keyword))) {
        issues.push({
          text: extractRelevantSentence(reflection.analysis, patterns.keywords),
          category: category as ActionItem["category"]
        });
        break; // One issue per section max
      }
    }
  }
  
  // Check questions for implied concerns
  if (reflection.questions && reflection.questions.length > 0) {
    const firstQuestion = reflection.questions[0];
    const questionText = typeof firstQuestion === 'string' 
      ? firstQuestion 
      : firstQuestion.question;
    
    if (questionText && !issues.some(i => i.text.includes(questionText.slice(0, 20)))) {
      issues.push({
        text: `Address the question: "${questionText}"`,
        category: categorizeSectionTitle(sectionTitle)
      });
    }
  }
  
  return issues;
}

function extractRelevantSentence(text: string, keywords: string[]): string {
  const sentences = text.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase();
    if (keywords.some(keyword => sentenceLower.includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return sentences[0]?.trim() || text.slice(0, 100);
}

function categorizeSectionTitle(title: string): ActionItem["category"] {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes("problem") || titleLower.includes("solution")) return "narrative";
  if (titleLower.includes("traction")) return "traction";
  if (titleLower.includes("team")) return "team";
  if (titleLower.includes("market")) return "market";
  if (titleLower.includes("business")) return "business";
  if (titleLower.includes("competition")) return "competition";
  
  return "narrative";
}

function generateSummaryLine(items: ActionItem[], urgency: ActionPlanData["overallUrgency"]): string {
  const categories = items.map(i => i.category);
  
  if (urgency === "critical") {
    return "Your pitch has fundamental gaps that will get you rejected. Fix these before your next meeting.";
  }
  
  if (categories.includes("traction") && categories.includes("team")) {
    return "Strengthen your proof points and team story to move from 'interesting' to 'investable'.";
  }
  
  if (categories.includes("narrative")) {
    return "Your story needs sharpening. VCs decide in seconds—make every word count.";
  }
  
  return "Address these gaps to significantly improve your fundability score.";
}
