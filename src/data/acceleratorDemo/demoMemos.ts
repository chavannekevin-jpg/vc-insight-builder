// Demo memo data for all 10 accelerator startups
// This provides structured content for the full memo view using VC framing methodology

import type { MemoVCQuickTake } from "@/types/memo";
import type { ActionPlanData } from "@/lib/actionPlanExtractor";

export interface DemoMemoData {
  vcQuickTake: MemoVCQuickTake;
  heroStatement: string;
  aiActionPlan?: ActionPlanData;
  sections: {
    title: string;
    narrative: string;
    keyPoints: string[];
  }[];
}

// Generate memo data for each demo startup with VC-style framing
export const DEMO_MEMOS: Record<string, DemoMemoData> = {
  "demo-carbonprint": {
    vcQuickTake: {
      verdict: "CarbonPrint shows strong fundamentals with regulatory tailwinds driving demand. The team's enterprise experience is a major asset, and early Fortune 500 pilots validate market appetite. However, enterprise sales cycles and regulatory dependency create timing risks.",
      readinessLevel: "HIGH",
      readinessRationale: "Strong team, clear market timing with regulations, and early enterprise validation. Ready for Demo Day with focused pitch on compliance-driven demand.",
      concerns: [
        "Enterprise sales cycle length (6-12 months)",
        "Regulatory dependency - timeline uncertainty",
        "Competition from well-funded players moving down-market"
      ],
      strengths: [
        "Exceptional founder-market fit (McKinsey sustainability + Google Cloud)",
        "Clear technical moat in supply chain carbon tracking",
        "Fortune 500 pilot provides credibility and case study"
      ]
    },
    heroStatement: "CarbonPrint is building the infrastructure layer for corporate carbon accountability, riding regulatory tailwinds that are making carbon tracking mandatory rather than optional.",
    aiActionPlan: {
      items: [
        {
          id: "action-1",
          priority: 1,
          category: "traction",
          problem: "Very early traction with only €45K ACV from LOIs — no repeatable sales process yet",
          impact: "VCs see founder-led sales as momentum, not product-market fit. Without evidence of non-founder-led closes, you're asking investors to bet on your hustle, not your business. This caps valuation and makes Series A conditional.",
          howToFix: "Close your 2 pending LOIs in the next 60 days, then document the exact sales process. Hire a junior sales rep to run 10 deals using your playbook — prove at least 3 can close without founder involvement before your Series A pitch.",
          badExample: "We have strong pipeline and great conversations with prospects.",
          goodExample: "Our founder closed 3 deals. We then hired a junior rep who closed 2 more using our playbook with zero founder involvement — proving the sales motion is transferable."
        },
        {
          id: "action-2",
          priority: 2,
          category: "business",
          problem: "€12K ACV is mid-market pricing but sales cycle suggests enterprise complexity",
          impact: "A 6-12 month sales cycle for a €12K contract creates unsustainable unit economics. Your CAC will eat your LTV before you hit scale. VCs will model this and see a company that can't grow profitably.",
          howToFix: "Either compress sales cycles to 3 months through self-serve + PLG motion (which works for €12K deals), OR raise ACV to €50K+ to justify enterprise sales complexity. Pick one — you can't do both.",
          badExample: "Our pricing is flexible based on customer needs.",
          goodExample: "We're implementing a 14-day self-serve trial that feeds into a sales-assisted close. Early data shows 40% of trials convert with minimal touch, compressing our cycle from 6 months to 6 weeks for the €12K tier."
        },
        {
          id: "action-3",
          priority: 3,
          category: "competition",
          problem: "Watershed and Persefoni have $200M+ in funding and are eyeing mid-market",
          impact: "Well-funded enterprise players can subsidize a mid-market push. If Watershed launches a €99/month SMB tier (as rumored), your differentiation on 'affordability' evaporates. VCs need to know why you win when the gorillas enter your market.",
          howToFix: "Build integration moats they can't replicate quickly. Sign exclusive partnerships with 3-5 mid-market ERP vendors (Sage, Xero, Zoho). Create a proprietary SMB emissions benchmark dataset from your 23 customers that enterprise players can't access.",
          badExample: "Enterprise players are focused on Fortune 500, they won't come down-market.",
          goodExample: "We've signed exclusive carbon module partnerships with Xero and Sage — 400K SMBs use these platforms. Even if Watershed launches an SMB tier, they'd need 2+ years to build these integrations."
        },
        {
          id: "action-4",
          priority: 4,
          category: "team",
          problem: "No climate industry domain expert on the founding team",
          impact: "VCs investing in climate tech expect founders who've lived the problem. McKinsey sustainability consulting is adjacent, not direct. This creates credibility questions in IC discussions: 'Do they really understand the space, or are they smart generalists?'",
          howToFix: "Add a climate tech advisor with operator experience (ex-Watershed, ex-Persefoni, or sustainability officer from a target enterprise). Get them to commit 4+ hours/month and include them in investor calls. Alternatively, your first VP hire should bring this credibility.",
          badExample: "We've done extensive market research and customer interviews.",
          goodExample: "Our advisor Sarah was Chief Sustainability Officer at Unilever and now joins our investor calls. She's helped us understand that procurement teams are the real buyers, not sustainability officers — insight that doubled our close rate."
        },
        {
          id: "action-5",
          priority: 5,
          category: "narrative",
          problem: "Positioning as 'carbon tracking for SMBs' is too broad and undifferentiated",
          impact: "VCs hear 'carbon tracking' pitches weekly. Without a sharp wedge, you blend into the noise. 'SMB-focused' isn't a moat — it's a temporary positioning that any competitor can claim.",
          howToFix: "Reframe around the supply chain compliance use case: 'We're how mid-market suppliers prove carbon credentials to enterprise buyers.' This is specific, urgent (enterprise mandates are real), and defensible (you understand the mid-market supplier pain).",
          badExample: "We help SMBs track their carbon footprint affordably.",
          goodExample: "We're the carbon compliance layer for mid-market suppliers. When Walmart requires carbon data from their 5,000 suppliers, those suppliers use CarbonPrint to generate compliant reports in hours, not months."
        }
      ],
      overallUrgency: "high",
      summaryLine: "CarbonPrint has strong regulatory tailwinds but needs to prove sales velocity, build competitive moats, and sharpen positioning before Series A."
    },
    sections: [
      { 
        title: "Problem", 
        narrative: "Mid-market enterprises today track carbon emissions using spreadsheets maintained by sustainability teams, supplemented by $50K+/year consulting engagements. This workflow breaks in three places: operations staff spend 20+ hours monthly on manual data collection from suppliers, CFOs face audit risk from inconsistent methodology across business units, and sales teams lose enterprise contracts that now require carbon credentials as procurement prerequisites. The pain is intensifying — CSRD deadlines hit 2025 for 50,000 EU companies, and Fortune 500 procurement mandates are cascading carbon requirements down the supply chain, creating compliance urgency for mid-market suppliers.",
        keyPoints: ["CSRD and SEC rules creating 2025 compliance deadlines", "Manual tracking costs $50K+/year for mid-size companies", "Supply chain pressure cascading compliance requirements to smaller suppliers"] 
      },
      { 
        title: "Solution", 
        narrative: "CarbonPrint automates carbon footprint tracking for mid-market enterprises by integrating directly with existing ERP and procurement systems. The platform works by ingesting transaction data, matching it against verified emission factor databases using ML, and generating compliance-ready reports for CSRD, SEC, and CDP frameworks. Why now: CSRD enforcement creates a hard deadline, and ERP APIs have matured to enable seamless data extraction. The ROI is concrete — customers report 15 hours/week saved on data collection, $40K/year reduction in consulting spend, and sales teams closing deals that previously stalled on carbon credential requirements.",
        keyPoints: ["Automated data collection from ERP systems", "AI-powered emission factor matching with 94% accuracy", "Compliance-ready reporting for CSRD, SEC, CDP frameworks"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is mid-market enterprises (500-5,000 employees) in manufacturing, logistics, and consumer goods with €50M-€500M revenue and EU exposure. At €12K ACV, reaching €100M ARR requires 8,300 customers — roughly 5% of the 180,000 EU companies entering CSRD scope by 2027. The acceleration path is clear: enterprise tier at €50K ACV reduces customer requirement to 2,000, achievable through channel partnerships with Big 4 sustainability practices. Structural tailwinds are powerful — regulatory deadlines create urgency, procurement mandates cascade requirements, and ESG reporting is moving from voluntary to mandatory across jurisdictions.",
        keyPoints: ["180K+ enterprises entering CSRD scope by 2027", "€12K ACV path to €100M ARR requires 5% market penetration", "Regulatory deadlines and procurement mandates create urgency"] 
      },
      { 
        title: "Competition", 
        narrative: "The competitive landscape breaks into three archetypes: enterprise incumbents (Watershed, Persefoni) focused on Fortune 500 with €100K+ ACVs and complex implementations; boutique consultancies offering manual services at €50K+/year with no software scale; and DIY spreadsheet approaches that create audit risk. Enterprise players are structurally constrained — their sales motion, implementation complexity, and pricing all target large enterprise, leaving mid-market underserved. CarbonPrint's wedge is the mid-market sweet spot: sophisticated enough for compliance, simple enough for self-service, priced for mid-market budgets. The dynamics would shift if Watershed launches a mid-market tier, though their enterprise DNA makes downmarket moves historically difficult.",
        keyPoints: ["Enterprise players (Watershed, Persefoni) structurally focused on Fortune 500", "Consultancies lack software economics; DIY creates audit risk", "Mid-market wedge is defensible given enterprise competitors' DNA"] 
      },
      { 
        title: "Team", 
        narrative: "The founding team has earned the right to build this company. The CEO spent 6 years at McKinsey leading sustainability transformation projects for Fortune 500 companies — she's seen the carbon tracking problem from the buyer's perspective and brings relationships with major enterprise buyers. The CTO led ML infrastructure at Google Cloud, giving him direct experience building enterprise data products at scale. This combination of sustainability domain expertise and enterprise software execution is rare. The team gap is commercial: they need a VP Sales with mid-market SaaS experience to build the GTM motion. They have two candidates in final stages with target close in Q1.",
        keyPoints: ["CEO: 6 years McKinsey sustainability practice, direct buyer relationships", "CTO: ML infrastructure lead at Google Cloud, enterprise scale experience", "Gap: VP Sales hire in progress, target close Q1"] 
      },
      { 
        title: "Business Model", 
        narrative: "CarbonPrint sells annual SaaS subscriptions with tiered pricing: €2,400/year for basic tracking (10 suppliers), €7,200/year for standard (50 suppliers + compliance reports), €12,000/year for enterprise (unlimited + API access). The core monetization event is annual contract renewal, with 85% retention in early cohorts. Gross margins are 78% with current infrastructure. Expansion comes from two vectors: supplier count growth as customers add scope 3 tracking, and compliance module upsells (€3K-€5K each for CSRD, SEC, CDP). Early data shows 120% NRR in the first cohort, suggesting strong expansion mechanics.",
        keyPoints: ["Tiered SaaS: €2.4K-€12K ACV based on supplier count", "78% gross margins; 85% logo retention in early cohorts", "Expansion via supplier growth + compliance modules; 120% NRR in first cohort"] 
      },
      { 
        title: "Traction", 
        narrative: "CarbonPrint is pre-revenue but has strong demand signals. One Fortune 500 pilot is in progress (proving enterprise capability), with 3 signed LOIs totaling €45K ACV from mid-market companies in the target segment. The pipeline shows 12 qualified opportunities representing €120K potential ACV. Growth is entirely organic — inbound from CSRD deadline pressure and referrals from sustainability networks. No retention data yet given stage. Forward indicators: 2 LOIs expected to convert to paid in next 60 days, Fortune 500 pilot decision in 90 days. Series A trigger would be €300K ARR with 10+ paying customers.",
        keyPoints: ["1 Fortune 500 pilot in progress, 3 LOIs signed (€45K ACV)", "12 qualified opportunities in pipeline (€120K potential)", "100% organic/inbound; Series A trigger: €300K ARR"] 
      },
      { 
        title: "Vision", 
        narrative: "The €1.5M raise provides 18 months runway with current burn. Allocation: 50% engineering (compliance modules, integrations), 30% GTM (VP Sales hire, marketing), 20% ops. Key milestones: €300K ARR with 25+ customers by month 18, Fortune 500 reference customer, and CSRD certification partnership. Series A unlock requires proving mid-market sales velocity (3-month cycles vs. current 6) and logo retention at 12-month mark. Contingency: if growth lags, pivot to channel strategy through Big 4 partnerships. Exit potential: strategic acquirers include Salesforce (sustainability cloud), SAP (supply chain), or carbon market players. €100M+ outcome is realistic at venture scale.",
        keyPoints: ["€1.5M for 18 months; 50% product, 30% GTM, 20% ops", "Milestones: €300K ARR, 25 customers, Fortune 500 reference", "Series A unlock: 3-month sales cycles, 85%+ retention at 12 months"] 
      }
    ]
  },
  "demo-healthsync": {
    vcQuickTake: {
      verdict: "HealthSync addresses a real pain point in healthcare data interoperability with strong domain expertise. The founding team's clinical and technical backgrounds are compelling. However, healthcare's long sales cycles and regulatory complexity create execution risks.",
      readinessLevel: "MEDIUM",
      readinessRationale: "Strong team and clear problem, but needs more traction data and clearer competitive differentiation before Series A readiness.",
      concerns: [
        "HIPAA compliance complexity adds development overhead",
        "Healthcare sales cycles are notoriously long (12-18 months)",
        "Competitive landscape is crowded with well-funded players"
      ],
      strengths: [
        "Deep domain expertise from founding team",
        "Clear regulatory pathway with FHIR standards compliance",
        "3 LOIs from hospital systems validate demand"
      ]
    },
    heroStatement: "HealthSync is building the interoperability layer that healthcare has needed for decades, making patient data portable and accessible across providers.",
    sections: [
      { 
        title: "Problem", 
        narrative: "When a patient moves between healthcare providers, their medical history doesn't follow them. Today, health systems rely on fax machines, patient portals with PDF exports, and phone calls between medical records departments. This workflow costs the US healthcare system $30B annually in duplicated tests ordered because providers can't access prior results. The stakeholders feeling this pain are Care Coordinators (spending 40% of time chasing records), CMOs (facing readmission penalties from CMS), and patients (frustrated with repeating medical history at every visit). The pain is intensifying: CMS interoperability rules now mandate data sharing, and value-based care reimbursement penalizes information gaps.",
        keyPoints: ["$30B wasted annually on duplicated tests due to missing records", "Care Coordinators spend 40% of time chasing patient data", "CMS mandates and value-based care penalties creating regulatory urgency"] 
      },
      { 
        title: "Solution", 
        narrative: "HealthSync enables seamless patient data exchange between healthcare providers through a FHIR-native API platform. The product integrates with major EHR systems (Epic, Cerner, MEDITECH) and manages patient consent, data normalization, and secure transmission in real-time. Why now: FHIR adoption hit critical mass in 2023, and CMS interoperability rules create regulatory push. The ROI is measurable — pilot customers report 3-hour reduction in care coordination time per patient transfer, 15% reduction in duplicate testing, and improved CMS quality scores. One hospital system estimated $2M annual savings from reduced readmission penalties.",
        keyPoints: ["FHIR-native platform integrating Epic, Cerner, MEDITECH", "Patient consent management built into every data exchange", "Pilot shows 3hr/patient saved, 15% reduction in duplicate tests"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is regional health systems (5-20 hospitals) with fragmented EHR landscapes and value-based care exposure. At $75K ACV (per-facility pricing at $15K × 5 facilities average), reaching $100M ARR requires 1,333 health system customers — approximately 20% of the 6,000 US hospital systems. Acceleration comes from moving upmarket: large IDNs at $500K+ ACV reduce customer count to 200. Structural tailwinds are strong — CMS mandates create compliance urgency, value-based care ties reimbursement to data sharing, and FHIR standardization reduces integration complexity. The 21st Century Cures Act prohibits information blocking, adding regulatory teeth.",
        keyPoints: ["6,000 US hospital systems as addressable market", "$75K average ACV; $100M ARR requires 20% penetration", "CMS mandates, value-based care, and FHIR adoption driving urgency"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes exist: legacy HIEs (Health Information Exchanges) built on outdated point-to-point connections with poor user experience; API-first players like Redox focused on app developers rather than provider-to-provider workflows; and EHR vendor solutions (Epic Care Everywhere) that only work within vendor ecosystems. Legacy HIEs are structurally limited by technical debt and governance complexity. Redox is focused on a different use case. EHR vendors create walled gardens that exclude multi-vendor health systems. HealthSync's wedge is the provider-to-provider use case across heterogeneous EHR environments — a workflow incumbent solutions handle poorly. Dynamics would shift if Epic opens its network to non-Epic systems, though their business model disincentivizes this.",
        keyPoints: ["Legacy HIEs have technical debt and governance complexity", "Redox focused on app developers, not provider-to-provider", "EHR vendor solutions create walled gardens; multi-vendor gap is our wedge"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO served as CMO at a 12-hospital system where she experienced the interoperability problem firsthand — she spent years trying to solve it with existing tools and understands buyer needs at the C-suite level. The CTO is a FHIR standards committee member who contributed to the specification; he brings technical credibility and deep protocol expertise. Combined, they have 25 years of healthcare experience and direct relationships with health system CIOs. The gap is commercial: they need enterprise sales leadership experienced with 12-18 month health system sales cycles. Advisory board includes former Epic VP and CMS innovation director.",
        keyPoints: ["CEO: Former CMO at 12-hospital system, buyer-side experience", "CTO: FHIR standards committee member, protocol expertise", "Gap: Enterprise sales leader; advisors include former Epic VP"] 
      },
      { 
        title: "Business Model", 
        narrative: "HealthSync prices per-facility annually ($15K/facility) with volume discounts for IDNs. The core revenue model is SaaS with transaction fees for high-volume data exchange above thresholds. Gross margins are 70% at current scale, targeting 80% as infrastructure costs amortize. LTV:CAC is estimated at 4:1 based on 3-year average customer lifetime (healthcare contracts are sticky). Expansion comes from facility count growth within systems and usage-based revenue as data exchange volume increases. Net revenue retention target is 115% based on comparable healthcare SaaS benchmarks.",
        keyPoints: ["$15K/facility annual subscription, volume discounts for IDNs", "70% gross margins, targeting 80% at scale", "4:1 LTV:CAC estimate; 115% NRR target based on healthcare SaaS comps"] 
      },
      { 
        title: "Traction", 
        narrative: "HealthSync has 3 signed LOIs totaling $180K ACV from regional health systems, with 1 active paid pilot at a 500-bed hospital generating $25K/year. Growth is entirely inbound from conference networking and CIO referrals — healthcare buyers trust peer recommendations. No cohort retention data yet given early stage. Pipeline shows 15 qualified opportunities from health system demos. Forward indicators: 2 LOIs expected to convert in next 90 days, pilot decision on expansion to 3 additional facilities in 60 days. Series A trigger is $500K ARR with 5+ health system customers and proven implementation playbook.",
        keyPoints: ["3 LOIs ($180K ACV), 1 paid pilot ($25K/year)", "15 qualified opportunities from inbound/referral", "Series A trigger: $500K ARR, 5+ customers, proven implementation playbook"] 
      },
      { 
        title: "Vision", 
        narrative: "The $2M raise provides 18 months runway. Allocation: 40% engineering (EHR integrations, security certifications), 35% GTM (enterprise sales hire, pilot support), 25% ops/compliance. Key milestones: $500K ARR with 5 health system customers, HITRUST certification, and Epic App Orchard listing. Series A unlock requires proving sales cycle compression (target: 9 months vs. industry 18) and demonstrating land-and-expand within health systems. Contingency: if direct sales lag, pursue channel partnership with health system consultancies. Exit potential: strategic acquirers include Epic, Oracle Health (Cerner), or health plan payers seeking provider data access.",
        keyPoints: ["$2M for 18 months; 40% product, 35% GTM, 25% compliance", "Milestones: $500K ARR, 5 customers, HITRUST certification", "Series A unlock: 9-month sales cycles, proven land-and-expand"] 
      }
    ]
  },
  "demo-finbot": {
    vcQuickTake: {
      verdict: "FinBot has exceptional product-market fit signals with strong organic growth and impressive early revenue. The team's experience at Robinhood and Amazon gives them unique insights into consumer fintech. This is a standout in the cohort.",
      readinessLevel: "HIGH",
      readinessRationale: "Strong traction, experienced team, and clear path to scale. Ready for Series A conversations immediately after Demo Day.",
      concerns: [
        "Regulatory compliance in financial services is complex",
        "Customer acquisition costs may increase as market matures"
      ],
      strengths: [
        "Strong product-market signals with $25K MRR",
        "Viral growth loops driving 50K waitlist",
        "Team has direct relevant experience at scale"
      ]
    },
    heroStatement: "FinBot is democratizing financial advice through conversational AI, making personalized financial guidance accessible to everyone.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Today, Americans seeking financial advice face a broken workflow. Robo-advisors offer portfolio management but can't answer questions about debt payoff vs. investing or whether to max 401k before Roth IRA. Traditional advisors require $250K+ minimums and charge 1% AUM. The alternative is Reddit threads, TikTok finance content, and generic articles that don't account for personal circumstances. 70% of Americans report financial stress, and the stakeholders feeling this most acutely are millennials and Gen Z with irregular income, student debt, and no family wealth to consult. The pain intensifies as financial decisions compound — early mistakes in 401k allocation or emergency fund sizing cost tens of thousands over a lifetime.",
        keyPoints: ["70% of Americans financially stressed, lacking personalized guidance", "Traditional advisors require $250K+ minimums; robo-advisors can't answer 'what should I do' questions", "Millennials/Gen Z face complex decisions with no trusted advisor access"] 
      },
      { 
        title: "Solution", 
        narrative: "FinBot is an AI financial advisor that provides personalized guidance through natural conversation. Users connect bank accounts for context, then ask questions like 'Should I pay off my student loans or invest?' and receive specific, personalized recommendations. The platform learns from user behavior to proactively surface relevant advice. Why now: LLM advances enable nuanced financial reasoning, and open banking APIs provide real-time financial context. The ROI is behavioral — beta users report 3x higher savings rate and 40% reduction in financial stress scores. One user testimonial: 'FinBot helped me find $400/month I was wasting on subscriptions and unused services.'",
        keyPoints: ["Conversational AI providing personalized financial guidance", "Bank account integration for context-aware recommendations", "Beta users show 3x higher savings rate, 40% stress reduction"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is millennials and Gen Z (ages 22-40) with $50K-$150K household income, some financial complexity (student loans, 401k decisions), and comfort with app-based tools. At $120/year ($9.99/month premium), reaching $100M ARR requires 833,000 subscribers — roughly 1% of the 75M Americans in this demographic cohort. Acceleration comes from family plan pricing ($240/year for households) and employer distribution partnerships. Structural tailwinds: financial literacy is declining despite increasing complexity, traditional advisors aren't building for digital-native users, and embedded finance makes AI-native advice increasingly viable.",
        keyPoints: ["75M millennials/Gen Z as core addressable market", "$120/year ACV; $100M ARR requires 1% penetration", "Employer distribution and family plans as acceleration vectors"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: budgeting apps (Mint, YNAB) that track spending but don't advise; robo-advisors (Betterment, Wealthfront) that manage portfolios but can't answer holistic questions; and emerging AI assistants (Cleo, Charlie) focused on narrow use cases like saving or budgeting. Budgeting apps are structurally limited to tracking — adding advice requires rebuilding. Robo-advisors are constrained by fiduciary obligations around specific securities recommendations. Narrow AI assistants haven't achieved the breadth for comprehensive financial guidance. FinBot's wedge is the holistic advice layer — answering the 'what should I do' question across all financial decisions. Dynamics would shift if a major fintech (Robinhood, SoFi) builds comparable AI, though their transaction-focused models create misaligned incentives.",
        keyPoints: ["Budgeting apps track but don't advise; robo-advisors manage but can't answer 'what should I do'", "Narrow AI assistants (Cleo, Charlie) haven't achieved holistic breadth", "Wedge: comprehensive AI advice layer across all financial decisions"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO spent 4 years on Robinhood's product team, leading the feature that taught her how consumers engage with financial tools and where existing products fall short. The CTO led conversational AI development at Amazon Alexa, building the infrastructure that powers voice-based interactions at scale. Both are second-time founders — their previous startup was acqui-hired by Square. This combination of consumer fintech product intuition and conversational AI technical depth is rare. Team is complete for current stage with strong engineering. The next critical hire is VP Growth to optimize the viral loops already showing traction.",
        keyPoints: ["CEO: 4 years Robinhood product; CTO: led Alexa conversational AI", "Both second-time founders, prior acqui-hire by Square", "Next hire: VP Growth to optimize viral loops"] 
      },
      { 
        title: "Business Model", 
        narrative: "FinBot operates a freemium model. Free tier includes basic budgeting and limited AI questions. Premium ($9.99/month) unlocks unlimited AI advice, account integration, and proactive recommendations. Secondary revenue from affiliate partnerships with financial products (credit cards, savings accounts, investment platforms) — users who ask 'what credit card should I get' receive recommendations with affiliate compensation. Gross margins are 82% (AI inference costs are manageable at current scale). LTV:CAC is currently 5:1 with organic acquisition dominating. Expansion comes from family plans and eventual B2B (employer financial wellness benefit).",
        keyPoints: ["Freemium: free basic, $9.99/month premium for unlimited AI", "Affiliate revenue from financial product recommendations", "82% gross margins; 5:1 LTV:CAC with organic acquisition"] 
      },
      { 
        title: "Traction", 
        narrative: "FinBot has $25K MRR from 2,500 paying subscribers, growing 40% month-over-month for the past 3 months. The 50K waitlist converts at 15% to free users, with 8% of free users upgrading to premium within 30 days. Growth is 80% organic — viral loops from social sharing of savings achievements and referral credits. Retention is strong: 85% monthly retention in premium tier after 6 months. Revenue concentration is minimal (no single user >0.1% of MRR). Forward indicators: TikTok campaign launching next month with finance influencer partnerships, expected to accelerate waitlist 3x. Series A trigger: $100K MRR with sustained 25%+ MoM growth.",
        keyPoints: ["$25K MRR, 2,500 subscribers, 40% MoM growth", "80% organic growth; 85% monthly premium retention", "Series A trigger: $100K MRR with 25%+ MoM growth"] 
      },
      { 
        title: "Vision", 
        narrative: "The $3M raise provides 24 months runway at planned burn. Allocation: 40% engineering (AI improvements, new integrations), 40% growth (VP Growth hire, paid acquisition testing, influencer partnerships), 20% ops. Key milestones: $100K MRR by month 12, 50K paying subscribers by month 18, and Series A raise at $150K+ MRR. Path to Series A requires proving paid acquisition efficiency (target: $30 CAC vs. current $15 organic) and 80%+ annual retention. Contingency: if consumer growth slows, pivot to B2B employer distribution. Exit potential: strategic acquirers include major banks (JP Morgan, Goldman), fintech platforms (SoFi, Chime), or financial media (NerdWallet). IPO path is realistic at scale given consumer fintech valuations.",
        keyPoints: ["$3M for 24 months; 40% product, 40% growth, 20% ops", "Milestones: $100K MRR month 12, 50K subscribers month 18", "Series A at $150K+ MRR; B2B pivot as contingency"] 
      }
    ]
  },
  "demo-legalflow": {
    vcQuickTake: {
      verdict: "LegalFlow combines exceptional team credibility with proven early revenue. The founder's BigLaw experience and co-founder's NLP expertise at OpenAI create a compelling team. Product-market fit is emerging with $15K MRR.",
      readinessLevel: "HIGH",
      readinessRationale: "Strong team, early revenue, and clear value proposition. Ready for Demo Day with compelling metrics.",
      concerns: [
        "AI accuracy liability in legal context",
        "Professional services firms may resist AI tools"
      ],
      strengths: [
        "Exceptional team credibility (BigLaw + OpenAI)",
        "Clear ROI messaging saves 10+ hours/week",
        "$15K MRR demonstrates willingness to pay"
      ]
    },
    heroStatement: "LegalFlow brings enterprise-grade AI contract review to SMB legal teams, democratizing technology that was previously only available to BigLaw.",
    sections: [
      { 
        title: "Problem", 
        narrative: "SMB legal teams today review contracts manually — a senior associate or GC reads every agreement line-by-line, flags risks, and drafts redlines. This workflow consumes 60% of in-house legal time for companies with 100-1,000 employees. The alternative is outside counsel at $400-600/hour, costing $30K+ per complex deal. The stakeholders feeling this pain are General Counsels (buried in routine review, unable to focus on strategic work), CFOs (watching legal spend balloon), and sales teams (waiting days for contract turnaround that delays deal closure). The pain intensifies as deal velocity increases — fast-growing companies sign more contracts but can't scale legal headcount proportionally.",
        keyPoints: ["In-house legal spends 60% of time on routine contract review", "Outside counsel costs $400-600/hour, $30K+ per complex deal", "Sales teams delayed days waiting for contract turnaround"] 
      },
      { 
        title: "Solution", 
        narrative: "LegalFlow is AI-powered contract review that identifies risks, suggests redlines, and accelerates review by 10x for SMB legal teams. Users upload contracts; the AI highlights problematic clauses, explains risks in plain English, and generates suggested language based on company playbooks. Why now: LLM advances enable nuanced legal reasoning, and SMB legal teams are increasingly digitized and willing to adopt software. The ROI is concrete — customers report 10+ hours/week saved per legal team member, 3-day average reduction in contract turnaround, and 70% reduction in outside counsel spend on routine reviews. One GC testimonial: 'LegalFlow catches things I miss and gives me confidence to move faster.'",
        keyPoints: ["AI identifies risks, suggests redlines, explains issues in plain English", "10x faster review; 10+ hours/week saved per legal team member", "70% reduction in outside counsel spend on routine reviews"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is SMB companies (100-1,000 employees) with 1-5 person legal teams, high contract volume (50+ agreements/month), and growth stage requiring legal velocity. At $2,400/user/year ($200/month), reaching $100M ARR requires 42,000 users — approximately 5% of the 800,000 in-house legal professionals in the US. Acceleration comes from team expansion within accounts and enterprise tier ($500/user) for compliance features. Structural tailwinds: legal tech adoption is accelerating post-COVID, AI acceptance in legal is increasing with GPT visibility, and GC role is shifting from cost center to strategic partner requiring efficiency tools.",
        keyPoints: ["800,000 US in-house legal professionals as addressable market", "$2,400/user ACV; $100M ARR requires 5% penetration", "Land with 2-3 users, expand to full legal team as value proven"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: enterprise AI (Kira, Luminance) serving AmLaw 100 with $100K+ implementations and 6-month deployments; generic AI tools (ChatGPT, Claude) lacking legal-specific training and compliance features; and manual review/outside counsel as the status quo. Enterprise players are structurally focused on large firm economics — their sales motion, pricing, and implementation requirements exclude SMB. Generic AI lacks the legal training, playbook integration, and audit trails that GCs require. LegalFlow's wedge is enterprise capability at SMB-accessible pricing and implementation. Dynamics would shift if Kira or Luminance launch SMB products, though their enterprise DNA makes downmarket moves historically difficult.",
        keyPoints: ["Enterprise AI (Kira, Luminance) priced and scoped for AmLaw 100", "Generic AI lacks legal training, playbooks, and audit trails", "Wedge: enterprise capability at SMB-accessible pricing"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO spent 8 years as a corporate associate at Davis Polk, reviewing thousands of contracts and understanding exactly what makes deals slow and GCs frustrated. She left to solve the problem she lived daily. The CTO led NLP research at OpenAI, contributing to the models that now power legal AI applications. This combination of legal domain expertise and cutting-edge AI capability is exceptionally rare — it opens doors with skeptical legal buyers and enables product decisions competitors can't make. The team includes 4 engineers with AI/ML backgrounds. Gap: VP Sales with legal tech experience to build repeatable GTM; currently in interview process.",
        keyPoints: ["CEO: 8 years BigLaw at Davis Polk, lived the problem daily", "CTO: NLP research lead at OpenAI, model expertise", "Gap: VP Sales with legal tech experience; in hiring process"] 
      },
      { 
        title: "Business Model", 
        narrative: "LegalFlow prices per-seat monthly ($200/user/month billed annually). Usage-based add-ons for high-volume users ($0.50/contract above monthly threshold) and premium playbook modules ($1,000/year for specialized clause libraries). Gross margins are 78% at current scale, targeting 85% as AI inference costs decline. LTV:CAC is 6:1 based on 24-month average customer lifetime and strong word-of-mouth. Expansion comes from seat growth within accounts (typical: start with 2 users, expand to 5) and enterprise tier with SSO, advanced analytics, and custom playbooks.",
        keyPoints: ["$200/user/month; usage-based add-ons for high volume", "78% gross margins, targeting 85% at scale", "6:1 LTV:CAC; expansion via seat growth and enterprise tier"] 
      },
      { 
        title: "Traction", 
        narrative: "LegalFlow has $15K MRR from 45 paying users across 18 companies, growing 35% month-over-month for the past 4 months. Growth is 70% organic from legal community referrals and LinkedIn content; 30% from targeted outreach. NPS is 62, with GCs citing time savings and confidence as primary value drivers. Retention is 92% monthly at the logo level. Revenue concentration is moderate (top 3 customers = 25% of MRR). Forward indicators: 8 qualified opportunities in pipeline representing $8K potential MRR, partnership discussions with 2 legal operations consultancies. Series A trigger: $50K MRR with 100+ paying users and proven enterprise motion.",
        keyPoints: ["$15K MRR, 45 users, 18 companies; 35% MoM growth", "NPS 62; 92% monthly logo retention", "Series A trigger: $50K MRR, 100+ users, enterprise motion proven"] 
      },
      { 
        title: "Vision", 
        narrative: "The $2M raise provides 20 months runway. Allocation: 45% engineering (accuracy improvements, enterprise features, integrations), 35% GTM (VP Sales hire, legal community marketing), 20% ops. Key milestones: $50K MRR by month 12, 150 paying users, and SOC 2 Type II certification. Series A unlock requires proving enterprise sales motion (5+ enterprise deals at $20K+ ACV) and demonstrating 90%+ annual retention. Contingency: if direct sales lag, pursue channel through legal ops consultancies. Exit potential: strategic acquirers include legal tech consolidators (Thomson Reuters, LexisNexis), enterprise software (Microsoft, Salesforce), or private equity legal tech rollups.",
        keyPoints: ["$2M for 20 months; 45% product, 35% GTM, 20% ops", "Milestones: $50K MRR, 150 users, SOC 2 certification", "Series A unlock: enterprise motion proven, 90%+ annual retention"] 
      }
    ]
  },
  "demo-supplyai": {
    vcQuickTake: {
      verdict: "SupplyAI has strong operational expertise from the founding team and differentiated ML approach. However, the market is crowded and mid-market price sensitivity is a concern. Needs clearer competitive positioning.",
      readinessLevel: "MEDIUM",
      readinessRationale: "Good team and early pilots, but competitive differentiation needs sharpening before Demo Day.",
      concerns: [
        "Crowded market with well-funded competitors",
        "Integration complexity with legacy systems",
        "Mid-market price sensitivity"
      ],
      strengths: [
        "Strong operational expertise from Target",
        "Differentiated ML approach for mid-market",
        "2 paid pilots demonstrate value"
      ]
    },
    heroStatement: "SupplyAI brings enterprise-grade predictive inventory to mid-market retailers who can't afford custom solutions.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Mid-market retailers (50-500 stores) today forecast demand using Excel spreadsheets, basic ERP modules, and buyer intuition. This workflow breaks constantly: inventory planners spend 30+ hours weekly adjusting forecasts manually, stores alternate between stockouts (losing 8-10% of potential sales) and overstock (tying up working capital and requiring markdowns). The stakeholders feeling this pain are Inventory Directors (judged on metrics they can't control with current tools), CFOs (watching inventory carrying costs erode margins), and Store Managers (fielding customer complaints about out-of-stocks). The pain intensifies with SKU proliferation and omnichannel complexity — online, in-store, and BOPIS require unified demand signals that legacy tools can't provide.",
        keyPoints: ["Mid-market loses 8-10% sales to stockouts, ties capital in overstock", "Planners spend 30+ hours/week on manual forecast adjustments", "SKU proliferation and omnichannel complexity breaking legacy tools"] 
      },
      { 
        title: "Solution", 
        narrative: "SupplyAI provides ML-powered demand forecasting designed specifically for mid-market retail complexity. The platform ingests POS, inventory, and external data (weather, events, trends), generates SKU-level demand forecasts, and provides actionable replenishment recommendations. Why now: cloud ML infrastructure costs have dropped 80% since 2020, and mid-market retailers are digitizing enough to have usable data. The ROI is measurable — paid pilots show 15% inventory reduction while maintaining service levels, $500K annual savings for a 100-store retailer, and 20+ hours/week freed for planning teams. Implementation takes 6 weeks vs. 6+ months for enterprise alternatives.",
        keyPoints: ["ML forecasting with SKU-level precision for mid-market scale", "15% inventory reduction demonstrated in pilots", "6-week implementation vs. 6+ months for enterprise tools"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is mid-market retailers (50-500 stores, $50M-$500M revenue) in grocery, apparel, and hardlines with complex SKU counts (1,000+) and existing ERP infrastructure. At $60K ACV (based on store count and SKU complexity), reaching $100M ARR requires 1,667 customers — approximately 15% of the 11,000 US mid-market retailers. Acceleration comes from vertical expansion (grocery first, then apparel, hardlines) and upmarket motion (500+ store retailers at $150K+ ACV). Structural tailwinds: supply chain disruptions have elevated inventory as a CEO-level priority, and mid-market retailers are finally investing in digital infrastructure post-COVID.",
        keyPoints: ["11,000 US mid-market retailers as addressable market", "$60K ACV; $100M ARR requires 15% penetration", "Supply chain disruptions elevated inventory to CEO-level priority"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: enterprise platforms (Blue Yonder, Oracle) with $500K+ implementations and 12-month deployments; point solutions focused on single aspects (replenishment, markdown optimization); and ERP-embedded forecasting modules that are basic and siloed. Enterprise players are structurally unable to serve mid-market — their cost structure, implementation complexity, and sales motion all target Fortune 500. Point solutions create fragmentation. ERP modules lack the ML sophistication for accurate forecasting. SupplyAI's wedge is the integrated mid-market sweet spot: sophisticated ML in a package that mid-market can afford and implement. Dynamics would shift if Blue Yonder launches a mid-market product, though enterprise DNA makes this historically rare.",
        keyPoints: ["Enterprise platforms (Blue Yonder, Oracle) priced at $500K+ for Fortune 500", "Point solutions create fragmentation; ERP modules lack ML sophistication", "Wedge: integrated ML platform at mid-market-accessible pricing"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO spent 12 years at Target, rising to VP Supply Chain where she led the demand forecasting transformation that saved $200M annually. She understands retailer buying processes, implementation challenges, and what makes forecasting tools succeed or fail. The CTO is a Stanford ML researcher whose PhD focused on time-series forecasting — the exact technical domain this product requires. This combination of operator credibility and deep technical expertise is rare. The team includes 3 ML engineers and 2 retail domain experts. Gap: VP Sales with mid-market retail sales experience to build repeatable GTM motion.",
        keyPoints: ["CEO: VP Supply Chain at Target, led $200M forecasting transformation", "CTO: Stanford PhD in time-series forecasting, domain-specific expertise", "Gap: VP Sales with mid-market retail experience"] 
      },
      { 
        title: "Business Model", 
        narrative: "SupplyAI prices based on store count and SKU complexity: $2K-8K/month depending on scale. Implementation services (one-time $20K-50K) cover data integration, model training, and change management. Gross margins are 72% at current scale, targeting 80% as implementation becomes more standardized. LTV:CAC target is 4:1 based on 3-year average customer lifetime (retailers are sticky once integrated). Expansion comes from additional use cases (markdown optimization, assortment planning) and geographic expansion within retail chains.",
        keyPoints: ["$2K-8K/month based on stores and SKU complexity", "Implementation services: $20K-50K one-time", "72% gross margins; 4:1 LTV:CAC target based on 3-year lifetime"] 
      },
      { 
        title: "Traction", 
        narrative: "SupplyAI has 2 paid pilots at $4K/month each ($96K ARR run-rate) with regional grocery chains. Both pilots show strong results: 15% inventory reduction, 20% improvement in forecast accuracy, and positive feedback from planning teams. Pipeline includes 8 qualified opportunities from retail conferences and Target network referrals. Growth is 100% outbound given early stage. No cohort retention data yet — pilots are 4 months in. Forward indicators: both pilots expected to convert to full contracts ($60K+ ACV each) in next 60 days, plus 2 additional pilots launching next quarter. Series A trigger: $500K ARR with 8+ retailers and proven implementation playbook.",
        keyPoints: ["2 paid pilots at $4K/month; 15% inventory reduction demonstrated", "8 qualified opportunities in pipeline from conferences and referrals", "Series A trigger: $500K ARR, 8+ retailers, proven implementation playbook"] 
      },
      { 
        title: "Vision", 
        narrative: "The $2.5M raise provides 18 months runway. Allocation: 40% engineering (ML improvements, ERP integrations), 35% GTM (VP Sales hire, retail conferences, pilot support), 25% ops/implementation. Key milestones: $500K ARR with 10 retailers by month 18, proven 8-week implementation playbook, and one case study with published ROI metrics. Series A unlock requires proving sales cycle compression (target: 4 months vs. current 6) and demonstrating 100%+ NRR from expansion. Contingency: if direct sales lag, pursue channel through retail consultancies (Accenture, McKinsey retail practice). Exit potential: strategic acquirers include enterprise platforms (Blue Yonder, Oracle) seeking mid-market entry, or retail tech consolidators.",
        keyPoints: ["$2.5M for 18 months; 40% product, 35% GTM, 25% ops", "Milestones: $500K ARR, 10 retailers, proven 8-week implementation", "Series A unlock: 4-month sales cycles, 100%+ NRR from expansion"] 
      }
    ]
  },
  "demo-eduvr": {
    vcQuickTake: {
      verdict: "EduVR addresses a clear pain point in vocational training with working hardware. However, hardware dependency and enterprise budget cycles create significant go-to-market challenges. Unit economics need work.",
      readinessLevel: "MEDIUM",
      readinessRationale: "Clear problem validation and working prototype, but business model needs refinement before Demo Day.",
      concerns: [
        "Hardware dependency limits scalability",
        "Enterprise budget cycles are long",
        "Content production costs are high"
      ],
      strengths: [
        "Clear pain point validation from industry",
        "Strong industry connections through Boeing",
        "Working prototype demonstrates capability"
      ]
    },
    heroStatement: "EduVR is transforming how manufacturing workers learn, reducing training time by 40% through immersive VR experiences.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Manufacturing faces a critical skills transfer crisis. Today, new workers learn through ride-alongs with experienced operators — a 6-12 month apprenticeship model that's breaking as baby boomers retire faster than knowledge transfers. The workflow fails in three ways: senior operators lose production time mentoring, new hires make expensive errors on live equipment ($50K+ per incident), and training bottlenecks limit hiring capacity. The stakeholders feeling this pain are Plant Managers (struggling to maintain throughput with green workforce), HR Directors (unable to hire fast enough), and Training Managers (watching training budgets balloon). The pain intensifies as 2.4M manufacturing jobs go unfilled by 2030 and institutional knowledge walks out the door daily.",
        keyPoints: ["2.4M manufacturing jobs unfilled by 2030; knowledge transfer breaking", "6-12 month apprenticeship model losing productivity and making errors", "Senior workers retiring faster than knowledge can transfer"] 
      },
      { 
        title: "Solution", 
        narrative: "EduVR provides VR-based training simulations that accelerate manufacturing skill development by 40%. Workers practice complex procedures in immersive digital twins of factory equipment, making mistakes safely and building muscle memory before touching real machinery. Why now: VR headset costs dropped 70% since 2020, and enterprise-grade hardware (Quest Pro, Vive Focus) reached manufacturing-ready durability. The ROI is measurable — pilot data shows 40% reduction in time-to-competency, 60% reduction in training-related equipment damage, and 25% improvement in safety incident rates during the first 90 days of employment. Boeing pilot testimonial: 'We're compressing 6 months of learning into 6 weeks.'",
        keyPoints: ["VR simulations reduce time-to-competency by 40%", "60% reduction in training-related equipment damage in pilots", "Practice on digital twins before touching real machinery"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is manufacturing plants (aerospace, automotive, heavy equipment) with 500+ employees, high training volume (100+ new hires/year), and safety-critical procedures. At $500/trainee/year plus content licensing, reaching $100M ARR requires 200,000 active trainees — approximately 5% of the 4M manufacturing workers requiring upskilling annually. Acceleration comes from content marketplace (training modules for common procedures) and enterprise volume licensing ($250K+ ACV for multi-plant deployments). Structural tailwinds: manufacturing reshoring is creating training demand, boomer retirements accelerating knowledge loss, and VR technology finally meeting enterprise reliability standards.",
        keyPoints: ["4M manufacturing workers require upskilling annually", "$500/trainee plus content; enterprise deals at $250K+ ACV", "Reshoring and boomer retirement creating training demand surge"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: enterprise VR training (STRIVR, Mursion) focused on soft skills and retail/warehouse, not manufacturing-specific content; traditional training providers (Wilson Learning, DDI) offering instructor-led programs without technology leverage; and internal training departments building custom solutions without scale or reusability. Enterprise VR players are focused on different verticals — their content libraries and sales motion target retail and customer service, not manufacturing. Traditional providers can't deliver the repetition and safety benefits of VR. Internal solutions lack reusability across plants. EduVR's wedge is manufacturing-specific VR content with industry expertise. Dynamics would shift if STRIVR pivots to manufacturing, though content development and industry relationships take years to build.",
        keyPoints: ["Enterprise VR (STRIVR) focused on retail/soft skills, not manufacturing", "Traditional training lacks VR's repetition and safety benefits", "Wedge: manufacturing-specific content with deep industry expertise"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO spent 10 years as Director of Learning & Development at Boeing, where she led training programs for 50,000 manufacturing workers and saw firsthand how traditional methods fail. She understands enterprise procurement, training metrics, and what makes manufacturing buyers say yes. The CTO has 10 years of XR development experience, including 4 years at Magic Leap building enterprise AR applications. This combination of training domain expertise and enterprise XR development is rare. The team includes 2 3D artists and 3 Unity developers. Gap: VP Sales with enterprise manufacturing experience to navigate complex procurement cycles.",
        keyPoints: ["CEO: 10 years L&D Director at Boeing, trained 50,000 workers", "CTO: 10 years XR development including 4 years at Magic Leap", "Gap: VP Sales with enterprise manufacturing experience"] 
      },
      { 
        title: "Business Model", 
        narrative: "EduVR operates a hardware-plus-subscription model. Hardware (headsets, controllers, charging infrastructure) is sold at cost (~$500/station) to reduce adoption friction. Revenue comes from annual subscriptions ($500/trainee/year for platform access) and content licensing ($20K-50K per custom training module). Custom content development services generate one-time revenue at $50K+. Gross margins are currently 55% (hardware drag), targeting 70% as content scales and hardware becomes commodity. LTV:CAC target is 3:1 based on 5-year enterprise contracts (training infrastructure decisions are sticky).",
        keyPoints: ["Hardware at cost; $500/trainee/year subscription", "Custom content: $20K-50K per module; development services $50K+", "55% gross margins (hardware drag), targeting 70% as content scales"] 
      },
      { 
        title: "Traction", 
        narrative: "EduVR has a working prototype deployed at 2 manufacturing sites with 100+ trainees in active pilot programs. No paid customers yet — pilots are proving ROI metrics for budget justification. Boeing is the anchor pilot with decision expected in 90 days; their internal data shows 40% training time reduction. Pipeline includes 3 additional manufacturers from CEO's Boeing network. Growth is 100% relationship-driven at this stage. Forward indicators: Boeing decision in 90 days (potential $200K initial contract), 2 additional pilots launching Q1. Series A trigger: $500K ARR with 3+ enterprise customers and proven content production pipeline.",
        keyPoints: ["Working prototype at 2 sites with 100+ active trainees", "Boeing pilot showing 40% training time reduction; decision in 90 days", "Series A trigger: $500K ARR, 3+ enterprise customers, content pipeline"] 
      },
      { 
        title: "Vision", 
        narrative: "The $2M raise provides 18 months runway. Allocation: 40% engineering (content authoring tools, platform improvements), 30% content production (5 manufacturing procedure modules), 20% GTM (VP Sales hire, industry events), 10% ops. Key milestones: $500K ARR with 5 enterprise customers, content library of 20+ modules, and Boeing case study published. Series A unlock requires proving content reusability (same modules sell to multiple customers) and reducing custom development dependency. Contingency: if enterprise sales lag, pivot to training-as-a-service model with staffing agencies. Exit potential: strategic acquirers include VR platforms (Meta, HTC), training companies (GP Strategies), or manufacturing conglomerates seeking internal capability.",
        keyPoints: ["$2M for 18 months; 40% product, 30% content, 20% GTM", "Milestones: $500K ARR, 5 customers, 20+ module library", "Series A unlock: content reusability proven, reduced custom dependency"] 
      }
    ]
  },
  "demo-farmwise": {
    vcQuickTake: {
      verdict: "FarmWise has authentic founder-market fit but faces significant business model challenges. Hardware margins are thin and rural connectivity creates deployment challenges. Needs fundamental business model rethink.",
      readinessLevel: "LOW",
      readinessRationale: "Strong founder authenticity but business model viability is unclear. Needs pivot consideration before Demo Day.",
      concerns: [
        "Hardware margins are unsustainably thin",
        "Rural connectivity limits IoT functionality",
        "Seasonality creates revenue volatility",
        "Distribution to small farms is expensive"
      ],
      strengths: [
        "Authentic founder-market fit (third-generation farmer)",
        "Deep customer empathy and relationships",
        "Working hardware demonstrates capability"
      ]
    },
    heroStatement: "FarmWise brings precision agriculture to small-scale farmers who've been left behind by ag-tech innovation.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Small-scale farmers (under 500 acres) today make critical decisions — when to irrigate, what to plant where, when to harvest — using intuition, almanacs, and visual inspection. This workflow costs them 15-25% of potential yield compared to precision-equipped large farms. The process breaks because soil moisture varies across fields, weather patterns are increasingly unpredictable, and small farmers lack the $50K+ capital for enterprise precision ag systems. The stakeholders feeling this pain are farm operators (watching yields underperform and costs rise), family members (questioning farm viability), and rural lenders (seeing portfolio risk from inefficient operations). The pain intensifies as climate volatility increases and commodity margins compress.",
        keyPoints: ["Small farms lose 15-25% yield vs. precision-equipped large farms", "Precision ag tools cost $50K+, designed for 1,000+ acre operations", "Climate volatility and margin compression intensifying pain"] 
      },
      { 
        title: "Solution", 
        narrative: "FarmWise provides affordable IoT sensors and analytics designed for small farm economics. Solar-powered soil sensors measure moisture, temperature, and nutrient levels, transmitting data to a mobile app that provides actionable recommendations: when to irrigate, where to apply fertilizer, which fields need attention. Why now: IoT sensor costs dropped 85% since 2018, and cellular coverage in rural areas improved with 5G investment. The ROI target is $3 returned for every $1 spent — achieved through water savings (20% reduction), yield improvement (10% increase), and labor efficiency. Beta farmer testimonial: 'For the first time, I can see what's happening in my fields without walking every row.'",
        keyPoints: ["Solar-powered sensors: moisture, temperature, nutrients", "Mobile app with actionable recommendations: when to irrigate, where to fertilize", "Target ROI: 20% water savings, 10% yield improvement"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is small-scale farmers (50-500 acres) in specialty crops (vegetables, fruits, vineyards) where per-acre value justifies sensor investment. At $200 hardware + $240/year subscription per sensor kit (5 sensors), reaching $100M ARR requires 230,000 active subscriptions — approximately 10% of the 2.3M small farms in the US. Acceleration comes from cooperative distribution (Farm Bureau, regional co-ops) and equipment financing partnerships. Structural tailwinds: water scarcity is making irrigation optimization critical, younger farmers are more tech-comfortable, and USDA conservation programs subsidize precision ag adoption.",
        keyPoints: ["2.3M US small farms as addressable market", "$200 hardware + $240/year; $100M ARR requires 10% penetration", "Cooperative distribution and USDA subsidies as acceleration vectors"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: enterprise precision ag (John Deere, Climate Corp) designed for 1,000+ acre operations with $50K+ costs; basic weather stations providing data without actionable recommendations; and manual inspection/intuition as the status quo. Enterprise players are structurally constrained by their economics — their sales motion, dealer network, and product design all target large operations. Basic weather stations lack the analytics layer that creates value. FarmWise's wedge is the small farm sweet spot: affordable enough for small operators, sophisticated enough to drive real outcomes. Dynamics would shift if John Deere launches a small farm product, though their dealer economics make sub-$1K products challenging.",
        keyPoints: ["Enterprise precision ag (John Deere) designed and priced for 1,000+ acres", "Basic weather stations provide data without actionable recommendations", "Wedge: affordable precision ag designed for small farm economics"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO is a third-generation farmer who grew up on a 300-acre operation and saw his family struggle with the technology gap. After earning a Stanford MBA, he returned to solve the problem he lived. This founder-market fit is authentic and creates deep empathy with customers. The CTO spent 8 years as an IoT engineer at John Deere, understanding both the technology and why enterprise solutions don't translate to small farms. The combination of farmer credibility and ag-tech engineering experience is rare. The team includes 2 hardware engineers. Gap: the team lacks commercial experience — no one has sold to farmers at scale or built distribution channels.",
        keyPoints: ["CEO: Third-generation farmer, Stanford MBA, authentic founder-market fit", "CTO: 8 years IoT engineering at John Deere, enterprise ag-tech experience", "Gap: No commercial/sales experience; distribution channel unclear"] 
      },
      { 
        title: "Business Model", 
        narrative: "FarmWise sells hardware ($200 sensor kit) with annual subscription ($240/year for app and analytics). Hardware margins are 35% — thin but necessary to drive adoption. Subscription margins are 80%. Blended Year 1 LTV:CAC is challenging at 1.5:1; the model requires multi-year subscriptions to work. Gross margins improve in Year 2+ as hardware is sunk cost. The concern: small farm economics limit willingness-to-pay, and customer acquisition costs in rural markets are high (limited digital channels, requires field sales or co-op partnerships).",
        keyPoints: ["$200 hardware + $240/year subscription per sensor kit", "35% hardware margins (thin), 80% subscription margins", "Year 1 LTV:CAC at 1.5:1; model requires multi-year retention to work"] 
      },
      { 
        title: "Traction", 
        narrative: "FarmWise has 50 beta users with working hardware deployed across 3 states. All beta users are free — no paying customers yet. Engagement is strong: 85% weekly active rate and NPS of 72. However, conversion to paid is unproven. Growth is 100% through farmer community networks and ag extension programs. Forward indicators: launching paid tier next month with beta conversion target of 40%; partnership discussions with 2 regional cooperatives. Series A trigger: 500 paying subscribers with positive unit economics and proven co-op distribution channel.",
        keyPoints: ["50 beta users with working hardware; 85% weekly active, NPS 72", "No paying customers yet; paid tier launching next month", "Series A trigger: 500 subscribers, positive unit economics, co-op channel proven"] 
      },
      { 
        title: "Vision", 
        narrative: "The $1.5M raise provides 18 months runway. Allocation: 35% hardware production (first manufacturing run), 35% engineering (app improvements, new sensor types), 20% GTM (co-op partnerships, farm show presence), 10% ops. Key milestones: 500 paying subscribers, positive unit economics (>2:1 LTV:CAC), and 2 co-op distribution partnerships. Series A unlock requires proving co-op distribution scales and that small farmers will pay. Contingency: if direct-to-farmer fails, pivot to B2B model selling to ag input suppliers or crop insurance companies who benefit from farm data. Exit potential: strategic acquirers include John Deere, Nutrien, or ag-focused PE.",
        keyPoints: ["$1.5M for 18 months; 35% hardware, 35% product, 20% GTM", "Milestones: 500 subscribers, positive unit economics, 2 co-op partnerships", "Contingency: B2B pivot to ag suppliers or crop insurance if D2C fails"] 
      }
    ]
  },
  "demo-securenet": {
    vcQuickTake: {
      verdict: "SecureNet has strong technical credentials and clear differentiation in the remote-work security space. SOC2 certification is a significant milestone. However, cybersecurity is crowded and enterprise procurement is challenging.",
      readinessLevel: "MEDIUM",
      readinessRationale: "Strong technical foundation and certification, but needs more customer traction before Demo Day.",
      concerns: [
        "Crowded cybersecurity market",
        "Enterprise procurement hurdles are significant"
      ],
      strengths: [
        "Strong technical credentials (Cloudflare + NSA)",
        "Clear differentiation for remote-first companies",
        "SOC2 certified ahead of most competitors"
      ]
    },
    heroStatement: "SecureNet is building zero-trust security for the remote-first era, protecting distributed workforces without the complexity.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Remote and hybrid work broke the traditional security perimeter. Today, IT teams manage security using VPNs that don't scale (bottlenecks, latency, poor UX), endpoint agents that conflict and slow machines, and manual access reviews that can't keep pace with workforce changes. This workflow fails because 76% of companies are now remote/hybrid, employees access resources from untrusted networks, and attack surface expanded 10x. The stakeholders feeling this pain are CISOs (accountable for breaches with inadequate tools), IT Directors (drowning in access requests and security alerts), and employees (frustrated with clunky VPNs that break productivity). The average breach costs $4.5M; the pain is existential.",
        keyPoints: ["76% of companies now remote/hybrid; VPNs don't scale", "Attack surface expanded 10x; average breach costs $4.5M", "CISOs accountable for security with inadequate tools for distributed workforce"] 
      },
      { 
        title: "Solution", 
        narrative: "SecureNet provides zero-trust network access designed for remote-first companies. The platform replaces VPNs with identity-based access control: employees authenticate once, and the system continuously verifies device health, location, and behavior to grant application-level access. Why now: zero-trust architecture matured from concept to practical implementation, and remote work created urgent demand. The ROI is concrete — customers report 90% reduction in VPN support tickets, 50% faster onboarding for new hires, and measurably improved security posture. Simple deployment (2-hour setup vs. weeks for enterprise alternatives) enables quick time-to-value.",
        keyPoints: ["Identity-based access replaces VPNs; continuous device verification", "2-hour deployment vs. weeks for enterprise alternatives", "90% reduction in VPN tickets; 50% faster employee onboarding"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is mid-market companies (200-2,000 employees) that are remote-first or hybrid, with SaaS-heavy technology stacks and compliance requirements (SOC2, HIPAA). At $12/user/month ($144/year), reaching $100M ARR requires 694,000 users — approximately 3% of the 23M knowledge workers at target-size companies. Acceleration comes from enterprise tier ($20/user with advanced features) and platform expansion (adding threat detection, compliance modules). Structural tailwinds: remote work is permanent, zero-trust is now CISO priority #1, and traditional VPN vendors are losing credibility.",
        keyPoints: ["23M knowledge workers at target-size companies", "$12/user/month; $100M ARR requires 3% penetration", "Enterprise tier at $20/user and platform expansion as acceleration"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: enterprise zero-trust (Zscaler, Okta) with complex implementations and $100K+ annual minimums; traditional VPN vendors (Cisco, Palo Alto) retrofitting zero-trust features onto legacy architecture; and point solutions focused on specific use cases (remote access, identity). Enterprise players are structurally focused on Fortune 500 — their sales motion, pricing, and implementation requirements exclude mid-market. Traditional vendors carry technical debt that limits zero-trust capabilities. Point solutions create security gaps. SecureNet's wedge is enterprise-grade zero-trust at mid-market accessibility: sophisticated security without complexity. Dynamics would shift if Okta launches a mid-market product, though their enterprise DNA makes this historically difficult.",
        keyPoints: ["Enterprise zero-trust (Zscaler, Okta) priced for Fortune 500 with complex implementations", "Traditional VPNs retrofitting zero-trust onto legacy architecture", "Wedge: enterprise-grade security at mid-market accessibility"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO spent 6 years as a security architect at Cloudflare, designing the zero-trust products that now protect millions of users. He understands both the technology and how to build security products that developers actually want to use. The CTO is a former NSA analyst with deep expertise in threat detection and government-grade security. This combination of commercial security product experience and intelligence community expertise is exceptionally rare. SOC2 Type II certification (achieved ahead of most competitors) validates the team's security credibility. Gap: VP Sales with mid-market cybersecurity experience to build repeatable GTM.",
        keyPoints: ["CEO: 6 years security architect at Cloudflare, zero-trust product experience", "CTO: Former NSA analyst, government-grade security expertise", "SOC2 Type II certified; gap: VP Sales with mid-market cybersecurity experience"] 
      },
      { 
        title: "Business Model", 
        narrative: "SecureNet prices per-user monthly: $8/user/month for core zero-trust access, $15/user/month for advanced (threat detection, compliance reporting). Enterprise agreements start at $50K/year with volume discounts. Gross margins are 70% at current scale, targeting 80% as infrastructure costs amortize. LTV:CAC target is 5:1 based on 3-year average customer lifetime (security tools are sticky once deployed). Expansion comes from seat growth (companies hire), tier upgrades (core to advanced), and module additions (compliance, threat intelligence).",
        keyPoints: ["$8-15/user/month; enterprise agreements at $50K+/year", "70% gross margins, targeting 80% at scale", "5:1 LTV:CAC target; expansion via seats, tiers, and modules"] 
      },
      { 
        title: "Traction", 
        narrative: "SecureNet has 5 pilot customers with 2 converting to paid (combined $40K ACV). SOC2 Type II certification is complete, ahead of most early-stage competitors. Growth is 100% outbound given early stage — CISO network referrals and security conference connections. No cohort retention data yet given recent launches. Pipeline shows 8 qualified opportunities from security community outreach. Forward indicators: 2 additional pilot conversions expected in next 60 days, partnership discussion with a security-focused MSP. Series A trigger: $300K ARR with 15+ customers and proven SMB sales motion.",
        keyPoints: ["5 pilots, 2 converting to paid ($40K ACV); SOC2 Type II certified", "8 qualified opportunities in pipeline from security community", "Series A trigger: $300K ARR, 15+ customers, proven SMB sales motion"] 
      },
      { 
        title: "Vision", 
        narrative: "The $2.5M raise provides 20 months runway. Allocation: 45% engineering (threat detection, compliance features, integrations), 35% GTM (VP Sales hire, security conferences, content marketing), 20% ops/compliance. Key milestones: $300K ARR with 20 customers by month 18, threat detection module launch, and FedRAMP authorization initiation. Series A unlock requires proving mid-market sales velocity (30-day cycles) and demonstrating land-and-expand within accounts. Contingency: if mid-market sales lag, pursue channel through security-focused MSPs. Exit potential: strategic acquirers include security platforms (CrowdStrike, Palo Alto), identity companies (Okta, Ping), or cloud providers (AWS, Microsoft).",
        keyPoints: ["$2.5M for 20 months; 45% product, 35% GTM, 20% compliance", "Milestones: $300K ARR, 20 customers, threat detection launch", "Series A unlock: 30-day sales cycles, proven land-and-expand"] 
      }
    ]
  },
  "demo-proptech": {
    vcQuickTake: {
      verdict: "SpaceMatch has deep industry relationships but faces significant headwinds from remote work trends. The market timing is questionable and revenue model needs clarity. May need pivot exploration.",
      readinessLevel: "LOW",
      readinessRationale: "Strong industry expertise but market timing concerns. Needs clearer thesis on post-pandemic commercial real estate before Demo Day.",
      concerns: [
        "Market timing with remote work trends",
        "Low switching costs for users",
        "Revenue model clarity needed"
      ],
      strengths: [
        "Deep industry relationships from 12-year broker career",
        "Good product intuition from user research"
      ]
    },
    heroStatement: "SpaceMatch uses AI to match startups with the perfect office space, reducing search time by 80%.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Startups searching for office space today work with commercial brokers who show them listings based on surface criteria (size, price, neighborhood) without understanding startup-specific needs: flexible terms, growth accommodation, culture fit, and speed. This workflow takes 3-6 months on average, consumes 50+ hours of founder time, and frequently results in poor matches — 40% of startups regret their space choice within 12 months, costing $50K+ in moving expenses and lost productivity. The stakeholders feeling this pain are founders (distracted from core business), operations managers (managing space that doesn't fit), and investors (watching portfolio companies waste resources). The pain intensifies as startups grow — space that worked at 10 people breaks at 30.",
        keyPoints: ["Average office search takes 3-6 months, 50+ hours of founder time", "40% of startups regret space choice within 12 months", "Mismatch costs $50K+ in moving and productivity loss"] 
      },
      { 
        title: "Solution", 
        narrative: "SpaceMatch uses AI to match startups with optimal office space based on their specific needs: growth trajectory, culture, budget flexibility, and team dynamics. The platform learns from user preferences, analyzes thousands of listings, and surfaces personalized recommendations in minutes rather than months. Why now: commercial real estate data is increasingly digitized, and flexible space options have proliferated post-COVID. The ROI is time — founders report 80% reduction in search time and higher satisfaction with final choices. Virtual tour integration allows evaluation without physical visits, further accelerating decisions.",
        keyPoints: ["AI matching based on growth trajectory, culture, budget, team dynamics", "80% reduction in search time; higher satisfaction with choices", "Virtual tour integration enables evaluation without physical visits"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is venture-backed startups (10-100 employees) in major metros (SF, NYC, Austin, Miami) actively searching for office space. At 4% commission on lease transactions (average $120K annual lease = $4,800 commission), reaching $100M ARR requires 20,800 transactions — approximately 15% of the 140,000 startup office searches annually. Acceleration comes from landlord subscription revenue (featured listings) and expansion into enterprise spin-outs. Market concern: remote work has permanently reduced office demand by 30-40% in some segments, and flex space (WeWork, Industrious) may eliminate traditional search entirely for early-stage startups.",
        keyPoints: ["140,000 startup office searches annually in target markets", "4% commission model; $100M ARR requires 15% market share", "Concern: 30-40% reduction in office demand from remote work"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: traditional commercial brokers (CBRE, JLL) focused on large enterprise deals with commission structures that deprioritize startup transactions; online listing platforms (SquareFoot, Truss) that provide data without matching intelligence; and flex space providers (WeWork, Industrious) offering all-inclusive alternatives to traditional leases. Traditional brokers are structurally disincentivized from serving startups — small deal sizes don't justify their time. Listing platforms lack the AI matching that differentiates SpaceMatch. Flex space may be the bigger threat — startups can bypass the search process entirely. SpaceMatch's wedge is AI-powered matching for startups who need traditional space flexibility. The wedge narrows if flex space captures more of the market.",
        keyPoints: ["Traditional brokers (CBRE, JLL) deprioritize small startup deals", "Listing platforms (SquareFoot) provide data without matching intelligence", "Flex space (WeWork) may eliminate search need entirely for early-stage"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO spent 12 years as a commercial real estate broker, including 5 years specializing in startup and tech company transactions. She understands the search process from the inside, has relationships with major landlords in key markets, and knows what makes deals close. The CTO led engineering at Zillow, bringing real estate technology experience and consumer product sensibility. This combination of broker domain expertise and proptech engineering is solid. Gap: the team lacks startup community connections — sales to startups requires different motion than broker relationships.",
        keyPoints: ["CEO: 12 years commercial broker, 5 years startup specialization", "CTO: Engineering lead at Zillow, proptech experience", "Gap: Startup community connections for B2B sales motion"] 
      },
      { 
        title: "Business Model", 
        narrative: "SpaceMatch operates a commission model: 4% of annual lease value from landlords on closed transactions. Secondary revenue from landlord subscriptions ($500/month for featured listings and analytics). Current gross margins are 50% (revenue share with referring brokers). The concern: transaction-based revenue is lumpy, CAC for startup acquisition is high (they search infrequently), and landlord willingness-to-pay for featured listings is unproven. LTV:CAC is unclear given single-transaction nature of the business.",
        keyPoints: ["4% commission on lease transactions from landlords", "Landlord subscriptions at $500/month for featured listings", "Concern: transaction revenue is lumpy; startup CAC is high"] 
      },
      { 
        title: "Traction", 
        narrative: "SpaceMatch has a working platform with 15 landlords listing properties and 3 completed matches (transactions). No recurring revenue — each transaction is one-time. The platform MVP is functional but growth is limited: only 3 matches in 6 months suggests product-market fit challenges. Pipeline is unclear; most startup leads come through founder network. The forward indicator concern: if 6 months of effort produced only 3 transactions, the market demand or product-market fit may be weaker than assumed. Series A would require 50+ transactions and clear path to repeatable acquisition.",
        keyPoints: ["Platform live with 15 landlords, only 3 completed matches in 6 months", "No recurring revenue; transaction-based model", "Concern: 3 transactions in 6 months suggests PMF challenges"] 
      },
      { 
        title: "Vision", 
        narrative: "The $1.5M raise provides 18 months runway. Allocation: 40% product (AI improvements, landlord tools), 40% GTM (startup community building, landlord acquisition), 20% ops. Key milestones: 50 transactions, $200K revenue, and 50 landlord partners. Series A unlock requires proving startup acquisition at scale and demonstrating transaction velocity. Contingency: if startup-focused model fails, pivot to enterprise relocations where transaction values are larger and decision-makers are professional. Exit potential: strategic acquirers include listing platforms (CoStar, LoopNet), flex space providers seeking deal flow, or commercial brokerage firms.",
        keyPoints: ["$1.5M for 18 months; 40% product, 40% GTM, 20% ops", "Milestones: 50 transactions, $200K revenue, 50 landlord partners", "Contingency: pivot to enterprise relocations if startup model fails"] 
      }
    ]
  },
  "demo-wasteless": {
    vcQuickTake: {
      verdict: "Wasteless has founder passion but lacks business fundamentals. No paying customers, unclear value proposition, and weak competitive positioning. Needs fundamental rethink of approach.",
      readinessLevel: "LOW",
      readinessRationale: "Important mission but not ready for investment. Needs to demonstrate product-market fit before Demo Day.",
      concerns: [
        "Unclear value proposition for buyers",
        "No paying customers after 6 months",
        "Weak competitive position",
        "Team lacks relevant domain experience"
      ],
      strengths: [
        "Important mission with founder passion",
        "Growing awareness of food waste issue"
      ]
    },
    heroStatement: "Wasteless helps restaurant chains reduce food waste by 30% through predictive analytics and smart inventory management.",
    sections: [
      { 
        title: "Problem", 
        narrative: "Restaurants today manage inventory using order-by-feel, prep-to-par, and end-of-day waste counting. This workflow results in 4-10% of purchased food going to waste — representing $25B annually in the US restaurant industry. The process breaks because prep decisions are made hours before demand materializes, menu items have variable popularity, and perishables have short windows. The stakeholders feeling this pain are Operations Directors (watching margins erode), Kitchen Managers (blamed for waste they can't predict), and Sustainability Officers (facing ESG pressure from investors and customers). The pain is real, but purchase urgency is unclear — restaurant margins are tight, and waste reduction competes with dozens of other operational priorities.",
        keyPoints: ["4-10% of restaurant food purchases wasted; $25B annually in US", "Prep decisions made hours before demand materializes", "Sustainability pressure increasing, but purchase urgency unclear"] 
      },
      { 
        title: "Solution", 
        narrative: "Wasteless provides analytics that predict demand and optimize ordering to reduce restaurant food waste by 30%. The platform integrates with POS and inventory systems, analyzes historical patterns, and provides prep recommendations and ordering suggestions. Why now: restaurant technology stacks are increasingly connected, and ESG pressure is creating sustainability budgets. The claimed ROI is 30% waste reduction, translating to 1-3% margin improvement. However, the mechanism of value delivery is unclear — does Wasteless replace judgment or augment it? The proof is thin — 3 free pilots with no measured outcomes or customer testimonials.",
        keyPoints: ["Demand prediction and ordering optimization for restaurants", "Claims 30% waste reduction, 1-3% margin improvement", "Concern: mechanism unclear and proof is thin (free pilots only)"] 
      },
      { 
        title: "Market", 
        narrative: "The ICP is restaurant chains (10-100 locations) with centralized operations and sustainability commitments. At $200/location/month ($2,400/year), reaching $100M ARR requires 41,667 locations — approximately 5% of the 800,000 chain restaurant locations in the US. The market math is feasible, but willingness-to-pay is unvalidated. Restaurant operators are notoriously cost-conscious and skeptical of technology that promises operational improvement. Structural tailwinds exist (ESG pressure, margin compression), but the timing may be off — restaurants are still recovering from pandemic disruption and prioritizing survival over optimization.",
        keyPoints: ["800,000 chain restaurant locations in US as addressable market", "$200/location/month; $100M ARR requires 5% penetration", "Concern: willingness-to-pay unvalidated; restaurants are cost-conscious"] 
      },
      { 
        title: "Competition", 
        narrative: "Three competitive archetypes: waste measurement tools (Leanpath, Winnow) focused on tracking rather than prediction; food redistribution platforms (Too Good To Go, Flashfood) that address waste after it occurs; and generic inventory/kitchen management platforms (MarketMan, BlueCart) that could add waste features. Leanpath and Winnow have first-mover advantage in enterprise and strong brand recognition. Redistribution platforms address a different part of the problem. Generic platforms have existing restaurant relationships and could bundle waste features. Wasteless's positioning is unclear — measurement is dominated by incumbents, and prediction alone may not be differentiated enough. The wedge is weak.",
        keyPoints: ["Leanpath, Winnow dominate waste measurement with enterprise focus", "Redistribution platforms (Too Good To Go) address waste after it occurs", "Concern: positioning unclear; prediction alone may not be differentiated"] 
      },
      { 
        title: "Team", 
        narrative: "The CEO is a sustainability consultant with 5 years experience advising companies on environmental initiatives. She brings passion for the mission and general business acumen. The CTO is a full-stack developer with 2x prior founder experience, though neither venture was in food or restaurant technology. The team gap is significant: neither founder has restaurant operations experience, food supply chain expertise, or enterprise sales capability. They are learning the domain on the job, which explains the slow traction. The passion is authentic, but the founder-market fit is weak.",
        keyPoints: ["CEO: Sustainability consultant, 5 years; passion for mission", "CTO: Full-stack developer, 2x founder, no food/restaurant experience", "Gap: No restaurant operations, supply chain, or enterprise sales experience"] 
      },
      { 
        title: "Business Model", 
        narrative: "Wasteless targets $200/location/month pricing based on competitive analysis, but this is aspirational — no customer has agreed to pay. The revenue model is SaaS subscription, which makes sense, but gross margins are unclear (integration complexity varies by POS system). LTV:CAC is completely unknown: no paying customers means no LTV data, and CAC assumptions are speculative. The business model needs validation before it can be evaluated.",
        keyPoints: ["Target pricing: $200/location/month (aspirational, unvalidated)", "SaaS subscription model; gross margins unclear", "Concern: no paying customers means no LTV or CAC data"] 
      },
      { 
        title: "Traction", 
        narrative: "Wasteless has an MVP and 3 restaurant pilots, but all are free. After 6 months of operation, there are no paying customers, no measured waste reduction outcomes, and no customer testimonials. The pilots are 'using the product' but engagement metrics are unclear. Growth is non-existent — the 3 pilots came from founder network outreach. The forward indicator is concerning: if 6 months of effort with a working product produced zero revenue, the product-market fit hypothesis may be wrong. Series A is unrealistic without fundamental validation that restaurants will pay for this solution.",
        keyPoints: ["MVP complete; 3 free pilots for 6 months", "Zero paying customers; no measured outcomes or testimonials", "Concern: 6 months with working product produced zero revenue"] 
      },
      { 
        title: "Vision", 
        narrative: "The $1M raise provides 15 months runway at minimal burn. Allocation: 40% product (integrations, analytics improvements), 40% GTM (sales hire, restaurant conferences), 20% ops. Key milestones: 10 paying customers, $50K ARR, and published case study with measured waste reduction. However, the plan assumes the current approach will work with more effort — the traction suggests the approach may need fundamental rethinking. Contingency: if direct-to-restaurant sales fail, pivot to B2B through food distributors or waste management companies. Exit potential is limited given current stage; the focus should be on validating PMF, not exit planning.",
        keyPoints: ["$1M for 15 months; 40% product, 40% GTM, 20% ops", "Milestones: 10 paying customers, $50K ARR, published case study", "Concern: plan assumes current approach works; traction suggests otherwise"] 
      }
    ]
  },
  "demo-signalflow": {
    vcQuickTake: {
      verdict: "SignalFlow demonstrates strong fundamentals with exceptional founder-market fit and validated product-market fit signals. The €32K MRR with 15% MoM growth and 4.9x LTV:CAC shows efficient economics. Competition from Gong is the primary concern, but the 'prediction vs. recording' positioning creates differentiation runway.",
      readinessLevel: "MEDIUM",
      readinessRationale: "Strong team and healthy unit economics, but needs to strengthen competitive moat and scale beyond founder-led sales before Series A readiness.",
      concerns: [
        "Gong's announced mid-market expansion with 'Essentials' tier",
        "Early traction base (28 customers) limits pattern confidence",
        "Founder-led sales motion may not scale predictably"
      ],
      strengths: [
        "Exceptional founder-market fit (Salesforce + Datadog pedigree)",
        "Strong unit economics (4.9x LTV:CAC, 7-month payback)",
        "Clear differentiation on prediction vs. recording",
        "High NPS (74) indicates organic growth potential"
      ],
      frameworkScore: 70,
      criteriaCleared: 6,
      rulingStatement: "Conditional pass — fundable with right investor who understands competitive dynamics"
    },
    heroStatement: "SignalFlow is building the AI intelligence layer for mid-market sales teams — predicting which deals will close and why, not just recording what happened.",
    aiActionPlan: {
      items: [
        {
          id: "action-1",
          priority: 1,
          category: "competition",
          problem: "Gong announced 'Essentials' tier targeting mid-market at $99/seat — direct competitive threat",
          impact: "Gong has $7B+ valuation, $200M+ ARR, and deep enterprise relationships. Their mid-market push could pressure pricing and positioning. VCs will ask: 'What happens when Gong comes down-market?'",
          howToFix: "Double down on the 'prediction' vs. 'recording' differentiation. Build competitive win documentation — every deal you win against Gong should be documented with specific reasons. Create a moat through data network effects and integration depth.",
          badExample: "Gong is focused on enterprise, they won't come after us.",
          goodExample: "We've won 8 competitive deals against Gong in the last quarter. Key differentiator: customers chose us for outcome prediction, not call recording. Our 89% accuracy on deal outcomes is the moat — Gong would need 18+ months to build comparable models."
        },
        {
          id: "action-2",
          priority: 2,
          category: "traction",
          problem: "€32K MRR with 28 customers is promising but founder-led — need to prove scalable GTM",
          impact: "VCs see founder-led sales as market validation, not product-market fit. Without evidence that non-founders can close deals, you're asking investors to bet on founders' hustle, not a repeatable business. This caps valuation and makes Series A conditional.",
          howToFix: "Hire 2 AEs in next 90 days. Document the sales playbook explicitly. Target: 3+ deals closed by non-founders within 6 months. Build pipeline visibility so you can show sales velocity, not just closed deals.",
          badExample: "Our founders are great at closing — we just need more of them.",
          goodExample: "Our first AE closed 2 deals in Month 2 using our documented playbook — 40% faster than founder average. We now have proof the motion transfers."
        },
        {
          id: "action-3",
          priority: 3,
          category: "team",
          problem: "Missing VP Marketing / demand generation leadership",
          impact: "Current growth is organic and founder-networked. Without systematic demand generation, scaling will hit a ceiling. VCs will ask: 'How do you get from €32K to €150K MRR without a marketing engine?'",
          howToFix: "Hire VP Marketing with B2B SaaS demand gen track record within 60 days. Priority: someone who has built lead generation at €10-50M ARR stage. Consider fractional initially if full-time hiring is slow.",
          badExample: "We'll figure out marketing once we have more revenue.",
          goodExample: "We're in final rounds with a VP Marketing candidate from Outreach. She built their mid-market lead gen engine from €20M to €80M ARR. Expected start date: Week 6."
        },
        {
          id: "action-4",
          priority: 4,
          category: "competition",
          problem: "No patents filed on core prediction algorithms — IP moat is informal",
          impact: "Without formal IP protection, your technical advantage is just execution speed. Well-funded competitors can hire ML talent and replicate. VCs investing in AI companies want to see IP strategy.",
          howToFix: "File provisional patent on the 'why' prediction methodology within 30 days. Document the trade secrets around your training data curation. Build the narrative: 'Our 2M+ deal outcomes dataset would take competitors 18+ months to replicate.'",
          badExample: "Our algorithms are proprietary — we don't need patents.",
          goodExample: "We filed a provisional patent on our outcome prediction methodology last month. Our 2M deal dataset is growing at 100K outcomes/quarter — this data moat compounds and is our real defensibility."
        },
        {
          id: "action-5",
          priority: 5,
          category: "narrative",
          problem: "Need stronger proof that 'prediction' is meaningfully different from 'conversation intelligence'",
          impact: "Investors hear 'AI sales tool' and think 'Gong competitor.' Your differentiation is subtle — predicting outcomes vs. analyzing calls. Without clear articulation, you blend into a crowded category.",
          howToFix: "Create side-by-side comparison content: 'What Gong tells you vs. what SignalFlow tells you.' Get 5 customers to testimonial specifically on the prediction value. Build the 'outcome intelligence' category narrative.",
          badExample: "We're like Gong but we predict outcomes.",
          goodExample: "Gong tells you what was said on a call. We tell you whether the deal will close and why — 45 days before the outcome. Three customers have quoted saving $500K+ by reallocating rep time from doomed deals."
        }
      ],
      overallUrgency: "high",
      summaryLine: "SignalFlow has strong fundamentals but needs to strengthen competitive moat, scale GTM beyond founders, and formalize IP protection before Series A."
    },
    sections: [
      {
        title: "Problem",
        narrative: "Enterprise sales teams lose 67% of qualified deals to 'no decision' — not competitors. After interviewing 85 sales leaders across the mid-market, SignalFlow found a consistent pattern: reps spend 40% of their time on deals that will never close, while neglecting the ones that could. The financial impact is staggering: $2.1M average annual revenue leakage per 50-person sales org. This isn't a productivity problem — it's a prediction problem. Current solutions (Salesforce reports, manager intuition, spreadsheet forecasting) catch problems far too late, after deals have already stalled. The insight comes in the post-mortem, not the moment of truth.",
        keyPoints: ["67% of deals lost to 'no decision' — not competitors", "$2.1M average revenue leakage per 50-person sales org", "Current tools catch problems too late — post-mortem vs. real-time"]
      },
      {
        title: "Solution",
        narrative: "SignalFlow analyzes CRM data, email patterns, call transcripts, and calendar activity to predict deal outcomes with 89% accuracy. Unlike tools that tell you what happened, SignalFlow tells you WHY deals will close or stall — so reps know exactly what to fix. The ML models identify the 3-5 signals that determine close probability for each deal, surfacing them as actionable coaching insights. A rep doesn't just see 'this deal is at risk' — they see 'this deal lacks technical champion engagement and has 40% less email velocity than won deals at this stage.' Key differentiators: prediction focus (vs. recording), mid-market optimization (20-100 person teams), 5-minute integration, and action-oriented insights.",
        keyPoints: ["89% accuracy on deal outcome prediction", "Identifies 'why' not just 'if' — actionable coaching", "5-minute integration with 12 CRM/email/calendar tools"]
      },
      {
        title: "Market",
        narrative: "The ICP is mid-market B2B companies (100-1000 employees) with 20-100 person sales teams selling $50K+ ACV products. At €14K ACV, the TAM is €2.5B (180K mid-market companies × €14K). SAM filters to tech-forward industries in US + Western Europe (€630M), with SOM of €112M based on reachable accounts through current channels. The category is validated by Gong's $7.25B valuation and Clari's $2.6B — combined $10B+ in value proves market appetite. Timing is favorable: 85% of sales organizations plan to increase AI tool spending in 2025, and the mid-market segment is underserved by enterprise-focused incumbents.",
        keyPoints: ["€2.5B TAM with bottom-up methodology", "Category validated by $10B+ in Gong + Clari value", "85% of sales orgs increasing AI spend in 2025"]
      },
      {
        title: "Competition",
        narrative: "The competitive landscape breaks into three archetypes: conversation intelligence leaders (Gong at $70M+ ARR, Chorus acquired for $575M), revenue platforms (Clari at $40M+ ARR, 6sense), and point solutions (activity capture, forecasting tools). Gong's announced 'Essentials' tier at $99/seat is a direct mid-market threat. SignalFlow's differentiation is the 'prediction' vs. 'recording' axis — rather than analyzing what happened on calls, SignalFlow predicts what will happen with deals and prescribes specific actions. The 2M+ deal outcomes training dataset creates a data moat that would take competitors 18+ months to replicate. Integration depth with 12 tools creates switching costs.",
        keyPoints: ["Primary threat: Gong's mid-market expansion", "Differentiation: prediction vs. recording", "Data moat: 2M+ deal outcomes in training set"]
      },
      {
        title: "Team",
        narrative: "The founding team has earned the right to build this company. Elena Vasquez (CEO, 52% equity) spent 8 years at Salesforce leading enterprise sales strategy — she's seen the deal intelligence problem from the inside and brings relationships with major sales tech buyers. Marcus Chen (CTO, 48% equity) led ML engineering at Datadog and holds a PhD from Stanford, giving him direct experience building production ML systems at scale. The combination of sales domain expertise and technical depth is rare. The team has hired 3 engineers from Stripe and Twilio, plus a VP Sales from Outreach. Gap: VP Marketing hire in progress, expected close in 6-8 weeks. Advisors include a Gong board member and former Clari CRO.",
        keyPoints: ["CEO: 8 years Salesforce enterprise sales strategy", "CTO: Datadog ML Lead, Stanford PhD", "Advisory: Gong board member, former Clari CRO"]
      },
      {
        title: "Business Model",
        narrative: "SignalFlow sells SaaS subscriptions at €1,200/month per team (average 15 seats = €14K ACV). Gross margin is 82%. Current unit economics are healthy: CAC of €8,500, LTV of €42,000, LTV:CAC ratio of 4.9x. Payback period is 7 months. Monthly churn is 2.1%, with Net Revenue Retention of 108% driven by seat expansion. Annual contracts at 15% discount are driving 45% of new ARR, improving cash efficiency. Expansion revenue comes from two vectors: seat growth as customers add teams, and enterprise tier upsell at €50K+ ACV (in development for Q2).",
        keyPoints: ["€14K ACV, 82% gross margin", "4.9x LTV:CAC, 7-month payback", "108% NRR from seat expansion"]
      },
      {
        title: "Traction",
        narrative: "SignalFlow has €32K MRR with 28 paying customers, growing 15% month-over-month for 8 consecutive months. Started charging 10 months ago. Customer quality is strong: 3 YC-backed companies, 2 publicly traded companies under NDA. Product engagement is healthy: NPS of 74, cohort retention of 94% at Month 6. Pipeline shows €180K in qualified opportunities. Forward indicators: 5 deals in final negotiation (€65K potential ACV), enterprise tier pilots with 2 customers, and inbound interest accelerating from content marketing. Series A trigger: €150K MRR with 75+ customers and proven non-founder sales motion.",
        keyPoints: ["€32K MRR, 28 customers, 15% MoM growth", "NPS 74, 94% retention at Month 6", "€180K in qualified pipeline"]
      },
      {
        title: "Vision",
        narrative: "Raising €2M Seed at €10M pre-money. Use of funds: 55% R&D (hire 4 engineers for enterprise features and model improvements), 25% sales (hire 2 AEs plus 1 SDR), 15% marketing (VP Marketing hire, content, events), 5% ops. 18-month runway to key milestones: €150K MRR, 75 customers, enterprise tier launched, US presence established. Series A unlock requires proving sales velocity (3-month cycles vs. current 4.5) and demonstrating non-founder-led closes. Exit potential: strategic acquisition by CRM platforms (Salesforce, HubSpot) or revenue intelligence consolidation (ZoomInfo pattern). Comparable exits: Chorus.ai ($575M), InsideSales.com (~$100M). Realistic outcome: €500M-1B exit at Series B/C stage.",
        keyPoints: ["€2M raise for 18 months runway", "Milestones: €150K MRR, 75 customers, enterprise tier", "Exit comps: Chorus.ai ($575M), category consolidation"]
      }
    ]
  }
};

export const getDemoMemo = (startupId: string): DemoMemoData | null => {
  return DEMO_MEMOS[startupId] || null;
};
