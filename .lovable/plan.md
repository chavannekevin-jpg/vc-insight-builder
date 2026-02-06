
# Fix: Route Discount Banner CTA to Checkout (Paywall)

## Current Behavior
The "Generate Now" button on the `AcceleratorDiscountBanner` currently navigates to:
```
/portal?companyId=${company.id}
```

This takes users to the **questionnaire** (Portal) where they fill out company info - not the paywall.

## Expected Behavior
For unpaid users with a discount, clicking "Generate Now" should go to the **checkout page**:
```
/checkout-analysis?companyId=${company.id}
```

This is where:
- The accelerator discount is automatically applied
- Users see the reduced price (e.g., 50% off = €50)
- Payment is processed via Stripe

## Implementation

### File: `src/pages/FreemiumHub.tsx`

Change the `onGenerate` callback from:
```tsx
onGenerate={() => navigate(`/portal?companyId=${company.id}`)}
```

To:
```tsx
onGenerate={() => navigate(`/checkout-analysis?companyId=${company.id}`)}
```

This single-line change ensures users go to the checkout page where their accelerator discount will be automatically detected and applied.

## Why This Works
The checkout page (`CheckoutMemo.tsx`) already has logic to:
1. Detect accelerator discounts via `accelerator_invites` table
2. Automatically apply the discount percentage
3. Show the reduced price to the user
4. Handle Stripe payment or 100% free access flow

No changes needed to the checkout page - it already handles accelerator discounts correctly.
