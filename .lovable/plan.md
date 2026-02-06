
# Workshop NPS Feedback Tool - Complete Implementation Plan

## Overview
Create a frictionless NPS feedback tool for workshop participants with two access points:
1. **Founder side**: Sidebar item in `/hub` that opens NPS modal
2. **Accelerator side**: Analytics dashboard with aggregated NPS data + shareable link generator

## User Flows

### Flow 1: Founder Submits NPS (via email deep-link)
```text
Email Link (/auth?redirect=/hub?openNps=true) 
    -> Auth Page 
    -> Hub (with ?openNps=true) 
    -> NPS Modal Auto-Opens
```

### Flow 2: Accelerator Manager Views Aggregated NPS
```text
Accelerator Dashboard -> Analytics Section -> "NPS Insights" Tab
    -> View aggregated scores, individual responses, trends
    -> Copy shareable NPS link button
```

## Database Changes

### New Table: `workshop_nps_responses`
```sql
CREATE TABLE workshop_nps_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  accelerator_invite_id UUID REFERENCES accelerator_invites(id),
  
  -- Slider scores (0-100)
  recommend_lecture INTEGER CHECK (recommend_lecture >= 0 AND recommend_lecture <= 100),
  investor_understanding INTEGER CHECK (investor_understanding >= 0 AND investor_understanding <= 100),
  strengths_weaknesses INTEGER CHECK (strengths_weaknesses >= 0 AND strengths_weaknesses <= 100),
  actionable_confidence INTEGER CHECK (actionable_confidence >= 0 AND actionable_confidence <= 100),
  mini_memo_usefulness INTEGER CHECK (mini_memo_usefulness >= 0 AND mini_memo_usefulness <= 100),
  mentoring_usefulness INTEGER CHECK (mentoring_usefulness >= 0 AND mentoring_usefulness <= 100),
  
  -- Free text
  additional_feedback TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id)
);

-- RLS Policies
ALTER TABLE workshop_nps_responses ENABLE ROW LEVEL SECURITY;

-- Founders can manage their own NPS responses
CREATE POLICY "Founders can manage their NPS responses"
  ON workshop_nps_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = workshop_nps_responses.company_id 
    AND companies.founder_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = workshop_nps_responses.company_id 
    AND companies.founder_id = auth.uid()
  ));

-- Accelerator members can view NPS responses for their portfolio companies
CREATE POLICY "Accelerator members can view portfolio NPS responses"
  ON workshop_nps_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM companies c
    JOIN accelerator_invites ai ON c.accelerator_invite_id = ai.id
    JOIN accelerator_members am ON ai.linked_accelerator_id = am.accelerator_id
    WHERE c.id = workshop_nps_responses.company_id
    AND am.user_id = auth.uid()
    AND am.joined_at IS NOT NULL
  ));

-- Admins can view all NPS responses
CREATE POLICY "Admins can view all NPS responses"
  ON workshop_nps_responses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

## Components to Create

### 1. WorkshopNPSModal.tsx
**Location**: `src/components/workshop/WorkshopNPSModal.tsx`

Premium glassmorphic modal with:
- 6 slider questions (0-100) with labels
- 1 free-text field for additional feedback
- Progress indicator
- Submit button with success animation
- "Already submitted" state that shows previous responses

**Questions:**
| # | Question | Slider Range |
|---|----------|--------------|
| 1 | How likely are you to recommend the lecture? | 0-100 |
| 2 | How clearly do you understand how professional investors think about your startup? | 0-100 |
| 3 | How much better do you understand your startup's strengths and weaknesses from an investor perspective? | 0-100 |
| 4 | How confident are you that you can translate learnings into concrete changes? | 0-100 |
| 5 | How useful was the "mini memo" exercise? | 0-100 |
| 6 | How useful was the "1-on-1 mentoring session"? | 0-100 |
| 7 | Anything else? | Free text |

### 2. useWorkshopNps.ts
**Location**: `src/hooks/useWorkshopNps.ts`

```typescript
// Hook exports:
export function useWorkshopNpsResponse(companyId: string | null)
  // Returns existing NPS response if any

export function useSaveWorkshopNps()
  // Mutation to save/update NPS response
