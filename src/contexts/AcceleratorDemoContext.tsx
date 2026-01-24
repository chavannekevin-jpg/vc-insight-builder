import { createContext, useContext, ReactNode } from "react";
import { DEMO_STARTUPS, DemoStartup, getCohortStats } from "@/data/acceleratorDemo/demoStartups";
import { DEMO_ACCELERATOR } from "@/data/acceleratorDemo/acceleratorProfile";

// Production-compatible interfaces
interface Company {
  id: string;
  name: string;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  created_at: string;
}

interface Cohort {
  id: string;
  name: string;
  invite_id: string | null;
  start_date: string | null;
  end_date: string | null;
  demo_day_date: string | null;
  is_active: boolean;
  company_count?: number;
}

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  focus_areas: string[] | null;
  demo_day_date: string | null;
  program_length_weeks: number | null;
  cohort_size_target: number | null;
  website_url: string | null;
}

interface AcceleratorDemoContextValue {
  accelerator: Accelerator;
  cohorts: Cohort[];
  companies: Company[];
  stats: {
    totalStartups: number;
    withReports: number;
    avgScore: number;
    activeCohorts: number;
  };
  // Original demo data for specialized views
  demoStartups: DemoStartup[];
  isDemo: true;
}

const AcceleratorDemoContext = createContext<AcceleratorDemoContextValue | null>(null);

// Convert DEMO_STARTUPS to production Company interface
function mapDemoStartupsToCompanies(startups: DemoStartup[]): Company[] {
  return startups.map((startup) => ({
    id: startup.id,
    name: startup.name,
    category: startup.category,
    stage: startup.stage,
    public_score: startup.fundabilityScore,
    memo_content_generated: true, // All demo startups have "generated" reports
    created_at: startup.lastUpdated,
  }));
}

// Create demo cohorts that match production interface
function createDemoCohorts(): Cohort[] {
  const cohortStats = getCohortStats();
  return [
    {
      id: "demo-cohort-spring-2025",
      name: DEMO_ACCELERATOR.batchName,
      invite_id: "demo-invite-1",
      start_date: "2025-01-15",
      end_date: "2025-04-15",
      demo_day_date: "2025-04-15",
      is_active: true,
      company_count: cohortStats.totalStartups,
    },
    {
      id: "demo-cohort-fall-2024",
      name: "Batch 2 - Fall 2024",
      invite_id: "demo-invite-2",
      start_date: "2024-09-01",
      end_date: "2024-12-01",
      demo_day_date: "2024-12-01",
      is_active: false,
      company_count: 8,
    },
  ];
}

// Create demo accelerator that matches production interface
function createDemoAccelerator(): Accelerator {
  return {
    id: DEMO_ACCELERATOR.id,
    name: DEMO_ACCELERATOR.name,
    slug: "ugly-baby-foundry",
    description: DEMO_ACCELERATOR.description,
    focus_areas: DEMO_ACCELERATOR.focus,
    demo_day_date: "2025-04-15",
    program_length_weeks: 12,
    cohort_size_target: 10,
    website_url: "https://uglybaby.com",
  };
}

export function AcceleratorDemoProvider({ children }: { children: ReactNode }) {
  const companies = mapDemoStartupsToCompanies(DEMO_STARTUPS);
  const cohorts = createDemoCohorts();
  const accelerator = createDemoAccelerator();
  const cohortStats = getCohortStats();

  const stats = {
    totalStartups: cohortStats.totalStartups,
    withReports: cohortStats.totalStartups, // All demo startups have reports
    avgScore: cohortStats.avgFundabilityScore,
    activeCohorts: cohorts.filter((c) => c.is_active).length,
  };

  const value: AcceleratorDemoContextValue = {
    accelerator,
    cohorts,
    companies,
    stats,
    demoStartups: DEMO_STARTUPS,
    isDemo: true,
  };

  return (
    <AcceleratorDemoContext.Provider value={value}>
      {children}
    </AcceleratorDemoContext.Provider>
  );
}

export function useAcceleratorDemo() {
  const context = useContext(AcceleratorDemoContext);
  if (!context) {
    throw new Error("useAcceleratorDemo must be used within AcceleratorDemoProvider");
  }
  return context;
}

export type { Company, Cohort, Accelerator, AcceleratorDemoContextValue };
