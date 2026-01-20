// Shared "What's Included" data for landing page and VCVerdictCard
// Single source of truth for the 38+ features included in the VC Analysis

export interface IncludedItem {
  name: string;
  tip: string;
}

export interface WhatsIncludedCategory {
  title: string;
  key: string;
  items: IncludedItem[];
}

export const WHATS_INCLUDED_DATA: WhatsIncludedCategory[] = [
  {
    title: "The 9-Page VC Analysis",
    key: "coreAnalysis",
    items: [
      { name: "Your narrative rewritten in VC framing", tip: "VCs have a specific language they use internally. We rewrite your story in their vocabulary so it \"clicks\" immediately in partner meetings." },
      { name: "Investment Readiness Score (8 dimensions)", tip: "See exactly where you stand across Problem, Solution, Market, Competition, Team, Traction, Business Model, and Vision — with scores benchmarked against fundable companies." },
      { name: "VC benchmark comparison per section", tip: "Stop guessing if you're \"good enough.\" See how your answers compare to companies that actually got funded at your stage." },
      { name: "Stage-calibrated verdict & expectations", tip: "Pre-seed expectations ≠ Series A expectations. We calibrate feedback to what VCs actually expect at YOUR stage." },
      { name: "30+ investor questions with prepared answers", tip: "The exact questions VCs will ask in your meeting — with draft answers you can refine and practice." },
      { name: "\"Why VCs ask this\" context for each", tip: "Understanding the intent behind each question helps you give answers that address what they're really evaluating." },
      { name: "Red flags surfaced before your pitch", tip: "Better to discover deal-breakers yourself than have a VC find them. Fix issues before they cost you the meeting." },
      { name: "Holistic cross-section coherence check", tip: "VCs notice when your TAM doesn't match your go-to-market, or your team doesn't match your technical claims. We catch these misalignments." },
      { name: "Prioritized \"fix these first\" action plan", tip: "Not all gaps are equal. We rank what to fix first based on what will move the needle most with investors." },
      { name: "Good vs. bad answer examples", tip: "See side-by-side examples of weak answers vs. strong answers for each question — learn the patterns." },
      { name: "Peer cohort benchmarking (not generic)", tip: "We compare you against companies at your stage, in your sector — not random startups that aren't relevant." },
      { name: "Real case study comparisons", tip: "Learn from companies that succeeded (or failed) with similar positioning — concrete examples, not abstract advice." },
      { name: "VC framing explainers (learn the patterns)", tip: "Understand the mental models VCs use to evaluate deals — power laws, ownership math, pattern matching." },
      { name: "Internal IC meeting simulation", tip: "What happens when the partner presents your deal on Monday? We simulate the internal discussion and objections." },
    ]
  },
  {
    title: "Section Deep-Dives",
    key: "deepDives",
    items: [
      { name: "Problem evidence threshold test", tip: "VCs need proof the problem is real and painful. We check if your evidence is strong enough to pass the \"so what?\" test." },
      { name: "Founder blind spot detection", tip: "Every founder has assumptions they don't question. We surface the ones that could derail your pitch." },
      { name: "Solution technical defensibility score", tip: "How hard would it be for Google or a well-funded competitor to copy this? We assess your technical moat." },
      { name: "Commoditization risk teardown", tip: "Will your solution become a feature in someone else's product? We analyze your long-term differentiation risk." },
      { name: "\"Can competitors build this?\" analysis", tip: "Honest assessment of build vs. buy — will incumbents just add this feature, or is there real defensibility?" },
      { name: "Market readiness index", tip: "Is the market ready for your solution NOW, or are you too early? Timing kills more startups than bad ideas." },
      { name: "VC market narrative framing", tip: "VCs need a compelling \"why now\" and \"why big\" story. We help frame your market the way investors think about it." },
      { name: "Competitor chessboard positioning", tip: "Visualize where you sit vs. competitors across key dimensions — find your defensible corner of the market." },
      { name: "Moat durability assessment", tip: "Is your competitive advantage growing or shrinking over time? We analyze the sustainability of your moat." },
      { name: "Team credibility gap analysis", tip: "What's missing from your team that VCs will immediately notice? Identify and address credibility gaps before they're raised." },
      { name: "Business model stress test", tip: "Can your unit economics actually work at scale? We pressure-test the math behind your business model." },
      { name: "Traction depth & momentum signals", tip: "Vanity metrics vs. real traction — we help you identify and present the metrics that actually matter to VCs." },
    ]
  },
  {
    title: "Premium Tools Suite",
    key: "tools",
    items: [
      { name: "Bottom-up TAM/SAM/SOM calculator", tip: "VCs hate top-down TAM (\"it's a $50B market\"). Build credible bottom-up market sizing they'll actually believe." },
      { name: "Unit economics & CAC payback model", tip: "Know your LTV:CAC ratio, payback period, and contribution margin — the numbers VCs will definitely ask about." },
      { name: "Valuation calculator (real numbers)", tip: "Get realistic valuation ranges based on your stage, traction, and sector — not fantasy numbers that kill deals." },
      { name: "Dilution simulator (SAFE/CLA/Equity)", tip: "See exactly how much you'll own after your raise under different scenarios — SAFE caps, discounts, pro-rata." },
      { name: "Raise calculator (runway planning)", tip: "Calculate how much to raise based on milestones, burn rate, and the runway needed to hit your next stage." },
      { name: "90-day milestone roadmap per section", tip: "Concrete next steps for each section of your pitch — what to achieve in the next 90 days to strengthen your story." },
      { name: "Exit pathway scenario planning", tip: "VCs invest for exits. Model potential acquisition and IPO scenarios to show you understand the end game." },
      { name: "Venture scale diagnostic", tip: "Is your business actually venture-scale? Honest assessment of whether VC is the right funding path for you." },
    ]
  },
  {
    title: "Investor Network Access",
    key: "network",
    items: [
      { name: "800+ curated European investors", tip: "Access our database of 800+ VCs, angels, and family offices actively investing in European startups — curated with verified thesis and ticket sizes." },
      { name: "AI-powered matching by stage & sector", tip: "Our algorithm scores each investor based on your stage, sector, traction, and geography — surface the best-fit investors instantly." },
      { name: "Fund profiles with ticket sizes & thesis", tip: "Detailed profiles for each fund including check sizes, portfolio companies, investment thesis, and partner preferences." },
      { name: "Personalized cold email generator", tip: "AI-generated personalized outreach emails based on each investor's thesis, portfolio, and public statements." },
    ]
  },
  {
    title: "Bonus Access",
    key: "bonus",
    items: [
      { name: "\"Roast Your Baby\" VC Q&A simulation", tip: "Practice answering tough VC questions in a safe environment. Get scored on your responses and improve before real meetings." },
      { name: "60+ VC Brain tactical guides", tip: "Deep-dive guides on everything from term sheets to negotiation tactics to what VCs discuss in partner meetings." },
    ]
  }
];

// Helper to get total feature count
export const getTotalFeatureCount = (): number => {
  return WHATS_INCLUDED_DATA.reduce((total, category) => total + category.items.length, 0);
};
