// Consolidated demo data for CarbonPrint - the fictional company used in the demo ecosystem

export const DEMO_COMPANY = {
  id: 'demo-carbonprint',
  name: 'CarbonPrint',
  stage: 'Pre-seed',
  category: 'Climate Tech',
  description: 'AI-powered carbon footprint tracking for enterprise supply chains',
  founders: [
    { name: "Maya Rodriguez", role: "CEO", background: "Ex-McKinsey sustainability practice" },
    { name: "James Liu", role: "CTO", background: "ML lead at Google Cloud" },
  ]
};

export const DEMO_SECTION_SCORES = {
  problem: { score: 58, label: "Developing" },
  solution: { score: 72, label: "Strong" },
  market: { score: 65, label: "Solid" },
  competition: { score: 55, label: "Needs Work" },
  team: { score: 78, label: "Strong" },
  businessModel: { score: 62, label: "Solid" },
  traction: { score: 45, label: "Early" },
  vision: { score: 70, label: "Strong" }
};

export const DEMO_MARKET_LENS_BRIEFING = {
  tailwinds: [
    {
      title: "CSRD Regulatory Push",
      insight: "The EU's Corporate Sustainability Reporting Directive (CSRD) comes into force in 2025, mandating carbon disclosure for 50,000+ companies. This creates urgent demand for compliance-ready solutions.",
      relevance: "CarbonPrint's core value proposition directly addresses this compliance need. Companies without solutions face regulatory penalties and procurement exclusion.",
      source: "EU Commission CSRD Framework 2024"
    },
    {
      title: "Enterprise Supply Chain Mandates",
      insight: "Fortune 500 companies are cascading carbon requirements to suppliers. Walmart, Apple, and Amazon have announced scope 3 disclosure requirements affecting mid-market suppliers.",
      relevance: "Mid-market companies need affordable solutions to meet enterprise buyer requirements. CarbonPrint's €12K ACV hits the sweet spot between DIY and enterprise solutions.",
      source: "CDP Supply Chain Report 2024"
    },
    {
      title: "ESG Investment Surge",
      insight: "Climate tech VC funding reached €8.2B in Europe in 2024, with carbon accounting emerging as a key infrastructure layer. Major funds are actively deploying in this space.",
      relevance: "Investor appetite is strong for companies solving the carbon measurement problem. This supports valuation and follow-on funding potential.",
      source: "Dealroom Climate Tech Report Q4 2024"
    }
  ],
  headwinds: [
    {
      title: "Enterprise Competitor Down-Market Expansion",
      insight: "Watershed (€200M+ raised) and Persefoni are reportedly exploring mid-market tiers. Their enterprise credibility and deep pockets could compress the mid-market window.",
      relevance: "CarbonPrint needs to build integration moats and customer density before well-funded competitors launch affordable offerings.",
      source: "TechCrunch Climate Coverage 2024"
    },
    {
      title: "Long Sales Cycles in Climate Tech",
      insight: "B2B climate solutions face 6-12 month sales cycles due to budget allocation timing and internal stakeholder alignment around sustainability investments.",
      relevance: "This creates CAC pressure and extends runway requirements. CarbonPrint needs to optimize for sales velocity or raise sufficient capital for extended cycles.",
      source: "Climate Tech VC Industry Survey 2024"
    }
  ],
  fundingLandscape: {
    summary: "European climate tech pre-seed rounds are averaging €1.2-2M, with strong investor interest in carbon measurement infrastructure. The funding environment is favorable for well-positioned companies.",
    dataPoints: [
      { metric: "Median Pre-Seed (Climate Tech)", value: "€1.5M", context: "Up 25% from 2023" },
      { metric: "Active Climate Investors (EU)", value: "180+", context: "Including new climate-focused funds" },
      { metric: "Avg. Time to Close", value: "4.5 months", context: "For climate pre-seed rounds" },
      { metric: "Follow-on Rate", value: "68%", context: "Climate pre-seed to seed conversion" }
    ]
  },
  geographicContext: {
    summary: "European climate tech is experiencing a funding renaissance, with regulatory tailwinds creating structural advantages over US counterparts. Berlin, London, and Amsterdam lead deal activity.",
    insights: [
      "CSRD creates 3-year head start for EU-focused solutions vs. SEC climate rules",
      "European climate tech valuations are 15-20% lower than US comparables, attractive for entry",
      "Strong government co-investment programs available in Germany, France, and Netherlands"
    ]
  },
  exitPrecedents: [
    {
      company: "Watershed",
      outcome: "Raised $100M Series C at $1.8B valuation (2022)",
      relevance: "Proves enterprise carbon accounting commands premium valuations. Shows category maturity."
    },
    {
      company: "Persefoni",
      outcome: "Raised $101M Series B at ~$500M valuation",
      relevance: "Mid-market positioning is viable. Validates the carbon accounting market size."
    },
    {
      company: "Normative (EU)",
      outcome: "Acquired by Worldfavor - strategic exit",
      relevance: "European carbon accounting has strategic acquirer interest. Shows exit path for smaller players."
    }
  ],
  narrativeAlignment: {
    summary: "CarbonPrint's positioning aligns well with current investor narratives around regulatory-driven climate tech, mid-market opportunity, and European advantage.",
    themes: [
      "Regulatory catalysts (CSRD) creating urgency",
      "Mid-market as underserved segment",
      "Infrastructure layer vs. point solution",
      "European climate tech momentum"
    ]
  },
  generatedAt: new Date().toISOString(),
  sourcesUsed: 12,
  sourcesList: [
    "EU Commission CSRD Framework 2024",
    "CDP Supply Chain Report 2024",
    "Dealroom Climate Tech Report Q4 2024",
    "Carta European Benchmarks 2024",
    "Climate Tech VC Industry Survey 2024",
    "TechCrunch Climate Coverage 2024"
  ]
};

