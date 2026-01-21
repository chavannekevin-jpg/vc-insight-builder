// Explanations for strategic concerns and insights
// Used by InsightWithTooltip to provide hover context throughout the memo

export interface InsightExplanation {
  statement: string;
  explanation: string;
  /** Optional function to generate company-specific context */
  getCompanyContext?: (data: { stage?: string; category?: string; acv?: number }) => string;
}

/**
 * Strategic concern explanations - keyed by a normalized version of the concern text
 */
export const STRATEGIC_CONCERN_EXPLANATIONS: Record<string, InsightExplanation> = {
  "market_crowded_differentiation": {
    statement: "Market is real but crowded — differentiation is existential, not optional",
    explanation: "Large, validated markets attract well-funded competition. Without clear technical moats, network effects, or unique distribution advantages, established players can replicate your approach with more resources. VCs need to see why you specifically will win, not just why the market exists.",
    getCompanyContext: (data) => {
      if (data.category) {
        return `In ${data.category}, incumbents often have established customer relationships and distribution. Your defensibility story needs to be concrete.`;
      }
      return "";
    }
  },
  "acv_sales_mismatch": {
    statement: "ACV/sales cycle mismatch creates unsustainable unit economics at scale",
    explanation: "High ACV products (€50k+) typically require 6-12 month enterprise sales cycles with dedicated sales reps earning €100k+ OTE. At early traction levels, the customer acquisition cost often exceeds the value delivered in year one, making growth capital-inefficient until you hit scale.",
    getCompanyContext: (data) => {
      if (data.acv && data.acv > 50000) {
        return `Your €${Math.round(data.acv / 1000)}k ACV likely requires enterprise sales motion. VCs will calculate your fully-loaded CAC including sales team costs.`;
      }
      return "";
    }
  },
  "low_defensibility_crowded": {
    statement: "Low defensibility in crowded market — need moats before well-funded players move",
    explanation: "When technical barriers are low and the market is validated, well-capitalized competitors can enter quickly. VCs look for defensibility through network effects, switching costs, data advantages, or regulatory barriers — not just first-mover advantage, which is rarely sustainable.",
  },
  "strong_team_weak_traction": {
    statement: "Strong team but weak traction suggests product or positioning issue, not execution",
    explanation: "When a credible team hasn't achieved expected traction, VCs investigate whether the problem is product-market fit, go-to-market strategy, or market timing. It's rarely a pure execution issue — the mismatch signals a strategic gap that needs addressing before more capital helps.",
  },
  "no_repeatable_sales": {
    statement: "No repeatable sales motion — still in founder-led discovery phase",
    explanation: "Founder-led sales often mask the true difficulty of the sales process. VCs want to see evidence that non-founders can close deals, with documented playbooks, consistent sales cycles, and predictable conversion rates. Without this, scaling means hiring sales reps who can't replicate founder magic.",
  },
  "build_more_evidence": {
    statement: "Build more evidence",
    explanation: "Your current traction signals aren't yet strong enough to make a clear case for investment readiness. Focus on acquiring more customers, demonstrating retention, or validating unit economics before approaching top-tier VCs.",
  },
  "on_track": {
    statement: "On track",
    explanation: "All sections are meeting or exceeding stage-appropriate benchmarks. This doesn't mean there's no room for improvement — continue executing and deepening your competitive advantages.",
  }
};

/**
 * VC term explanations - for common VC vocabulary used in the memo
 */
