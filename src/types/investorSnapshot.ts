export type InvestorStage = "Pre-Seed" | "Seed" | "Series A" | "Series B" | "Later" | "Unknown";

export interface InvestorSnapshotRevenue {
  is_pre_revenue: boolean;
  amount: number | null;
  metric: string; // e.g. MRR|ARR|Revenue|GMV|Unknown
  currency: string | null;
}

export interface InvestorSnapshotAsk {
  amount: number | null;
  currency: string | null;
  round_type: string; // e.g. Pre-Seed|Seed|Series A|Unknown
}

export interface InvestorSnapshotTags {
  stage: string;
  sector: string;
  geography: string | null;
  revenue: InvestorSnapshotRevenue;
  ask: InvestorSnapshotAsk;
  traction_tags: string[];
}

export interface InvestorSnapshotDealQuality {
  score_0_100: number;
  verdict: string;
}

export interface InvestorSnapshot {
  company_name: string;
  tagline: string;
  deal_quality: InvestorSnapshotDealQuality;
  debrief: string;
  tags: InvestorSnapshotTags;
  key_strengths?: string[];
  key_risks?: string[];
}
