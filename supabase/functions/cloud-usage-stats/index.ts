import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Admin access required");

    // 1. Database table stats
    const { data: tableStats } = await supabase.rpc("get_table_stats");

    // 2. Storage bucket stats
    const { data: storageStats } = await supabase.rpc("get_storage_stats");

    // 3. Edge function call counts from ai_usage_logs (as proxy)
    const { data: edgeFnStats } = await supabase
      .from("ai_usage_logs")
      .select("function_name, created_at, duration_ms, status")
      .order("created_at", { ascending: false })
      .limit(1000);

    // Aggregate edge function stats
    const edgeFnAgg: Record<string, { calls: number; errors: number; avgDuration: number; totalDuration: number; lastCalled: string }> = {};
    (edgeFnStats || []).forEach((log: any) => {
      if (!edgeFnAgg[log.function_name]) {
        edgeFnAgg[log.function_name] = { calls: 0, errors: 0, avgDuration: 0, totalDuration: 0, lastCalled: log.created_at };
      }
      const fn = edgeFnAgg[log.function_name];
      fn.calls++;
      fn.totalDuration += log.duration_ms || 0;
      if (log.status === "error") fn.errors++;
      if (log.created_at > fn.lastCalled) fn.lastCalled = log.created_at;
    });

    const edgeFunctions = Object.entries(edgeFnAgg).map(([name, data]) => ({
      name,
      calls: data.calls,
      errors: data.errors,
      avgDuration: data.calls > 0 ? Math.round(data.totalDuration / data.calls) : 0,
      lastCalled: data.lastCalled,
    })).sort((a, b) => b.calls - a.calls);

    return new Response(
      JSON.stringify({
        database: tableStats || [],
        storage: storageStats || [],
        edgeFunctions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("cloud-usage-stats error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: error instanceof Error && error.message.includes("nauthorized") ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
