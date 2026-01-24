import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AcceleratorCompany {
  id: string;
  name: string;
  category: string | null;
  stage: string;
  public_score: number | null;
  memo_content_generated: boolean;
  created_at: string;
  cohort_name: string | null;
  sectionScores: Record<string, number>;
}

export interface CohortStats {
  totalStartups: number;
  withReports: number;
  avgScore: number;
  demoReady: number;
  onTrack: number;
  needsWork: number;
  atRisk: number;
}

const SECTION_LABELS: Record<string, string> = {
  problem: "Problem",
  solution: "Solution",
  market: "Market",
  competition: "Competition",
  team: "Team",
  businessModel: "Biz Model",
  traction: "Traction",
  vision: "Vision"
};

export function useAcceleratorCompanies(acceleratorId: string | undefined) {
  return useQuery({
    queryKey: ["accelerator-companies", acceleratorId],
    queryFn: async (): Promise<AcceleratorCompany[]> => {
      if (!acceleratorId) return [];

      // Get cohorts for this accelerator
      const { data: cohorts } = await supabase
        .from("accelerator_cohorts")
        .select("id, name, invite_id")
        .eq("accelerator_id", acceleratorId);

      // Get all invites linked to this accelerator (not just through cohorts)
      const { data: allInvites } = await supabase
        .from("accelerator_invites")
        .select("id")
        .eq("linked_accelerator_id", acceleratorId);

      // Collect invite IDs from both cohorts and direct accelerator invites
      const cohortInviteIds = (cohorts || [])
        .filter(c => c.invite_id)
        .map(c => c.invite_id) as string[];
      const directInviteIds = (allInvites || []).map(inv => inv.id);
      
      // Combine and deduplicate
      const inviteIds = [...new Set([...cohortInviteIds, ...directInviteIds])];

      if (inviteIds.length === 0) return [];

      // Get companies linked to these invites
      const { data: companies } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          category,
          stage,
          public_score,
          memo_content_generated,
          created_at,
          accelerator_invite_id
        `)
        .in("accelerator_invite_id", inviteIds);

      if (!companies || companies.length === 0) return [];

      // Get section scores for all companies
      const companyIds = companies.map(c => c.id);
      const { data: toolData } = await supabase
        .from("memo_tool_data")
        .select("company_id, section_name, ai_generated_data, user_overrides")
        .in("company_id", companyIds)
        .eq("tool_name", "sectionScore");

      // Create a map of company scores
      const scoreMap: Record<string, Record<string, number>> = {};
      toolData?.forEach(tool => {
        if (!scoreMap[tool.company_id]) {
          scoreMap[tool.company_id] = {};
        }
        const data = { ...(tool.ai_generated_data as any || {}), ...(tool.user_overrides as any || {}) };
        if (data.score) {
          scoreMap[tool.company_id][tool.section_name] = data.score;
        }
      });

      // Map cohort names
      const inviteToCohort: Record<string, string> = {};
      cohorts.forEach(c => {
        if (c.invite_id) {
          inviteToCohort[c.invite_id] = c.name;
        }
      });

      return companies.map(company => ({
        id: company.id,
        name: company.name,
        category: company.category,
        stage: company.stage,
        public_score: company.public_score,
        memo_content_generated: company.memo_content_generated || false,
        created_at: company.created_at,
        cohort_name: company.accelerator_invite_id 
          ? inviteToCohort[company.accelerator_invite_id] || null 
          : null,
        sectionScores: scoreMap[company.id] || {}
      }));
    },
    enabled: !!acceleratorId
  });
}

export function getCohortStats(companies: AcceleratorCompany[]): CohortStats {
  const withReports = companies.filter(c => c.memo_content_generated);
  const scores = companies.filter(c => c.public_score).map(c => c.public_score!);
  
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) 
    : 0;

  return {
    totalStartups: companies.length,
    withReports: withReports.length,
    avgScore,
    demoReady: scores.filter(s => s >= 75).length,
    onTrack: scores.filter(s => s >= 60 && s < 75).length,
    needsWork: scores.filter(s => s >= 45 && s < 60).length,
    atRisk: scores.filter(s => s < 45).length
  };
}

export function getSectionAverages(companies: AcceleratorCompany[]) {
  const sections = Object.keys(SECTION_LABELS);
  
  return sections.map(section => {
    const scores = companies
      .map(c => c.sectionScores[section])
      .filter(s => s !== undefined && s !== null);
    
    const avg = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;
    
    return {
      section: SECTION_LABELS[section],
      sectionKey: section,
      average: avg,
      fullMark: 100,
      count: scores.length
    };
  });
}

export function getScoreDistribution(companies: AcceleratorCompany[]) {
  const scores = companies.filter(c => c.public_score).map(c => c.public_score!);
  
  return [
    { range: "0-40", count: scores.filter(s => s < 40).length, color: "hsl(var(--destructive))" },
    { range: "40-60", count: scores.filter(s => s >= 40 && s < 60).length, color: "hsl(var(--warning))" },
    { range: "60-75", count: scores.filter(s => s >= 60 && s < 75).length, color: "hsl(var(--primary))" },
    { range: "75-100", count: scores.filter(s => s >= 75).length, color: "hsl(var(--success))" },
  ];
}

export function getWeakestAndStrongestSections(companies: AcceleratorCompany[]) {
  const averages = getSectionAverages(companies).filter(s => s.count > 0);
  
  if (averages.length === 0) {
    return { weakest: null, strongest: null };
  }
  
  const sorted = [...averages].sort((a, b) => a.average - b.average);
  
  return {
    weakest: sorted[0],
    strongest: sorted[sorted.length - 1]
  };
}

export { SECTION_LABELS };