export const DEMO_MATCHING_FUNDS = [
  {
    id: "fund-1",
    name: "World Fund",
    organization_name: "World Fund",
    city: "Berlin",
    country: "Germany",
    investment_focus: ["Climate Tech", "Sustainability", "Deep Tech"],
    stages: ["Pre-seed", "Seed"],
    fund_size: 350000000,
    ticket_size_min: 500000,
    ticket_size_max: 5000000,
    thesis_keywords: ["carbon", "climate", "decarbonization", "sustainability"],
    notable_investments: [{ name: "Planet A Foods", round: "Seed" }, { name: "Daphni Climate", round: "Pre-seed" }],
    matchScore: 92
  },
  {
    id: "fund-2",
    name: "2050",
    organization_name: "2050",
    city: "Paris",
    country: "France",
    investment_focus: ["Climate Tech", "Clean Energy", "Circular Economy"],
    stages: ["Pre-seed", "Seed", "Series A"],
    fund_size: 200000000,
    ticket_size_min: 300000,
    ticket_size_max: 3000000,
    thesis_keywords: ["climate", "green tech", "sustainability", "ESG"],
    notable_investments: [{ name: "Greenly", round: "Seed" }, { name: "Sweep", round: "Series A" }],
    matchScore: 89
  },
  {
    id: "fund-3",
    name: "Pale Blue Dot",
    organization_name: "Pale Blue Dot",
    city: "Stockholm",
    country: "Sweden",
    investment_focus: ["Climate Tech", "Planet Positive"],
    stages: ["Pre-seed", "Seed"],
    fund_size: 90000000,
    ticket_size_min: 200000,
    ticket_size_max: 2000000,
    thesis_keywords: ["carbon", "climate", "planet", "sustainability"],
    notable_investments: [{ name: "Einride", round: "Early Stage" }],
    matchScore: 87
  },
  {
    id: "fund-4",
    name: "Extantia",
    organization_name: "Extantia",
    city: "Berlin",
    country: "Germany",
    investment_focus: ["Climate Tech", "Carbon Removal", "Sustainability"],
    stages: ["Seed", "Series A"],
    fund_size: 150000000,
    ticket_size_min: 500000,
    ticket_size_max: 5000000,
    thesis_keywords: ["carbon", "climate", "decarbonization"],
    notable_investments: [{ name: "Carbonfuture", round: "Seed" }],
    matchScore: 85
  },
  {
    id: "fund-5",
    name: "Contrarian Ventures",
    organization_name: "Contrarian Ventures",
    city: "Vilnius",
    country: "Lithuania",
    investment_focus: ["Climate Tech", "Energy", "Mobility"],
    stages: ["Pre-seed", "Seed"],
    fund_size: 60000000,
    ticket_size_min: 100000,
    ticket_size_max: 1500000,
    thesis_keywords: ["climate", "energy transition", "sustainability"],
    notable_investments: [{ name: "Vinted", round: "Early" }],
    matchScore: 82
  },
  {
    id: "fund-6",
    name: "SET Ventures",
    organization_name: "SET Ventures",
    city: "Amsterdam",
    country: "Netherlands",
    investment_focus: ["Energy Transition", "Climate Tech", "Cleantech"],
    stages: ["Seed", "Series A"],
    fund_size: 110000000,
    ticket_size_min: 500000,
    ticket_size_max: 3000000,
    thesis_keywords: ["energy", "climate", "cleantech", "sustainability"],
    notable_investments: [{ name: "Northvolt", round: "Early" }],
    matchScore: 80
  },
  {
    id: "fund-7",
    name: "Speedinvest",
    organization_name: "Speedinvest",
    city: "Vienna",
    country: "Austria",
    investment_focus: ["Climate Tech", "SaaS", "Fintech"],
    stages: ["Pre-seed", "Seed"],
    fund_size: 500000000,
    ticket_size_min: 200000,
    ticket_size_max: 2500000,
    thesis_keywords: ["climate", "software", "B2B", "sustainability"],
    notable_investments: [{ name: "Refurbed", round: "Seed" }],
    matchScore: 76
  },
  {
    id: "fund-8",
    name: "Lowercarbon Capital",
    organization_name: "Lowercarbon Capital",
    city: "San Francisco",
    country: "USA",
    investment_focus: ["Climate Tech", "Carbon Removal", "Clean Energy"],
    stages: ["Pre-seed", "Seed", "Series A"],
    fund_size: 800000000,
    ticket_size_min: 500000,
    ticket_size_max: 10000000,
    thesis_keywords: ["carbon", "climate", "decarbonization", "removal"],
    notable_investments: [{ name: "Watershed", round: "Series A" }],
    matchScore: 74
  },
  {
    id: "fund-9",
    name: "Lightspeed Venture Partners",
    organization_name: "Lightspeed",
    city: "London",
    country: "UK",
    investment_focus: ["Enterprise SaaS", "Climate Tech", "B2B"],
    stages: ["Seed", "Series A"],
    fund_size: 1000000000,
    ticket_size_min: 1000000,
    ticket_size_max: 15000000,
    thesis_keywords: ["enterprise", "SaaS", "B2B", "sustainability"],
    notable_investments: [{ name: "Persefoni", round: "Series B" }],
    matchScore: 71
  },
  {
    id: "fund-10",
    name: "EQT Ventures",
    organization_name: "EQT Ventures",
    city: "Stockholm",
    country: "Sweden",
    investment_focus: ["Tech", "Climate Tech", "Enterprise"],
    stages: ["Seed", "Series A"],
    fund_size: 700000000,
    ticket_size_min: 1000000,
    ticket_size_max: 10000000,
    thesis_keywords: ["technology", "climate", "enterprise", "growth"],
    notable_investments: [{ name: "Northvolt", round: "Series A" }],
    matchScore: 68
  },
  {
    id: "fund-11",
    name: "Seedcamp",
    organization_name: "Seedcamp",
    city: "London",
    country: "UK",
    investment_focus: ["B2B SaaS", "Climate Tech", "Fintech"],
    stages: ["Pre-seed", "Seed"],
    fund_size: 150000000,
    ticket_size_min: 100000,
    ticket_size_max: 1000000,
    thesis_keywords: ["B2B", "SaaS", "climate", "enterprise"],
    notable_investments: [{ name: "UiPath", round: "Pre-seed" }],
    matchScore: 65
  },
  {
    id: "fund-12",
    name: "Point Nine Capital",
    organization_name: "Point Nine",
    city: "Berlin",
    country: "Germany",
    investment_focus: ["B2B SaaS", "Marketplaces"],
    stages: ["Seed"],
    fund_size: 200000000,
    ticket_size_min: 500000,
    ticket_size_max: 2000000,
    thesis_keywords: ["SaaS", "B2B", "enterprise", "software"],
    notable_investments: [{ name: "Algolia", round: "Seed" }],
    matchScore: 62
  }
];
