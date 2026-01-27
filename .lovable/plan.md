
# Plan: Fix Unit Economics Sync Mismatch

## Problem Identified

When a user clicks "Sync from memo" on the My Profile page, the Unit Economics tab is not pre-filled because of two issues:

1. **Data Type Mismatch**: The extraction function saves numbers, but the editor expects strings
2. **Key Naming Mismatch**: The extracted keys don't fully align with the editor's expected keys

### Current Data Flow

```text
Memo Content → extractUnitEconomicsFromMemo() → JSON saved to DB → UnitEconomicsEditor loads
                        ↓                              ↓                      ↓
              Extracts as NUMBERS           Stored as {"arr": 18000}    Expects STRINGS
              Uses key "growthRate"                                     Uses key "monthlyGrowth"
```

### Specific Mismatches Found

| Extracted Key | Editor Key | Issue |
|--------------|------------|-------|
| `arr`, `mrr`, etc. | Same | Type: number vs string |
| `growthRate` | `monthlyGrowth` | Key name differs |
| `acv`, `carr` | (none) | Not shown in editor |

---

## Solution

Update the `extractUnitEconomicsFromMemo` function to output data in the exact format the `UnitEconomicsEditor` expects:

1. **Convert all values to strings** (numbers → `"15000"` format)
2. **Use the correct key names** that match the editor's interface
3. **Calculate derived metrics** where possible (e.g., `ltvCacRatio` from `ltv` and `cac`)

---

## Implementation Details

### File to Modify: `src/pages/CompanyProfile.tsx`

Update the `extractUnitEconomicsFromMemo` function (lines 117-264):

**Before (current):**
```typescript
extracted.arr = 18000;  // number
extracted.growthRate = 15;  // wrong key name
```

**After (fixed):**
```typescript
// Convert to string format matching UnitEconomicsEditor
extracted.arr = arr.toString();  // string
extracted.monthlyGrowth = growthRate.toString();  // correct key name
```

### Changes Required

1. **Rename key `growthRate` → `monthlyGrowth`** to match editor

2. **Convert all numeric values to strings** at extraction time:
   ```typescript
   if (arrValue) extracted.arr = arrValue.toString();
   if (mrrValue) extracted.mrr = mrrValue.toString();
   if (customerCount) extracted.customers = customerCount.toString();
   ```

3. **Add derived metric calculations:**
   - If we have `ltv` and `cac`, calculate `ltvCacRatio = (ltv / cac).toFixed(1)`
   - If we have `cac` and `mrr`, calculate `paybackMonths = (cac / mrr).toFixed(1)`
   - If we have `arr` and no `mrr`, calculate `mrr = (arr / 12).toString()`

4. **Optionally extract additional metrics** the memo might contain:
   - Churn rate patterns: `"4% monthly churn"`, `"churn: 4%"`
   - Gross margin patterns: `"75% gross margin"`, `"margin: 75%"`
   - Burn rate patterns: `"$25K monthly burn"`, `"burn: $25,000"`
   - Runway patterns: `"18 months runway"`, `"runway: 18 months"`

---

## Technical Summary

### Root Cause
The `extractUnitEconomicsFromMemo` function outputs numbers and uses different key names than what `UnitEconomicsEditor` expects (strings with specific keys like `monthlyGrowth` instead of `growthRate`).

### Fix
Normalize the extraction output to match the editor's `Metrics` interface exactly:

```typescript
interface Metrics {
  mrr: string;
  arr: string;
  monthlyGrowth: string;  // was: growthRate
  cac: string;
  ltv: string;
  ltvCacRatio: string;    // calculated
  paybackMonths: string;  // calculated
  churnRate: string;
  grossMargin: string;
  burnRate: string;
  runway: string;
  customers: string;
}
```

### Files Changed
- `src/pages/CompanyProfile.tsx` - Update `extractUnitEconomicsFromMemo` function

### Expected Outcome
After syncing from memo, the Unit Economics tab will show all extracted metrics properly pre-filled in the input fields, and derived metrics (LTV:CAC ratio, payback months) will be auto-calculated.
