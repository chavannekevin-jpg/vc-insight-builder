

# Workshop Enhancement Plan: Pre-Seed Validation Coach

## Context

The Workshop tool is designed exclusively for **pre-seed companies** joining accelerator programs. At this stage, founders are focused on:
- **Problem discovery** - Does the problem actually exist?
- **Customer validation** - Have you talked to real potential customers?
- **Founder-market fit** - Why are YOU the right person to solve this?
- **Early evidence** - Interviews, LOIs, waitlists, not revenue metrics

This plan adjusts all enhancements to match pre-seed expectations, removing later-stage concerns like unit economics, NRR, and CAC/LTV that are irrelevant at this stage.

---

## What Changes from Original Plan

| Original Feature | Pre-Seed Adjustment |
|-----------------|---------------------|
| Pain Intensity Meter | Keep - core to pre-seed |
| Evidence Checklist (unit economics, NRR) | Remove metrics focus - replace with interview counts, LOIs, waitlist quality |
| Follow-up Questions | Reframe around "Mom Test" discovery questions |
| Blind Spot Warnings | Focus on validation gaps, not traction gaps |
| Validation Report | Grade based on problem clarity + validation depth, not revenue readiness |
| Stage-Specific Tips | Remove - all users are pre-seed |

---

## Enhanced Feature Set

### Feature 1: Problem Intensity Meter (Keep)

The existing Pain Validator is perfect for pre-seed. It measures exactly what matters:
- Urgency of the problem
- Frequency of the pain
- Willingness to pay (budget signals)
- Quality of current alternatives

**Technical:** Extract `analyzePainPoints()` from `MemoPainValidatorCard.tsx` into shared utility and integrate into Problem section.

---

### Feature 2: Pre-Seed Evidence Checklist

Replace metrics-focused checklists with validation-focused ones appropriate for pre-seed.

| Section | Pre-Seed Evidence Items |
|---------|------------------------|
| Problem | Customer interviews (20-50 target), pain quantified, urgency described, current workarounds identified |
| Solution | Prototype/MVP exists, unique approach explained, differentiation stated |
| Market | Target segment defined, initial beachhead identified, why-now timing explained |
| Business Model | Revenue model outlined (not proven), pricing hypothesis stated |
| GTM | First 10 customers identified, acquisition hypothesis defined |
| Team | Founder-market fit explained, relevant experience cited, missing skills acknowledged |
| Funding | Use of funds specified, 18-month milestones defined, path to seed metrics outlined |

**Key Insight:** At pre-seed, VCs invest in hypotheses and validation signals, not proven metrics.

---

### Feature 3: Discovery-Focused Follow-Up Prompts

Replace Mom Test style questions focused on validation, not traction:

**Problem Section:**
- "How many potential customers have you spoken to about this problem?"
- "What workarounds are they currently using?"
- "How did you discover this problem exists?"

**Solution Section:**
- "Have customers tried your prototype? What was their reaction?"
- "Why is now the right time for this solution?"

**Market Section:**
- "Who are your first 10 customers? Can you name them?"
- "Why this segment first vs. a larger market?"

**Team Section:**
- "What's your unfair insight about this problem?"
- "Have you worked in this industry before?"

---

### Feature 4: Pre-Seed Blind Spot Warnings

Focus on validation gaps that pre-seed investors care about:

| Warning Category | What We Flag |
|-----------------|--------------|
| Unvalidated Problem | "Sounds like an assumption - have you talked to customers?" |
| Premature Scaling Talk | "This is scaling language - focus on discovery first" |
| Missing Founder-Market Fit | "Why are YOU the right person to solve this?" |
| Weak Interview Evidence | "How many customer conversations have you had?" |
| Vanity Metrics | "Waitlist numbers mean less than quality of intent" |

---

### Feature 5: Pre-Seed Validation Report

The completion report grades validation quality, not investment readiness:

**Grade Categories:**
- **A: Strong Discovery** - Deep customer interviews, clear pain, validated hypothesis
- **B: Good Progress** - Some validation, clear problem, needs more evidence
- **C: Early Discovery** - Problem identified, limited validation
- **D: Hypothesis Only** - No evidence of customer conversations

**Report Sections:**
1. **Validation Depth Score** - Based on evidence of customer discovery
2. **Problem Clarity Score** - How well-articulated is the pain?
3. **Founder-Market Fit Score** - Why you + why now?
4. **Top 3 Validation Strengths** - What evidence supports your thesis
5. **Top 3 Discovery Gaps** - Where you need more customer conversations
6. **Next Steps Roadmap** - Specific validation activities (not fundraising prep)

**Example Roadmap Items:**
- "Conduct 15 more customer discovery interviews focused on [specific segment]"
- "Document 3 concrete LOIs or pilot commitments"
- "Clarify your unique insight from working in [industry]"

