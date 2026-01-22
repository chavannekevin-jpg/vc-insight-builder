// Demo questionnaire responses for SignalFlow
// This represents what a founder would input to generate a ~70 score analysis

export const DEMO_PROFILE_COMPLETION = {
  overall: 100,
  sections: {
    companyBasics: 100,
    solutionProduct: 100,
    businessModelMarket: 100,
    tractionTeam: 100,
    financialsVision: 100
  }
};

export const DEMO_UNIT_ECONOMICS = {
  mrr: 32000,
  arr: 384000,
  customers: 28,
  acv: 14000,
  cac: 8500,
  ltv: 42000,
  ltvCacRatio: 4.9,
  paybackMonths: 7,
  grossMargin: 82,
  monthlyChurn: 2.1,
  nrr: 108,
  burnRate: 45000,
  runway: 14
};

export const DEMO_PROFILE_RESPONSES = {
  // Section 1: Company Basics & Problem
  company_name: "SignalFlow",
  company_stage: "Seed",
  company_category: "B2B SaaS / AI",
  company_description: "AI-powered deal intelligence that predicts which enterprise deals will close and why",
  
  problem_core: `Enterprise sales teams lose 67% of qualified deals to "no decision" — not competitors. After interviewing 85 sales leaders across the mid-market, we found a consistent pattern: reps spend 40% of their time on deals that will never close, while neglecting the ones that could.

The financial impact is staggering: $2.1M average annual revenue leakage per 50-person sales org. This isn't a productivity problem — it's a prediction problem. Current solutions (Salesforce reports, manager intuition, spreadsheet forecasting) catch problems far too late, after deals have already stalled.

What makes this particularly painful is the asymmetry: sales leaders can tell you which deals closed or lost, but they can't tell you WHY until it's too late to intervene. The insight comes in the post-mortem, not the moment of truth.`,

  problem_evidence: `We validated this through three channels:

1. **Customer Discovery**: 85 structured interviews with VPs of Sales and CROs at companies with 20-200 person sales teams. 78% cited "pipeline quality" as their #1 operational challenge. 92% said they couldn't predict which deals would close with any confidence beyond the final stage.

2. **Quantitative Analysis**: We analyzed anonymized CRM data from 12 pilot companies (2.1M deals total). Key finding: deals that eventually lose show detectable behavioral patterns 45 days before formal loss — but current tools don't flag these signals.

3. **Market Validation**: Paid pilots with 8 companies before building the full product. 6 converted to annual contracts. NPS of 74 across early customers.`,

  // Section 2: Solution & Product
  solution_core: `SignalFlow analyzes CRM data, email patterns, call transcripts, and calendar activity to predict deal outcomes with 89% accuracy. Unlike tools that tell you what happened, we tell you WHY deals will close or stall — so reps know exactly what to fix.

Our ML models identify the 3-5 signals that determine close probability for each deal, surfacing them as actionable coaching insights. A rep doesn't just see "this deal is at risk" — they see "this deal lacks technical champion engagement and has 40% less email velocity than won deals at this stage."

Key differentiators:
• **Prediction focus**: We predict outcomes and prescribe actions, not just record calls
• **Mid-market optimized**: Designed for 20-100 person sales teams, not enterprise-only
• **5-minute integration**: Connects to Salesforce, HubSpot, Outreach, Gong in minutes
• **Action-oriented**: Every insight comes with a specific next step`,

  solution_product_status: `MVP live with 28 paying customers. Core platform includes:
• Deal scoring engine (89% accuracy on close/loss prediction)
• Risk signal dashboard with daily alerts
• Rep coaching recommendations
• Manager pipeline health views
• Slack/email notification integrations

In development:
• Enterprise SSO and advanced permissions (Q1)
• Custom ML model training per customer (Q2)
• Salesforce native app (Q3)`,

  solution_defensibility: `Our moat has three layers:

1. **Data Network Effect**: We've processed 2M+ deal outcomes across 28 customers, training models that improve with every new customer. Competitors starting now would need 18+ months to reach our data depth.

2. **Integration Depth**: We pull from 12 different data sources (CRM, email, calendar, call recordings, engagement tools) — creating switching costs and comprehensive signal coverage.

3. **Algorithmic IP**: Our prediction models are trained on deal outcomes, not just call transcripts. We're building the "why" layer that conversation intelligence tools can't replicate through retrofitting.

The longer-term moat: as we expand to more customers, our benchmarking and pattern recognition becomes increasingly valuable — showing what "good" looks like across thousands of deals.`,

  // Section 3: Business Model & Market
  target_customer: `Primary ICP: Mid-market B2B companies (100-1000 employees) with 20-100 person sales teams selling $50K+ ACV products.

**Decision Maker**: VP Sales or CRO
**Budget Owner**: Sales Operations or RevOps
**Champion**: Sales enablement or sales managers

**Ideal customer signals**:
• Salesforce or HubSpot CRM in use
• 6+ month sales cycles with complex stakeholder maps
• Already using 1+ sales engagement tool (Outreach, SalesLoft)
• Experiencing pipeline predictability pain

**Best-fit industries**: Technology, financial services, manufacturing, professional services

**Why mid-market**: Enterprise is dominated by Gong/Clari. SMB can't afford $15K+ tools. Mid-market is underserved, has budget, and makes faster decisions.`,

  market_size: `**Bottom-up TAM**:
• 180,000 mid-market B2B companies globally with 20+ person sales teams
• Average contract value: €14,000
• Addressable market: €2.5B

**Served Available Market (SAM)**:
• 45,000 companies in our ICP (US + Western Europe, tech-forward industries)
• SAM: €630M

**Current Target Market (SOM)**:
• 8,000 companies reachable through our channels in Year 1-2
• SOM: €112M

**Category context**:
• Revenue Intelligence market: $1.2B (2024), growing 25% YoY
• Broader Sales Tech market: $12B, but fragmented across 20+ categories`,

  competitive_landscape: `**Direct Competitors**:
• **Gong** ($70M ARR, $7.25B valuation): Market leader in conversation intelligence. Enterprise-focused, €30-50K ACV. Strength: Brand, data, distribution. Weakness: Overkill for mid-market, reactive not predictive.
• **Clari** ($40M ARR, $2.6B valuation): Revenue platform focused on forecasting. Enterprise-heavy. Strength: Exec dashboards. Weakness: Requires significant implementation, too expensive for SMB.
• **People.ai** ($30M ARR, $1.1B valuation): Activity capture and analytics. Strength: CRM automation. Weakness: Descriptive not predictive, limited coaching.

**Indirect Competitors**:
• **BoostUp, Aviso, InsideSales**: Smaller players in revenue intelligence
• **Native CRM analytics**: Salesforce Einstein, HubSpot forecasting

**Our Edge**:
• 5x lower pricing than enterprise players
• Prediction-first (why) vs. recording-first (what)
• Mid-market focus with self-serve onboarding
• Faster time-to-value (days not months)`,

  // Section 4: Traction & Team
  traction_proof: `**Revenue**:
• €32K MRR (€384K ARR run rate)
• 28 paying customers
• 15% month-over-month growth for 8 consecutive months
• Started charging 10 months ago

**Customer Quality**:
• 3 YC-backed companies as customers
• 2 publicly traded companies (under NDA)
• Average customer has 35-person sales team

**Engagement Metrics**:
• NPS: 74
• Weekly active users: 89%
• Average session time: 12 minutes/day

**Retention**:
• Month-6 cohort retention: 94%
• Logo churn: 2.1% monthly
• Net revenue retention: 108% (upsells offsetting churn)

**Pipeline**:
• €180K in qualified opportunities
• 45 active trials
• 12% trial-to-paid conversion rate`,

  team_core: `**Elena Vasquez, CEO (52% equity)**
8 years at Salesforce running Enterprise Sales Strategy for the EMEA region. Built and led a 45-person team. Deep network in B2B sales leadership. MBA from INSEAD.

**Marcus Chen, CTO (48% equity)**
ML Engineering Lead at Datadog for 4 years, built their anomaly detection and alerting systems. PhD in NLP from Stanford. Previously at Google Research working on sequence prediction.

**Extended Team (6 people)**:
• VP Sales: Former Director at Outreach, 15 years in sales tech
• 3 Senior Engineers: Ex-Stripe, Ex-Twilio, Ex-Shopify
• 1 Product Designer: Ex-Figma
• 1 Customer Success Lead: Ex-Salesforce

**Advisory Board**:
• Board member at Gong (investor context)
• Former CRO at Clari (domain expertise)
• Partner at Point Nine (European SaaS expertise)`,

  team_gaps: `**Current Gaps**:
1. **VP Marketing**: Need to build demand gen engine. Currently relying on founder-led content and referrals.
2. **Data Science Lead**: Marcus is stretched. Need dedicated ML hire to accelerate model development.
3. **Enterprise Sales Rep**: As we move upmarket, need someone with €100K+ ACV experience.

**Hiring Plan (Next 12 Months)**:
• Q1: VP Marketing (€150K budget)
• Q1: 2 Account Executives
• Q2: Data Science Lead
• Q3: 1 SDR, 1 Customer Success Manager`,

  // Section 5: Financials & Vision
  financials_current: `**Monthly Metrics**:
• MRR: €32,000
• Burn rate: €45,000/month
• Runway: 14 months (€630K in bank)

**Unit Economics**:
• ACV: €14,000
• CAC: €8,500
• LTV: €42,000
• LTV:CAC: 4.9x
• Payback period: 7 months
• Gross margin: 82%

**Cost Structure**:
• Team (salaries + contractors): 75%
• Infrastructure (cloud, tools): 15%
• Marketing/growth: 10%

**Previous Funding**:
• Pre-seed: €500K from angels + small fund
• Total raised: €500K`,

  funding_ask: `**Raising**: €2M Seed round

**Use of Funds**:
• 55% R&D: Hire 4 engineers, accelerate enterprise features and ML capabilities
• 25% Sales: Hire 2 AEs, 1 SDR, build repeatable sales motion
• 15% Marketing: Content, events, paid acquisition experiments
• 5% Operations: Legal, finance, infrastructure

**Runway Target**: 18 months to Series A milestones

**Key Milestones to Series A**:
• €150K MRR (from €32K)
• 75+ customers (from 28)
• Enterprise tier launched
• US expansion initiated
• VP Marketing hired and demand gen operational`,

  vision_long_term: `**12-Month Vision**:
• Market leader in mid-market deal intelligence
• €150K MRR with 75+ customers
• Enterprise tier validated with 5+ €50K+ accounts
• US sales motion established

**3-Year Vision**:
• €5M ARR with 300+ customers
• Full revenue intelligence platform (prediction → coaching → automation)
• US/EU balanced revenue
• Category-defining thought leadership

**5-Year Vision**:
• €30M+ ARR
• Acquisition target for Salesforce, HubSpot, or strategic buyer
• Or: Path to Series C and potential IPO

**Exit Scenarios**:
• Strategic acquisition by CRM platform (Salesforce, HubSpot, Microsoft)
• Acquisition by sales engagement player (Outreach, SalesLoft)
• Private equity roll-up of sales tech category
• Independent path to IPO (if €100M+ ARR)`
};

