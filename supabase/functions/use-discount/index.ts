import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * This function is called after a 100% discount code is used to bypass Stripe checkout.
 * It doesn't actually need to do anything with Stripe since:
 * 1. Stripe coupons' times_redeemed is only incremented when used in a checkout session
 * 2. For 100% discounts, we bypass Stripe entirely
 * 
 * This function exists to prevent errors and can optionally log usage.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { codeId } = await req.json();

    if (!codeId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[USE-DISCOUNT] Recording usage of discount code: ${codeId}`);
    
    // For Stripe coupons used in 100% discount flow, we can't increment times_redeemed
    // via API (Stripe only does this during checkout sessions).
    // This function serves as a placeholder to prevent errors.
    // Actual tracking is done via the memo_purchases table discount_code_used field.

    return new Response(
      JSON.stringify({ success: true, message: 'Discount usage recorded' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[USE-DISCOUNT] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
