
# Fix: Show VCVerdictCard for Premium Users Before Generation

## The Problem
When a user:
1. Uploads a deck and gets a free VC verdict preview (stored in `vc_verdict_json`)
2. Then purchases access (now `hasPaid = true`)
3. But hasn't generated their full analysis yet (`hasMemoData = false`)

They currently only see the "Generate Your Analysis" card and lose access to their previously-generated verdict preview.

## Root Cause
The rendering logic in `FreemiumHub.tsx` has exclusive cases:

```
CASE 2: isPremiumNoMemo → Show ONLY "Generate Your Analysis" card
CASE 5 (else): → Show VCVerdictCard
```

When `isPremiumNoMemo` is true, the VCVerdictCard is completely hidden, even if the user has a cached verdict.

## Solution
For the `isPremiumNoMemo` state, show **both**:
1. The "Generate Your Analysis" CTA card (existing)
2. The VCVerdictCard with their cached verdict (currently hidden)

This way, premium users who haven't generated yet can still see their verdict preview.

## Implementation

### File: `src/pages/FreemiumHub.tsx`

**Current structure (lines ~951-994):**
```tsx
) : isPremiumNoMemo ? (
  /* CASE 2: Premium user but no memo generated yet */
  <Card className="...">
    {/* Generate Analysis CTA card */}
  </Card>
) : finalizingTimedOut ...
```

**Updated structure:**
```tsx
) : isPremiumNoMemo ? (
  /* CASE 2: Premium user but no memo generated yet */
  <>
    <Card className="...">
      {/* Generate Analysis CTA card - unchanged */}
    </Card>
    
    {/* Also show VCVerdictCard if they have a cached verdict */}
    {cachedVerdict && (
      <VCVerdictCard
        companyId={company.id}
        companyName={company.name}
        companyDescription={company.description}
        companyStage={company.stage}
        companyCategory={company.category}
        responses={responses}
        memoGenerated={false}
        hasPaid={hasPaid}
        deckParsed={deckParsed}
        cachedVerdict={cachedVerdict}
        onVerdictGenerated={handleVerdictGenerated}
        generationsAvailable={generationsAvailable}
      />
    )}
  </>
) : finalizingTimedOut ...
```

## Expected Behavior After Fix

| State | What User Sees |
|-------|---------------|
| Premium + no memo + has verdict | "Generate Your Analysis" card **+** VCVerdictCard below |
| Premium + no memo + no verdict | "Generate Your Analysis" card only |
| Premium + memo generated | Full dashboard scorecard |
| Not paid | VCVerdictCard (freemium) only |

## File Changes Summary

| File | Change |
|------|--------|
| `src/pages/FreemiumHub.tsx` | Wrap `isPremiumNoMemo` case in fragment, add VCVerdictCard below CTA |
