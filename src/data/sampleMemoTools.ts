import { EnhancedSectionTools } from "@/types/memo";

// Sample data for CarbonPrint demo company
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
        verdict: "A well-funded competitor (or Intuit/Sage) could build this. Your advantage is speed-to-market and SMB focus, but that's a temporary moat. Need to build switching costs fast."
      },
      dataSource: "ai-complete"
    },
    actionPlan90Day: {
      actions: [
        { action: "File provisional patent on unique workflow/data combination", timeline: "Week 1-2", metric: "Patent application filed", priority: "important" },
        { action: "Launch 3+ accounting software integrations (QuickBooks, Xero, Wave)", timeline: "Month 2", metric: "Live integrations with 100+ users", priority: "critical" },
        { action: "Build data moat with proprietary SMB emission benchmarks", timeline: "Month 3", metric: "Unique dataset from 500+ companies", priority: "important" }
      ]
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
    bottomsUpTAM: {
      aiGenerated: {
        targetSegments: [
          { segment: "US SMBs with ESG requirements (50-500 employees)", count: 180000, acv: 2400, tam: 432000000 },
          { segment: "EU SMBs under CSRD scope", count: 50000, acv: 3600, tam: 180000000 },
          { segment: "Supply chain reporters (any size)", count: 100000, acv: 1800, tam: 180000000 }
        ],
        totalTAM: 792000000,
        sam: 158000000,
        som: 3200000,
        methodology: "Bottom-up based on government SMB registries filtered by employee count and industry sectors with ESG exposure",
        assumptions: ["20% of SMBs in target segments will adopt carbon software by 2027", "ACV based on current pricing tier analysis", "SAM assumes US + EU only"]
      },
      dataSource: "ai-partial",
      inputGuidance: ["Add your actual pricing to refine ACV", "Include any customer research on willingness-to-pay"]
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
        pitchToIC: "Carbon accounting is becoming mandatory, not optional. CSRD affects 50,000 EU companies, SEC rules impact US public companies, and their supply chains will cascade requirements to SMBs. CarbonPrint is positioning as the 'QuickBooks of carbon' - simple, affordable, SMB-focused while enterprise tools remain expensive and complex.",
        marketTiming: "We're at an inflection point: regulations passed but deadlines 18-36 months out. Perfect time to build category leadership before the compliance rush.",
        whyNow: "Three converging forces: 1) Regulatory mandates with teeth, 2) Enterprise supply chain requirements cascading to SMBs, 3) AI enabling 10x cheaper carbon accounting than legacy tools."
      },
      dataSource: "ai-complete"
    }
  }
};

export const getSampleToolsForSection = (sectionTitle: string): EnhancedSectionTools | undefined => {
  return SAMPLE_SECTION_TOOLS[sectionTitle];
};
