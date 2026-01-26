
# Workshop Feature Implementation Plan

## Overview

A guided tutorial experience for accelerator cohort startups that teaches founders how to write in investor language while building a structured mini-memorandum. The workshop is accessible only to companies invited by an accelerator, with content templates managed from the admin panel.

---

## Architecture Overview

```text
                    ADMIN PANEL
                         |
    +--------------------+--------------------+
    |                                         |
    v                                         v
┌─────────────────────┐          ┌─────────────────────────────┐
│  Workshop Menu      │          │  workshop_templates table   │
│  - Mini Memo        │ -------> │  - section_name             │
│    Exercise         │          │  - benchmark_text           │
└─────────────────────┘          │  - guidance_text            │
                                 │  - example_questions        │
                                 └─────────────────────────────┘
                                              |
                                              v
                    ┌─────────────────────────────────────────┐
                    │           FOUNDER SPACE                 │
                    │  FounderSidebar (Workshop menu item)    │
                    │        |                                │
                    │        v                                │
                    │  /workshop route                        │
                    │        |                                │
                    │        v                                │
                    │  WorkshopPage.tsx                       │
                    │  - Left: Input textarea                 │
                    │  - Right: Benchmark example             │
                    │  - Progress through 8 sections          │
                    │        |                                │
                    │        v                                │
                    │  workshop_responses table               │
                    │  (maps to memo_responses on complete)   │
                    └─────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `workshop_templates`
Stores the admin-configured benchmark models for each workshop section.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `section_key` | text | Unique identifier (problem, solution, market, business_model, gtm, team, funding_strategy, investment_thesis) |
| `section_title` | text | Display title |
| `sort_order` | integer | Order in the flow |
| `guidance_text` | text | Investor-thinking explanation shown at top |
| `prompt_question` | text | The question/prompt for the founder |
| `benchmark_example` | text | Well-written example response (admin input) |
| `benchmark_tips` | jsonb | Array of tip strings highlighting what makes it good |
| `is_active` | boolean | Enable/disable sections |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### New Table: `workshop_responses`
Stores founder answers during the workshop flow.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `company_id` | uuid | FK to companies |
| `section_key` | text | Matches workshop_templates.section_key |
| `answer` | text | Founder's response |
| `completed_at` | timestamp | When section was completed |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### New Table: `workshop_completions`
Tracks overall workshop completion and stores the compiled mini-memo.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `company_id` | uuid | FK to companies |
| `completed_at` | timestamp | When all sections finished |
| `mini_memo_content` | text | AI-compiled final memo |
| `mapped_to_profile` | boolean | Whether data synced to memo_responses |
| `created_at` | timestamp | |

### RLS Policies
- Admins: Full access to `workshop_templates`
- Founders: Read `workshop_templates`, CRUD own `workshop_responses` and `workshop_completions`
- Non-accelerator companies: No access (enforced by checking `accelerator_invite_id IS NOT NULL`)

---

## Component Structure

### Admin Panel

```text
src/pages/
  AdminWorkshop.tsx              # Workshop template management
  AdminWorkshopMiniMemo.tsx      # Edit benchmark models

src/components/admin/
  AdminSidebar.tsx               # Add Workshop menu section
  workshop/
    WorkshopTemplateEditor.tsx   # Rich text editor for benchmarks
    WorkshopSectionCard.tsx      # Individual section card in list
```

### Founder Space

```text
src/pages/
  Workshop.tsx                   # Main workshop page

src/components/workshop/
  WorkshopLayout.tsx             # Split-pane layout
  WorkshopSection.tsx            # Single section view
  WorkshopProgress.tsx           # Step progress indicator
  WorkshopBenchmarkPanel.tsx     # Right-side benchmark display
  WorkshopInputPanel.tsx         # Left-side text input
  WorkshopCompletionScreen.tsx   # Final compiled memo view
  WorkshopLockedState.tsx        # Shown when not accelerator member
