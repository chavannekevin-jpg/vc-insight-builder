// =============================================================================
// BUILD COMPANY MODEL EDGE FUNCTION
// Constructs a structured CompanyModel from user responses
// Enables relational reasoning across all company dimensions
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCompanyModel } from './model-builder.ts';
import type { BuildCompanyModelRequest, BuildCompanyModelResponse, CompanyModel } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { companyId, forceRebuild = false }: BuildCompanyModelRequest = await req.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({ success: false, model: null, warnings: [], errors: ['companyId is required'] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[build-company-model] Building model for company: ${companyId}, forceRebuild: ${forceRebuild}`);

    // Check for cached model if not forcing rebuild
    if (!forceRebuild) {
      const { data: cachedModel } = await supabase
        .from('company_models')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedModel) {
        // Check if responses have been updated since model was built
        const { data: latestResponse } = await supabase
          .from('memo_responses')
          .select('updated_at')
          .eq('company_id', companyId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        const modelBuiltAt = new Date(cachedModel.created_at);
        const responsesUpdatedAt = latestResponse ? new Date(latestResponse.updated_at) : new Date(0);

        if (modelBuiltAt > responsesUpdatedAt) {
          console.log(`[build-company-model] Using cached model (built: ${modelBuiltAt.toISOString()})`);
          return new Response(
            JSON.stringify({
              success: true,
              model: cachedModel.model_data as CompanyModel,
              warnings: ['Using cached model'],
              errors: [],
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Fetch company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, stage, category, description')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('[build-company-model] Company not found:', companyError);
      return new Response(
        JSON.stringify({ success: false, model: null, warnings: [], errors: ['Company not found'] }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all responses for this company
    const { data: responses, error: responsesError } = await supabase
      .from('memo_responses')
      .select('question_key, answer')
      .eq('company_id', companyId);

    if (responsesError) {
      console.error('[build-company-model] Error fetching responses:', responsesError);
      return new Response(
        JSON.stringify({ success: false, model: null, warnings: [], errors: ['Failed to fetch responses'] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert responses array to map
    const responsesMap: Record<string, string> = {};
    responses?.forEach(r => {
      if (r.answer) {
        responsesMap[r.question_key] = r.answer;
      }
    });

    console.log(`[build-company-model] Found ${Object.keys(responsesMap).length} responses`);

    // Build the company model
    const warnings: string[] = [];
    
    // Check for missing critical responses
    const criticalKeys = ['problem_core', 'solution_core', 'target_customer', 'traction_proof', 'team_story', 'business_model'];
    const missingKeys = criticalKeys.filter(k => !responsesMap[k] || responsesMap[k].length < 50);
    
    if (missingKeys.length > 0) {
      warnings.push(`Missing or incomplete responses for: ${missingKeys.join(', ')}`);
    }

    const model = buildCompanyModel(
      companyId,
      company.name,
      company.stage,
      company.category,
      company.description,
      responsesMap
    );

    console.log(`[build-company-model] Model built successfully. Coherence: ${model.coherence.overallCoherence} (${model.coherence.score}/100)`);
    console.log(`[build-company-model] Discrepancies found: ${model.discrepancies.length}`);

    // Add warnings for high-severity discrepancies
    model.discrepancies
      .filter(d => d.severity === 'high' || d.severity === 'critical')
      .forEach(d => warnings.push(`Discrepancy: ${d.explanation.substring(0, 100)}...`));

    // Save the model to database
    const { error: saveError } = await supabase
      .from('company_models')
      .upsert({
        company_id: companyId,
        model_data: model,
        coherence_score: model.coherence.score,
        discrepancy_count: model.discrepancies.length,
        version: model.version,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id',
      });

    if (saveError) {
      console.error('[build-company-model] Error saving model:', saveError);
      warnings.push('Failed to cache model for future use');
    }

    const response: BuildCompanyModelResponse = {
      success: true,
      model,
      warnings,
      errors: [],
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[build-company-model] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        model: null,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
