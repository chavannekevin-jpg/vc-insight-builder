
# Workshop AI Output Enhancement

## Problem Summary

The Workshop's "Compile Mini-Memo" feature produces outputs that are too short. The benchmark examples in the database are detailed, multi-paragraph texts (200-400+ words per section), but the AI is generating brief summaries instead of matching this depth.

**Current Issue:**
- AI prompt says "use benchmark as style guide" but doesn't explicitly require matching length/depth
- Token budget (6000) may be insufficient for 8 detailed sections + executive summary + validation report
- No explicit word count or paragraph requirements per section

---

## Solution Overview

Enhance the AI prompt in `compile-workshop-memo/index.ts` to:
1. **Explicitly require matching benchmark length and structure**
2. **Increase token budget** to accommodate detailed outputs
3. **Add word count targets** per section (e.g., "150-300 words per section")
4. **Strengthen the instruction hierarchy** to prioritize depth over brevity

---

## Technical Changes

### File: `supabase/functions/compile-workshop-memo/index.ts`

| Area | Current | Enhanced |
|------|---------|----------|
| Token limit | 6000 | 10000 |
| Length guidance | "Match the benchmark's professional tone and structure" | Explicit word count targets and paragraph requirements |
| AI role | "Transform founder inputs" | "Expand and elaborate founder inputs to match benchmark depth" |
| Quality signal | None | "Your output should be approximately as long as the benchmark example" |

### Specific Prompt Changes

**1. Update the main task instruction (lines 104-106):**
```
Current:
"Transform each founder's raw input into polished, investor-ready prose. 
Use the benchmark example as a style guide - match the tone, structure, 
and level of detail."

Enhanced:
"Expand and elaborate each founder's raw input into comprehensive, 
investor-ready analysis. The benchmark example is your LENGTH AND 
QUALITY TARGET - your output for each section should be approximately 
the same length (150-350 words), with the same level of depth, 
structure, and specificity as the benchmark."
```

**2. Add explicit length requirements to section instructions (lines 142-147):**
```
Current:
"For each user-written section, produce a polished paragraph that:
- Maintains the founder's core message and facts
- Matches the benchmark's professional tone and structure"

Enhanced:
"For each user-written section, produce a COMPREHENSIVE analysis that:
- Matches the BENCHMARK LENGTH (150-350 words, multiple paragraphs)
- Maintains the founder's core message and facts
- Replicates the benchmark's structure (e.g., bullet points, numbered lists, 
  multiple sub-sections where appropriate)
- Adds professional framing, context, and investor-focused language
- Includes specific numbers/metrics if the founder provided them
- Extrapolates reasonable business logic where founder input is sparse"
```

**3. Add quality validation instruction:**
```
"CRITICAL: If a founder's input is brief, you must EXPAND it to match 
the benchmark length by:
- Adding relevant business context
- Structuring with clear sub-sections
- Including standard investor considerations for that section
- Using professional VC terminology and framing"
```

**4. Update token budget:**
```typescript
// Line 212
max_tokens: 6000  →  max_tokens: 10000
```

**5. Enhance system message:**
```
Current:
"You are an expert investment memo writer. Transform founder inputs into 
polished, professional investor communications. Match the style of 
provided benchmark examples."

Enhanced:
"You are an expert investment memo writer creating comprehensive VC-grade 
memorandums. Your outputs must MATCH THE LENGTH AND DEPTH of the 
provided benchmark examples - typically 150-350 words per section with 
multiple paragraphs. Brief, summarized outputs are NOT acceptable. 
Always respond with valid JSON only."
```

---

## Expected Outcome

After this change:

| Metric | Before | After |
|--------|--------|-------|
| Average words per section | ~50-100 | ~150-350 |
| Paragraph count per section | 1 | 2-4 |
| Structure elements (bullets, lists) | Rare | Common |
| Benchmark alignment | Low | High |

---

## Files Modified

1. `supabase/functions/compile-workshop-memo/index.ts`
   - Enhanced AI prompt with explicit length requirements
   - Increased token budget from 6000 to 10000
   - Updated system message for depth emphasis
   - Added quality validation instructions

---

## Deployment

The edge function will be automatically deployed after the changes are saved.
