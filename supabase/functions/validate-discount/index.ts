import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  uses: number;
  max_uses: number | null;
  expires_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Query discount code (using service role to bypass RLS)
    const { data: codeData, error } = await supabase
      .from('discount_codes')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Failed to validate code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!codeData) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const discountCode = codeData as DiscountCode;

    // Check usage limit
    if (discountCode.max_uses !== null && discountCode.uses >= discountCode.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Code has reached usage limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Code has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return valid code info (only what's needed)
    return new Response(
      JSON.stringify({
        valid: true,
        id: discountCode.id,
        discount_percent: discountCode.discount_percent,
        code: discountCode.code
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});