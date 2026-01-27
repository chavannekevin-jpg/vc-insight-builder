// Profile Enrichment Sync Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Section mapping for enrichments
const SECTION_MAPPING: Record<string, string[]> = {
  'tam_calculator': ['target_customer', 'business_model'],
  'improve_score_problem_core': ['problem_core'],
  'improve_score_solution_core': ['solution_core'],
  'improve_score_target_customer': ['target_customer'],
  'improve_score_competitive_moat': ['competitive_moat'],
  'improve_score_team_story': ['team_story'],
  'improve_score_business_model': ['business_model'],
  'improve_score_traction_proof': ['traction_proof'],
  'improve_score_vision_ask': ['vision_ask'],
  'venture_diagnostic': ['business_model', 'traction_proof'],
  'pain_validator': ['problem_core'],
  'evidence_threshold': ['problem_core'],
  'business_model_stress_test': ['business_model'],
  'moat_durability': ['competitive_moat'],
  'team_credibility': ['team_story'],
  'traction_depth': ['traction_proof'],
};

const SECTION_LABELS: Record<string, string> = {
  'problem_core': 'Problem',
  'solution_core': 'Solution',
  'target_customer': 'Target Customer',
  'competitive_moat': 'Competition',
  'team_story': 'Team',
  'business_model': 'Business Model',
  'traction_proof': 'Traction',
  'vision_ask': 'Vision & Ask',
};

interface Enrichment {
  id: string;
  company_id: string;
  source_type: string;
  source_tool: string | null;
  input_data: Record<string, any>;
  target_section_hint: string | null;
  processed: boolean;
  created_at: string;
}

interface MemoResponse {
  question_key: string;
  answer: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return new Response(
        JSON.stringify({ success: false, error: "Company ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch all unprocessed enrichments for this company
    const { data: enrichments, error: enrichError } = await supabaseClient
      .from("profile_enrichment_queue")
      .select("*")
      .eq("company_id", companyId)
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (enrichError) throw enrichError;

    if (!enrichments || enrichments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, synced: 0, sectionsUpdated: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${enrichments.length} enrichments for company ${companyId}`);

    // 2. Fetch current profile responses
    const { data: currentResponses, error: respError } = await supabaseClient
      .from("memo_responses")
      .select("question_key, answer")
      .eq("company_id", companyId);

    if (respError) throw respError;

    const currentProfile: Record<string, string> = {};
    (currentResponses as MemoResponse[] || []).forEach(r => {
      currentProfile[r.question_key] = r.answer || "";
    });

    // 3. Group enrichments by target section
    const enrichmentsBySection: Record<string, Enrichment[]> = {};
    
    for (const enrichment of enrichments as Enrichment[]) {
      // Determine target sections
      let targetSections: string[] = [];
      
      if (enrichment.target_section_hint) {
        targetSections = [enrichment.target_section_hint];
      } else {
        // Use source_type to determine sections
        const mappingKey = enrichment.source_type.includes('improve_score') 
          ? `improve_score_${enrichment.input_data?.section || 'general'}`
          : enrichment.source_type;
        targetSections = SECTION_MAPPING[mappingKey] || SECTION_MAPPING[enrichment.source_type] || [];
      }

      for (const section of targetSections) {
        if (!enrichmentsBySection[section]) {
          enrichmentsBySection[section] = [];
        }
        enrichmentsBySection[section].push(enrichment);
      }
    }

    // 4. Build AI prompt and process each section
    const sectionsToUpdate: Record<string, string> = {};
    const processedEnrichmentIds: string[] = [];

    for (const [sectionKey, sectionEnrichments] of Object.entries(enrichmentsBySection)) {
      const currentContent = currentProfile[sectionKey] || "";
      const sectionLabel = SECTION_LABELS[sectionKey] || sectionKey;
      
      // Build enrichment context
      const enrichmentContext = sectionEnrichments.map(e => {
        const source = e.source_tool || e.source_type;
        const data = e.input_data;
        
        // Format the data nicely
        let formattedData = "";
        if (data.question && data.answer) {
          formattedData = `Q: ${data.question}\nA: ${data.answer}`;
        } else if (data.segments) {
          formattedData = `Market Segments:\n${data.segments.map((s: any) => 
            `- ${s.segment}: ${s.count?.toLocaleString()} companies at $${s.acv?.toLocaleString()} ACV = $${(s.tam || 0).toLocaleString()} TAM`
          ).join('\n')}`;
        } else if (data.acv) {
          formattedData = `ACV: $${data.acv.toLocaleString()}`;
        } else {
          formattedData = JSON.stringify(data, null, 2);
        }
        
        return `[From ${source}]:\n${formattedData}`;
      }).join("\n\n");

      // Call AI to synthesize
      const prompt = `You are helping a startup founder update their company profile. Your task is to intelligently merge new information into an existing profile section.

## Current "${sectionLabel}" Section:
${currentContent || "(Empty - no content yet)"}

## New Information to Incorporate:
${enrichmentContext}

## Instructions:
1. Analyze the new information provided
2. Merge it into the existing section content naturally
3. Preserve the founder's original voice and writing style
4. Add specific details, numbers, and facts from the new information
5. Don't duplicate information that's already present
6. Keep the response focused and concise (max 500 words)
7. If the section was empty, create a compelling new section based on the new information

## Output:
Write the updated section content. Return ONLY the updated text, no explanations or formatting.`;

      try {
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
        if (!lovableApiKey) {
          console.error("LOVABLE_API_KEY not configured");
          continue;
        }

        const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });

        if (!aiResponse.ok) {
          console.error(`AI API error: ${aiResponse.status}`);
          continue;
        }

        const aiData = await aiResponse.json();
        const updatedContent = aiData.choices?.[0]?.message?.content?.trim();

        if (updatedContent && updatedContent.length > 10) {
          sectionsToUpdate[sectionKey] = updatedContent;
          
          // Mark these enrichments as processed
          for (const e of sectionEnrichments) {
            if (!processedEnrichmentIds.includes(e.id)) {
              processedEnrichmentIds.push(e.id);
            }
          }
        }
      } catch (aiError) {
        console.error(`Error processing section ${sectionKey}:`, aiError);
      }
    }

    // 5. Upsert updated sections to memo_responses
    for (const [sectionKey, newContent] of Object.entries(sectionsToUpdate)) {
      const { data: existing } = await supabaseClient
        .from("memo_responses")
        .select("id")
        .eq("company_id", companyId)
        .eq("question_key", sectionKey)
        .maybeSingle();

      if (existing) {
        await supabaseClient
          .from("memo_responses")
          .update({ 
            answer: newContent, 
            updated_at: new Date().toISOString(),
            source: "enrichment_sync"
          })
          .eq("id", existing.id);
      } else {
        await supabaseClient
          .from("memo_responses")
          .insert({
            company_id: companyId,
            question_key: sectionKey,
            answer: newContent,
            source: "enrichment_sync"
          });
      }
    }

    // 6. Mark enrichments as processed
    if (processedEnrichmentIds.length > 0) {
      await supabaseClient
        .from("profile_enrichment_queue")
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString() 
        })
        .in("id", processedEnrichmentIds);
    }

    console.log(`Synced ${processedEnrichmentIds.length} enrichments to ${Object.keys(sectionsToUpdate).length} sections`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: processedEnrichmentIds.length,
        sectionsUpdated: Object.keys(sectionsToUpdate)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error syncing enrichments:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
