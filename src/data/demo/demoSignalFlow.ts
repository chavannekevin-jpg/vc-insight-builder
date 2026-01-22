// Core demo data for SignalFlow - the fictional B2B SaaS AI company used in the demo ecosystem

export const DEMO_COMPANY = {
  id: 'demo-signalflow',
  name: 'SignalFlow',
  stage: 'Seed',
  category: 'B2B SaaS / AI',
  description: 'AI-powered deal intelligence that predicts which enterprise deals will close and why',
  biggest_challenge: 'Scaling sales beyond founder-led motion while maintaining win rates',
  founders: [
    { name: "Elena Vasquez", role: "CEO", background: "8 years at Salesforce, Enterprise Sales Strategy" },
    { name: "Marcus Chen", role: "CTO", background: "ML Engineering Lead at Datadog, PhD Stanford" },
  ]
};

// Target weighted average: ~70
export const DEMO_SECTION_SCORES = {
  problem: { score: 72, label: "Strong" },
  solution: { score: 68, label: "Solid" },
  market: { score: 75, label: "Strong" },
  competition: { score: 58, label: "Developing" },
  team: { score: 78, label: "Strong" },
  businessModel: { score: 65, label: "Solid" },
  traction: { score: 62, label: "Solid" },
  vision: { score: 72, label: "Strong" }
};

export const DEMO_MARKET_LENS_BRIEFING = {
  tailwinds: [
    {
      title: "Enterprise AI Adoption Surge",
      insight: "85% of sales organizations plan to increase AI tool spending in 2025, with revenue intelligence emerging as a priority category. Gartner projects 40% of enterprise sales teams will adopt AI-powered coaching tools by 2026.",
      relevance: "SignalFlow's AI-native approach positions it ahead of legacy tools retrofitting AI features. First-mover advantage in mid-market segment where adoption is accelerating fastest.",
      source: "Gartner Sales Technology Survey 2024"
    },
    {
      title: "RevOps Category Explosion",
      insight: "Revenue Operations software spend growing 25% YoY, outpacing broader B2B SaaS growth of 12%. Companies with dedicated RevOps functions have 19% faster revenue growth.",
      relevance: "SignalFlow sits at the intersection of RevOps and AI - two of the fastest-growing enterprise software categories. Budget allocation for this category is expanding.",
      source: "Forrester RevOps Market Analysis 2024"
    },
    {
      title: "Hybrid Work Driving Digital Sales Tools",
      insight: "Remote and hybrid selling has made AI-powered insights essential. 73% of sales leaders report declining win rates post-pandemic, creating urgent demand for deal intelligence.",
      relevance: "SignalFlow's async coaching and deal signals solve the visibility problem created by remote selling. This is a structural shift, not a temporary trend.",
      source: "McKinsey B2B Sales Survey 2024"
    },
    {
      title: "Mid-Market SaaS Renaissance",
      insight: "Mid-market companies ($10-100M ARR) are adopting enterprise-grade tools at unprecedented rates, with 65% now having formal sales operations. This segment is underserved by enterprise-focused incumbents.",
      relevance: "SignalFlow's €14K ACV and self-serve onboarding hits the mid-market sweet spot. Less competition, faster sales cycles, and expanding budgets.",
      source: "Bessemer State of the Cloud 2024"
    }
  ],
  headwinds: [
    {
      title: "Gong's Mid-Market Expansion",
      insight: "Gong announced 'Gong Essentials' tier targeting smaller teams at $99/seat, a direct challenge to mid-market players. Their $7B+ valuation gives them significant runway for competitive pricing.",
      relevance: "Creates pricing pressure and distribution competition. SignalFlow needs to establish category differentiation (prediction vs. recording) before Gong's mid-market push gains momentum.",
      source: "TechCrunch Enterprise Coverage 2024"
    },
    {
      title: "Economic Uncertainty Impact on Sales Tech",
      insight: "During economic downturns, sales technology is often among the first categories to face budget cuts. 2024 saw 18% reduction in average SaaS tool count at mid-market companies.",
      relevance: "SignalFlow must demonstrate clear ROI (deals saved, revenue recovered) to survive consolidation. The 'nice-to-have' positioning is existentially risky.",
      source: "SaaStr CFO Survey Q4 2024"
    }
  ],
  fundingLandscape: {
    summary: "B2B SaaS AI companies at Seed stage are raising €2.5-4M in Europe with strong investor appetite. The category is attracting both traditional SaaS investors and AI-focused funds.",
    dataPoints: [
      { metric: "Median Seed (B2B SaaS AI)", value: "€3.2M", context: "Up 15% from 2023" },
      { metric: "Active SaaS Investors (EU)", value: "250+", context: "Including US funds with EU thesis" },
      { metric: "Avg. Time to Close", value: "3.5 months", context: "For AI-native SaaS" },
      { metric: "Follow-on Rate", value: "72%", context: "Seed to Series A conversion" }
    ]
  },
  geographicContext: {
    summary: "European B2B SaaS is experiencing a funding renaissance, with Berlin, London, and Paris leading deal activity. US expansion remains the primary growth path for ambitious European SaaS companies.",
    insights: [
      "European SaaS valuations are 20-25% lower than US comparables, attractive for early entry",
      "Strong government R&D credits available in Germany, France, and UK for AI development",
      "Transatlantic go-to-market increasingly common, with EU build + US sell model proving effective"
    ]
  },
  exitPrecedents: [
    {
      company: "Gong",
      outcome: "Valued at $7.25B (2021 Series E), revenue intelligence category leader",
      relevance: "Proves market size and VC appetite for sales AI. Shows category can support multiple billion-dollar outcomes."
    },
    {
      company: "Clari",
      outcome: "Valued at $2.6B (2022 Series F), revenue platform positioning",
      relevance: "RevOps category validation. Shows mid-market focus can achieve significant scale."
    },
    {
      company: "Chorus.ai",
      outcome: "Acquired by ZoomInfo for $575M (2021)",
      relevance: "Demonstrates strategic acquirer interest in conversation intelligence. Shows exit path for #2-3 players."
    },
    {
      company: "People.ai",
      outcome: "Valued at $1.1B (2021), activity capture and revenue intelligence",
      relevance: "Another validation point for AI + sales data category. Multiple winners in adjacent spaces."
    }
  ],
  narrativeAlignment: {
    summary: "SignalFlow's positioning aligns exceptionally well with current investor narratives around AI-native SaaS, mid-market opportunity, and European tech excellence.",
    themes: [
      "AI-native vs. AI-retrofitted (first principles advantage)",
      "Mid-market as underserved goldmine",
      "Predictive vs. descriptive analytics (next generation)",
      "European technical talent + US market opportunity"
    ]
  },
  generatedAt: new Date().toISOString(),
  sourcesUsed: 14,
  sourcesList: [
    "Gartner Sales Technology Survey 2024",
    "Forrester RevOps Market Analysis 2024",
    "McKinsey B2B Sales Survey 2024",
    "Bessemer State of the Cloud 2024",
    "TechCrunch Enterprise Coverage 2024",
    "SaaStr CFO Survey Q4 2024",
    "Dealroom European SaaS Report 2024",
    "Carta Benchmarks Q4 2024"
  ]
};

