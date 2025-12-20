import { EnhancedSectionTools } from "@/types/memo";

// Sample data for CarbonPrint demo company - all sections
export const SAMPLE_SECTION_TOOLS: Record<string, EnhancedSectionTools> = {
  "Problem": {
    sectionScore: {
      score: 58,
      label: "Developing",
      vcBenchmark: 65,
      percentile: "Lower quartile",
      whatThisTellsVC: "The problem is real but the pain quantification is weak. VCs see SMB sustainability as emerging, not urgent.",
      fundabilityImpact: "Without stronger evidence of burning pain, this raises questions about willingness to pay and sales cycle length."
    },
    benchmarks: [
      { metric: "Customer Interviews", yourValue: "12", seedBenchmark: "25+", seriesABenchmark: "50+", percentile: "Below average", insight: "Need more validation interviews to prove pain at scale" },
      { metric: "Pain Quantification", yourValue: "Qualitative", seedBenchmark: "$50K+ cost/year", seriesABenchmark: "ROI model", percentile: "Weak", insight: "Quantify the cost of inaction in dollars" }
    ],
    caseStudy: {
      company: "Watershed",
      problem: "Started with vague 'companies want to be green' positioning",
      fix: "Pivoted to compliance-driven messaging: 'Avoid SEC climate disclosure penalties'",
      outcome: "3x increase in enterprise close rates, raised $100M Series C",
      timeframe: "6 months",
      sector: "Climate Tech / Carbon Accounting"
    },
    vcInvestmentLogic: {
      decision: "CAUTIOUS",
      reasoning: "The problem exists but isn't clearly differentiated from general 'sustainability' noise. SMBs historically deprioritize compliance until forced.",
      keyCondition: "Show regulatory pressure creating urgency (e.g., supply chain requirements from enterprise customers)"
    },
    actionPlan90Day: {
      actions: [
        { action: "Conduct 15 more customer interviews with specific pain quantification", timeline: "Week 1-2", metric: "25+ total interviews documented", priority: "critical" },
        { action: "Calculate average cost of manual carbon tracking for SMBs", timeline: "Week 1-2", metric: "Clear $/year pain number", priority: "critical" },
        { action: "Document 3 regulatory drivers forcing SMB action", timeline: "Week 3-4", metric: "Specific regulations with deadlines", priority: "important" },
        { action: "Get 5 LOIs mentioning specific pain points", timeline: "Month 2", metric: "Signed LOIs with pain quotes", priority: "important" }
      ]
    },
    leadInvestorRequirements: {
      requirements: ["Quantified pain in dollars/year", "Regulatory timeline creating urgency", "Evidence of willingness to pay"],
      dealbreakers: ["Nice-to-have positioning", "No enterprise customer requirements driving SMB adoption"],
      wouldWantToSee: ["Supply chain pressure from large customers", "Case study of SMB losing contract due to carbon reporting"],
      investorParagraph: "I'd need to see that SMBs are being forced to act, not just choosing to. Show me the Walmart or Apple supplier mandate that makes this a must-have, not a nice-to-have."
    },
    evidenceThreshold: {
      aiGenerated: {
        verifiedPain: ["SMBs spend 20+ hours/month on manual tracking", "ESG reporting requirements increasing"],
        unverifiedPain: ["SMBs 'want' to be sustainable", "Cost savings from carbon reduction"],
        evidenceGrade: "C",
        missingEvidence: ["Quantified cost of current solutions", "Customer churn data from competitors", "Regulatory compliance deadlines"],
        whatVCsConsiderVerified: ["Paid pilots or LOIs", "Customer interviews with specific quotes", "Third-party market research", "Regulatory filings with deadlines"]
      },
      dataSource: "ai-complete"
    },
    founderBlindSpot: {
      aiGenerated: {
        potentialExaggerations: ["Assuming all SMBs care about sustainability equally", "Overstating regulatory urgency for small businesses"],
        misdiagnoses: ["The problem might be 'reporting to enterprise customers' not 'being sustainable'", "Pain might be sales/contracts, not operations"],
        assumptions: ["SMBs will pay $200+/month for this", "Carbon accounting is top-3 priority for target segment"],
        commonMistakes: ["Selling to 'sustainability officers' who have no budget", "Competing on features vs. compliance/sales enablement"]
      },
      dataSource: "ai-complete"
    }
  },
  "Solution": {
    sectionScore: {
      score: 52,
      label: "Developing",
      vcBenchmark: 60,
      percentile: "Average",
      whatThisTellsVC: "The product exists but defensibility is unclear. AI features are table-stakes, not differentiators.",
      fundabilityImpact: "Without clear moats, VCs worry about commoditization from Salesforce/Microsoft entering the space."
    },
    vcInvestmentLogic: {
      decision: "CAUTIOUS",
      reasoning: "The solution works but isn't clearly 10x better than spreadsheets + consultant. AI carbon tracking is becoming commoditized.",
      keyCondition: "Demonstrate unique data advantage or integration moat that competitors can't replicate in 12 months"
    },
    actionPlan90Day: {
      actions: [
        { action: "File provisional patent on unique workflow/data combination", timeline: "Week 1-2", metric: "Patent application filed", priority: "important" },
        { action: "Launch 3+ accounting software integrations (QuickBooks, Xero, Wave)", timeline: "Month 2", metric: "Live integrations with 100+ users", priority: "critical" },
        { action: "Build data moat with proprietary SMB emission benchmarks", timeline: "Month 3", metric: "Unique dataset from 500+ companies", priority: "important" }
      ]
    },
    technicalDefensibility: {
      aiGenerated: {
        defensibilityScore: 45,
        proofPoints: ["Proprietary emission factor database", "SMB-specific workflow automation", "Integration with accounting software"],
        expectedProofs: ["Patents or patent-pending", "Unique data sources", "Network effects", "High switching costs"],
        gaps: ["No patents filed", "Data could be replicated", "Low switching costs for SMBs"],
        vcEvaluation: "Current defensibility is weak. The AI component uses standard models, and the emission factors are publicly available. Focus on building switching costs through integrations and workflow lock-in."
      },
      dataSource: "ai-complete"
    },
    commoditizationTeardown: {
      aiGenerated: {
        features: [
          { feature: "AI-powered carbon calculations", commoditizationRisk: "High", timeToClone: "3-6 months", defensibility: "Low - uses standard LLMs" },
          { feature: "Automated data collection", commoditizationRisk: "Medium", timeToClone: "6-9 months", defensibility: "Medium - requires integrations" },
          { feature: "SMB-focused UX", commoditizationRisk: "Medium", timeToClone: "3-6 months", defensibility: "Low - easily copied" },
          { feature: "Compliance report generation", commoditizationRisk: "High", timeToClone: "2-3 months", defensibility: "Low - template-based" }
        ],
        overallRisk: "High"
      },
      dataSource: "ai-complete"
    },
    competitorBuildAnalysis: {
      aiGenerated: {
        couldBeBuilt: true,
        estimatedTime: "9-12 months for full feature parity",
        requiredResources: "$2-3M and team of 8-10 engineers",
        barriers: ["Existing customer relationships", "Integration ecosystem", "Brand awareness in SMB segment"],
        verdict: "A well-funded competitor (or Intuit/Sage) could build this. Your advantage is speed-to-market and SMB focus, but that's a temporary moat."
      },
      dataSource: "ai-complete"
    }
  },
  "Market": {
    sectionScore: {
      score: 62,
      label: "Developing",
      vcBenchmark: 65,
      percentile: "Average",
      whatThisTellsVC: "Market size is believable but TAM methodology needs work. VCs will challenge the SMB willingness-to-pay assumptions.",
      fundabilityImpact: "Solid enough for Seed, but Series A will require bottoms-up validation with actual customer data."
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Climate tech is a hot space with regulatory tailwinds. SMB segment is underserved. Market timing appears good.",
      keyCondition: "Validate SAM with actual paying customers, not just TAM projections"
    },
    actionPlan90Day: {
      actions: [
        { action: "Build bottoms-up TAM model with verifiable data sources", timeline: "Week 1-2", metric: "TAM model with citations", priority: "critical" },
        { action: "Survey 100 target SMBs on budget allocation for sustainability tools", timeline: "Month 2", metric: "Willingness-to-pay data", priority: "important" }
      ]
    },
    bottomsUpTAM: {
      aiGenerated: {
        targetSegments: [
          { segment: "EU mid-market with CSRD scope (500-5000 employees)", count: 50000, acv: 12000, tam: 600000000 },
          { segment: "US mid-market with supply chain requirements", count: 30000, acv: 12000, tam: 360000000 },
          { segment: "SMB tier (compliance-driven smaller companies)", count: 100000, acv: 2400, tam: 240000000 }
        ],
        totalTAM: 1200000000,
        sam: 240000000,
        som: 12000000,
        methodology: "Bottom-up based on EU CSRD scope registries + US mid-market with enterprise supply chain exposure, validated against CarbonPrint's €12K ACV enterprise tier",
        assumptions: ["25% of mid-market in target segments will adopt by 2027", "ACV based on CarbonPrint's €12K enterprise tier pricing", "SAM assumes EU + US primary markets"]
      },
      dataSource: "ai-partial",
      inputGuidance: ["Your €12K ACV is validated against 3 LOIs", "Consider tiered penetration rates by segment"]
    },
    marketReadinessIndex: {
      aiGenerated: {
        regulatoryPressure: { score: 72, evidence: "CSRD in EU, SEC climate rules in US, California SB 253 - all creating compliance pressure" },
        urgency: { score: 55, evidence: "SMBs feel pressure but not burning urgency - often through enterprise supply chain requirements" },
        willingnessToPay: { score: 48, evidence: "Limited data on SMB spend; enterprise budgets clear but SMB price sensitivity unknown" },
        switchingFriction: { score: 35, evidence: "Low switching costs - most SMBs use spreadsheets, easy to switch between tools" },
        overallScore: 52
      },
      dataSource: "ai-complete"
    },
    vcMarketNarrative: {
      aiGenerated: {
        pitchToIC: "Carbon accounting is becoming mandatory, not optional. CSRD affects 50,000 EU companies, SEC rules impact US public companies, and their supply chains will cascade requirements to SMBs. CarbonPrint is positioning as the 'QuickBooks of carbon' - simple, affordable, SMB-focused.",
        marketTiming: "We're at an inflection point: regulations passed but deadlines 18-36 months out. Perfect time to build category leadership before the compliance rush.",
        whyNow: "Three converging forces: 1) Regulatory mandates with teeth, 2) Enterprise supply chain requirements cascading to SMBs, 3) AI enabling 10x cheaper carbon accounting."
      },
      dataSource: "ai-complete"
    }
  },
  "Competition": {
    sectionScore: {
      score: 55,
      label: "Developing",
      vcBenchmark: 60,
      percentile: "Average",
      whatThisTellsVC: "Competitive landscape is crowded. Differentiation on 'SMB focus' is weak without clear evidence of why enterprise players won't move down-market.",
      fundabilityImpact: "VCs will ask about Watershed, Persefoni moving to SMB. Need stronger moat story."
    },
    vcInvestmentLogic: {
      decision: "CAUTIOUS",
      reasoning: "Climate tech is getting crowded. Enterprise players like Watershed are well-funded and could easily build SMB tier.",
      keyCondition: "Show why Salesforce, Intuit, or Watershed won't win this market with their existing distribution"
    },
    actionPlan90Day: {
      actions: [
        { action: "Create detailed competitive intelligence on enterprise players' SMB plans", timeline: "Week 1-2", metric: "Intel on top 5 competitors' roadmaps", priority: "critical" },
        { action: "Build integration moat with 5+ SMB accounting tools", timeline: "Month 3", metric: "Live integrations creating lock-in", priority: "critical" }
      ]
    },
    competitorChessboard: {
      aiGenerated: {
        competitors: [
          { name: "Watershed", currentPosition: "Enterprise leader ($70M ARR)", likely12MonthMoves: ["Launch SMB tier at $99/mo", "Acquire SMB-focused competitor", "Partner with accounting software"], threat24Months: "High" },
          { name: "Persefoni", currentPosition: "Mid-market focus", likely12MonthMoves: ["Expand down-market", "Add AI automation features", "Build channel partnerships"], threat24Months: "Medium" },
          { name: "Salesforce Net Zero Cloud", currentPosition: "Enterprise bundle play", likely12MonthMoves: ["SMB push through Essentials", "AI carbon features", "Vertical solutions"], threat24Months: "Medium" }
        ],
        marketDynamics: "Market is consolidating. Enterprise leaders are eyeing SMB as their next growth vector. Window for pure-play SMB positioning is 12-18 months."
      },
      dataSource: "ai-complete"
    },
    moatDurability: {
      aiGenerated: {
        currentMoatStrength: 35,
        erosionFactors: ["Enterprise players have resources to build SMB features", "Low switching costs for customers", "AI/tech is commoditizing rapidly"],
        estimatedDuration: "12-18 months before significant competitive pressure",
        reinforcementOpportunities: ["Deep accounting software integrations", "Proprietary SMB emission benchmarks", "Community/network effects", "Vertical-specific solutions"]
      },
      dataSource: "ai-complete"
    }
  },
  "Team": {
    sectionScore: {
      score: 68,
      label: "Strong",
      vcBenchmark: 65,
      percentile: "Above average",
      whatThisTellsVC: "Technical team is solid. Missing climate/sustainability domain expertise and enterprise sales experience.",
      fundabilityImpact: "Team is fundable but will need to add industry advisor or hire with domain expertise before Series A."
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Strong technical founders with relevant backgrounds. The gap is climate industry expertise, but that's addressable through advisors or hires.",
      keyCondition: "Add climate tech advisor or hire with direct industry experience within 6 months"
    },
    actionPlan90Day: {
      actions: [
        { action: "Recruit 2 climate industry advisors with VC network", timeline: "Week 1-2", metric: "Signed advisor agreements", priority: "critical" },
        { action: "Hire or contract enterprise sales leader with SMB climate experience", timeline: "Month 3", metric: "Sales leader onboarded", priority: "important" }
      ]
    },
    credibilityGapAnalysis: {
      aiGenerated: {
        expectedSkills: ["Climate/sustainability domain expertise", "Enterprise sales experience", "Regulatory/compliance background", "B2B SaaS scaling experience"],
        currentSkills: ["Strong technical/engineering background", "Product development experience", "Data science capabilities", "Startup experience"],
        gaps: [
          { skill: "Climate industry expertise", severity: "Critical", mitigation: "Add climate tech advisor or hire sustainability expert" },
          { skill: "Enterprise sales", severity: "Important", mitigation: "Hire fractional VP Sales with SMB experience" },
          { skill: "Regulatory knowledge", severity: "Minor", mitigation: "Partner with compliance consulting firm" }
        ],
        overallCredibility: 68
      },
      dataSource: "ai-complete"
    },
    founderMapping: {
      aiGenerated: {
        successfulFounderProfiles: [
          { company: "Watershed", founderBackground: "Stripe alumni with climate policy experience", relevantTo: "Technical + policy combo" },
          { company: "Persefoni", founderBackground: "Big 4 sustainability consulting + tech", relevantTo: "Domain expertise path" }
        ],
        matchScore: 65,
        gaps: ["No climate industry operating experience", "Limited regulatory/policy network"]
      },
      dataSource: "ai-complete"
    }
  },
  "Business Model": {
    sectionScore: {
      score: 58,
      label: "Developing",
      vcBenchmark: 65,
      percentile: "Below average",
      whatThisTellsVC: "Unit economics are early-stage typical but LTV:CAC needs work. SMB churn is a concern.",
      fundabilityImpact: "Acceptable for Seed but will need to show path to 3:1+ LTV:CAC for Series A."
    },
    vcInvestmentLogic: {
      decision: "CAUTIOUS",
      reasoning: "SMB SaaS unit economics are historically challenging. Current CAC payback is too long and churn assumption may be optimistic.",
      keyCondition: "Demonstrate 12-month payback and <5% monthly churn with real cohort data"
    },
    actionPlan90Day: {
      actions: [
        { action: "Track and report actual cohort retention data", timeline: "Week 1-2", metric: "3+ months of cohort data", priority: "critical" },
        { action: "Test pricing tiers to improve ACV", timeline: "Month 2", metric: "A/B test results on pricing", priority: "important" },
        { action: "Implement annual billing incentives to reduce churn", timeline: "Month 3", metric: "30%+ on annual plans", priority: "important" }
      ]
    },
    modelStressTest: {
      aiGenerated: {
        scenarios: [
          { scenario: "Churn doubles to 6% monthly", impact: "LTV drops 50%, unit economics become unsustainable", survivalProbability: 40, mitigations: ["Annual contracts", "Usage-based stickiness", "Integration lock-in"] },
          { scenario: "CAC increases 50%", impact: "Payback extends to 18+ months, growth stalls", survivalProbability: 55, mitigations: ["Product-led growth", "Referral program", "Content marketing"] },
          { scenario: "Competitor undercuts by 50%", impact: "Forced to match, margins compress significantly", survivalProbability: 50, mitigations: ["Differentiate on features", "Focus on enterprise segment", "Bundle services"] }
        ],
        overallResilience: "Medium"
      },
      dataSource: "ai-complete"
    },
    cashEfficiencyBenchmark: {
      aiGenerated: {
        burnMultiple: 2.8,
        industryAverage: 2.0,
        percentile: "Below average",
        efficiency: "Average",
        recommendation: "Burn multiple of 2.8x is acceptable for Seed but needs to improve to <2x for Series A. Focus on improving sales efficiency and reducing CAC."
      },
      dataSource: "ai-partial"
    }
  },
  "Traction": {
    sectionScore: {
      score: 45,
      label: "Weak",
      vcBenchmark: 60,
      percentile: "Lower quartile",
      whatThisTellsVC: "Very early traction. Revenue is primarily from pilot customers, not repeatable sales process.",
      fundabilityImpact: "Seed-fundable with strong team, but need to show 3x growth in next 6 months for Series A."
    },
    vcInvestmentLogic: {
      decision: "CAUTIOUS",
      reasoning: "Traction is founder-led and pilot-based. No evidence of repeatable sales motion or product-market fit.",
      keyCondition: "Show 3 customers acquired without founder involvement and 90%+ retention"
    },
    actionPlan90Day: {
      actions: [
        { action: "Close 5 customers without founder sales involvement", timeline: "Month 3", metric: "5 non-founder-led deals", priority: "critical" },
        { action: "Document and standardize sales process", timeline: "Month 2", metric: "Sales playbook created", priority: "important" },
        { action: "Launch self-serve trial flow", timeline: "Month 3", metric: "10+ trial signups/week", priority: "nice-to-have" }
      ]
    },
    tractionDepthTest: {
      aiGenerated: {
        tractionType: "Founder-led",
        sustainabilityScore: 42,
        redFlags: ["Most customers from founder network", "Heavy discounting in early deals", "No inbound demand yet", "Long sales cycles (3+ months)"],
        positiveSignals: ["100% retention so far", "Expanding usage within accounts", "Positive NPS scores", "Referral requests from customers"]
      },
      dataSource: "ai-complete"
    },
    cohortStabilityProjection: {
      aiGenerated: {
        currentRetention: 97,
        industryBenchmark: 92,
        projectedLTVImpact: "Current retention is strong but sample size is small. If churn increases to industry average, LTV drops 40%.",
        churnScenarios: [
          { churnRate: 3, impact: "Sustainable - maintains current unit economics" },
          { churnRate: 5, impact: "Challenging - LTV:CAC drops below 3:1" },
          { churnRate: 8, impact: "Unsustainable - requires pricing or cost restructure" }
        ]
      },
      dataSource: "ai-complete"
    }
  },
  "Vision": {
    sectionScore: {
      score: 70,
      label: "Strong",
      vcBenchmark: 65,
      percentile: "Above average",
      whatThisTellsVC: "Clear vision with believable path. Exit narrative is compelling given M&A activity in climate tech.",
      fundabilityImpact: "Vision is fundable. VCs can see the path to meaningful outcome."
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "Vision is compelling - 'Stripe for carbon' positioning resonates. Climate tech M&A is active. Timing is good.",
      keyCondition: "Execute on near-term milestones to prove you can reach the vision"
    },
    actionPlan90Day: {
      actions: [
        { action: "Hit $50K MRR milestone", timeline: "Month 3", metric: "$50K MRR", priority: "critical" },
        { action: "Secure 2 strategic partnership LOIs", timeline: "Month 3", metric: "Signed LOIs with accounting/ERP vendors", priority: "important" }
      ]
    },
    vcMilestoneMap: {
      aiGenerated: {
        milestones: [
          { month: 3, milestone: "Product-market fit signal", metric: "MRR", targetValue: "$50K", currentValue: "$18K" },
          { month: 6, milestone: "Repeatable sales process", metric: "Deals closed by non-founders", targetValue: "10", currentValue: "0" },
          { month: 12, milestone: "Series A ready", metric: "ARR", targetValue: "$1M", currentValue: "$216K" },
          { month: 18, milestone: "Market leadership position", metric: "SMB customers", targetValue: "500", currentValue: "45" }
        ],
        criticalPath: ["Achieve $50K MRR to prove willingness to pay", "Build repeatable sales motion", "Secure strategic partnerships for distribution", "Demonstrate 100%+ NRR"]
      },
      dataSource: "ai-complete"
    },
    scenarioPlanning: {
      aiGenerated: {
        bestCase: { description: "Hit $1M ARR in 12 months, secure strategic partnership, raise $8M Series A at $40M valuation", fundraisingImplication: "Strong Series A with multiple term sheets, ability to be selective on investors", probability: 20 },
        baseCase: { description: "Reach $600K ARR in 12 months, solid retention, raise $5M Series A at $25M valuation", fundraisingImplication: "Fundable Series A with 2-3 interested investors, standard terms", probability: 50 },
        downside: { description: "Growth stalls at $300K ARR, need to extend runway, raise bridge or smaller round", fundraisingImplication: "Challenging fundraise, may need to consider acqui-hire or pivot", probability: 30 }
      },
      dataSource: "ai-complete"
    },
    exitNarrative: {
      aiGenerated: {
        potentialAcquirers: ["Intuit", "Sage", "Salesforce", "Microsoft", "SAP", "Workday"],
        strategicValue: "SMB carbon data is valuable for enterprise supply chain reporting. Acquirer gets instant SMB customer base and compliance data.",
        comparableExits: [
          { company: "Normative", acquirer: "Strategic (undisclosed)", value: "$40M", multiple: "8x ARR" },
          { company: "CarbonChain", acquirer: "Vista Equity", value: "$60M", multiple: "10x ARR" }
        ],
        pathToExit: "Build to $10M+ ARR with strong SMB base, then strategic acquisition by accounting/ERP platform seeking carbon compliance capabilities. Target 5-8x revenue multiple."
      },
      dataSource: "ai-complete"
    }
  },
  "Investment Thesis": {
    sectionScore: {
      score: 60,
      label: "Developing",
      vcBenchmark: 65,
      percentile: "Average",
      whatThisTellsVC: "The thesis is coherent but needs stronger differentiation. VCs see potential but want clearer path to category leadership.",
      fundabilityImpact: "Fundable at Seed with the right team, but Series A will require proven traction metrics."
    },
    vcInvestmentLogic: {
      decision: "INTERESTED",
      reasoning: "The market opportunity is real and timing is good. Team has relevant experience. Main question is execution speed and competitive differentiation.",
      keyCondition: "Demonstrate 3x growth in next two quarters while maintaining unit economics"
    },
    actionPlan90Day: {
      actions: [
        { action: "Refine positioning to clearly differentiate from enterprise players", timeline: "Week 1-2", metric: "Updated pitch deck and messaging", priority: "critical" },
        { action: "Secure 3 reference customers willing to speak with VCs", timeline: "Month 2", metric: "3 referenceable customers", priority: "important" },
        { action: "Build financial model showing path to $10M ARR", timeline: "Month 3", metric: "Detailed financial model", priority: "important" }
      ]
    },
    leadInvestorRequirements: {
      requirements: ["Clear path to $100M+ revenue", "Defensible competitive position", "Strong founder-market fit"],
      dealbreakers: ["Unclear differentiation", "Weak unit economics", "No evidence of product-market fit"],
      wouldWantToSee: ["Customer testimonials", "Retention metrics", "Clear go-to-market strategy"],
      investorParagraph: "I'd want to see that you can win in a crowded market. Show me the unique insight that makes you 10x better for your target customer, and prove it with retention data."
    }
  }
};

export const getSampleToolsForSection = (sectionTitle: string): EnhancedSectionTools | undefined => {
  return SAMPLE_SECTION_TOOLS[sectionTitle];
};
