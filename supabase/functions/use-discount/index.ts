import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { codeId } = await req.json();

    if (!codeId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Increment usage count (using service role to bypass RLS)
    const { error } = await supabase
      .from('discount_codes')
      .update({ 
        uses: supabase.rpc('increment', { row_id: codeId })
      })
      .eq('id', codeId);

    if (error) {
      console.error('Database error:', error);
      
      // Fallback: Get current uses and increment
      const { data: currentCode } = await supabase
        .from('discount_codes')
        .select('uses')
        .eq('id', codeId)
        .single();
      
      if (currentCode) {
        await supabase
          .from('discount_codes')
          .update({ uses: currentCode.uses + 1 })
          .eq('id', codeId);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});