// Formatted sections for display in demo profile page
export const DEMO_PROFILE_SECTIONS = [
  {
    id: 'company-basics',
    title: 'Company Basics & Problem',
    icon: 'Building2',
    fields: [
      { label: 'Company Name', key: 'company_name', type: 'text' },
      { label: 'Stage', key: 'company_stage', type: 'badge' },
      { label: 'Category', key: 'company_category', type: 'badge' },
      { label: 'One-liner', key: 'company_description', type: 'text' },
      { label: 'Core Problem', key: 'problem_core', type: 'longtext' },
      { label: 'Problem Evidence', key: 'problem_evidence', type: 'longtext' }
    ]
  },
  {
    id: 'solution-product',
    title: 'Solution & Product',
    icon: 'Lightbulb',
    fields: [
      { label: 'Solution Overview', key: 'solution_core', type: 'longtext' },
      { label: 'Product Status', key: 'solution_product_status', type: 'longtext' },
      { label: 'Defensibility', key: 'solution_defensibility', type: 'longtext' }
    ]
  },
  {
    id: 'business-market',
    title: 'Business Model & Market',
    icon: 'TrendingUp',
    fields: [
      { label: 'Target Customer', key: 'target_customer', type: 'longtext' },
      { label: 'Market Size', key: 'market_size', type: 'longtext' },
      { label: 'Competitive Landscape', key: 'competitive_landscape', type: 'longtext' }
    ]
  },
  {
    id: 'traction-team',
    title: 'Traction & Team',
    icon: 'Users',
    fields: [
      { label: 'Traction Evidence', key: 'traction_proof', type: 'longtext' },
      { label: 'Core Team', key: 'team_core', type: 'longtext' },
      { label: 'Team Gaps', key: 'team_gaps', type: 'longtext' }
    ]
  },
  {
    id: 'financials-vision',
    title: 'Financials & Vision',
    icon: 'Target',
    fields: [
      { label: 'Current Financials', key: 'financials_current', type: 'longtext' },
      { label: 'Funding Ask', key: 'funding_ask', type: 'longtext' },
      { label: 'Long-term Vision', key: 'vision_long_term', type: 'longtext' }
    ]
  }
];