```

### 3. AcceleratorNPSInsights.tsx
**Location**: `src/components/accelerator/sections/AcceleratorNPSInsights.tsx`

Analytics component for accelerator managers showing:
- **Summary Cards**: Average scores per question, response rate
- **Score Distribution**: Bar charts per question
- **Individual Responses**: Expandable list with company names and timestamps
- **Shareable Link Generator**: Button to copy NPS deep-link

### 4. NPSLinkGenerator.tsx
**Location**: `src/components/accelerator/NPSLinkGenerator.tsx`

Small component with:
- Copy-to-clipboard button for NPS link
- Preview of the generated link
- Optional: customize redirect destination

## Files to Modify

### 1. FounderSidebar.tsx
**Changes:**
- Add new prop: `onNpsClick: () => void`
- Add "Workshop NPS" menu item below "Workshop" (only visible when `hasAcceleratorAccess`)
- Icon: `MessageSquareHeart` from lucide-react

```typescript
// New sidebar item (after Workshop)
{hasAcceleratorAccess && (
  <SidebarMenuItem>
    <SidebarMenuButton onClick={onNpsClick}>
      <MessageSquareHeart className="w-4 h-4" />
      <span>Workshop NPS</span>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

### 2. FreemiumHub.tsx
**Changes:**
- Add `npsModalOpen` state
- Handle `?openNps=true` URL parameter in `useEffect`
- Clear URL param after opening modal
- Pass `onNpsClick` handler to `FounderSidebar`
- Render `WorkshopNPSModal`

```typescript
// URL param handling
useEffect(() => {
  if (searchParams.get('openNps') === 'true' && hasAcceleratorAccess && company?.id) {
    setNpsModalOpen(true);
    // Clear the param to prevent re-opening on refresh
    searchParams.delete('openNps');
    setSearchParams(searchParams, { replace: true });
  }
}, [searchParams, hasAcceleratorAccess, company?.id]);
```

### 3. AcceleratorAnalyticsSection.tsx
**Changes:**
- Add tabbed interface: "Portfolio Insights" | "NPS Insights"
- Integrate `AcceleratorNPSInsights` component as second tab

### 4. AcceleratorInvites.tsx (or new section)
**Changes:**
- Add "NPS Survey Link" section with copy button
- Generate link format: `{origin}/auth?redirect=/hub?openNps=true`

## Shareable Link Format

The accelerator manager can copy this link to share via email:
```
https://vc-insight-builder.lovable.app/auth?redirect=/hub?openNps=true
```

This ensures:
1. User is authenticated (lands on `/auth` if not logged in)
2. Redirect preserves the `openNps=true` query param
3. `/hub` auto-opens the NPS modal on load

## File Summary

| Action | File Path |
|--------|-----------|
| Create | `src/components/workshop/WorkshopNPSModal.tsx` |
| Create | `src/hooks/useWorkshopNps.ts` |
| Create | `src/components/accelerator/sections/AcceleratorNPSInsights.tsx` |
| Create | `src/components/accelerator/NPSLinkGenerator.tsx` |
| Modify | `src/components/founder/FounderSidebar.tsx` |
| Modify | `src/pages/FreemiumHub.tsx` |
| Modify | `src/components/accelerator/sections/AcceleratorAnalyticsSection.tsx` |
| Create | Database migration for `workshop_nps_responses` table |

## Technical Considerations

### Deep-Link Authentication Flow
The `/auth` page already preserves the full `redirect` parameter including query strings (verified in codebase). After login:
1. User redirected to `/hub?openNps=true`
2. `FreemiumHub` detects the param
3. Modal opens automatically
4. Param cleared to prevent re-triggering

### Accelerator Context Linking
When saving NPS response, we also store the `accelerator_invite_id` from the company record. This allows:
- Filtering NPS responses by accelerator
- Showing only relevant responses in each accelerator's dashboard

### Score Interpretation
| Score Range | Label | Color |
|-------------|-------|-------|
| 0-30 | Poor | Red |
| 31-50 | Below Average | Orange |
| 51-70 | Average | Yellow |
| 71-85 | Good | Green |
| 86-100 | Excellent | Primary |

## Success Criteria
1. Founders with accelerator access see "Workshop NPS" in sidebar
2. Deep-link `/auth?redirect=/hub?openNps=true` opens modal after auth
3. NPS responses save to database with company and accelerator context
4. Accelerator Analytics shows aggregated NPS data
5. Accelerator managers can copy shareable NPS link from dashboard
6. Previously submitted responses show in read-only mode with option to update
