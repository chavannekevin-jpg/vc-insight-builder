export interface DemoStartup {
  id: string;
  name: string;
  tagline: string;
  category: string;
  stage: string;
  founders: { name: string; role: string; background: string }[];
  fundabilityScore: number;
  status: "demo-ready" | "on-track" | "needs-work" | "at-risk";
  sectionScores: {
    problem: number;
    solution: number;
    market: number;
    competition: number;
    team: number;
    businessModel: number;
    traction: number;
    vision: number;
  };
  topConcerns: string[];
  topStrengths: string[];
  mentorFocus: string;
  lastUpdated: string;
  weeklyProgress: number; // -10 to +10
}

export const DEMO_STARTUPS: DemoStartup[] = [
  {
    id: "demo-carbonprint",
    name: "CarbonPrint",
    tagline: "AI-powered carbon footprint tracking for enterprise supply chains",
    category: "Climate Tech",
    stage: "Pre-seed",
    founders: [
      { name: "Maya Rodriguez", role: "CEO", background: "Ex-McKinsey sustainability practice" },
      { name: "James Liu", role: "CTO", background: "ML lead at Google Cloud" },
    ],
    fundabilityScore: 82,
    status: "demo-ready",
    sectionScores: {
      problem: 88,
      solution: 85,
      market: 78,
      competition: 72,
      team: 92,
      businessModel: 80,
      traction: 75,
      vision: 85,
    },
    topConcerns: ["Enterprise sales cycle length", "Regulatory dependency"],
    topStrengths: ["Strong founder-market fit", "Clear technical moat", "Early Fortune 500 pilot"],
    mentorFocus: "Enterprise sales strategy and pricing optimization",
    lastUpdated: "2024-02-10",
    weeklyProgress: 5,
  },
  {
    id: "demo-healthsync",
    name: "HealthSync",
    tagline: "Patient data interoperability platform for healthcare providers",
    category: "Healthcare",
    stage: "Pre-seed",
    founders: [
      { name: "Dr. Priya Sharma", role: "CEO", background: "Former CMO at regional health system" },
      { name: "Kevin Park", role: "CTO", background: "FHIR standards committee member" },
    ],
    fundabilityScore: 76,
    status: "on-track",
    sectionScores: {
      problem: 90,
      solution: 78,
      market: 85,
      competition: 65,
      team: 88,
      businessModel: 70,
      traction: 68,
      vision: 75,
    },
    topConcerns: ["HIPAA compliance complexity", "Long healthcare sales cycles", "Competitive landscape"],
    topStrengths: ["Deep domain expertise", "Clear regulatory pathway", "3 LOIs from hospital systems"],
    mentorFocus: "Competitive differentiation and go-to-market strategy",
    lastUpdated: "2024-02-09",
    weeklyProgress: 3,
  },
  {
    id: "demo-supplyai",
    name: "SupplyAI",
    tagline: "Predictive inventory management for mid-market retailers",
    category: "Retail Tech",
    stage: "Pre-seed",
    founders: [
      { name: "Tom Anderson", role: "CEO", background: "VP Supply Chain at Target" },
      { name: "Lisa Chen", role: "CTO", background: "ML researcher at Stanford" },
    ],
    fundabilityScore: 71,
    status: "on-track",
    sectionScores: {
      problem: 82,
      solution: 75,
      market: 70,
      competition: 60,
      team: 85,
      businessModel: 72,
      traction: 65,
      vision: 68,
    },
    topConcerns: ["Crowded market", "Integration complexity", "Mid-market price sensitivity"],
    topStrengths: ["Strong operational expertise", "Differentiated ML approach", "2 paid pilots"],
    mentorFocus: "Market positioning and competitive moat",
    lastUpdated: "2024-02-08",
    weeklyProgress: 2,
  },
  {
    id: "demo-eduvr",
    name: "EduVR",
    tagline: "VR-based vocational training for manufacturing workers",
    category: "EdTech",
    stage: "Pre-seed",
    founders: [
      { name: "Marcus Johnson", role: "CEO", background: "Former L&D director at Boeing" },
      { name: "Sarah Kim", role: "CTO", background: "Unity game developer, 10 years XR" },
    ],
    fundabilityScore: 68,
    status: "needs-work",
    sectionScores: {
      problem: 85,
      solution: 72,
      market: 65,
      competition: 58,
      team: 78,
      businessModel: 62,
      traction: 55,
      vision: 70,
    },
    topConcerns: ["Hardware dependency", "Enterprise budget cycles", "Content production costs"],
    topStrengths: ["Clear pain point validation", "Strong industry connections", "Working prototype"],
    mentorFocus: "Unit economics and hardware-independent strategy",
    lastUpdated: "2024-02-07",
    weeklyProgress: -1,
  },
  {
    id: "demo-legalflow",
    name: "LegalFlow",
    tagline: "AI contract review for SMB legal teams",
    category: "LegalTech",
    stage: "Pre-seed",
    founders: [
      { name: "Amanda Foster", role: "CEO", background: "Corporate attorney, 8 years BigLaw" },
      { name: "Raj Patel", role: "CTO", background: "NLP engineer at OpenAI" },
    ],
    fundabilityScore: 79,
    status: "demo-ready",
    sectionScores: {
      problem: 88,
      solution: 82,
      market: 75,
      competition: 70,
      team: 90,
      businessModel: 78,
      traction: 72,
      vision: 80,
    },
    topConcerns: ["AI accuracy liability", "Professional services resistance"],
    topStrengths: ["Exceptional team credibility", "Clear ROI messaging", "$15K MRR"],
    mentorFocus: "Scaling customer acquisition and AI governance positioning",
    lastUpdated: "2024-02-10",
    weeklyProgress: 4,
  },
  {
    id: "demo-farmwise",
    name: "FarmWise",
    tagline: "Precision agriculture sensors for small-scale farmers",
    category: "AgTech",
    stage: "Pre-seed",
    founders: [
      { name: "Carlos Mendez", role: "CEO", background: "Third-generation farmer, MBA Stanford" },
      { name: "Emily Zhang", role: "CTO", background: "IoT engineer at John Deere" },
    ],
    fundabilityScore: 58,
    status: "needs-work",
    sectionScores: {
      problem: 80,
      solution: 65,
      market: 55,
      competition: 50,
      team: 72,
      businessModel: 48,
      traction: 45,
      vision: 62,
    },
    topConcerns: ["Hardware margins", "Rural connectivity", "Seasonality", "Distribution challenges"],
    topStrengths: ["Authentic founder-market fit", "Deep customer empathy", "Working hardware"],
    mentorFocus: "Business model pivot to SaaS or partnership strategy",
    lastUpdated: "2024-02-06",
    weeklyProgress: -2,
  },
  {
    id: "demo-securenet",
    name: "SecureNet",
    tagline: "Zero-trust network security for remote-first companies",
    category: "Cybersecurity",
    stage: "Pre-seed",
    founders: [
      { name: "David Chen", role: "CEO", background: "Security architect at Cloudflare" },
      { name: "Nina Volkov", role: "CTO", background: "NSA cybersecurity analyst" },
    ],
    fundabilityScore: 74,
    status: "on-track",
    sectionScores: {
      problem: 85,
      solution: 78,
      market: 80,
      competition: 62,
      team: 88,
      businessModel: 70,
      traction: 62,
      vision: 72,
    },
    topConcerns: ["Crowded cybersecurity market", "Enterprise procurement hurdles"],
    topStrengths: ["Strong technical credentials", "Clear differentiation", "SOC2 certified"],
    mentorFocus: "Positioning against incumbents and channel partnerships",
    lastUpdated: "2024-02-09",
    weeklyProgress: 1,
  },
  {
    id: "demo-proptech",
    name: "SpaceMatch",
    tagline: "AI-powered commercial real estate matching for startups",
    category: "PropTech",
    stage: "Pre-seed",
    founders: [
      { name: "Jennifer Wu", role: "CEO", background: "Commercial broker, 12 years" },
      { name: "Alex Thompson", role: "CTO", background: "Engineering lead at Zillow" },
    ],
    fundabilityScore: 62,
    status: "needs-work",
    sectionScores: {
      problem: 72,
      solution: 68,
      market: 60,
      competition: 55,
      team: 75,
      businessModel: 58,
      traction: 50,
      vision: 60,
    },
    topConcerns: ["Market timing (remote work)", "Low switching costs", "Revenue model clarity"],
    topStrengths: ["Deep industry relationships", "Good product intuition"],
    mentorFocus: "Market validation and pivot exploration",
    lastUpdated: "2024-02-05",
    weeklyProgress: 0,
  },
  {
    id: "demo-finbot",
    name: "FinBot",
    tagline: "Conversational AI for personal finance management",
    category: "FinTech",
    stage: "Pre-seed",
    founders: [
      { name: "Michael Brown", role: "CEO", background: "Product manager at Robinhood" },
      { name: "Sophia Lee", role: "CTO", background: "Conversational AI at Amazon Alexa" },
    ],
    fundabilityScore: 85,
    status: "demo-ready",
    sectionScores: {
      problem: 82,
      solution: 88,
      market: 85,
      competition: 75,
      team: 90,
      businessModel: 82,
      traction: 80,
      vision: 88,
    },
    topConcerns: ["Regulatory compliance", "Customer acquisition costs"],
    topStrengths: ["Strong product-market signals", "Viral growth loops", "$25K MRR", "50K waitlist"],
    mentorFocus: "Regulatory strategy and Series A positioning",
    lastUpdated: "2024-02-10",
    weeklyProgress: 6,
  },
  {
    id: "demo-wasteless",
    name: "Wasteless",
    tagline: "B2B food waste reduction for restaurant chains",
    category: "Climate Tech",
    stage: "Pre-seed",
    founders: [
      { name: "Hannah Green", role: "CEO", background: "Sustainability consultant, ex-Deloitte" },
      { name: "Omar Hassan", role: "CTO", background: "Full-stack developer, 2x founder" },
    ],
    fundabilityScore: 45,
    status: "at-risk",
    sectionScores: {
      problem: 75,
      solution: 50,
      market: 45,
      competition: 40,
      team: 58,
      businessModel: 35,
      traction: 30,
      vision: 55,
    },
    topConcerns: ["Unclear value proposition", "No paying customers", "Weak competitive position", "Team gaps"],
    topStrengths: ["Important mission", "Founder passion"],
    mentorFocus: "Fundamental business model rethink or pivot decision",
    lastUpdated: "2024-02-04",
    weeklyProgress: -5,
  },
];

export const getStartupById = (id: string): DemoStartup | undefined => {
  return DEMO_STARTUPS.find(startup => startup.id === id);
};

export const getStartupsByStatus = (status: DemoStartup["status"]): DemoStartup[] => {
  return DEMO_STARTUPS.filter(startup => startup.status === status);
};

export const getCohortStats = () => {
  const avgScore = Math.round(
    DEMO_STARTUPS.reduce((sum, s) => sum + s.fundabilityScore, 0) / DEMO_STARTUPS.length
  );
  
  return {
    totalStartups: DEMO_STARTUPS.length,
    avgFundabilityScore: avgScore,
    demoReady: DEMO_STARTUPS.filter(s => s.status === "demo-ready").length,
    onTrack: DEMO_STARTUPS.filter(s => s.status === "on-track").length,
    needsWork: DEMO_STARTUPS.filter(s => s.status === "needs-work").length,
    atRisk: DEMO_STARTUPS.filter(s => s.status === "at-risk").length,
  };
};
