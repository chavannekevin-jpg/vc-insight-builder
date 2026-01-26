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
      console.error('[delete-accelerator] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get accelerator ID from request body
    const { acceleratorId } = await req.json();
    
    if (!acceleratorId) {
      return new Response(
        JSON.stringify({ error: 'Accelerator ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user ID from JWT token
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const payload = JSON.parse(atob(parts[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
      
      console.log(`[delete-accelerator] User ${userId} requesting deletion of accelerator ${acceleratorId}`);
    } catch (tokenError) {
      console.error('[delete-accelerator] Token parsing error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns this accelerator (is ecosystem_head)
    const { data: accelerator, error: accError } = await supabaseAdmin
      .from('accelerators')
      .select('id, ecosystem_head_id')
      .eq('id', acceleratorId)
      .single();

    if (accError || !accelerator) {
      console.error('[delete-accelerator] Accelerator not found:', accError);
      return new Response(
        JSON.stringify({ error: 'Accelerator not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (accelerator.ecosystem_head_id !== userId) {
      console.error('[delete-accelerator] User is not the ecosystem head');
      return new Response(
        JSON.stringify({ error: 'You do not have permission to delete this accelerator' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[delete-accelerator] Starting deletion of accelerator: ${acceleratorId}`);

    // 1. Get ALL accelerator_invites linked to this accelerator (not just cohort ones)
    const { data: allInvites } = await supabaseAdmin
      .from('accelerator_invites')
      .select('id')
      .eq('linked_accelerator_id', acceleratorId);

    const allInviteIds = allInvites?.map(i => i.id) || [];
    console.log(`[delete-accelerator] Found ${allInviteIds.length} linked invites`);

    // 2. Unlink ALL companies from these invites (not just cohort-based ones)
    if (allInviteIds.length > 0) {
      await supabaseAdmin
        .from('companies')
        .update({ accelerator_invite_id: null })
        .in('accelerator_invite_id', allInviteIds);
      console.log('[delete-accelerator] Unlinked companies from all accelerator invites');
    }

    // 3. Delete accelerator cohorts
    const { data: cohorts } = await supabaseAdmin
      .from('accelerator_cohorts')
      .select('id')
      .eq('accelerator_id', acceleratorId);

    if (cohorts && cohorts.length > 0) {
      await supabaseAdmin
        .from('accelerator_cohorts')
        .delete()
        .eq('accelerator_id', acceleratorId);
      console.log(`[delete-accelerator] Deleted ${cohorts.length} cohorts`);
    }

    // 4. Delete ALL accelerator invites linked to this accelerator
    if (allInviteIds.length > 0) {
      await supabaseAdmin
        .from('accelerator_invites')
        .delete()
        .eq('linked_accelerator_id', acceleratorId);
      console.log('[delete-accelerator] Deleted accelerator invites');
    }

    // 5. Delete accelerator members
    await supabaseAdmin
      .from('accelerator_members')
      .delete()
      .eq('accelerator_id', acceleratorId);
    console.log('[delete-accelerator] Deleted accelerator members');

    // 6. Delete the accelerator itself
    const { error: deleteError } = await supabaseAdmin
      .from('accelerators')
      .delete()
      .eq('id', acceleratorId);

    if (deleteError) {
      console.error('[delete-accelerator] Error deleting accelerator:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete accelerator' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Check if user has any remaining accelerators
    const { data: remainingAccelerators } = await supabaseAdmin
      .from('accelerators')
      .select('id')
      .eq('ecosystem_head_id', userId);

    const { data: remainingMemberships } = await supabaseAdmin
      .from('accelerator_members')
      .select('accelerator_id')
      .eq('user_id', userId)
      .not('joined_at', 'is', null);

    const hasRemainingAccelerators = 
      (remainingAccelerators && remainingAccelerators.length > 0) ||
      (remainingMemberships && remainingMemberships.length > 0);

    // 8. If no remaining accelerators, remove the accelerator role
    if (!hasRemainingAccelerators) {
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'accelerator');
      console.log('[delete-accelerator] Removed accelerator role from user (no remaining accelerators)');
    }

    console.log(`[delete-accelerator] Successfully deleted accelerator: ${acceleratorId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Accelerator deleted successfully',
        hasRemainingAccelerators 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[delete-accelerator] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