export const VC_TERM_EXPLANATIONS: Record<string, string> = {
  // Metrics & Economics
  "unit economics": "The direct revenues and costs associated with a single customer or transaction. VCs use this to assess whether your business can scale profitably.",
  "cac": "Customer Acquisition Cost — the total cost to acquire one customer, including marketing, sales, and overhead. Should be recovered within 12-18 months.",
  "ltv": "Lifetime Value — the total revenue expected from a customer over their entire relationship with your company. Healthy businesses have LTV:CAC ratios of 3:1 or better.",
  "acv": "Annual Contract Value — the average yearly revenue per customer contract. Higher ACVs typically mean longer sales cycles but better unit economics.",
  "arr": "Annual Recurring Revenue — the normalized yearly value of your subscription revenue. The primary metric VCs use to value SaaS companies.",
  "mrr": "Monthly Recurring Revenue — your subscription revenue normalized to a monthly value. Used to track month-over-month growth.",
  "burn rate": "How much cash your company spends per month beyond what it earns. VCs want to see this decreasing relative to growth.",
  "runway": "How many months your company can operate with current cash reserves at current burn rate. Typically want 18+ months.",
  "gross margin": "Revenue minus the direct costs of delivering your product, expressed as a percentage. Software typically targets 70-80%+.",
  
  // Market & Competition
  "tam": "Total Addressable Market — the entire potential market if you captured 100%. VCs want to see $1B+ for venture-scale returns.",
  "sam": "Serviceable Addressable Market — the portion of TAM you can realistically target with your current product and go-to-market.",
  "som": "Serviceable Obtainable Market — the realistic market share you can capture in 3-5 years given competition and resources.",
  "moat": "Sustainable competitive advantage that protects your business from competitors. Can be technical, regulatory, network effects, or brand.",
  "defensibility": "The ability to protect your market position from competitors over time. Stronger with switching costs, data network effects, or regulatory barriers.",
  "wedge": "Your initial entry point into a market — the specific, narrow problem you solve exceptionally well to gain a foothold.",
  
  // Traction & Growth
  "product-market fit": "When you have a product that satisfies strong market demand. Evidenced by organic growth, low churn, and customers actively pulling the product.",
  "pmf": "Product-Market Fit — same as above. The inflection point where growth becomes organic rather than forced.",
  "churn": "The rate at which customers cancel or don't renew. Enterprise SaaS should target <5% annual; consumer products vary widely.",
  "retention": "The opposite of churn — how well you keep customers over time. Net dollar retention above 100% means existing customers grow.",
  "cohort analysis": "Tracking customer behavior by when they joined. Shows whether your product is improving and if early customers still engage.",
  
  // Team & Execution
  "founder-market fit": "When founders have unique insight, experience, or unfair advantages to solve the specific problem they're tackling.",
  "domain expertise": "Deep knowledge of the industry or problem space, usually from years of direct experience. Reduces execution risk.",
  "execution risk": "The risk that the team can't actually build and sell what they're proposing. Mitigated by relevant experience and early traction.",
  
  // Fundraising & Investment
  "pre-seed": "The earliest institutional funding stage, typically $500K-$2M. Expected: strong team, clear problem, early product or prototype.",
  "seed": "First significant funding round, typically $1-4M. Expected: some traction, product-market fit signals, clear go-to-market.",
  "series a": "Growth funding round, typically $10-25M. Expected: proven PMF, repeatable sales, clear path to scale.",
  "dilution": "The reduction in ownership percentage when new shares are issued. Each round typically dilutes founders by 15-25%.",
  "valuation": "The price investors pay for equity, implying a total company worth. Early-stage valuations are more art than science.",
  "term sheet": "A non-binding agreement outlining the key terms of an investment. The starting point for negotiations.",
  "ic": "Investment Committee — the internal meeting where VC partners decide whether to make an investment. Your pitch is evaluated here.",
  "lead investor": "The VC who sets the terms and leads the round. They do the most due diligence and typically take a board seat.",
  
  // Business Model
  "saas": "Software as a Service — subscription-based software delivered over the internet. The dominant model for B2B startups.",
  "b2b": "Business-to-Business — selling to other companies rather than consumers. Typically higher ACVs, longer sales cycles.",
  "b2c": "Business-to-Consumer — selling directly to individual consumers. Higher volume, lower prices, marketing-driven.",
  "gtm": "Go-to-Market — your strategy for reaching and acquiring customers. Includes sales model, channels, and positioning.",
  "sales motion": "How you sell your product — self-serve, inside sales, field sales, etc. Must match your ACV and customer type.",
  "land and expand": "Starting with a small deal and growing within the account over time. Common in enterprise sales.",
};

/**
 * Score interpretation explanations
 */
export const SCORE_INTERPRETATIONS: Record<string, { range: string; meaning: string; vcReaction: string }> = {
  "exceptional": {
    range: "80-100",
    meaning: "Significantly above stage expectations",
    vcReaction: "This is a clear strength that could differentiate the deal. Will be highlighted in IC discussions."
  },
  "strong": {
    range: "65-79",
    meaning: "Above benchmark for this stage",
    vcReaction: "Meets the bar for competitive deals. Won't raise concerns but also won't be a standout."
  },
  "adequate": {
    range: "50-64",
    meaning: "Meeting minimum expectations",
    vcReaction: "Acceptable for early stage, but needs to improve for later rounds. May generate follow-up questions."
  },
  "concerning": {
    range: "35-49",
    meaning: "Below stage expectations",
    vcReaction: "Will likely come up in IC as a risk factor. Needs addressing with a clear improvement plan."
  },
  "critical": {
    range: "0-34",
    meaning: "Significantly below expectations",
    vcReaction: "Potential deal-breaker. VCs will want to see evidence this can be fixed before proceeding."
  }
};

