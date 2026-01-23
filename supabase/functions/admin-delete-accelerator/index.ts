import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-DELETE-ACCELERATOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify caller is authenticated
    const { data: callerData, error: callerError } = await supabaseUser.auth.getUser();
    if (callerError || !callerData.user) {
      logStep('Caller auth failed', callerError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerData.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      logStep('Admin check failed', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { acceleratorId } = await req.json();
    
    if (!acceleratorId) {
      return new Response(
        JSON.stringify({ error: 'Accelerator ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Starting accelerator deletion', { acceleratorId });

    // 1. Get all cohorts for this accelerator
    const { data: cohorts } = await supabaseAdmin
      .from('accelerator_cohorts')
      .select('id, invite_id')
      .eq('accelerator_id', acceleratorId);
    
    const cohortIds = cohorts?.map(c => c.id) || [];
    const inviteIds = cohorts?.filter(c => c.invite_id).map(c => c.invite_id) || [];
    logStep('Found cohorts', { count: cohortIds.length, inviteIds });

    // 2. Unlink companies from accelerator invites (don't delete companies, just unlink)
    if (inviteIds.length > 0) {
      await supabaseAdmin
        .from('companies')
        .update({ accelerator_invite_id: null })
        .in('accelerator_invite_id', inviteIds);
      logStep('Unlinked companies from accelerator invites');
    }

    // 3. Delete accelerator_cohorts
    if (cohortIds.length > 0) {
      await supabaseAdmin
        .from('accelerator_cohorts')
        .delete()
        .eq('accelerator_id', acceleratorId);
      logStep('Deleted accelerator_cohorts');
    }

    // 4. Delete accelerator_invites linked to this accelerator
    await supabaseAdmin
      .from('accelerator_invites')
      .delete()
      .eq('linked_accelerator_id', acceleratorId);
    logStep('Deleted linked accelerator_invites');

    // 5. Delete accelerator_members
    await supabaseAdmin
      .from('accelerator_members')
      .delete()
      .eq('accelerator_id', acceleratorId);
    logStep('Deleted accelerator_members');

    // 6. Remove accelerator role from ecosystem head if they have no other accelerators
    const { data: accData } = await supabaseAdmin
      .from('accelerators')
      .select('ecosystem_head_id')
      .eq('id', acceleratorId)
      .single();

    if (accData?.ecosystem_head_id) {
      // Check if they have other accelerators
      const { data: otherAccs } = await supabaseAdmin
        .from('accelerators')
        .select('id')
        .eq('ecosystem_head_id', accData.ecosystem_head_id)
        .neq('id', acceleratorId);

      if (!otherAccs || otherAccs.length === 0) {
        // Remove accelerator role
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', accData.ecosystem_head_id)
          .eq('role', 'accelerator');
        logStep('Removed accelerator role from user', { userId: accData.ecosystem_head_id });
      }
    }

    // 7. Delete the accelerator
    const { error: deleteError } = await supabaseAdmin
      .from('accelerators')
      .delete()
      .eq('id', acceleratorId);

    if (deleteError) {
      logStep('Error deleting accelerator', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete accelerator' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Successfully deleted accelerator', { acceleratorId });

    return new Response(
      JSON.stringify({ success: true, message: 'Accelerator deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Unexpected error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