---

## Technical Implementation

### Database Changes

Add new JSONB columns to `workshop_templates`:

| Column | Type | Purpose |
|--------|------|---------|
| `preseed_evidence_items` | jsonb | Array of pre-seed appropriate evidence checklist items |
| `discovery_prompts` | jsonb | Mom Test style follow-up questions |

Add new column to `workshop_completions`:

| Column | Type | Purpose |
|--------|------|---------|
| `validation_report` | jsonb | AI-generated pre-seed validation analysis |

### New Components

| File | Purpose |
|------|---------|
| `src/components/workshop/WorkshopPainMeter.tsx` | Problem section intensity meter |
| `src/components/workshop/WorkshopEvidenceChecklist.tsx` | Pre-seed evidence tracking |
| `src/components/workshop/WorkshopDiscoveryPrompt.tsx` | Follow-up discovery questions |
| `src/components/workshop/WorkshopBlindSpotWarning.tsx` | Validation gap warnings |
| `src/components/workshop/WorkshopValidationReport.tsx` | Pre-seed validation grade report |
| `src/lib/preseedValidation.ts` | Shared validation utilities |

### Edge Function Updates

Update `compile-workshop-memo` to:
1. Generate a `validation_report` object with pre-seed appropriate grading
2. Focus AI synthesis on validation depth, not revenue readiness
3. Include specific discovery-focused next steps

### Modified Components

| File | Changes |
|------|---------|
| `WorkshopSection.tsx` | Add pain meter to Problem section, evidence checklist to all sections |
| `WorkshopCompletionScreen.tsx` | Add tabbed view with Validation Report |

---

## Implementation Phases

### Phase 1: Problem Intensity Meter
- Extract pain analysis to shared utility
- Create `WorkshopPainMeter.tsx`
- Integrate into Problem section only
- Real-time feedback as founder types

### Phase 2: Pre-Seed Evidence Checklist
- Add `preseed_evidence_items` column to templates
- Create `WorkshopEvidenceChecklist.tsx`
- Populate default items for all 7 sections
- Display collapsible checklist per section

### Phase 3: Discovery Follow-Up Prompts
- Add `discovery_prompts` column to templates
- Create `WorkshopDiscoveryPrompt.tsx`
- Show prompts when evidence items unchecked
- Append answers to main response

### Phase 4: Pre-Seed Blind Spot Warnings
- Create `analyze-workshop-section` edge function
- Create `WorkshopBlindSpotWarning.tsx`
- Show warnings before next section (optional dismiss)

### Phase 5: Pre-Seed Validation Report
- Extend `compile-workshop-memo` to generate validation grades
- Add `validation_report` column to completions
- Create `WorkshopValidationReport.tsx` with discovery-focused grading
- Tabbed view: Mini-Memo | Validation Report

---

## Example User Experience

### Problem Section with Pain Meter

```text
YOUR RESPONSE:
SMB retailers lose $50K annually to manual inventory tracking.
We've interviewed 35 store owners who all describe this as their
#1 operational headache...

PROBLEM INTENSITY: 72/100 [BURNING]
- Urgency:       ████████░░ 8/10
- Frequency:     ██████░░░░ 6/10  
- Willingness:   ████████░░ 8/10
- Alternatives:  ██████░░░░ 6/10

VALIDATION CHECKLIST:
[x] Customer interviews cited (35 mentioned)
[x] Pain quantified ($50K loss)
[x] Frequency described (daily issue)
[ ] Current workarounds documented
```

### Pre-Seed Validation Report

```text
VALIDATION GRADE: B+ (Good Progress)

VALIDATION DEPTH: 72/100
Strong customer interview evidence with quantified pain.
More detail needed on current workarounds and timing.

DISCOVERY STRENGTHS:
+ 35 customer interviews shows deep problem understanding
+ Clear pain quantification ($50K/year)
+ Specific target segment (SMB retailers)

DISCOVERY GAPS:
- Current workarounds not documented
- Founder-market fit could be stronger
- "Why now" timing argument missing

NEXT STEPS:
1. Document 3-5 specific workarounds customers currently use
2. Add your personal insight from working with retailers
3. Explain why this problem is solvable NOW vs. 5 years ago
```

---

## Summary

This plan transforms the Workshop from a documentation exercise into a **pre-seed validation coach** that:

1. **Teaches** founders what VCs actually look for at pre-seed (validation, not metrics)
2. **Measures** problem intensity and discovery depth in real-time
3. **Prompts** for missing validation evidence with specific discovery questions
4. **Warns** about common pre-seed mistakes (scaling talk, vanity metrics)
5. **Grades** validation quality and provides a clear discovery roadmap

The result: Founders complete the workshop understanding not just how to articulate their story, but where they need to deepen their customer discovery to be truly fundable at pre-seed.

