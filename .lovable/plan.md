

# Analysis: Full Memo Generation Failure on Admin (Pro Model)

## Problem Summary

When you tested memo generation with your admin account (using Gemini 2.5 Pro), the analysis failed with multiple JSON parsing errors like:

```
SyntaxError: Unterminated string in JSON at position 1240
SyntaxError: Unexpected end of JSON input  
```

Meanwhile, the same flow works fine for regular users on Flash.

---

## Root Cause

**Token limits are too small for Pro's verbose output style.**

| Model | Behavior | Token Limit | Result |
|-------|----------|-------------|--------|
| Flash | Concise, efficient responses | 3000-4500 | Fits within limits |
| Pro | Longer, more detailed analysis | 3000-4500 | Truncated mid-JSON |

The Pro model produces more thorough, reasoned outputs (which is its strength), but those responses are getting cut off before completing the JSON structure.

---

## Affected Areas in Code

The function `generate-full-memo/index.ts` has multiple AI calls with conservative token limits:

| Location | Purpose | Current Limit |
|----------|---------|---------------|
| Line 3357 | Main section generation | 3000 |
| Line 3704 | Tool data generation | 3000 |
| Line 1530 | Tool prompt generation | 4500 |
| Line 3866 | Fallback generation | 1500 |
| Line 4049 | VC Quick Take | 2000 |
| Line 4332 | Action Plan | 2000 |

---

## Proposed Solution

**Increase token limits when Pro model is selected** to accommodate its more detailed output:

```text
+-------------------------+---------------+------------------+
| AI Call Purpose         | Flash Limit   | Pro Limit        |
+-------------------------+---------------+------------------+
| Section generation      | 3000          | 6000             |
| Tool data generation    | 3000          | 6000             |
| Tool prompt gen         | 4500          | 8000             |
| Fallback generation     | 1500          | 3000             |
| VC Quick Take           | 2000          | 4000             |
| Action Plan             | 2000          | 4000             |
+-------------------------+---------------+------------------+
```

---

## Implementation Steps

1. **Add dynamic token limit calculation**
   - Create a helper function that returns appropriate limits based on the selected model
   - Pro model gets approximately 2x the token budget of Flash

2. **Update all AI API calls**
   - Replace hardcoded `max_tokens` values with the dynamic calculation
   - Approximately 6-8 locations need updating

3. **Add safety logging**
   - Log when responses approach the token limit to catch future issues
   - Log the model being used for each major generation step

---

## Technical Details

```
Modified file:
  supabase/functions/generate-full-memo/index.ts

Changes:
  1. Add helper function at the top of generateMemoInBackground:
     const getMaxTokens = (base: number) => useProModel ? base * 2 : base;

  2. Update each max_tokens usage:
     - max_tokens: 3000 -> max_tokens: getMaxTokens(3000)
     - max_tokens: 4500 -> max_tokens: getMaxTokens(4500)
     - max_tokens: 1500 -> max_tokens: getMaxTokens(1500)
     - max_tokens: 2000 -> max_tokens: getMaxTokens(2000)
```

---

## Expected Outcome

After this change:
- Admin accounts using Pro will have sufficient token budget for detailed responses
- Regular users on Flash continue with current (lower-cost) limits
- JSON parsing errors should be eliminated for Pro model runs

---

## Cost Impact

- Pro is already ~10x more expensive per token than Flash
- Doubling the token limit for Pro increases the maximum cost per memo from ~$1-3 to ~$2-6
- Since this is only for admin testing, the cost impact is minimal

