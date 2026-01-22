// Section-specific framework application instructions
// Maps memo section types to their relevant frameworks and explicit application guidance

export interface FrameworkInstruction {
  frameworks: string[];
  applicationPrompt: string;
}

// Framework relevance mapping by section
export const SECTION_FRAMEWORK_MAP: Record<string, FrameworkInstruction> = {
  Problem: {
    frameworks: ["Jobs-to-be-Done", "Pain severity", "Sequoia PMF Archetypes"],
    applicationPrompt: `
When evaluating the Problem section, apply these methodological lenses:

1. **Sequoia PMF Archetypes** - Classify the problem type:
   - "Hair on Fire": Urgent, obvious pain with active solution-seeking and budget
   - "Hard Fact": Accepted inconvenience requiring customer epiphany to recognize as solvable
   - "Future Vision": Requires belief in a paradigm shift
   
2. **Jobs-to-be-Done** - Analyze the functional, emotional, and social jobs customers are hiring for

3. **Pain Severity** - Score urgency/frequency/intensity of the problem. Painkiller vs Vitamin distinction.

Apply these frameworks to assess whether the problem is significant enough to build a venture-scale business.
`,
  },

  Solution: {
    frameworks: ["Technical Defensibility", "Product-Led Growth", "Moat Analysis"],
    applicationPrompt: `
When evaluating the Solution section, apply these methodological lenses:

1. **Technical Defensibility** - Assess proprietary technology, data advantages, or algorithmic moats
   - Is the solution 10x better, not just incrementally improved?
   - What prevents replication by well-funded competitors?

2. **Product-Led Growth Readiness** - If PLG is the strategy:
   - Time-to-value: Can users experience value within minutes?
   - Viral loops: Built-in sharing or collaboration triggers?
   - Self-serve onboarding feasibility

3. **Moat Potential** - Early signals of future defensibility even if not yet established

Evaluate whether the solution is differentiated enough to capture and retain market share.
`,
  },

  Market: {
    frameworks: ["TAM/SAM/SOM", "Market Type", "Crossing the Chasm", "Category Creation"],
    applicationPrompt: `
When evaluating the Market section, apply these methodological lenses:

1. **TAM/SAM/SOM Methodology** - Validate market sizing approach:
   - Bottom-up calculations based on customer counts and pricing
   - Top-down sanity checks against industry reports
   - Red flag: TAM > $100B without clear segmentation

2. **Market Type Classification** (Crossing the Chasm):
   - Red Ocean: Crowded, commoditized, margin compression
   - Blue Ocean: Uncontested, new demand creation
   - Purple Ocean: Differentiated niche within existing market

3. **Category Creation Potential** - Is this creating a new category or competing in an existing one?

4. **Timing Analysis** - Why now? What macro trends enable this opportunity?

Assess market attractiveness for venture-scale returns.
`,
  },

  Competition: {
    frameworks: ["Hamilton Helmer 7 Powers", "Competitive Positioning", "Porter's Forces"],
    applicationPrompt: `
When evaluating the Competition section, apply Hamilton Helmer's 7 Powers framework:

1. **Scale Economies** - Unit costs decline with volume; near-zero marginal cost creates winner-take-most
2. **Network Effects** - Value increases with each user (direct, indirect, data network effects)
3. **Counter-Positioning** - Incumbent can't copy without cannibalizing their core business
4. **Switching Costs** - Lock-in through data, workflow, or integration depth
5. **Cornered Resource** - Exclusive access to talent, IP, data, or regulatory advantage
6. **Process Power** - Embedded organizational capabilities hard to replicate
7. **Branding** - Ability to charge premium due to perceived quality/trust

For each power: If present, explain HOW it manifests specifically in this company's context.
If absent, note which powers could be developed and what it would take.

Also assess: Porter's 5 Forces exposure (threat of substitutes, buyer/supplier power, new entrants).
`,
  },

  Team: {
    frameworks: ["Founder-Market Fit", "Team Composition", "Execution Velocity"],
    applicationPrompt: `
When evaluating the Team section, apply these methodological lenses:

1. **Founder-Market Fit** - Deep domain expertise or unique insight:
   - Have they experienced this problem firsthand?
   - Do they have unfair advantages (network, knowledge, reputation)?
   - Would a rational person bet on THIS team for THIS problem?

2. **Team Composition Analysis**:
   - Technical depth vs. commercial capability balance
   - Critical gaps that must be filled before Series A
   - Prior working relationships and trust

3. **Execution Velocity Signals**:
   - Speed from idea to MVP to first customers
   - Capital efficiency in achieving milestones
   - Evidence of learning and iteration velocity

Assess team's ability to execute the specific plan and adapt when needed.
`,
  },

  "Business Model": {
    frameworks: ["Unit Economics", "Revenue Model", "Scalability Patterns"],
    applicationPrompt: `
When evaluating the Business Model section, apply these methodological lenses:

1. **Unit Economics Framework**:
   - LTV:CAC ratio (target 3:1+ for healthy economics)
   - CAC Payback (target <18 months for SaaS)
   - Gross Margin trajectory (70%+ for software, varies by model)
   - Magic Number for sales efficiency

2. **Revenue Model Assessment**:
   - Recurring vs. transactional vs. usage-based
   - Pricing power and expansion revenue potential
   - Net Revenue Retention trajectory (>100% = healthy expansion)

3. **Scalability Patterns**:
   - Operating leverage: Does margin improve with scale?
   - Customer acquisition scalability
   - Delivery/fulfillment scalability

Identify what needs to be true for this model to work at venture scale.
`,
  },

  Traction: {
    frameworks: ["Sequoia PMF Indicators", "Growth Accounting", "Cohort Analysis"],
    applicationPrompt: `
When evaluating the Traction section, apply these methodological lenses:

1. **Sequoia PMF Indicators** - Product-Market Fit signals:
   - Organic growth and word-of-mouth percentage
   - User engagement depth (not just vanity metrics)
   - NPS and qualitative customer feedback
   - Retention curves that flatten (not decay to zero)

2. **Growth Accounting** (Reforge methodology):
   - New vs. Resurrected vs. Churned breakdown
   - Quick Ratio: (New + Resurrected) / Churned
   - Sustainable vs. paid growth dependency

3. **Cohort Analysis**:
   - Early cohorts vs. later cohorts behavior
   - Revenue retention by cohort vintage
   - Time-to-value improvements

Stage-calibrate expectations: Pre-seed traction signals differ from Seed differ from Series A.
`,
  },

  Vision: {
    frameworks: ["Exit Pathway Analysis", "Venture Scale", "Category Leadership"],
    applicationPrompt: `
When evaluating the Vision section, apply these methodological lenses:

1. **Exit Pathway Analysis**:
   - Strategic acquirer landscape (who would buy and why)
   - IPO potential and comparable public companies
   - Timing to potential exit and fund return math

2. **Venture Scale Assessment**:
   - Path to $100M+ ARR or equivalent scale
   - Winner-take-most dynamics in the market
   - Power Law return potential (can this be a fund returner?)

3. **Category Leadership Potential**:
   - Can this company define and own a category?
   - Expansion vectors beyond initial beachhead
   - Defensible position once at scale

Assess whether the vision is ambitious enough for venture returns while grounded in executable strategy.
`,
  },

  "Investment Thesis": {
    frameworks: ["All Frameworks", "Synthesis", "Risk-Adjusted Returns"],
    applicationPrompt: `
For the Investment Thesis, synthesize insights from ALL frameworks applied in previous sections:

1. **Cross-Section Synthesis**:
   - How do the 7 Powers analysis, PMF signals, and unit economics interconnect?
   - What are the critical dependencies between team capability and market timing?
   - Where do multiple frameworks point to the same strength or weakness?

2. **Risk-Adjusted Return Analysis**:
   - Technical risk, market risk, execution risk, financing risk
   - What de-risks with the next raise?
   - What remains risky regardless of funding?

3. **Investment Decision Framework**:
   - Does this fit Power Law return requirements?
   - What conviction level and at what valuation?
   - Specific diligence items that would change the decision

Provide a clear, defensible investment stance with explicit reasoning.
`,
  },
};

