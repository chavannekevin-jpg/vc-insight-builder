
# Plan: Fix €5k vs €500k-€2M ACV Extraction for Enterprise Companies

## Problem Summary
Kontrol explicitly states their ACV range is **€500k to €2M** per enterprise customer, but the Key Assumptions card shows **€5k** — a **100x error**. This severely undermines the credibility of the investment analysis.

## Root Causes Identified

### 1. Regex Pattern Doesn't Match Enterprise Pricing Text
The current enterprise ACV regex on line 275 of `anchoredAssumptions.ts`:
```javascript
/[€$£]([\d,]+)\s*k?\s*[-–—to]+\s*[€$£]?([\d,]+)\s*k?\s*\+?\s*(?:arr|acv|per\s*year|annual|contract)/i
```

**Fails on Kontrol's text** because:
- It doesn't support **"M" suffix** (millions) - only handles "k"
- Requires "arr|acv|per year|annual|contract" **immediately after** the range
- Kontrol's text: "€500k to €2M...ARR per customer" has "ARR" separated from the range

### 2. Missing Patterns for Enterprise Pricing
The regex doesn't handle common enterprise patterns like:
- "€500k to €2M" (million suffix)
- "ARR per customer" or "per account"
- "potential ARR...ranging from"

### 3. Fallback to AI Estimation Uses Wrong Benchmarks
When extraction fails, the AI estimation uses SMB SaaS benchmarks (~€5k-6k seed stage) instead of enterprise benchmarks (~€100k-200k).

---

## Solution: Enhanced Enterprise ACV Extraction

### File Changes

**File: `src/lib/anchoredAssumptions.ts`**

### Step 1: Add Million-Aware Parsing Function
Create a new helper that handles k/M suffixes properly:

```typescript
function parseEnterpriseValue(str: string, fullMatch: string): number {
  const clean = str.replace(/,/g, '').toLowerCase();
  const num = parseFloat(clean);
  const fullLower = fullMatch.toLowerCase();
  
  // Check for millions suffix (M or m, but not MRR/mrr)
  if (/\d+\s*m(?!rr)/i.test(fullLower)) {
    return num * 1000000;
  }
  // Check for thousands suffix (k)
  if (/\d+\s*k/i.test(fullLower) || fullLower.includes('k')) {
    return num * 1000;
  }
  // If small number without suffix, likely in thousands for enterprise context
  if (num < 1000) {
    return num * 1000;
  }
  return num;
}
```

### Step 2: Expand Enterprise ACV Range Regex
Replace the narrow regex with a more flexible pattern:

```typescript
// Enterprise ACV ranges with M/k support
// Matches: "€500k to €2M", "$100K-$500K ARR", "ranging from €500k to €2M per customer"
const enterpriseRangePatterns = [
  // Pattern 1: Direct range with ARR/ACV suffix
  /[€$£]([\d,.]+)\s*([km])?\s*(?:to|-|–|—)\s*[€$£]?([\d,.]+)\s*([km])?\s*\+?\s*(?:arr|acv|annual|contract)/i,
  
  // Pattern 2: "ranging from X to Y" with per customer/account
  /ranging\s+(?:from\s+)?(?:approximately\s+)?[€$£]([\d,.]+)\s*([km])?\s*(?:to|-|–|—)\s*[€$£]?([\d,.]+)\s*([km])?/i,
  
  // Pattern 3: "ARR per customer is X to Y"
  /(?:arr|acv)(?:\s+per\s+(?:customer|account|enterprise))?\s*(?:is|of|:)?\s*[€$£]?([\d,.]+)\s*([km])?\s*(?:to|-|–|—)\s*[€$£]?([\d,.]+)\s*([km])?/i,
  
  // Pattern 4: "potential ARR...X to Y"
  /potential\s+(?:arr|acv)\s+(?:per\s+(?:customer|account))?\s*(?:is|of|:)?\s*(?:substantial,?\s+)?(?:ranging\s+)?(?:from\s+)?(?:approximately\s+)?[€$£]?([\d,.]+)\s*([km])?\s*(?:to|-|–|—)\s*[€$£]?([\d,.]+)\s*([km])?/i,
];
```

### Step 3: Extract Values with Suffix Awareness
Update the extraction logic to:
1. Try each pattern
2. Parse numeric values with their k/M suffixes correctly
3. Calculate geometric mean for ranges

```typescript
for (const pattern of enterpriseRangePatterns) {
  const match = combinedText.match(pattern);
  if (match) {
    // Extract value and suffix pairs
    const lowValue = parseFloat(match[1].replace(/,/g, ''));
    const lowSuffix = match[2]?.toLowerCase();
    const highValue = parseFloat(match[3].replace(/,/g, ''));
    const highSuffix = match[4]?.toLowerCase();
    
    // Apply multipliers
    const low = lowSuffix === 'm' ? lowValue * 1000000 
              : lowSuffix === 'k' ? lowValue * 1000 
              : lowValue < 1000 ? lowValue * 1000 : lowValue;
              
    const high = highSuffix === 'm' ? highValue * 1000000 
               : highSuffix === 'k' ? highValue * 1000 
               : highValue < 1000 ? highValue * 1000 : highValue;
    
    const midpoint = Math.round(Math.sqrt(low * high));
    // ... return result
  }
}
```

### Step 4: Add Logging for Debugging
Add console logging to trace extraction:

```typescript
console.log('[AnchoredAssumptions] Extracting for', companyDetails?.name, 
            'businessModel:', businessModelType);
console.log('[AnchoredAssumptions] Combined text length:', combinedText.length);
```

---

## Testing Scenarios

| Company Text | Expected Result |
|--------------|-----------------|
| "€500k to €2M ARR per customer" | €1M midpoint (geometric mean) |
| "ranging from approximately €500k to €2M" | €1M midpoint |
| "$100K-$500K+ ACV" | €223k midpoint |
| "ACV of €150,000" | €150k |
| No explicit pricing (fallback) | AI estimation using enterprise benchmarks |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/anchoredAssumptions.ts` | Update `extractPrimaryMetricValue()` with expanded regex patterns and M-suffix support |

---

## Expected Outcome

For Kontrol, the Key Assumptions card will show:
- **ACV: €1M/year** (geometric mean of €500k and €2M)
- **Source: "From founder: €500k-€2M range (using €1M midpoint)"**
- **Confidence: High**

This accurately reflects the enterprise pricing stated by the founder.