```

---

## Implementation Phases

### Phase 1: Database Setup
1. Create `workshop_templates` table with RLS policies
2. Create `workshop_responses` table with RLS policies  
3. Create `workshop_completions` table with RLS policies
4. Seed default template structure for 8 sections

### Phase 2: Admin Panel
1. Add "Workshop" collapsible section to `AdminSidebar.tsx`
2. Create `AdminWorkshop.tsx` - list view of workshop exercises
3. Create `AdminWorkshopMiniMemo.tsx` - benchmark model editor
   - WYSIWYG editor using existing RichTextEditor component
   - Preview panel showing how it will appear to founders
   - Save/publish controls

### Phase 3: Founder Sidebar Update
1. Extend `Company` interface in `useCompany.ts` to include `accelerator_invite_id`
2. Add `hasAcceleratorAccess` to `useCompany` return value
3. Update `FounderSidebarProps` to include `hasAcceleratorAccess: boolean`
4. Pass prop from `FounderLayout.tsx`
5. Add Workshop menu item to `FounderSidebar.tsx`:
   - Show with `GraduationCap` icon
   - If `hasAcceleratorAccess`: clickable, navigates to `/workshop`
   - If not: grayed out with lock icon, tooltip "Available for accelerator members"

### Phase 4: Workshop Flow (Frontend)
1. Create `/workshop` route in `App.tsx`
2. Build `Workshop.tsx` main page:
   - Fetch templates from `workshop_templates`
   - Fetch existing responses from `workshop_responses`
   - Progressive 8-step flow
3. Build `WorkshopSection.tsx`:
   - Left panel: Guidance text + textarea input
   - Right panel: Benchmark example with highlighted tips
   - Character/word count indicator
   - Auto-save on blur
4. Build `WorkshopProgress.tsx`:
   - Visual stepper showing all 8 sections
   - Completed sections marked with checkmark
   - Click to navigate between sections
5. Build `WorkshopCompletionScreen.tsx`:
   - Triggered when all 8 sections complete
   - Shows loading state while AI compiles
   - Displays final mini-memo
   - "Refine" and "Save to Profile" buttons

### Phase 5: AI Compilation Edge Function
Create `compile-workshop-memo` edge function:
1. Receives `company_id`
2. Fetches all `workshop_responses` for company
3. Fetches `workshop_templates` for benchmark context
4. Calls AI to compile cohesive mini-memo following benchmark style
5. Stores result in `workshop_completions.mini_memo_content`
6. Returns compiled memo

### Phase 6: Profile Data Mapping
1. On "Save to Profile" action:
   - Map workshop responses to `memo_responses` with appropriate `question_key` values
   - Create mapping: `problem` -> `problem_description`, etc.
   - Upsert to `memo_responses` table
2. Update `workshop_completions.mapped_to_profile = true`

---

## Section Mapping

| Workshop Section | Display Title | Maps to Question Key |
|-----------------|---------------|---------------------|
| problem | The Problem | problem_description |
| solution | The Solution | solution_description |
| market | The Market | market_size |
| business_model | Business Model | revenue_model |
| gtm | Go-to-Market | go_to_market |
| team | The Team | team_background |
| funding_strategy | Funding Strategy | funding_plan |
| investment_thesis | Investment Thesis | investment_ask |

---

## UI/UX Specifications

### Workshop Page Layout
```text
┌──────────────────────────────────────────────────────────────────┐
│  [Progress Bar: 8 steps]                                         │
│  Step 3 of 8: The Market                                         │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│  HOW INVESTORS THINK:       │  BENCHMARK EXAMPLE                 │
│  [Guidance text explaining  │  ─────────────────                 │
│   investor perspective]     │  "Our target market is the $47B    │
│                             │  enterprise HR software sector,    │
│  YOUR RESPONSE:             │  specifically the 12,000 mid-      │
│  ┌─────────────────────┐    │  market companies..."              │
│  │                     │    │                                    │
│  │  [Textarea input]   │    │  ✓ Specific TAM number             │
│  │                     │    │  ✓ Clear segmentation              │
│  │                     │    │  ✓ Quantified target customers     │
│  │                     │    │                                    │
│  └─────────────────────┘    │                                    │
│  450 words                  │                                    │
│                             │                                    │
│  [← Previous]  [Next →]     │                                    │
│                             │                                    │
└─────────────────────────────┴────────────────────────────────────┘
```

### Locked State (Non-Accelerator)
```text
┌─────────────────────────────────────────────┐
│         🔒 Workshop                         │
│                                             │
│  This feature is available for startups    │
│  participating in an accelerator program.  │
│                                             │
│  If you've been invited to a program,      │
│  please use your invitation link.          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Technical Notes

### Access Control
- Check `company.accelerator_invite_id !== null` for workshop access
- RLS policy on `workshop_responses` ensures company ownership
- Admin-only access to `workshop_templates` via `has_role(auth.uid(), 'admin')`

### Data Flow
1. Admin creates/edits benchmark templates
2. Founder accesses workshop via sidebar
3. Each section saves to `workshop_responses` on blur/navigation
4. Upon completing all 8 sections, edge function compiles memo
5. Founder reviews and maps to profile

### Existing Patterns Followed
- Uses `AdminLayout` wrapper for admin pages (like `AdminSimplifiedMemo.tsx`)
- Uses `FounderLayout` wrapper for founder pages
- Rich text editing via existing `RichTextEditor` component
- Follows `Collapsible` section pattern in sidebars
- Uses `useQuery` hooks for data fetching
- Toast notifications for feedback

---

## Files to Create/Modify

### New Files
1. `src/pages/AdminWorkshop.tsx` - Workshop list page
2. `src/pages/AdminWorkshopMiniMemo.tsx` - Benchmark editor
3. `src/pages/Workshop.tsx` - Founder workshop page
4. `src/components/workshop/WorkshopLayout.tsx`
5. `src/components/workshop/WorkshopSection.tsx`
6. `src/components/workshop/WorkshopProgress.tsx`
7. `src/components/workshop/WorkshopBenchmarkPanel.tsx`
8. `src/components/workshop/WorkshopInputPanel.tsx`
9. `src/components/workshop/WorkshopCompletionScreen.tsx`
10. `src/components/workshop/WorkshopLockedState.tsx`
11. `supabase/functions/compile-workshop-memo/index.ts`
12. `src/hooks/useWorkshopData.ts`

### Modified Files
1. `src/components/admin/AdminSidebar.tsx` - Add Workshop menu
2. `src/components/founder/FounderSidebar.tsx` - Add Workshop item
3. `src/components/founder/FounderLayout.tsx` - Pass accelerator access prop
4. `src/hooks/useCompany.ts` - Include accelerator_invite_id in Company interface
5. `src/App.tsx` - Add workshop routes

### Database Migrations
1. Create `workshop_templates` table
2. Create `workshop_responses` table
3. Create `workshop_completions` table
4. Add RLS policies
5. Seed default template structure