/**
 * Maps the actual concern string to its explanation key
 */
export function findConcernExplanation(concernText: string): InsightExplanation | null {
  const normalizedConcern = concernText.toLowerCase().trim();
  
  // Direct keyword matching
  if (normalizedConcern.includes("crowded") && normalizedConcern.includes("differentiation")) {
    return STRATEGIC_CONCERN_EXPLANATIONS["market_crowded_differentiation"];
  }
  if (normalizedConcern.includes("acv") && normalizedConcern.includes("sales cycle")) {
    return STRATEGIC_CONCERN_EXPLANATIONS["acv_sales_mismatch"];
  }
  if (normalizedConcern.includes("defensibility") && normalizedConcern.includes("crowded")) {
    return STRATEGIC_CONCERN_EXPLANATIONS["low_defensibility_crowded"];
  }
  if (normalizedConcern.includes("strong team") && normalizedConcern.includes("weak traction")) {
    return STRATEGIC_CONCERN_EXPLANATIONS["strong_team_weak_traction"];
  }
  if (normalizedConcern.includes("no repeatable sales") || normalizedConcern.includes("founder-led")) {
    return STRATEGIC_CONCERN_EXPLANATIONS["no_repeatable_sales"];
  }
  if (normalizedConcern.includes("build more evidence") || normalizedConcern === "build evidence") {
    return STRATEGIC_CONCERN_EXPLANATIONS["build_more_evidence"];
  }
  if (normalizedConcern.includes("on track")) {
    return STRATEGIC_CONCERN_EXPLANATIONS["on_track"];
  }
  
  return null;
}

/**
 * Find VC term explanation from text - returns the term and its explanation
 */
export function findVCTermInText(text: string): { term: string; explanation: string } | null {
  const lowerText = text.toLowerCase();
  
  // Check each term (longest first to avoid partial matches)
  const sortedTerms = Object.keys(VC_TERM_EXPLANATIONS).sort((a, b) => b.length - a.length);
  
  for (const term of sortedTerms) {
    if (lowerText.includes(term.toLowerCase())) {
      return { term, explanation: VC_TERM_EXPLANATIONS[term] };
    }
  }
  
  return null;
}

/**
 * Get explanation for a specific VC term
 */
export function getVCTermExplanation(term: string): string | null {
  const lowerTerm = term.toLowerCase().trim();
  return VC_TERM_EXPLANATIONS[lowerTerm] || null;
}

/**
 * Get score interpretation
 */
export function getScoreInterpretation(score: number): typeof SCORE_INTERPRETATIONS[keyof typeof SCORE_INTERPRETATIONS] {
  if (score >= 80) return SCORE_INTERPRETATIONS["exceptional"];
  if (score >= 65) return SCORE_INTERPRETATIONS["strong"];
  if (score >= 50) return SCORE_INTERPRETATIONS["adequate"];
  if (score >= 35) return SCORE_INTERPRETATIONS["concerning"];
  return SCORE_INTERPRETATIONS["critical"];
}

/**
 * Default explanation when no specific match is found
 */
export const DEFAULT_INSIGHT_EXPLANATION: InsightExplanation = {
  statement: "",
  explanation: "This is an observation from our VC analysis framework. It highlights an area that investors typically scrutinize when evaluating early-stage companies.",
};

/**
 * Strength headlines based on section and score delta
 */
export const STRENGTH_HEADLINES: Record<string, (scoreDelta: number) => string> = {
  "Team": (delta) => delta >= 15 
    ? "Exceptional founding team with proven execution" 
    : "Strong team credentials validate approach",
  "Problem": (delta) => delta >= 15 
    ? "Deep problem understanding with validated customer pain" 
    : "Clear problem framing resonates with target market",
  "Solution": (delta) => delta >= 15 
    ? "Differentiated solution with technical moat" 
    : "Solid solution approach with clear value proposition",
  "Market": (delta) => delta >= 15 
    ? "Large addressable market with clear entry wedge" 
    : "Validated market opportunity with growth potential",
  "Traction": (delta) => delta >= 15 
    ? "Exceptional traction signals strong product-market fit" 
    : "Early traction validates core hypothesis",
  "Business Model": (delta) => delta >= 15 
    ? "Unit economics support scalable growth" 
    : "Clear path to sustainable economics",
  "Competition": (delta) => delta >= 15 
    ? "Strong competitive moat with defensible position" 
    : "Differentiated positioning vs. alternatives",
  "Vision": (delta) => delta >= 15 
    ? "Compelling vision with credible execution path" 
    : "Clear vision aligns with market opportunity"
};

