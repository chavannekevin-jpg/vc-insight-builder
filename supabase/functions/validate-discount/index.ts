import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Payment system not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const trimmedCode = code.trim().toUpperCase();

    console.log(`[VALIDATE-DISCOUNT] Validating code: ${trimmedCode}`);

    // Try to retrieve coupon from Stripe (coupon IDs are case-sensitive, try both)
    let coupon = null;
    
    // Try exact code first
    try {
      coupon = await stripe.coupons.retrieve(code.trim());
      console.log(`[VALIDATE-DISCOUNT] Found coupon with exact code`);
    } catch (e) {
      // Try uppercase version
      try {
        coupon = await stripe.coupons.retrieve(trimmedCode);
        console.log(`[VALIDATE-DISCOUNT] Found coupon with uppercase code`);
      } catch (e2) {
        // Try lowercase version
        try {
          coupon = await stripe.coupons.retrieve(code.trim().toLowerCase());
          console.log(`[VALIDATE-DISCOUNT] Found coupon with lowercase code`);
        } catch (e3) {
          console.log(`[VALIDATE-DISCOUNT] Coupon not found in Stripe`);
        }
      }
    }

    if (!coupon) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if coupon is valid/active
    if (!coupon.valid) {
      console.log(`[VALIDATE-DISCOUNT] Coupon is not valid/active`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Code is no longer valid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check redemption limits
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      console.log(`[VALIDATE-DISCOUNT] Coupon has reached max redemptions`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Code has reached usage limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get discount percentage (Stripe coupons can be percent_off or amount_off)
    let discountPercent = 0;
    if (coupon.percent_off) {
      discountPercent = coupon.percent_off;
    } else if (coupon.amount_off) {
      // For amount_off coupons, we'll return the amount in cents
      // The frontend will need to handle this differently
      console.log(`[VALIDATE-DISCOUNT] Amount-off coupon: ${coupon.amount_off} ${coupon.currency}`);
    }

    console.log(`[VALIDATE-DISCOUNT] Valid coupon found - ${discountPercent}% off`);

    return new Response(
      JSON.stringify({
        valid: true,
        id: coupon.id,
        discount_percent: discountPercent,
        amount_off: coupon.amount_off || null,
        currency: coupon.currency || null,
        code: coupon.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[VALIDATE-DISCOUNT] Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