export const DEMO_MATCHING_FUNDS = [
  {
    id: "fund-1",
    name: "Point Nine Capital",
    organization_name: "Point Nine",
    city: "Berlin",
    country: "Germany",
    investment_focus: ["B2B SaaS", "Developer Tools", "Sales Tech"],
    stages: ["Seed"],
    fund_size: 200000000,
    ticket_size_min: 500000,
    ticket_size_max: 3000000,
    thesis_keywords: ["saas", "b2b", "sales", "enterprise", "ai"],
    notable_investments: [{ name: "Algolia", round: "Seed" }, { name: "Contentful", round: "Seed" }],
    matchScore: 94
  },
  {
    id: "fund-2",
    name: "Balderton Capital",
    organization_name: "Balderton",
    city: "London",
    country: "UK",
    investment_focus: ["Enterprise SaaS", "AI/ML", "B2B Software"],
    stages: ["Seed", "Series A"],
    fund_size: 600000000,
    ticket_size_min: 1000000,
    ticket_size_max: 10000000,
    thesis_keywords: ["enterprise", "ai", "saas", "b2b", "revenue"],
    notable_investments: [{ name: "Revolut", round: "Seed" }, { name: "GoCardless", round: "Series A" }],
    matchScore: 91
  },
  {
    id: "fund-3",
    name: "Notion Capital",
    organization_name: "Notion Capital",
    city: "London",
    country: "UK",
    investment_focus: ["B2B SaaS", "Enterprise Software", "Sales & Marketing Tech"],
    stages: ["Seed", "Series A"],
    fund_size: 350000000,
    ticket_size_min: 500000,
    ticket_size_max: 5000000,
    thesis_keywords: ["b2b", "saas", "sales", "enterprise", "go-to-market"],
    notable_investments: [{ name: "Pipedrive", round: "Early" }, { name: "Tradeshift", round: "Series A" }],
    matchScore: 89
  },
  {
    id: "fund-4",
    name: "Accel",
    organization_name: "Accel",
    city: "London",
    country: "UK",
    investment_focus: ["Enterprise", "AI", "SaaS", "Fintech"],
    stages: ["Seed", "Series A", "Series B"],
    fund_size: 3000000000,
    ticket_size_min: 1000000,
    ticket_size_max: 50000000,
    thesis_keywords: ["enterprise", "ai", "saas", "growth", "platform"],
    notable_investments: [{ name: "Slack", round: "Series A" }, { name: "UiPath", round: "Series A" }],
    matchScore: 87
  },
  {
    id: "fund-5",
    name: "Index Ventures",
    organization_name: "Index Ventures",
    city: "London",
    country: "UK",
    investment_focus: ["Enterprise SaaS", "AI", "Developer Tools"],
    stages: ["Seed", "Series A", "Series B"],
    fund_size: 2000000000,
    ticket_size_min: 500000,
    ticket_size_max: 30000000,
    thesis_keywords: ["enterprise", "saas", "ai", "developer", "b2b"],
    notable_investments: [{ name: "Figma", round: "Seed" }, { name: "Notion", round: "Series A" }],
    matchScore: 85
  },
  {
    id: "fund-6",
    name: "Northzone",
    organization_name: "Northzone",
    city: "Stockholm",
    country: "Sweden",
    investment_focus: ["B2B SaaS", "AI/ML", "Fintech"],
    stages: ["Seed", "Series A"],
    fund_size: 500000000,
    ticket_size_min: 500000,
    ticket_size_max: 10000000,
    thesis_keywords: ["b2b", "ai", "saas", "enterprise", "nordic"],
    notable_investments: [{ name: "Klarna", round: "Early" }, { name: "iZettle", round: "Seed" }],
    matchScore: 83
  },
  {
    id: "fund-7",
    name: "Dawn Capital",
    organization_name: "Dawn Capital",
    city: "London",
    country: "UK",
    investment_focus: ["B2B Software", "Enterprise SaaS", "Security"],
    stages: ["Seed", "Series A"],
    fund_size: 400000000,
    ticket_size_min: 1000000,
    ticket_size_max: 15000000,
    thesis_keywords: ["b2b", "enterprise", "saas", "software", "security"],
    notable_investments: [{ name: "Collibra", round: "Series A" }, { name: "Mimecast", round: "Series A" }],
    matchScore: 81
  },
  {
    id: "fund-8",
    name: "Atomico",
    organization_name: "Atomico",
    city: "London",
    country: "UK",
    investment_focus: ["Deep Tech", "AI", "Enterprise", "Consumer"],
    stages: ["Series A", "Series B"],
    fund_size: 820000000,
    ticket_size_min: 5000000,
    ticket_size_max: 50000000,
    thesis_keywords: ["ai", "enterprise", "deep tech", "europe", "growth"],
    notable_investments: [{ name: "Graphcore", round: "Series A" }, { name: "Lilium", round: "Series A" }],
    matchScore: 79
  },
  {
    id: "fund-9",
    name: "Creandum",
    organization_name: "Creandum",
    city: "Stockholm",
    country: "Sweden",
    investment_focus: ["B2B SaaS", "Fintech", "Deep Tech"],
    stages: ["Seed", "Series A"],
    fund_size: 500000000,
    ticket_size_min: 500000,
    ticket_size_max: 15000000,
    thesis_keywords: ["b2b", "saas", "fintech", "europe", "growth"],
    notable_investments: [{ name: "Spotify", round: "Seed" }, { name: "Klarna", round: "Seed" }],
    matchScore: 77
  },
  {
    id: "fund-10",
    name: "Speedinvest",
    organization_name: "Speedinvest",
    city: "Vienna",
    country: "Austria",
    investment_focus: ["B2B SaaS", "Fintech", "AI/ML", "Marketplaces"],
    stages: ["Pre-seed", "Seed"],
    fund_size: 500000000,
    ticket_size_min: 200000,
    ticket_size_max: 3000000,
    thesis_keywords: ["b2b", "saas", "ai", "fintech", "early"],
    notable_investments: [{ name: "GoStudent", round: "Pre-seed" }, { name: "Bitpanda", round: "Seed" }],
    matchScore: 75
  },
  {
    id: "fund-11",
    name: "Firstminute Capital",
    organization_name: "Firstminute",
    city: "London",
    country: "UK",
    investment_focus: ["Enterprise", "Consumer", "AI"],
    stages: ["Seed"],
    fund_size: 250000000,
    ticket_size_min: 500000,
    ticket_size_max: 5000000,
    thesis_keywords: ["enterprise", "ai", "seed", "consumer", "b2b"],
    notable_investments: [{ name: "Hopin", round: "Seed" }, { name: "Marshmallow", round: "Seed" }],
    matchScore: 73
  },
  {
    id: "fund-12",
    name: "EQT Ventures",
    organization_name: "EQT Ventures",
    city: "Stockholm",
    country: "Sweden",
    investment_focus: ["Tech", "Enterprise", "Consumer"],
    stages: ["Seed", "Series A"],
    fund_size: 700000000,
    ticket_size_min: 1000000,
    ticket_size_max: 15000000,
    thesis_keywords: ["technology", "enterprise", "ai", "growth", "platform"],
    notable_investments: [{ name: "Wolt", round: "Series A" }, { name: "Einride", round: "Series A" }],
    matchScore: 71
  },
  {
    id: "fund-13",
    name: "Felix Capital",
    organization_name: "Felix Capital",
    city: "London",
    country: "UK",
    investment_focus: ["B2C", "B2B", "Design-led Tech"],
    stages: ["Seed", "Series A"],
    fund_size: 600000000,
    ticket_size_min: 500000,
    ticket_size_max: 10000000,
    thesis_keywords: ["design", "b2b", "consumer", "saas", "europe"],
    notable_investments: [{ name: "Peloton", round: "Series A" }, { name: "Mirakl", round: "Series A" }],
    matchScore: 68
  },
  {
    id: "fund-14",
    name: "Insight Partners",
    organization_name: "Insight Partners",
    city: "New York",
    country: "USA",
    investment_focus: ["Enterprise SaaS", "ScaleUp"],
    stages: ["Series A", "Series B", "Growth"],
    fund_size: 20000000000,
    ticket_size_min: 10000000,
    ticket_size_max: 200000000,
    thesis_keywords: ["enterprise", "saas", "growth", "scale", "b2b"],
    notable_investments: [{ name: "Monday.com", round: "Series B" }, { name: "Wiz", round: "Series A" }],
    matchScore: 65
  },
  {
    id: "fund-15",
    name: "a]6z (Andreessen Horowitz)",
    organization_name: "a16z",
    city: "San Francisco",
    country: "USA",
    investment_focus: ["AI", "Enterprise", "Crypto", "Bio"],
    stages: ["Seed", "Series A", "Growth"],
    fund_size: 35000000000,
    ticket_size_min: 1000000,
    ticket_size_max: 500000000,
    thesis_keywords: ["ai", "enterprise", "crypto", "deep tech", "platform"],
    notable_investments: [{ name: "GitHub", round: "Series A" }, { name: "Figma", round: "Series A" }],
    matchScore: 62
  }
];

