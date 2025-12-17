import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Backend misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userResult, error: userError } = await supabaseUser.auth.getUser();
    const user = userResult?.user;
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin-only
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(JSON.stringify({ error: "Failed role check" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Companies for this user
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("founder_id", user.id)
      .neq("id", DEMO_COMPANY_ID);

    if (companiesError) {
      console.error("Companies query error:", companiesError);
      return new Response(JSON.stringify({ error: "Failed to load companies" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const companyIds = (companies ?? []).map((c) => c.id).filter(Boolean);

    if (companyIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, deletedCompanies: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Memos -> memo analyses
    const { data: memos, error: memosError } = await supabaseAdmin
      .from("memos")
      .select("id")
      .in("company_id", companyIds);

    if (memosError) {
      console.error("Memos query error:", memosError);
      return new Response(JSON.stringify({ error: "Failed to load memos" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const memoIds = (memos ?? []).map((m) => m.id).filter(Boolean);

    // Delete in safe order
    if (memoIds.length > 0) {
      const { error: delAnalysesError } = await supabaseAdmin
        .from("memo_analyses")
        .delete()
        .in("memo_id", memoIds);
      if (delAnalysesError) {
        console.error("Delete memo_analyses error:", delAnalysesError);
        return new Response(JSON.stringify({ error: "Failed to delete memo analyses" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const deletionResults = await Promise.all([
      supabaseAdmin.from("memo_generation_jobs").delete().in("company_id", companyIds),
      supabaseAdmin.from("memo_tool_data").delete().in("company_id", companyIds),
      supabaseAdmin.from("memo_responses").delete().in("company_id", companyIds),
      supabaseAdmin.from("roast_question_history").delete().in("company_id", companyIds),
      supabaseAdmin.from("waitlist_signups").delete().in("company_id", companyIds),
      supabaseAdmin.from("memo_purchases").delete().in("company_id", companyIds),
      supabaseAdmin.from("memos").delete().in("company_id", companyIds),
    ] as any);

    const firstError = (deletionResults as any[]).find((r) => r?.error)?.error;
    if (firstError) {
      console.error("Delete related data error:", firstError);
      return new Response(JSON.stringify({ error: "Failed to delete related data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: delCompaniesError } = await supabaseAdmin
      .from("companies")
      .delete()
      .in("id", companyIds);

    if (delCompaniesError) {
      console.error("Delete companies error:", delCompaniesError);
      return new Response(JSON.stringify({ error: "Failed to delete companies" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, deletedCompanies: companyIds.length, deletedMemos: memoIds.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("admin-reset-flow error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
