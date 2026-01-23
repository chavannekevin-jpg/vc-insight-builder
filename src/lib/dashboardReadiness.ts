import { supabase } from "@/integrations/supabase/client";

/**
 * The 8 sections that must have sectionScore tools for the paid dashboard to be ready.
 */
export const REQUIRED_SECTIONS = [
  'Problem', 
  'Solution', 
  'Market', 
  'Competition', 
  'Team', 
  'Business Model', 
  'Traction', 
  'Vision'
] as const;

export interface DashboardReadinessResult {
  isReady: boolean;
  hasMemoContent: boolean;
  hasVcQuickTake: boolean;
  hasArcClassification: boolean;
  sectionScoreCount: number;
  missingSections: string[];
  debug?: {
    existingSections: string[];
    memoId?: string;
  };
}

/**
 * Check if all required data exists for the paid dashboard preview card to render.
 * 
 * Requirements:
 * 1. Memo with structured_content exists
 * 2. vcQuickTake exists in structured_content
 * 3. All 8 sections have sectionScore tools in memo_tool_data
 * 
 * @param companyId - The company ID to check
 * @returns DashboardReadinessResult with detailed status
 */
export async function checkDashboardReadiness(companyId: string): Promise<DashboardReadinessResult> {
  try {
    // 1. Check memos table for structured_content
    const { data: memo, error: memoError } = await supabase
      .from("memos")
      .select("id, structured_content")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (memoError) {
      console.error("[dashboardReadiness] Memo query error:", memoError);
    }
    
    const content = memo?.structured_content as any;
    const hasMemoContent = !!content;
    const hasVcQuickTake = !!content?.vcQuickTake;
    
    // Check for ARC classification (can be in multiple places)
    const hasArcClassification = !!content?.arcClassification || 
      !!(content?.sections && Array.isArray(content.sections) && 
         content.sections.some((s: any) => s?.tools?.arcClassification));
    
    // 2. Check memo_tool_data for all 8 sectionScore rows
    const { data: scoreTools, error: toolsError } = await supabase
      .from("memo_tool_data")
      .select("section_name")
      .eq("company_id", companyId)
      .eq("tool_name", "sectionScore");
    
    if (toolsError) {
      console.error("[dashboardReadiness] Tools query error:", toolsError);
    }
    
    const existingSections = (scoreTools || []).map(t => t.section_name);
    const existingSectionsSet = new Set(existingSections);
    const missingSections = REQUIRED_SECTIONS.filter(s => !existingSectionsSet.has(s));
    const sectionScoreCount = scoreTools?.length || 0;
    
    // 3. Determine overall readiness
    // All conditions must be met:
    // - Memo content exists
    // - VC Quick Take exists (critical for the paid preview card)
    // - All 8 section scores exist
    const isReady = hasMemoContent && 
                    hasVcQuickTake && 
                    sectionScoreCount >= 8 && 
                    missingSections.length === 0;
    
    return {
      isReady,
      hasMemoContent,
      hasVcQuickTake,
      hasArcClassification,
      sectionScoreCount,
      missingSections,
      debug: {
        existingSections,
        memoId: memo?.id
      }
    };
  } catch (error) {
    console.error("[dashboardReadiness] Unexpected error:", error);
    return {
      isReady: false,
      hasMemoContent: false,
      hasVcQuickTake: false,
      hasArcClassification: false,
      sectionScoreCount: 0,
      missingSections: [...REQUIRED_SECTIONS]
    };
  }
}

/**
 * Poll for dashboard readiness with configurable timeout.
 * 
 * @param companyId - The company ID to check
 * @param options - Polling options
 * @returns Promise that resolves when ready or rejects on timeout
 */
export async function waitForDashboardReady(
  companyId: string,
  options: {
    maxAttempts?: number;
    intervalMs?: number;
    onProgress?: (attempt: number, result: DashboardReadinessResult) => void;
  } = {}
): Promise<DashboardReadinessResult> {
  const { 
    maxAttempts = 40, // ~2 minutes at 3s intervals
    intervalMs = 3000,
    onProgress 
  } = options;
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const result = await checkDashboardReadiness(companyId);
    
    if (onProgress) {
      onProgress(attempts + 1, result);
    }
    
    if (result.isReady) {
      return result;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  // Return last result even if not ready
  return checkDashboardReadiness(companyId);
}
