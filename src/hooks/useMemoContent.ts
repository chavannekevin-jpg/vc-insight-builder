import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemoStructuredContent, EnhancedSectionTools } from "@/types/memo";
import { sanitizeMemoContent, safeTitle } from "@/lib/stringUtils";
import { 
  extractAnchoredAssumptions, 
  detectCurrencyFromResponses, 
  getAIMetricEstimate, 
  applyAIEstimate, 
  getFallbackMetricValue,
  type AnchoredAssumptions 
} from "@/lib/anchoredAssumptions";

export interface MemoContentData {
  memoContent: MemoStructuredContent | null;
  companyInfo: any | null;
  hasPremium: boolean;
  sectionTools: Record<string, EnhancedSectionTools>;
  memoResponses: Record<string, string>;
  anchoredAssumptions: AnchoredAssumptions | null;
  holisticVerdicts: Record<string, { verdict: string; stageContext?: string }>;
  holisticStage: any | null;
}

// Helper to find section tools with flexible matching
export const findSectionTools = (
  sectionTitle: string, 
  tools: Record<string, EnhancedSectionTools>
): EnhancedSectionTools => {
  // Direct match first
  if (tools[sectionTitle]) return tools[sectionTitle];
  
  // Try normalized title
  const normalized = safeTitle(sectionTitle).toLowerCase();
  const key = Object.keys(tools).find(k => {
    const normalizedKey = safeTitle(k).toLowerCase();
    return normalizedKey === normalized ||
           k.toLowerCase().includes(normalized) ||
           normalized.includes(k.toLowerCase());
  });
  
  if (!key && Object.keys(tools).length > 0) {
    console.warn(`[useMemoContent] No tools found for section: "${sectionTitle}". Available: ${Object.keys(tools).join(', ')}`);
  }
  
  return key ? tools[key] : {};
};

async function fetchMemoContent(companyId: string): Promise<MemoContentData> {
  console.log('[useMemoContent] Fetching memo content for company:', companyId);
  
  // Fetch all data in parallel for maximum speed
  const [
    companyResult,
    memoResult,
    toolDataResult,
    responsesResult,
    companyModelResult
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle(),
    supabase
      .from("memos")
      .select("structured_content")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("memo_tool_data")
      .select("*")
      .eq("company_id", companyId),
    supabase
      .from("memo_responses")
      .select("question_key, answer")
      .eq("company_id", companyId),
    supabase
      .from("company_models")
      .select("model_data")
      .eq("company_id", companyId)
      .maybeSingle()
  ]);

  const companyData = companyResult.data;
  const hasPremium = companyData?.has_premium || false;
  
  // Process memo content
  const memoContent = memoResult.data?.structured_content 
    ? sanitizeMemoContent(memoResult.data.structured_content)
    : null;

  // Process responses into a map
  const responsesMap: Record<string, string> = {};
  (responsesResult.data || []).forEach(r => {
    if (r.answer) responsesMap[r.question_key] = r.answer;
  });

  // Extract holistic stage from company model
  let holisticStage = null;
  if (companyModelResult.data?.model_data) {
    const modelData = companyModelResult.data.model_data as any;
    if (modelData.holisticStage) {
      holisticStage = modelData.holisticStage;
    }
  }

  // Process tool data
  const toolsMap: Record<string, EnhancedSectionTools> = {};
  const verdictsMap: Record<string, { verdict: string; stageContext?: string }> = {};
  
  if (toolDataResult.data && toolDataResult.data.length > 0) {
    toolDataResult.data.forEach((tool) => {
      const sectionName = tool.section_name;
      
      // Extract holistic verdicts separately - check both possible keys
      if (tool.tool_name === 'holisticVerdict') {
        const aiData = tool.ai_generated_data as Record<string, any> || {};
        // Check both 'holisticVerdict' and 'verdict' keys (legacy support)
        const verdictText = aiData.holisticVerdict || aiData.verdict;
        if (verdictText) {
          verdictsMap[sectionName] = {
            verdict: verdictText,
            stageContext: aiData.stageContext
          };
        }
        return;
      }
      
      if (!toolsMap[sectionName]) {
        toolsMap[sectionName] = {};
      }
      
      let aiData = tool.ai_generated_data as Record<string, any> || {};
      const userOverrides = tool.user_overrides as Record<string, any> || {};
      
      // CRITICAL: Unwrap double-wrapped data from AI hallucination
      if (aiData.aiGenerated !== undefined && typeof aiData.aiGenerated === 'object') {
        console.log(`[useMemoContent] Unwrapping double-wrapped data for ${tool.tool_name}`);
        aiData = aiData.aiGenerated;
      }
      
      const directMergeTools = ["sectionScore", "benchmarks", "caseStudy", "vcInvestmentLogic", "actionPlan90Day", "leadInvestorRequirements"];
      
      if (directMergeTools.includes(tool.tool_name)) {
        (toolsMap[sectionName] as any)[tool.tool_name] = {
          ...aiData,
          ...userOverrides,
          dataSource: tool.data_source || "ai-complete"
        };
      } else {
        (toolsMap[sectionName] as any)[tool.tool_name] = {
          aiGenerated: aiData,
          userOverrides: userOverrides,
          dataSource: tool.data_source || "ai-complete"
        };
      }
    });
  }

  // Extract anchored assumptions with AI estimation
  let anchoredAssumptions: AnchoredAssumptions | null = null;
  if (Object.keys(responsesMap).length > 0) {
    const currency = detectCurrencyFromResponses(responsesMap);
    let assumptions = extractAnchoredAssumptions(
      companyModelResult.data?.model_data as any || null,
      responsesMap,
      currency,
      { category: companyData?.category, stage: companyData?.stage, name: companyData?.name }
    );
    
    // AI estimation if no primary metric value
    if (assumptions.primaryMetricValue === null && companyData) {
      try {
        const estimate = await getAIMetricEstimate(assumptions, {
          name: companyData.name,
          category: companyData.category,
          stage: companyData.stage
        }, responsesMap);
        if (estimate) {
          assumptions = applyAIEstimate(assumptions, estimate);
        }
      } catch (e) {
        console.error('[useMemoContent] AI estimation failed, using fallback:', e);
        const fallback = getFallbackMetricValue(assumptions, companyData?.stage || 'seed');
        assumptions = { ...assumptions, primaryMetricValue: fallback, source: 'ai_estimated' };
      }
    }
    anchoredAssumptions = assumptions;
  }

  console.log('[useMemoContent] Memo content loaded successfully');

  return {
    memoContent,
    companyInfo: companyData,
    hasPremium,
    sectionTools: toolsMap,
    memoResponses: responsesMap,
    anchoredAssumptions,
    holisticVerdicts: verdictsMap,
    holisticStage
  };
}

export function useMemoContent(companyId: string | null | undefined) {
  return useQuery({
    queryKey: ["memo-content", companyId],
    queryFn: () => fetchMemoContent(companyId!),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 10, // 10 minutes - memo rarely changes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });
}

// Hook for prefetching memo content
export function usePrefetchMemoContent() {
  const queryClient = useQueryClient();
  
  return (companyId: string) => {
    return queryClient.prefetchQuery({
      queryKey: ["memo-content", companyId],
      queryFn: () => fetchMemoContent(companyId),
      staleTime: 1000 * 60 * 10,
    });
  };
}

// Hook for invalidating memo cache (after regeneration, smart fill, etc.)
export function useInvalidateMemoContent() {
  const queryClient = useQueryClient();
  
  return (companyId: string) => {
    return queryClient.invalidateQueries({
      queryKey: ["memo-content", companyId],
    });
  };
}
