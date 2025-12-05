import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated data criteria for new merged questions
const dataCriteria = {
  // Qualitative data (from questionnaire)
  qualitative: {
    problem: {
      keys: ['problem_core', 'problem_description', 'problem_validation'], // Include legacy keys for backwards compat
      weight: 10,
      label: 'Problem Definition'
    },
    solution: {
      keys: ['solution_core', 'solution_description', 'solution_demo'],
      weight: 10,
      label: 'Solution Clarity'
    },
    market: {
      keys: ['target_customer', 'market_size', 'market_timing'],
      weight: 12,
      label: 'Market Understanding'
    },
    competition: {
      keys: ['competitive_moat', 'competitors', 'competitive_advantage'],
      weight: 8,
      label: 'Competitive Landscape'
    },
    team: {
      keys: ['team_story', 'founder_background', 'team_composition'],
      weight: 10,
      label: 'Team Credentials'
    }
  },
  // Momentum data (CRITICAL for VC assessment)
  momentum: {
    unit_economics: {
      keys: ['unit_economics', 'unit_economics_cac', 'unit_economics_ltv', 'unit_economics_margins'],
      weight: 15,
      label: 'Unit Economics',
      vcImportance: 'VCs won\'t invest without understanding your CAC/LTV ratio'
    },
    revenue: {
      keys: ['business_model', 'revenue_model', 'pricing_model', 'average_deal_size'],
      weight: 12,
      label: 'Revenue Model',
      vcImportance: 'How you make money is non-negotiable information'
    },
    growth: {
      keys: ['traction_proof', 'current_traction', 'growth_rate', 'mrr_arr'],
      weight: 15,
      label: 'Growth Metrics',
      vcImportance: 'Traction proves you\'re not just a slideshow'
    },
    vision: {
      keys: ['vision_ask', 'key_milestones', 'funding_ask'],
      weight: 8,
      label: 'Vision & Ask',
      vcImportance: 'Clear use of funds shows operational maturity'
    }
  }
};

function analyzeDataCompleteness(responses: Record<string, string>) {
  const analysis = {
    qualitative: {} as Record<string, { coverage: number; filled: string[]; missing: string[] }>,
    momentum: {} as Record<string, { coverage: number; filled: string[]; missing: string[]; vcImportance: string }>,
    scores: {
      qualitativeScore: 0,
      momentumScore: 0,
      totalScore: 0,
      memoReadiness: 0
    },
    criticalGaps: [] as { category: string; label: string; keys: string[]; vcImportance: string }[],
    filledData: {} as Record<string, string>
  };

  let qualitativePoints = 0;
  let qualitativeMaxPoints = 0;
  let momentumPoints = 0;
  let momentumMaxPoints = 0;

  // Analyze qualitative data - count as filled if ANY key in the group has data
  for (const [category, config] of Object.entries(dataCriteria.qualitative)) {
    const filledKeys = config.keys.filter(key => responses[key]?.trim());
    const hasData = filledKeys.length > 0;
    
    // For merged questions, we only need ONE answer (either new or legacy)
    const coverage = hasData ? 1 : 0;
    
    analysis.qualitative[category] = { 
      coverage, 
      filled: filledKeys, 
      missing: hasData ? [] : [config.keys[0]] // Only show new key as missing
    };
    
    qualitativePoints += coverage * config.weight;
    qualitativeMaxPoints += config.weight;
    
    // Store filled data for context
    filledKeys.forEach(key => {
      if (responses[key]) {
        analysis.filledData[key] = responses[key];
      }
    });
  }

  // Analyze momentum data (CRITICAL)
  for (const [category, config] of Object.entries(dataCriteria.momentum)) {
    const filledKeys = config.keys.filter(key => responses[key]?.trim());
    const hasData = filledKeys.length > 0;
    const coverage = hasData ? 1 : 0;
    
    analysis.momentum[category] = { 
      coverage, 
      filled: filledKeys, 
      missing: hasData ? [] : [config.keys[0]],
      vcImportance: config.vcImportance 
    };
    
    momentumPoints += coverage * config.weight;
    momentumMaxPoints += config.weight;
    
    // Track critical gaps (momentum data with no coverage)
    if (!hasData) {
      analysis.criticalGaps.push({
        category,
        label: config.label,
        keys: [config.keys[0]],
        vcImportance: config.vcImportance
      });
    }
    
    // Store filled data for context
    filledKeys.forEach(key => {
      if (responses[key]) {
        analysis.filledData[key] = responses[key];
      }
    });
  }

  // Calculate scores
  analysis.scores.qualitativeScore = Math.round((qualitativePoints / qualitativeMaxPoints) * 100);
  analysis.scores.momentumScore = Math.round((momentumPoints / momentumMaxPoints) * 100);
  
  // Memo readiness: 40% qualitative, 60% momentum (momentum matters more for VC)
  analysis.scores.memoReadiness = Math.round(
    (analysis.scores.qualitativeScore * 0.4) + (analysis.scores.momentumScore * 0.6)
  );
  
  analysis.scores.totalScore = Math.round(
    ((qualitativePoints + momentumPoints) / (qualitativeMaxPoints + momentumMaxPoints)) * 100
  );

  return analysis;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();
    
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    console.log('Analyzing data gaps for company:', companyId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all memo responses for the company
    const { data: memoResponses, error: responsesError } = await supabase
      .from('memo_responses')
      .select('question_key, answer')
      .eq('company_id', companyId);

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    // Convert to a map for easy access
    const responsesMap: Record<string, string> = {};
    (memoResponses || []).forEach((r: any) => {
      if (r.answer) {
        responsesMap[r.question_key] = r.answer;
      }
    });

    // Fetch company info for context
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, description, stage, category')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Could not fetch company info:', companyError);
    }

    // Analyze data completeness
    const analysis = analyzeDataCompleteness(responsesMap);

    console.log('Gap analysis complete:', {
      memoReadiness: analysis.scores.memoReadiness,
      criticalGapsCount: analysis.criticalGaps.length,
      qualitativeScore: analysis.scores.qualitativeScore,
      momentumScore: analysis.scores.momentumScore
    });

    return new Response(JSON.stringify({
      success: true,
      companyId,
      company: company || null,
      analysis,
      recommendation: analysis.scores.memoReadiness >= 60 
        ? 'ready' 
        : analysis.scores.memoReadiness >= 40 
          ? 'needs_input' 
          : 'insufficient_data'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error in analyze-data-gaps:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});