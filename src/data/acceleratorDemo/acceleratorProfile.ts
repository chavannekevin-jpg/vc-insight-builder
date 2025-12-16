export const DEMO_ACCELERATOR = {
  id: "demo-horizon-ventures",
  name: "Horizon Ventures",
  batchName: "Batch 7 - Spring 2024",
  description: "A 12-week pre-seed accelerator focused on B2B SaaS and climate tech",
  programManager: {
    name: "Sarah Chen",
    role: "Program Director",
    avatar: null,
  },
  cohortSize: 10,
  programLength: "12 weeks",
  demoDay: "March 15, 2024",
  currentWeek: 4,
  focus: ["B2B SaaS", "Climate Tech", "Enterprise AI"],
  stats: {
    totalStartups: 10,
    avgFundabilityScore: 67,
    readyForDemoDay: 3,
    needsWork: 5,
    atRisk: 2,
  },
};

export type AcceleratorProfile = typeof DEMO_ACCELERATOR;
