import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[delete-account] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client with user's auth (to verify identity)
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Service role client (to delete data and auth user)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('[delete-account] User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`[delete-account] Starting deletion for user: ${userId}`);

    // 1. Get user's companies
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('founder_id', userId);

    const companyIds = companies?.map(c => c.id) || [];
    console.log(`[delete-account] Found ${companyIds.length} companies to delete`);

    if (companyIds.length > 0) {
      // 2. Get memo IDs for these companies
      const { data: memos } = await supabaseAdmin
        .from('memos')
        .select('id')
        .in('company_id', companyIds);

      const memoIds = memos?.map(m => m.id) || [];

      // 3. Delete memo_analyses
      if (memoIds.length > 0) {
        await supabaseAdmin
          .from('memo_analyses')
          .delete()
          .in('memo_id', memoIds);
        console.log('[delete-account] Deleted memo_analyses');
      }

      // 4. Delete memo_tool_data
      await supabaseAdmin
        .from('memo_tool_data')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted memo_tool_data');

      // 5. Delete memos
      await supabaseAdmin
        .from('memos')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted memos');

      // 6. Delete memo_responses
      await supabaseAdmin
        .from('memo_responses')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted memo_responses');

      // 7. Delete memo_purchases
      await supabaseAdmin
        .from('memo_purchases')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted memo_purchases');

      // 8. Delete waitlist_signups
      await supabaseAdmin
        .from('waitlist_signups')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted waitlist_signups');

      // 9. Delete roast_question_history
      await supabaseAdmin
        .from('roast_question_history')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted roast_question_history');

      // 10. Delete memo_generation_jobs
      await supabaseAdmin
        .from('memo_generation_jobs')
        .delete()
        .in('company_id', companyIds);
      console.log('[delete-account] Deleted memo_generation_jobs');

      // 11. Delete companies
      await supabaseAdmin
        .from('companies')
        .delete()
        .in('id', companyIds);
      console.log('[delete-account] Deleted companies');
    }

    // 12. Delete user_roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    console.log('[delete-account] Deleted user_roles');

    // 13. Delete profile (will cascade or be handled by trigger)
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    console.log('[delete-account] Deleted profile');

    // 14. Delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      console.error('[delete-account] Error deleting auth user:', deleteAuthError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete authentication record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[delete-account] Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[delete-account] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
