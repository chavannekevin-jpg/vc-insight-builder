import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { investorId } = await req.json();

    if (!investorId) {
      return new Response(
        JSON.stringify({ error: "investorId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete from linked_calendars
    const { error: linkedError } = await supabase
      .from("linked_calendars")
      .delete()
      .eq("investor_id", investorId);

    if (linkedError) {
      console.error("Error deleting linked_calendars:", linkedError);
    }

    // Delete from google_calendar_tokens
    const { error: tokensError } = await supabase
      .from("google_calendar_tokens")
      .delete()
      .eq("investor_id", investorId);

    if (tokensError) {
      console.error("Error deleting google_calendar_tokens:", tokensError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Calendar connections removed. Please also revoke access at https://myaccount.google.com/permissions" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in disconnect-calendar:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
