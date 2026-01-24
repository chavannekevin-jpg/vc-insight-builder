export const DEMO_ACCELERATOR = {
  id: "demo-ugly-baby-foundry",
  name: "Ugly Baby's Foundry",
  batchName: "Batch 3 - Spring 2025",
  description: "A 12-week pre-seed accelerator focused on B2B SaaS, FinTech, and Climate Tech startups",
  programManager: {
    name: "Sarah Chen",
    role: "Program Director",
    avatar: null,
  },
  cohortSize: 10,
  programLength: "12 weeks",
  demoDay: "April 15, 2025",
  currentWeek: 6,
  focus: ["B2B SaaS", "FinTech", "Climate Tech"],
  stats: {
    totalStartups: 10,
    avgFundabilityScore: 70,
    readyForDemoDay: 3,
    onTrack: 3,
    needsWork: 3,
    atRisk: 1,
  },
};

export type AcceleratorProfile = typeof DEMO_ACCELERATOR;
