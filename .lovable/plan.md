
# Plan: AI-Powered Profile Accumulation System

## Problem Summary

Currently, user inputs across the platform are fragmented:
- **"My Profile"** (`memo_responses` table) is the canonical source for founder data
- **Strategic tools** (TAM Calculator, Pain Validator, etc.) save to `memo_tool_data` as "override layers"
- **"Improve Your Score"** answers are stored in browser localStorage only
- **Venture Scale Diagnostic** inputs are ephemeral and not persisted
- **Workshop data** is mapped to profile on completion, but nothing else is

**Result:** When a user fills in data across the platform, it doesn't accumulate in their profile, making regenerated audits miss valuable context.

---

## Solution Overview

Create a **Profile Enrichment Pipeline** that:
1. Captures user inputs from all sources
2. Logs them to a new `profile_enrichment_queue` table
3. Triggers an AI agent when the user visits "My Profile"
4. The AI reviews all queued inputs and intelligently merges them into the 8 core profile sections

---

## Technical Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                     User Input Sources                          │
├─────────────┬─────────────┬────────────────┬───────────────────┤
│ TAM Tool    │ Improve     │ Venture Scale  │ Other Strategic   │
│ Overrides   │ Your Score  │ Diagnostic     │ Tools             │
└──────┬──────┴──────┬──────┴───────┬────────┴────────┬──────────┘
       │             │              │                 │
       └─────────────┴──────────────┴─────────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │  profile_enrichment_queue    │
               │  (company_id, source, data)  │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │   User visits "My Profile"   │
               │   or clicks "Sync Profile"   │
               └──────────────┬───────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │   sync-profile-enrichments   │
               │   (Edge Function)            │
               │   - Fetches queued inputs    │
               │   - AI reviews & synthesizes │
               │   - Upserts to memo_responses│
               │   - Marks queue as processed │
               └──────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Database Schema

Create a new `profile_enrichment_queue` table to capture all user inputs:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `company_id` | UUID | FK to companies |
| `source_type` | TEXT | e.g., `tam_calculator`, `improve_score`, `venture_diagnostic` |
| `source_tool` | TEXT | Specific tool name |
| `input_data` | JSONB | The user's input (key-value pairs or freeform) |
| `target_section_hint` | TEXT | Optional hint for which profile section (e.g., `traction_proof`) |
| `processed` | BOOLEAN | Whether the AI has incorporated this |
| `processed_at` | TIMESTAMP | When it was processed |
| `created_at` | TIMESTAMP | When input was captured |

RLS policies will allow founders to insert/view their own enrichments.

---

### Phase 2: Capture User Inputs

Modify the following components to log inputs to `profile_enrichment_queue`:

1. **Strategic Tool Saves** (`EditableToolCard` children)
   - `MarketTAMCalculator.tsx` - Log TAM/SAM/SOM values and segment counts
   - `ProblemEvidenceThreshold.tsx` - Log evidence sources
   - `BusinessModelStressTestCard.tsx` - Log model parameters
   - Other 15+ tool components

2. **Improve Your Score** (`ImprovementQuestionCard.tsx`)
   - When user saves an answer, also insert to enrichment queue with `source_type: 'improve_score'`
   - Include the question asked and the answer provided

3. **Venture Scale Diagnostic** (`VentureScaleDiagnostic.tsx`)
   - Log the ACV input and any other user-provided data
   - Log the AI-generated insights as context

4. **Calculator Tools** (`RaiseCalculator.tsx`, `ValuationCalculator.tsx`)
   - Already write to `memo_responses` directly - add queue logging for audit trail

---

### Phase 3: AI Synthesis Edge Function

Create `supabase/functions/sync-profile-enrichments/index.ts`:

```typescript
// Pseudocode
async function syncProfileEnrichments(companyId: string) {
  // 1. Fetch all unprocessed enrichments for this company
  const enrichments = await getUnprocessedEnrichments(companyId);
  if (enrichments.length === 0) return { synced: 0 };

  // 2. Fetch current profile responses
  const currentProfile = await getCurrentMemoResponses(companyId);

  // 3. Build AI prompt with enrichments grouped by target section
  const prompt = buildEnrichmentPrompt(enrichments, currentProfile);

  // 4. Call Lovable AI to synthesize updates
  const aiResponse = await callLovableAI({
    model: "google/gemini-2.5-flash",
    prompt: `You are reviewing new information provided by a founder.
             Merge these inputs into their existing profile sections.
             Only update sections where new information adds value.
             Preserve the founder's voice and existing content.
             Return JSON with section updates.`
  });

  // 5. Upsert updated sections to memo_responses
  for (const [sectionKey, newContent] of Object.entries(aiResponse.updates)) {
    await upsertMemoResponse(companyId, sectionKey, newContent, 'enrichment_sync');
  }

  // 6. Mark enrichments as processed
  await markEnrichmentsProcessed(enrichmentIds);

  return { synced: enrichments.length, sectionsUpdated: Object.keys(aiResponse.updates) };
}
```