// Demo VC Quick Take data
export const DEMO_VC_QUICK_TAKE = {
  verdict: "Conditional Yes",
  verdictExplanation: "SignalFlow presents a compelling opportunity in a proven market with strong tailwinds. The team has exceptional domain credibility, and early traction validates product-market fit. However, competitive pressure from well-funded incumbents and the need to scale GTM beyond founder-led sales create meaningful execution risk.",
  readinessLevel: "Nearly Ready",
  keyStrengths: [
    "Exceptional team: CEO's Salesforce pedigree + CTO's ML expertise from Datadog is the ideal combo for this category",
    "Strong early metrics: 4.9x LTV:CAC and 82% gross margin suggest a scalable unit economics foundation",
    "Market timing: AI adoption surge + mid-market RevOps expansion create a window of opportunity",
    "Differentiated approach: Predictive (why deals close) vs. descriptive (what happened) is defensible positioning"
  ],
  keyRisks: [
    "Competitive intensity: Gong's mid-market push and €7B+ war chest creates existential pressure",
    "GTM scaling: Transitioning from founder-led sales to repeatable motion is the primary near-term risk",
    "Traction depth: €32K MRR is promising but 28 customers is a thin base for pattern recognition",
    "Category definition: 'Deal intelligence' vs. 'conversation intelligence' distinction may not resonate"
  ],
  investmentConditions: [
    "Clear evidence of sales hire success (2+ quota-carrying reps hitting targets)",
    "Competitive moat articulation beyond 'mid-market focus'",
    "Path to €100K MRR within 6 months of funding"
  ],
  arcClassification: {
    type: "Emerging Market Leader",
    description: "Entering a validated category with differentiated positioning and strong execution potential"
  }
};
