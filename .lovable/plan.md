
# Plan: Enhanced Problem & Solution Sections for Mini-Memo Workshop

## Overview
This enhancement will upgrade the AI prompt instructions in the `compile-workshop-memo` edge function to ensure the **Problem** and **Solution** sections of the mini-memo include specific investor-focused elements, even when founders provide sparse input. The AI will use contextual awareness to infer and fill gaps.

---

## Current State

The existing prompt tells the AI to:
- Match benchmark length (150-350 words)
- Use bullet points for scannability
- Expand sparse founder input with "relevant business context"

**What's Missing:**
- No explicit instructions for the Problem section to quantify pain, describe who feels it, explain how it's solved today, or estimate costs
- No explicit instructions for the Solution section to justify market need, highlight key features, explain "why now," or estimate ROI

---

## Proposed Changes

### 1. Add Section-Specific Instructions to the AI Prompt

Update `supabase/functions/compile-workshop-memo/index.ts` to include dedicated instruction blocks for Problem and Solution sections.

#### Problem Section Requirements

The AI will be instructed to ensure the enhanced output addresses:

| Element | Description |
|---------|-------------|
| **Quantify the problem** | Use founder data or estimate metrics (e.g., "SMEs spend X hours/week on manual invoicing") |
| **Make the pain tangible** | Include a concrete scenario or example showing how the pain materializes in daily operations |
| **Why is it getting worse?** | Identify trends, regulations, or market shifts accelerating the problem |
| **Who feels the pain?** | Clearly identify the ICP (Ideal Customer Profile) most affected |
| **How is it solved today?** | Describe current alternatives/workarounds, even if founder didn't provide this |
| **How big is the pain?** | Estimate economic cost (time, money, efficiency loss) if not provided |

#### Solution Section Requirements

The AI will be instructed to ensure the enhanced output addresses:

| Element | Description |
|---------|-------------|
| **Justify the market need** | Connect solution to validated problem; explain "why this, why now" |
| **Key features** | List 3-5 core capabilities that address the pain points |
| **Why do we need it?** | Articulate what changes if this solution exists vs. status quo |
| **ROI estimation** | If founder hasn't mentioned ROI, estimate time/cost/efficiency savings based on context |

---

## Technical Implementation

### File to Modify
- `supabase/functions/compile-workshop-memo/index.ts`

### Changes

**Step 1:** Add a new section in the prompt after `SECTIONS TO TRANSFORM` that provides section-specific generation rules:

```text
=== SECTION-SPECIFIC GENERATION RULES ===

FOR "PROBLEM" SECTION:
Your enhanced content MUST address these elements (infer from context if founder didn't provide):

1. QUANTIFY THE PROBLEM
   - Include specific numbers: hours wasted, money lost, frequency of occurrence
   - If founder didn't provide numbers, estimate based on industry context

2. MAKE THE PAIN TANGIBLE  
   - Include a concrete scenario (can be illustrative/fictional) showing how this pain plays out day-to-day
   - E.g., "Picture a finance manager spending 3 hours every Friday chasing overdue invoices..."

3. WHY IS IT GETTING WORSE?
   - Identify market trends, regulatory changes, or competitive pressures accelerating the problem

4. WHO FEELS THE PAIN?
   - Clearly name the ICP: job title, company size, industry segment
   - Describe why this specific persona bears the brunt

5. HOW IS IT SOLVED TODAY?
   - Describe current workarounds: manual processes, legacy tools, outsourcing
   - Highlight why these alternatives are inadequate

6. ECONOMIC COST OF THE PAIN
   - Estimate the dollar/time cost if founder hasn't quantified it
   - E.g., "This translates to an estimated $X,000/year in lost productivity"

---

FOR "SOLUTION" SECTION:
Your enhanced content MUST address these elements (infer from context if founder didn't provide):

1. JUSTIFY THE MARKET NEED
   - Connect directly to the problem: "Given that [problem], there is clear demand for..."
   - Explain timing: why this solution makes sense NOW

2. KEY FEATURES (list 3-5)
   - Describe core capabilities with specificity
   - Link each feature to a pain point from the Problem section

3. WHY DO WE NEED IT?
   - Articulate the transformation: what changes for the customer with this solution?
   - Contrast with status quo

4. ROI / OUTCOME ESTIMATION
   - If founder hasn't provided ROI, estimate based on:
     - Time savings (e.g., "reduces X hours to Y minutes")
     - Cost reduction (e.g., "cuts processing costs by ~Z%")
     - Efficiency gains (e.g., "improves collection rates from A% to B%")
   - Be explicit: "Based on typical implementations, customers could expect..."
```

**Step 2:** Update the system message to reinforce this behavior:
```text
"When founder input is sparse on quantification, pain scenarios, current alternatives, or ROI, you MUST infer reasonable estimates using industry context and business logic. Never leave these elements blank."
```

---

## Example: Before vs. After

### Problem Section (Sparse Founder Input)
**Founder wrote:** "Businesses struggle with late payments"

**Current AI Output:**
> Late payments are a significant challenge for businesses, causing cash flow issues and operational disruptions. Many companies experience delays in receiving payments...

**Enhanced AI Output:**
> Late payments represent a critical operational bottleneck for SMEs. In Europe alone, businesses are collectively owed over €10 trillion in outstanding receivables, with the average company spending 73 business days chasing payment.
>
> Picture a small manufacturing supplier: their finance manager spends every Friday afternoon—roughly 4 hours—manually sending reminders, reconciling partial payments, and escalating overdue accounts. This isn't productive work; it's survival mode.
>
> The pain falls hardest on:
> - **Small suppliers (10-50 employees)** who lack leverage to enforce payment terms
> - **Finance teams** drowning in manual collection workflows
> - **Business owners** forced to draw credit lines to cover gaps
>
> Today, these companies cope with spreadsheets, manual email reminders, or expensive factoring services that take 3-5% of invoice value. None of these solutions address the root cause.
>
> The problem is accelerating: recent EU regulations are pushing to cap payment terms at 30 days, signaling that the current system is unsustainable. The economic cost? An estimated $15,000-$50,000/year in lost productivity and financing costs for a typical SME.

---

## Deployment

After updating the edge function:
1. Redeploy `compile-workshop-memo` function
2. Test by regenerating a mini-memo with sparse founder input
3. Verify Problem and Solution sections include all required elements

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/compile-workshop-memo/index.ts` | Add section-specific instructions for Problem (6 elements) and Solution (4 elements) |
| Same file | Update system message to enforce inference when founder input is sparse |
