// Demo memo data for all 10 accelerator startups
// This provides structured content for the full memo view

import type { MemoVCQuickTake } from "@/types/memo";

export interface DemoMemoData {
  vcQuickTake: MemoVCQuickTake;
  heroStatement: string;
  sections: {
    title: string;
    narrative: string;
    keyPoints: string[];
  }[];
}

// Generate memo data for each demo startup
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
    sections: [
      { title: "Problem", narrative: "Enterprises face increasing regulatory pressure to track and report carbon emissions across their supply chains. Current solutions are manual, expensive, and don't integrate with existing business systems.", keyPoints: ["CSRD and SEC rules creating compliance deadlines", "Manual tracking costs $50K+/year for mid-size companies", "Supply chain pressure cascading to smaller suppliers"] },
      { title: "Solution", narrative: "AI-powered carbon footprint tracking that integrates with existing enterprise systems to automate emission calculations and compliance reporting.", keyPoints: ["Automated data collection from ERP systems", "AI-powered emission factor matching", "Compliance-ready reporting for major frameworks"] },
      { title: "Market", narrative: "The carbon accounting market is projected to reach $64B by 2030, driven by regulatory mandates in EU and US.", keyPoints: ["$64B TAM by 2030", "180K+ enterprises need compliance solutions", "Regulatory deadlines creating urgency"] },
      { title: "Competition", narrative: "Enterprise players like Watershed and Persefoni dominate the large enterprise segment, leaving mid-market underserved.", keyPoints: ["Watershed focused on Fortune 500", "Persefoni targeting mid-market", "Gap in integrated, affordable solutions"] },
      { title: "Team", narrative: "Founding team combines sustainability expertise with enterprise software experience from Google Cloud and McKinsey.", keyPoints: ["CEO: Ex-McKinsey sustainability practice lead", "CTO: ML lead at Google Cloud", "Combined 20+ years enterprise experience"] },
      { title: "Business Model", narrative: "SaaS model with tiered pricing based on company size and data volume. Land-and-expand strategy with compliance modules.", keyPoints: ["$2,400-$12,000 ACV depending on tier", "78% gross margins", "Land with core tracking, expand with compliance"] },
      { title: "Traction", narrative: "Early traction with Fortune 500 pilot and growing pipeline of mid-market companies.", keyPoints: ["1 Fortune 500 pilot (proof of concept)", "12 companies in pipeline", "3 LOIs signed"] },
      { title: "Vision", narrative: "Become the standard infrastructure for corporate carbon accountability, expanding from tracking to carbon marketplace and offset management.", keyPoints: ["Phase 1: Carbon tracking platform", "Phase 2: Compliance automation", "Phase 3: Carbon marketplace integration"] }
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
      { title: "Problem", narrative: "Patient data is siloed across healthcare systems, leading to duplicated tests, medical errors, and poor care coordination.", keyPoints: ["$30B wasted annually on duplicated tests", "Medical errors from incomplete records", "Patients frustrated with manual data sharing"] },
      { title: "Solution", narrative: "FHIR-native platform that enables seamless patient data exchange between healthcare providers with patient consent management.", keyPoints: ["FHIR-first architecture", "Patient consent management built-in", "Integration with major EHR systems"] },
      { title: "Market", narrative: "Healthcare interoperability market growing rapidly driven by regulatory mandates and value-based care models.", keyPoints: ["$5.7B market by 2027", "CMS interoperability rules driving adoption", "Value-based care requires data sharing"] },
      { title: "Competition", narrative: "Competing against legacy HIE networks and newer API-first players like Redox and Health Gorilla.", keyPoints: ["Legacy HIEs have poor UX", "Redox focused on app developers", "Gap in provider-to-provider solutions"] },
      { title: "Team", narrative: "CEO is former CMO with health system experience, CTO is FHIR standards committee member.", keyPoints: ["Combined 25 years healthcare experience", "Direct EHR integration experience", "Strong clinical credibility"] },
      { title: "Business Model", narrative: "Per-connection pricing with enterprise agreements for health systems. Revenue scales with data volume.", keyPoints: ["$0.10-0.50 per transaction", "Enterprise unlimited plans at $50K+/year", "70% gross margins at scale"] },
      { title: "Traction", narrative: "3 LOIs from regional health systems and pilot program with 500-bed hospital.", keyPoints: ["3 LOIs totaling $180K ACV", "1 active pilot", "15 demos scheduled"] },
      { title: "Vision", narrative: "Create the universal health data exchange layer, expanding from providers to payers and life sciences.", keyPoints: ["Phase 1: Provider interoperability", "Phase 2: Payer integration", "Phase 3: Research data marketplace"] }
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
      { title: "Problem", narrative: "Most Americans lack access to quality financial advice. Traditional advisors require high minimums, and robo-advisors lack personalization.", keyPoints: ["70% of Americans financially stressed", "Traditional advisors need $250K+ minimums", "Robo-advisors feel impersonal"] },
      { title: "Solution", narrative: "AI-powered financial assistant that provides personalized advice through natural conversation, learning user behavior over time.", keyPoints: ["Conversational interface", "Personalized recommendations", "Learns from user behavior"] },
      { title: "Market", narrative: "Personal finance app market is large and growing, with increasing AI adoption.", keyPoints: ["$1.5B personal finance app market", "AI fintech growing 25% annually", "Millennials prefer digital-first"] },
      { title: "Competition", narrative: "Competing against robo-advisors, budgeting apps, and emerging AI assistants.", keyPoints: ["Mint/YNAB for budgeting", "Betterment/Wealthfront for investing", "Gap in conversational advice"] },
      { title: "Team", narrative: "CEO from Robinhood product team, CTO led conversational AI at Amazon Alexa.", keyPoints: ["Direct fintech product experience", "Conversational AI expertise", "Previous startup experience"] },
      { title: "Business Model", narrative: "Freemium model with premium subscription and affiliate revenue.", keyPoints: ["$9.99/month premium tier", "Affiliate revenue from financial products", "82% gross margins"] },
      { title: "Traction", narrative: "Impressive early traction with $25K MRR and 50K waitlist.", keyPoints: ["$25K MRR", "50K waitlist", "40% week-over-week growth"] },
      { title: "Vision", narrative: "Become the primary financial relationship for the next generation, expanding into banking and wealth management.", keyPoints: ["Phase 1: Financial advice AI", "Phase 2: Embedded banking", "Phase 3: Wealth management"] }
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
      { title: "Problem", narrative: "SMB legal teams spend 60%+ of time on contract review, using expensive outside counsel or risky manual processes.", keyPoints: ["Average lawyer spends 60% time on contracts", "Outside counsel costs $300-600/hour", "Manual review creates liability risk"] },
      { title: "Solution", narrative: "AI-powered contract analysis that identifies risks, suggests edits, and accelerates review by 10x.", keyPoints: ["AI risk identification", "Suggested redlines", "10x faster review"] },
      { title: "Market", narrative: "Legal tech market growing rapidly with AI adoption accelerating.", keyPoints: ["$18B legal tech market", "AI legal tools fastest growing segment", "SMBs underserved by current solutions"] },
      { title: "Competition", narrative: "Enterprise players like Kira and Luminance serve large firms, leaving SMB market open.", keyPoints: ["Kira/Luminance for enterprise", "Generic AI tools lack legal training", "Gap in SMB-focused solutions"] },
      { title: "Team", narrative: "CEO is former BigLaw attorney with 8 years experience, CTO led NLP at OpenAI.", keyPoints: ["Deep legal domain expertise", "Cutting-edge NLP capabilities", "Combined credibility opens doors"] },
      { title: "Business Model", narrative: "SaaS subscription with per-seat pricing and usage-based components.", keyPoints: ["$200/user/month", "Usage-based add-ons", "78% gross margins"] },
      { title: "Traction", narrative: "Strong early traction with $15K MRR and growing customer base.", keyPoints: ["$15K MRR", "45 paying customers", "NPS of 62"] },
      { title: "Vision", narrative: "Expand from contract review to full legal workflow automation for SMBs.", keyPoints: ["Phase 1: Contract review", "Phase 2: Legal document generation", "Phase 3: Full legal operations platform"] }
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
      { title: "Problem", narrative: "Mid-market retailers lose 8-10% of revenue to stockouts and overstock due to poor demand forecasting.", keyPoints: ["$200B+ lost to inventory inefficiency", "Mid-market can't afford enterprise tools", "Excel-based forecasting is error-prone"] },
      { title: "Solution", narrative: "ML-powered demand forecasting designed specifically for mid-market retail complexity.", keyPoints: ["Purpose-built ML models", "Simple integration approach", "Actionable recommendations"] },
      { title: "Market", narrative: "Retail inventory management is a large market with mid-market underserved.", keyPoints: ["$4B inventory optimization market", "Mid-market is 40% of addressable market", "Legacy tools are expensive and complex"] },
      { title: "Competition", narrative: "Enterprise players focus on large retailers, leaving mid-market with outdated tools.", keyPoints: ["Blue Yonder for enterprise", "Basic tools for small retailers", "Gap in mid-market solutions"] },
      { title: "Team", narrative: "CEO was VP Supply Chain at Target, CTO is ML researcher from Stanford.", keyPoints: ["Direct retail operations experience", "Strong ML credentials", "Industry relationships for sales"] },
      { title: "Business Model", narrative: "SaaS with pricing based on SKU count and location volume.", keyPoints: ["$2K-8K/month based on SKUs", "Implementation services revenue", "72% gross margins"] },
      { title: "Traction", narrative: "2 paid pilots with regional retailers showing promising results.", keyPoints: ["2 paid pilots at $4K/month", "15% inventory reduction demonstrated", "Pipeline of 8 retailers"] },
      { title: "Vision", narrative: "Expand from forecasting to full supply chain optimization for mid-market.", keyPoints: ["Phase 1: Demand forecasting", "Phase 2: Replenishment automation", "Phase 3: Full supply chain suite"] }
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
      { title: "Problem", narrative: "Manufacturing faces critical skills gap with retiring workers and insufficient training capacity.", keyPoints: ["2.4M manufacturing jobs unfilled by 2030", "Traditional training takes 6-12 months", "High error rates from inexperienced workers"] },
      { title: "Solution", narrative: "VR-based training simulations that accelerate skill development and reduce on-floor training time.", keyPoints: ["Immersive skill simulations", "Risk-free practice environment", "Progress tracking and certification"] },
      { title: "Market", narrative: "VR training market growing rapidly in industrial applications.", keyPoints: ["$6.3B VR training market by 2027", "Manufacturing is largest vertical", "ROI proven in enterprise pilots"] },
      { title: "Competition", narrative: "Competing against traditional training and emerging VR players.", keyPoints: ["Traditional training is slow", "STRIVR focused on retail/warehouse", "Gap in manufacturing-specific content"] },
      { title: "Team", narrative: "CEO was L&D director at Boeing, CTO has 10 years XR development experience.", keyPoints: ["Direct manufacturing training experience", "Deep XR technical expertise", "Industry credibility for sales"] },
      { title: "Business Model", narrative: "Hardware + content subscription model with custom development services.", keyPoints: ["$500/user/year subscription", "Custom content development at $50K+", "55% gross margins currently"] },
      { title: "Traction", narrative: "Working prototype with pilot discussions at 3 manufacturers.", keyPoints: ["Working prototype complete", "3 pilot discussions in progress", "Boeing expressing interest"] },
      { title: "Vision", narrative: "Expand from manufacturing to all skilled trades requiring hands-on training.", keyPoints: ["Phase 1: Manufacturing training", "Phase 2: Healthcare/aviation", "Phase 3: Full vocational platform"] }
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
      { title: "Problem", narrative: "Small-scale farmers lack access to precision agriculture tools that could increase yields and reduce costs.", keyPoints: ["Small farms are 90% of US farms", "Precision ag tools cost $50K+", "Manual monitoring is labor-intensive"] },
      { title: "Solution", narrative: "Affordable IoT sensors and analytics platform designed for small farm economics.", keyPoints: ["Low-cost sensor hardware", "Simple mobile-first interface", "Actionable recommendations"] },
      { title: "Market", narrative: "Small farm precision ag is underserved despite large farm count.", keyPoints: ["2M+ small farms in US", "Precision ag adoption <10% in small farms", "Growing awareness of technology benefits"] },
      { title: "Competition", narrative: "Enterprise ag-tech ignores small farms, basic sensors lack intelligence.", keyPoints: ["John Deere for large farms", "Basic sensors have no analytics", "Gap in affordable smart solutions"] },
      { title: "Team", narrative: "CEO is third-generation farmer with Stanford MBA, CTO is IoT engineer from John Deere.", keyPoints: ["Deep farmer relationships", "Hardware engineering expertise", "Credibility with target market"] },
      { title: "Business Model", narrative: "Hardware sales plus subscription for analytics and recommendations.", keyPoints: ["$200 sensor kit", "$20/month subscription", "35% gross margins on hardware"] },
      { title: "Traction", narrative: "50 beta users with working hardware, but no paid customers yet.", keyPoints: ["50 beta users", "Working hardware deployed", "Strong NPS from beta users"] },
      { title: "Vision", narrative: "Build the operating system for small-scale sustainable farming.", keyPoints: ["Phase 1: Soil monitoring", "Phase 2: Irrigation automation", "Phase 3: Farm management platform"] }
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
      { title: "Problem", narrative: "Remote work has broken traditional perimeter security, leaving companies vulnerable.", keyPoints: ["76% of companies now remote/hybrid", "Traditional VPNs don't scale", "Breach costs averaging $4.5M"] },
      { title: "Solution", narrative: "Zero-trust network access platform designed for remote-first companies.", keyPoints: ["Device-level security", "Identity-based access", "Simple deployment"] },
      { title: "Market", narrative: "Zero-trust security market growing rapidly with remote work.", keyPoints: ["$60B zero-trust market by 2027", "Remote work driving adoption", "SMBs increasingly targeted"] },
      { title: "Competition", narrative: "Enterprise players are complex and expensive, leaving mid-market underserved.", keyPoints: ["Zscaler/Okta for enterprise", "Basic tools lack zero-trust", "Gap in mid-market solutions"] },
      { title: "Team", narrative: "CEO is security architect from Cloudflare, CTO is former NSA analyst.", keyPoints: ["Deep security expertise", "Enterprise architecture experience", "Government security clearance"] },
      { title: "Business Model", narrative: "Per-user SaaS pricing with enterprise tiers.", keyPoints: ["$8-15/user/month", "Enterprise agreements at $50K+", "70% gross margins"] },
      { title: "Traction", narrative: "SOC2 certified with 5 pilot customers.", keyPoints: ["SOC2 Type II certified", "5 pilot customers", "2 converting to paid"] },
      { title: "Vision", narrative: "Build the security layer for the distributed workforce era.", keyPoints: ["Phase 1: Zero-trust access", "Phase 2: Threat detection", "Phase 3: Full security platform"] }
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
      { title: "Problem", narrative: "Finding office space is time-consuming and startups often make poor choices.", keyPoints: ["Average search takes 3-6 months", "High lease commitment risk", "Mismatched space costs $50K+/year"] },
      { title: "Solution", narrative: "AI matching platform that learns startup preferences and finds optimal spaces.", keyPoints: ["Preference learning AI", "Instant matching", "Virtual tour integration"] },
      { title: "Market", narrative: "Commercial real estate tech is growing but remote work creates uncertainty.", keyPoints: ["$18B CRE tech market", "Startup office market uncertain", "Flex space growing despite remote"] },
      { title: "Competition", narrative: "Legacy brokers and emerging platforms compete for startup attention.", keyPoints: ["Traditional brokers dominate", "SquareFoot, Truss for online search", "WeWork for flex space"] },
      { title: "Team", narrative: "CEO has 12 years as commercial broker, CTO led engineering at Zillow.", keyPoints: ["Deep broker relationships", "Real estate tech experience", "Strong network for BD"] },
      { title: "Business Model", narrative: "Commission-based model with landlord and tenant fees.", keyPoints: ["4% landlord commission", "Tenant subscription option", "50% gross margins"] },
      { title: "Traction", narrative: "Platform built with limited customer traction.", keyPoints: ["Platform MVP complete", "15 landlords listed", "3 matches completed"] },
      { title: "Vision", narrative: "Become the go-to platform for startup real estate needs.", keyPoints: ["Phase 1: Office matching", "Phase 2: Lease management", "Phase 3: Workspace analytics"] }
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
      { title: "Problem", narrative: "Restaurants waste 4-10% of food purchased, hurting margins and sustainability.", keyPoints: ["$25B wasted by US restaurants annually", "4-10% of food purchases wasted", "Growing pressure on sustainability"] },
      { title: "Solution", narrative: "Analytics platform that predicts demand and optimizes ordering to reduce waste.", keyPoints: ["Demand prediction", "Ordering optimization", "Waste tracking dashboard"] },
      { title: "Market", narrative: "Restaurant food waste reduction is a growing market.", keyPoints: ["$2B addressable market", "Sustainability pressure increasing", "ROI from waste reduction"] },
      { title: "Competition", narrative: "Several players addressing restaurant waste with different approaches.", keyPoints: ["Leanpath for measurement", "Too Good To Go for redistribution", "Generic inventory tools"] },
      { title: "Team", narrative: "CEO is sustainability consultant, CTO is full-stack developer with 2x founder experience.", keyPoints: ["Sustainability background", "Technical capability", "Limited restaurant industry experience"] },
      { title: "Business Model", narrative: "SaaS subscription based on location count.", keyPoints: ["$200/location/month target", "No validated pricing", "Unclear willingness to pay"] },
      { title: "Traction", narrative: "MVP built but no paying customers yet.", keyPoints: ["MVP complete", "3 restaurant pilots (free)", "No paying customers"] },
      { title: "Vision", narrative: "Build the food waste reduction platform for the restaurant industry.", keyPoints: ["Phase 1: Waste tracking", "Phase 2: Prediction engine", "Phase 3: Full optimization"] }
    ]
  }
};

export const getDemoMemo = (startupId: string): DemoMemoData | null => {
  return DEMO_MEMOS[startupId] || null;
};
