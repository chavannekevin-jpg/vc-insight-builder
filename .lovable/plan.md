
# Plan: Full Audit Sharing for External Partners

## Overview
Upgrade the shared memo view so external partners see the **complete investment audit** with all VC tools, section scores, action plans, and analysis — matching what admins see in `AdminMemoView`.

---

## Current Gap

| Feature | AdminMemoView | SharedMemoView (Current) |
|---------|---------------|--------------------------|
| Company header + score | Yes | Yes |
| VC Quick Take | Yes | Yes |
| AI Conclusion | Yes | Yes |
| Section narratives | Yes | Yes |
| **Section scores** | Yes | No |
| **Action Plan** | Yes | No |
| **Pain Validator, Differentiation Matrix** | Yes | No |
| **TAM Calculator, Moat Scores** | Yes | No |
| **Team Gap Analysis** | Yes | No |
| **Unit Economics** | Yes | No |
| **VC Perspective per section** | Yes | No |
| **Benchmarks & Case Studies** | Yes | No |
| **90-Day Plans, VC Investment Logic** | Yes | No |
| **Lead Investor Requirements** | Yes | No |
| **Anchored Assumptions** | Yes | No |

---

## Solution Architecture

### 1. Expand Database Access for Shared Memos

Create additional shareable views that expose tool data and responses for valid share tokens:

```text
┌─────────────────────────────────────────────────────────────┐
│                    shared_memo_view                         │
│  (existing - company info + memo structured_content)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            shareable_section_scores (NEW)                   │
│  Exposes memo_tool_data for companies with active links     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            shareable_memo_responses (NEW)                   │
│  Exposes memo_responses for companies with active links     │
└─────────────────────────────────────────────────────────────┘
```

### 2. Database Migration

Create two new views that join against `memo_share_links` to only expose data for companies with active share links:

**shareable_section_scores:**
- Joins `memo_tool_data` with `memo_share_links`
- Only returns tool data for companies with active, non-expired share links
- Exposes: `company_id`, `section_name`, `tool_name`, `ai_generated_data`, `user_overrides`

**shareable_memo_responses:**
- Joins `memo_responses` with `memo_share_links`
- Only returns responses for companies with active share links
- Exposes: `company_id`, `question_key`, `answer`

### 3. Update SharedMemoView Component

Transform from a simple viewer to a full audit display:

**Data Fetching:**
- Fetch tool data from `shareable_section_scores` view
- Fetch responses from `shareable_memo_responses` view
- Process into the same `sectionTools` format used by AdminMemoView

**Rendering:**
- Import and display all section-specific tool cards:
  - Problem: PainValidator, EvidenceThreshold, FounderBlindSpot
  - Solution: DifferentiationCard, TechnicalDefensibility, CommoditizationTeardown
  - Market: VCScaleCard, TAMCalculator, ReadinessIndex
  - Competition: MoatScoreCard, CompetitorChessboard, MoatDurability
  - Team: TeamList, TeamGapCard, CredibilityGapCard
  - Business: UnitEconomicsCard, ModelStressTest
  - Traction: MomentumCard, TractionDepthTest
  - Vision: MilestoneMap, ScenarioPlanning, ExitNarrative, ExitPath
- Show VC Perspective for each section (analysis, questions, benchmarking)
- Display Benchmarks, Case Studies, VC Investment Logic, 90-Day Plans
- Add Anchored Assumptions card at the top
- Add Action Plan summary

---

## Technical Implementation

### Step 1: Database Migration

```sql
-- Create view for shareable section tools/scores
CREATE OR REPLACE VIEW public.shareable_section_scores
WITH (security_invoker=on) AS
SELECT 
    mtd.company_id,
    mtd.section_name,
    mtd.tool_name,
    mtd.ai_generated_data,
    mtd.user_overrides,
    mtd.data_source
FROM public.memo_tool_data mtd
WHERE EXISTS (
    SELECT 1 FROM public.memo_share_links sl
    WHERE sl.company_id = mtd.company_id
    AND sl.is_active = true
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
);

-- Create view for shareable memo responses
CREATE OR REPLACE VIEW public.shareable_memo_responses
WITH (security_invoker=on) AS
SELECT 
    mr.company_id,
    mr.question_key,
    mr.answer
FROM public.memo_responses mr
WHERE EXISTS (
    SELECT 1 FROM public.memo_share_links sl
    WHERE sl.company_id = mr.company_id
    AND sl.is_active = true
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
);

-- Grant anon access
GRANT SELECT ON public.shareable_section_scores TO anon;
GRANT SELECT ON public.shareable_memo_responses TO anon;
```

### Step 2: Update SharedMemoView.tsx

**New Imports:**
```typescript
import { MemoActionPlan } from "@/components/memo/MemoActionPlan";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoPainValidatorCard } from "@/components/memo/MemoPainValidatorCard";
import { MemoDifferentiationCard } from "@/components/memo/MemoDifferentiationCard";
// ... all other tool imports from AdminMemoView
```

**Data Fetching:**
```typescript
// After fetching shared_memo_view data...

// Fetch tool data for this company
const { data: toolData } = await supabase
  .from("shareable_section_scores")
  .select("*")
  .eq("company_id", data.company_id);

// Fetch responses for anchored assumptions
const { data: responsesData } = await supabase
  .from("shareable_memo_responses")
  .select("*")
  .eq("company_id", data.company_id);

// Process into sectionTools format (same logic as AdminMemoView)
```

**Rendering:**
- Mirror the AdminMemoView section rendering logic
- Show all tool cards based on section type
- Display VC Perspective (vcReflection) for each section
- Include Action Plan at the top

---

## Files to Modify

| File | Changes |
|------|---------|
| New migration file | Create `shareable_section_scores` and `shareable_memo_responses` views |
| `src/pages/SharedMemoView.tsx` | Major update: fetch tool data, add all tool card imports, mirror AdminMemoView rendering |

---

## Security Considerations

- Views only expose data for companies with **active, non-expired** share links
- No authentication required (by design - public sharing)
- Token-based access control remains in place
- View count tracking continues to work

---

## Visual Result

Partners accessing the shared link will see the complete investment audit:
1. Company header with Fundability Score
2. Anchored Assumptions (key metrics)
3. VC Quick Take
4. Action Plan summary
5. Each section with:
   - Section score card
   - Hero statement + narrative
   - Section-specific tools (Pain Validator, TAM, Moat, etc.)
   - VC Perspective (analysis, questions, benchmarking, conclusion)
   - Benchmarks and Case Studies
   - VC Investment Logic
   - 90-Day Action Plan
   - Lead Investor Requirements
6. Footer with confidentiality notice
