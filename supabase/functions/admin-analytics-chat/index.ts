import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const SYSTEM_PROMPT = `You are an AI analytics assistant for the UglyBaby admin panel. Your job is to help administrators understand user behavior, conversion rates, and platform metrics.

You have access to query the following database tables:
- profiles (id, email, created_at) - User accounts
- companies (id, name, stage, founder_id, created_at, has_premium, description, category) - Startup companies
- memo_responses (id, company_id, question_key, answer, created_at, source) - Questionnaire answers
- memos (id, company_id, status, created_at) - Generated investment memos
- memo_purchases (id, user_id, company_id, amount_paid, created_at, discount_code_used) - Purchases
- waitlist_signups (id, user_id, company_id, has_paid, created_at, pricing_tier) - Waitlist signups
- memo_generation_jobs (id, company_id, status, created_at, error_message) - Memo generation jobs
- discount_codes (id, code, discount_percent, uses, is_active) - Discount codes

When analyzing data, be specific with numbers and percentages. Provide actionable insights.
Focus on:
1. Conversion funnel analysis (signup → company → questionnaire → payment → memo)
2. Drop-off points identification
3. User engagement patterns
4. Revenue and payment insights
5. Feature usage patterns

Format your responses clearly with:
- Key metrics and numbers
- Insights and patterns
- Specific recommendations

Keep responses focused and actionable. Use markdown formatting for clarity.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const supabaseUser = createClient(
      SUPABASE_URL!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, queryType } = await req.json();

    // Fetch relevant platform data for context
    const platformData = await fetchPlatformData(supabaseAdmin);

    // Build context message with current data
    const contextMessage = buildContextMessage(platformData, queryType);

    // Prepare messages for AI
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: contextMessage },
      ...messages,
    ];

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Admin analytics chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchPlatformData(supabase: any) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all data in parallel
  const [
    profilesResult,
    companiesResult,
    memosResult,
    purchasesResult,
    waitlistResult,
    responsesResult,
    jobsResult,
    recentProfilesResult,
    recentCompaniesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id, created_at"),
    supabase.from("companies").select("id, name, stage, created_at, has_premium, founder_id"),
    supabase.from("memos").select("id, company_id, status, created_at"),
    supabase.from("memo_purchases").select("id, amount_paid, created_at, discount_code_used"),
    supabase.from("waitlist_signups").select("id, has_paid, created_at, pricing_tier"),
    supabase.from("memo_responses").select("company_id, question_key, source").limit(5000),
    supabase.from("memo_generation_jobs").select("id, status, created_at, error_message"),
    supabase.from("profiles").select("id, email, created_at").gte("created_at", sevenDaysAgo.toISOString()).order("created_at", { ascending: false }),
    supabase.from("companies").select("id, name, stage, created_at").gte("created_at", sevenDaysAgo.toISOString()).order("created_at", { ascending: false }),
  ]);

  return {
    profiles: profilesResult.data || [],
    companies: companiesResult.data || [],
    memos: memosResult.data || [],
    purchases: purchasesResult.data || [],
    waitlist: waitlistResult.data || [],
    responses: responsesResult.data || [],
    jobs: jobsResult.data || [],
    recentProfiles: recentProfilesResult.data || [],
    recentCompanies: recentCompaniesResult.data || [],
  };
}

function buildContextMessage(data: any, queryType?: string) {
  const totalUsers = data.profiles.length;
  const totalCompanies = data.companies.length;
  const totalMemos = data.memos.filter((m: any) => m.status === "completed").length;
  const totalPurchases = data.purchases.length;
  const totalRevenue = data.purchases.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0);

  // Calculate conversion rates
  const usersWithCompanies = new Set(data.companies.map((c: any) => c.founder_id)).size;
  const companiesWithResponses = new Set(data.responses.map((r: any) => r.company_id)).size;
  const companiesWithMemos = new Set(data.memos.map((m: any) => m.company_id)).size;
  const premiumCompanies = data.companies.filter((c: any) => c.has_premium).length;

  // Response depth per company
  const responsesByCompany: Record<string, number> = {};
  data.responses.forEach((r: any) => {
    responsesByCompany[r.company_id] = (responsesByCompany[r.company_id] || 0) + 1;
  });
  
  const companiesBy7Plus = Object.values(responsesByCompany).filter((count: number) => count >= 7).length;
  const avgResponsesPerCompany = totalCompanies > 0 
    ? (Object.values(responsesByCompany).reduce((a: number, b: number) => a + b, 0) / totalCompanies).toFixed(1)
    : 0;

  // Stage breakdown
  const stageBreakdown: Record<string, number> = {};
  data.companies.forEach((c: any) => {
    stageBreakdown[c.stage] = (stageBreakdown[c.stage] || 0) + 1;
  });

  // Source breakdown for responses
  const sourceBreakdown: Record<string, number> = {};
  data.responses.forEach((r: any) => {
    const source = r.source || 'manual';
    sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
  });

  // Job status breakdown
  const jobsByStatus: Record<string, number> = {};
  data.jobs.forEach((j: any) => {
    jobsByStatus[j.status] = (jobsByStatus[j.status] || 0) + 1;
  });

  // Recent activity
  const recentUsers = data.recentProfiles.length;
  const recentCompanies = data.recentCompanies.length;

  return `CURRENT PLATFORM DATA (as of ${new Date().toISOString()}):

## Overview Metrics
- Total Users: ${totalUsers}
- Total Companies: ${totalCompanies}
- Completed Memos: ${totalMemos}
- Total Purchases: ${totalPurchases}
- Total Revenue: €${totalRevenue.toFixed(2)}

## Conversion Funnel
1. Users signed up: ${totalUsers}
2. Users created company: ${usersWithCompanies} (${((usersWithCompanies/totalUsers)*100).toFixed(1)}%)
3. Companies with responses: ${companiesWithResponses} (${((companiesWithResponses/totalCompanies)*100).toFixed(1)}%)
4. Companies with 7+ answers: ${companiesBy7Plus} (${((companiesBy7Plus/totalCompanies)*100).toFixed(1)}%)
5. Companies with memo: ${companiesWithMemos} (${((companiesWithMemos/totalCompanies)*100).toFixed(1)}%)
6. Premium companies: ${premiumCompanies} (${((premiumCompanies/totalCompanies)*100).toFixed(1)}%)

## Response Data
- Avg responses per company: ${avgResponsesPerCompany}
- Response sources: ${JSON.stringify(sourceBreakdown)}

## Company Stages
${Object.entries(stageBreakdown).map(([stage, count]) => `- ${stage}: ${count}`).join('\n')}

## Generation Jobs
${Object.entries(jobsByStatus).map(([status, count]) => `- ${status}: ${count}`).join('\n')}

## Last 7 Days
- New users: ${recentUsers}
- New companies: ${recentCompanies}
- Recent signups: ${data.recentProfiles.slice(0, 5).map((p: any) => p.email).join(', ')}

Please analyze this data and answer the user's question with specific insights and recommendations.`;
}