/**
 * Weakness headlines based on section and score gap
 */
export const WEAKNESS_HEADLINES: Record<string, (scoreGap: number) => string> = {
  "Team": (gap) => gap >= 20 
    ? "Critical team gaps block investor confidence" 
    : "Team credentials need strengthening",
  "Problem": (gap) => gap >= 20 
    ? "Problem validation insufficient for investment" 
    : "Need stronger evidence of customer pain",
  "Solution": (gap) => gap >= 20 
    ? "Solution lacks differentiation in competitive market" 
    : "Defensibility story needs work",
  "Market": (gap) => gap >= 20 
    ? "Market sizing concerns raise red flags" 
    : "Market positioning needs refinement",
  "Traction": (gap) => gap >= 20 
    ? "Insufficient traction for stage expectations" 
    : "Need to accelerate customer acquisition",
  "Business Model": (gap) => gap >= 20 
    ? "Unit economics don't support venture scale" 
    : "Path to profitability unclear",
  "Competition": (gap) => gap >= 20 
    ? "No clear competitive advantage identified" 
    : "Competitive positioning needs strengthening",
  "Vision": (gap) => gap >= 20 
    ? "Vision lacks credibility or scale" 
    : "Vision-to-execution gap needs bridging"
};

/**
 * Get a strength headline for a section
 */
export function getStrengthHeadline(sectionName: string, score: number, benchmark: number): string {
  const delta = score - benchmark;
  const generator = STRENGTH_HEADLINES[sectionName];
  return generator ? generator(delta) : `Strong ${sectionName.toLowerCase()} signals`;
}

/**
 * Get a weakness headline for a section
 */
export function getWeaknessHeadline(sectionName: string, score: number, benchmark: number): string {
  const gap = benchmark - score;
  const generator = WEAKNESS_HEADLINES[sectionName];
  return generator ? generator(gap) : `${sectionName} needs improvement`;
}

/**
 * Generate contextual explanation for any VC insight text
 * Uses keyword matching to provide relevant context
 */
export function generateInsightExplanation(insightText: string): string {
  const lower = insightText.toLowerCase();
  
  // Match common VC insight patterns
  if (lower.includes("traction") && (lower.includes("weak") || lower.includes("low") || lower.includes("insufficient"))) {
    return "Early traction is the strongest signal of product-market fit. Without it, VCs must rely on the team and market thesis alone, which increases perceived risk.";
  }
  if (lower.includes("team") && (lower.includes("gap") || lower.includes("missing") || lower.includes("lack"))) {
    return "Team completeness matters because execution risk is the primary concern at early stages. Missing key roles (especially technical or commercial) raises questions about ability to execute.";
  }
  if (lower.includes("market") && (lower.includes("size") || lower.includes("tam") || lower.includes("small"))) {
    return "VCs need large markets to generate fund-returning outcomes. A $100M market can't produce the 10-50x returns that venture math requires.";
  }
  if (lower.includes("competition") || lower.includes("competitor")) {
    return "VCs aren't worried about competition existing — they're worried about whether you have sustainable advantages. 'Better product' is rarely enough.";
  }
  if (lower.includes("unit economics") || lower.includes("cac") || lower.includes("ltv")) {
    return "Healthy unit economics (LTV:CAC > 3:1) prove the business can scale profitably. Without them, growth just accelerates losses.";
  }
  if (lower.includes("defensib") || lower.includes("moat")) {
    return "Defensibility determines whether you can keep what you build. Without moats, success invites competition that erodes margins.";
  }
  if (lower.includes("burn") || lower.includes("runway")) {
    return "Runway determines negotiating leverage. <12 months forces urgency; 18+ months allows patience to find the right partner and terms.";
  }
  if (lower.includes("valuation")) {
    return "Valuation at early stages is more art than science. It's based on comparable deals, team pedigree, traction, and market size — not DCF models.";
  }
  if (lower.includes("product-market fit") || lower.includes("pmf")) {
    return "PMF is the point where customers are actively pulling your product rather than you pushing it. Evidenced by organic growth, low churn, and customer referrals.";
  }
  
  // Default for unmatched insights
  return "This insight reflects how VCs evaluate early-stage companies. They're looking for patterns that predict success while identifying risks that could derail the investment.";
}