// Get framework instructions for a specific section
export function getFrameworkInstructions(sectionTitle: string): FrameworkInstruction | null {
  // Normalize section title for lookup
  const normalizedTitle = sectionTitle.trim();
  
  // Direct match first
  if (SECTION_FRAMEWORK_MAP[normalizedTitle]) {
    return SECTION_FRAMEWORK_MAP[normalizedTitle];
  }
  
  // Case-insensitive partial match
  const lowerTitle = normalizedTitle.toLowerCase();
  for (const [key, instruction] of Object.entries(SECTION_FRAMEWORK_MAP)) {
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      return instruction;
    }
  }
  
  return null;
}

// Build framework application prompt for a section
export function buildFrameworkPromptForSection(sectionTitle: string): string {
  const instruction = getFrameworkInstructions(sectionTitle);
  
  if (!instruction) {
    return "";
  }
  
  return `
=== FRAMEWORK APPLICATION GUIDANCE ===
Relevant frameworks for this section: ${instruction.frameworks.join(", ")}

${instruction.applicationPrompt}
=== END FRAMEWORK GUIDANCE ===
`;
}

// Track which frameworks were applied during generation
export interface FrameworkUsageLog {
  sectionName: string;
  frameworksApplied: string[];
  kbFrameworksUsed: string[]; // from kb_frameworks table
  timestamp: string;
}

export function createFrameworkUsageLog(
  sectionName: string,
  kbFrameworks: Array<{ title?: string; source_id?: string }>,
): FrameworkUsageLog {
  const staticInstruction = getFrameworkInstructions(sectionName);
  
  return {
    sectionName,
    frameworksApplied: staticInstruction?.frameworks || [],
    kbFrameworksUsed: kbFrameworks
      .filter((f) => f.title)
      .map((f) => `${f.title || "Unknown"} [${f.source_id || "?"}]`),
    timestamp: new Date().toISOString(),
  };
}