The AI prompt will:
- Receive all new inputs grouped by their target section
- See the current profile section content
- Intelligently merge new data without losing existing content
- Use the founder's voice and writing style
- Flag any conflicting information for review

---

### Phase 4: Frontend Integration

1. **"My Profile" Page** (`CompanyProfileEdit.tsx`)
   - On page load, check for unprocessed enrichments
   - Show a badge: "5 new insights to sync"
   - Trigger sync automatically or via button click
   - Show toast: "Profile updated with 3 new data points from TAM Calculator and Score Improvements"

2. **Visual Feedback**
   - Add an "enrichment pending" indicator on sections with new data
   - Show "Last synced: 2 hours ago" timestamp
   - Highlight sections that were recently updated by AI

3. **Profile Section Cards**
   - Show provenance: "Updated from Venture Scale Diagnostic on Jan 27"
   - Allow user to review and edit AI-merged content before saving

---

### Phase 5: Mapping Logic

Define how each input type maps to profile sections:

| Source Tool | Input Type | Target Section(s) |
|-------------|------------|-------------------|
| TAM Calculator | Market segments, TAM values | `target_customer` |
| TAM Calculator | ACV per segment | `business_model` |
| Venture Scale Diagnostic | ACV input | `business_model` |
| Venture Scale Diagnostic | Rating/verdict | `traction_proof` context |
| Pain Validator | Urgency/frequency scores | `problem_core` |
| Evidence Threshold | Evidence sources | `problem_core` |
| Business Model Stress Test | Revenue projections | `business_model` |
| Improve Score (Problem) | User answers | `problem_core` |
| Improve Score (Team) | User answers | `team_story` |
| Moat Durability | Competitive moat analysis | `competitive_moat` |

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/sync-profile-enrichments/index.ts` | AI synthesis edge function |
| `src/hooks/useProfileEnrichments.ts` | Hook to fetch pending enrichments and trigger sync |
| `src/components/profile/EnrichmentSyncBanner.tsx` | UI component showing pending enrichments |

### Modified Files
| File | Change |
|------|--------|
| `supabase/migrations/[new]_create_enrichment_queue.sql` | Create `profile_enrichment_queue` table |
| `src/components/memo/tools/MarketTAMCalculator.tsx` | Add enrichment queue logging on save |
| `src/components/memo/tools/ProblemEvidenceThreshold.tsx` | Add enrichment queue logging |
| `src/components/memo/ImprovementQuestionCard.tsx` | Persist to enrichment queue |
| `src/pages/VentureScaleDiagnostic.tsx` | Log ACV and result to enrichment queue |
| `src/pages/CompanyProfileEdit.tsx` | Add sync banner and auto-sync trigger |
| ~15 other tool components | Add enrichment queue logging |

---

## User Experience Flow

1. **User fills TAM Calculator** → Numbers saved to `profile_enrichment_queue`
2. **User answers "Improve Your Score"** → Answers saved to queue
3. **User runs Venture Scale Diagnostic** → ACV and insights saved to queue
4. **User visits "My Profile"** → Banner shows "3 new insights available"
5. **User clicks "Sync to Profile"** → AI merges all inputs intelligently
6. **Profile sections updated** → Toast shows "Market section updated with TAM data"
7. **User regenerates audit** → Full VC analysis now includes all the data

---

## Edge Cases Handled

- **Conflicting data**: AI notes conflicts in a dedicated field for founder review
- **Duplicate inputs**: Queue is deduplicated by source + data hash
- **Empty inputs**: Filtered out before AI processing
- **Large queue**: Processed in batches of 50 enrichments
- **AI failure**: Graceful fallback, queue items remain unprocessed

---

## Success Metrics

- Profile completion rate increases after tool usage
- Regenerated audits contain richer, more accurate data
- User engagement with profile editing increases
- Time-to-complete profile decreases
