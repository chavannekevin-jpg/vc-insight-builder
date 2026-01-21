// Explanations for strategic concerns and insights
// Used by InsightWithTooltip to provide hover context

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
