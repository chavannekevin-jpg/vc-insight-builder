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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('Callback received:', { 
      hasCode: !!code, 
      hasState: !!stateParam, 
      error,
      fullUrl: req.url 
    });

    // Get the app's base URL for redirects
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://vc-insight-builder.lovable.app';

    if (error) {
      console.error('OAuth error:', error);
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${appBaseUrl}/investor/dashboard?calendar_error=oauth_denied` }
      });
    }

    if (!code || !stateParam) {
      console.error('Missing params:', { code: !!code, state: !!stateParam });
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${appBaseUrl}/investor/dashboard?calendar_error=missing_params` }
      });
    }

    // Decode state
    let state;
    try {
      state = JSON.parse(atob(stateParam));
      console.log('Decoded state:', state);
    } catch (e) {
      console.error('Invalid state:', e);
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${appBaseUrl}/investor/dashboard?calendar_error=invalid_state` }
      });
    }

    const { investorId, redirectUrl } = state;
    const finalRedirectUrl = redirectUrl || `${appBaseUrl}/investor/dashboard`;

    // Exchange code for tokens
    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const callbackUrl = `${supabaseUrl}/functions/v1/google-calendar-callback`;

    console.log('Exchanging code for tokens...');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${finalRedirectUrl}?calendar_error=token_exchange_failed` }
      });
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received, storing...');
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Store tokens in database
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { error: upsertError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        investor_id: investorId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        calendar_id: 'primary',
        connected_at: new Date().toISOString()
      }, { onConflict: 'investor_id' });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${finalRedirectUrl}?calendar_error=storage_failed` }
      });
    }

    console.log('Calendar connected successfully!');
    // Redirect back to app with success
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${finalRedirectUrl}?calendar_connected=true` }
    });
  } catch (error) {
    console.error('Callback error:', error);
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://vc-insight-builder.lovable.app';
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${appBaseUrl}/investor/dashboard?calendar_error=unknown` }
    });
  }
});
