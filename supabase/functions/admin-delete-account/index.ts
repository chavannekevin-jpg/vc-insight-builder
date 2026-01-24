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
      console.error('[admin-delete-account] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Service role client (to delete data and auth user)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Client to verify the caller is authenticated
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify caller is authenticated
    const { data: callerData, error: callerError } = await supabaseUser.auth.getUser();
    if (callerError || !callerData.user) {
      console.error('[admin-delete-account] Caller auth failed:', callerError);
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

    if (roleError) {
      console.error('[admin-delete-account] Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.error('[admin-delete-account] Caller is not an admin');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the target user ID from the request body
    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admin from deleting themselves
    if (targetUserId === callerData.user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account through admin panel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[admin-delete-account] Admin ${callerData.user.id} deleting user: ${targetUserId}`);

    // 1. Get user's companies (including accelerator_invite_id for cleanup)
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id, accelerator_invite_id')
      .eq('founder_id', targetUserId);

    const companyIds = companies?.map(c => c.id) || [];
    const acceleratorInviteIds = companies
      ?.filter(c => c.accelerator_invite_id)
      .map(c => c.accelerator_invite_id) || [];
    
    console.log(`[admin-delete-account] Found ${companyIds.length} companies to delete`);
    console.log(`[admin-delete-account] Found ${acceleratorInviteIds.length} accelerator invites to update`);

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
        console.log('[admin-delete-account] Deleted memo_analyses');
      }

      // 4. Delete memo_tool_data
      await supabaseAdmin
        .from('memo_tool_data')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted memo_tool_data');

      // 5. Delete memos
      await supabaseAdmin
        .from('memos')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted memos');

      // 6. Delete memo_responses
      await supabaseAdmin
        .from('memo_responses')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted memo_responses');

      // 7. Delete memo_purchases
      await supabaseAdmin
        .from('memo_purchases')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted memo_purchases');

      // 8. Delete waitlist_signups
      await supabaseAdmin
        .from('waitlist_signups')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted waitlist_signups');

      // 9. Delete roast_question_history
      await supabaseAdmin
        .from('roast_question_history')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted roast_question_history');

      // 10. Delete memo_generation_jobs
      await supabaseAdmin
        .from('memo_generation_jobs')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted memo_generation_jobs');

      // 11. Delete investor_dealflow entries (investors who have this company in their pipeline)
      await supabaseAdmin
        .from('investor_dealflow')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted investor_dealflow');

      // 12. Delete dealflow_shares entries
      await supabaseAdmin
        .from('dealflow_shares')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted dealflow_shares');

      // 13. Delete accelerator_section_recommendations
      await supabaseAdmin
        .from('accelerator_section_recommendations')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted accelerator_section_recommendations');

      // 14. Delete company_models
      await supabaseAdmin
        .from('company_models')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted company_models');

      // 15. Delete startup_claim_codes
      await supabaseAdmin
        .from('startup_claim_codes')
        .delete()
        .in('company_id', companyIds);
      console.log('[admin-delete-account] Deleted startup_claim_codes');

      // 16. Get referral IDs before deactivating (for cleanup)
      const { data: referralIds } = await supabaseAdmin
        .from('founder_referrals')
        .select('id')
        .in('referrer_company_id', companyIds);

      // 12. Deactivate founder referral codes so they can't be used after account deletion
      await supabaseAdmin
        .from('founder_referrals')
        .update({ is_active: false })
        .in('referrer_company_id', companyIds);
      console.log('[admin-delete-account] Deactivated founder_referrals');

      // 13. Delete founder_referral_signups for those referrals
      if (referralIds && referralIds.length > 0) {
        await supabaseAdmin
          .from('founder_referral_signups')
          .delete()
          .in('referral_id', referralIds.map(r => r.id));
        console.log('[admin-delete-account] Deleted founder_referral_signups');
      }

      // 14. Decrement accelerator invite usage counts
      for (const inviteId of acceleratorInviteIds) {
        const { data: invite } = await supabaseAdmin
          .from('accelerator_invites')
          .select('uses')
          .eq('id', inviteId)
          .single();
        
        if (invite && invite.uses > 0) {
          await supabaseAdmin
            .from('accelerator_invites')
            .update({ uses: invite.uses - 1 })
            .eq('id', inviteId);
        }
      }
      console.log('[admin-delete-account] Decremented accelerator invite uses');

      // 15. Delete companies
      await supabaseAdmin
        .from('companies')
        .delete()
        .in('id', companyIds);
      console.log('[admin-delete-account] Deleted companies');
    }

    // 15. Delete user_roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', targetUserId);
    console.log('[admin-delete-account] Deleted user_roles');

    // 16. Delete profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId);
    console.log('[admin-delete-account] Deleted profile');

    // 17. Delete auth user
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    
    if (deleteAuthError) {
      console.error('[admin-delete-account] Error deleting auth user:', deleteAuthError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete authentication record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[admin-delete-account] Successfully deleted user: ${targetUserId}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[admin-delete-account] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
