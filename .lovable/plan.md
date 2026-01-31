# ✅ COMPLETED: Dynamic Token Limits for Pro Model

## Summary
Implemented dynamic token limits that double for the Pro model (admin accounts) to prevent JSON truncation errors.

## Changes Made

### 1. Helper Function Added
Added `getMaxTokens()` helper in two locations:
- Inside `generateMemoInBackground` (line ~2206)
- Inside `generateSectionToolData` (line ~1342)

```typescript
const getMaxTokens = (baseTokens: number): number => useProModel ? baseTokens * 2 : baseTokens;
```

### 2. Updated Function Signature
`generateSectionToolData` now accepts `useProModel` parameter to calculate proper token limits.

### 3. Token Limits Updated

| AI Call | Flash Limit | Pro Limit |
|---------|-------------|-----------|
| Tool prompt generation | 4500 | 9000 |
| Section generation | 3000 | 6000 |
| Fallback generation | 1500 | 3000 |
| Investment Thesis | 3000 | 6000 |
| VC Quick Take | 1500 | 3000 |
| Action Plan | 2000 | 4000 |
| Holistic Verdicts | 2000 | 4000 |

## Verification
- Edge function deployed
- Admin accounts will now use Pro model with 2x token budget
- Regular users continue with Flash at current limits

## Next Steps
Test memo generation with admin account to verify JSON parsing errors are resolved.
