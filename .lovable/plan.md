
# Complete Profile Accumulation System: Full Integration Plan

## Current State Summary

After extensive analysis, I've identified:

### Tools Already Integrated (6 of 27)
| Component | Status |
|-----------|--------|
| MarketTAMCalculator | ✅ Integrated |
| ImprovementQuestionCard | ✅ Integrated |
| VentureScaleDiagnostic | ✅ Integrated |
| BusinessModelStressTestCard | ✅ Integrated |
| TractionDepthTestCard | ✅ Integrated |
| ProblemEvidenceThreshold | ✅ Integrated |

### Tools NOT Yet Integrated (21 remaining)

**Strategic Tools (11 components):**
| Component | Target Section | Captures |
|-----------|----------------|----------|
| CompetitionChessboardCard | competitive_moat | Competitor positions, threat levels, likely moves |
| CompetitionMoatDurabilityCard | competitive_moat | Moat strength score, duration, erosion factors |
| MarketReadinessIndexCard | target_customer | Readiness score, market timing indicators |
| MarketVCNarrativeCard | target_customer | IC pitch, market timing, "why now" narrative |
| ProblemFounderBlindSpot | problem_core | Exaggerations, misdiagnoses, assumptions |
| SolutionCommoditizationTeardown | solution_core | Risk level, replicability analysis |
| SolutionCompetitorBuildAnalysis | competitive_moat | Build time/cost, defensibility factors |
| SolutionTechnicalDefensibility | solution_core | Defensibility score, technical barriers |
| TeamCredibilityGapCard | team_story | Credibility score, skills, identified gaps |
| VisionExitNarrativeCard | vision_ask | Acquirers, strategic value, comparable exits |
| VisionMilestoneMapCard | vision_ask | Milestones with metrics, critical path |
| VisionScenarioPlanningCard | vision_ask | Best/base/downside scenarios, probabilities |

**Calculators (2 components):**
| Component | Target Section | Captures |
|-----------|----------------|----------|
| RaiseCalculator | business_model, vision_ask | MRR, burn rate, ARR target, runway, raise amount |
| ValuationCalculator | vision_ask | Pre-money valuation, dilution, investor signal |

**Workshop (1 component):**
| Component | Target Section | Captures |
|-----------|----------------|----------|
| WorkshopSection | Multiple (based on section_key) | Freeform text with embedded metrics |

**Additional Tools (3 components):**
| Component | Target Section | Captures |
|-----------|----------------|----------|
| MicroCaseStudyCard | traction_proof | Case study details, proof points |
| LeadInvestorCard | vision_ask | Lead investor preferences, terms |
| VCInvestmentLogicCard | Multiple | Investment thesis, deal logic |

---

## New Feature: Audit Data Extraction for Paid Users

For users who have paid and received their full audit, the system should automatically extract relevant insights from the AI-generated analysis and queue them for profile enrichment.

### Data Sources from Paid Audit

1. **`memos.structured_content`** - Contains:
   - Section narratives (8 sections)
   - VC Quick Take summary
   - ARC Classification
   - Key insights per section

2. **`memo_tool_data`** - Contains:
   - Section scores (8 sections with score, rationale, improvements)
   - Strategic tool outputs (TAM analysis, competitive analysis, etc.)
   - AI-generated recommendations

### Audit Extraction Logic

When a user's audit is complete (`has_premium = true` AND `memo_content_generated = true`), trigger extraction:

```text
┌─────────────────────────────────────────────────────────────────┐
│              Paid Audit Generated                               │
│  (has_premium = true, memo_content_generated = true)            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
               ┌──────────────────────────────┐
               │   extract-audit-insights     │
               │   (Edge Function)            │
               │   - Parse structured_content │
               │   - Extract key metrics      │
               │   - Extract narratives       │
               │   - Queue to enrichment      │
               └──────────────┬───────────────┘
                               │
                               ▼
               ┌──────────────────────────────┐
               │  profile_enrichment_queue    │
               │  source_type: 'audit_insight'│
               └──────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Integrate Remaining Strategic Tools

Update the following 11 components to call `addEnrichment()` in their `onSave` handlers:

**File: `CompetitionChessboardCard.tsx`**
```typescript
import { useAddEnrichment } from "@/hooks/useProfileEnrichments";
// In component:
const { addEnrichment } = useAddEnrichment();
// In onSave:
addEnrichment('competitor_chessboard', 'CompetitionChessboardCard', {
  marketDynamics,
  competitors: competitors.map(c => ({
    name: c.name, position: c.currentPosition, threatLevel: c.threat24Months
  }))
}, 'competitive_moat');
```

Same pattern for all 11 remaining strategic tools, each capturing their relevant data.

### Phase 2: Integrate Calculators

**File: `RaiseCalculator.tsx`**
Add enrichment logging when user confirms their raise plan:
```typescript
addEnrichment('raise_calculator', 'RaiseCalculator', {
  monthlyBurn, currentMRR, monthlyMRRGrowth, arrTarget,
  recommendedRaise, impliedValuation, totalRunway, projectedARR
}, 'business_model');
```

**File: `ValuationCalculator.tsx`**
Add enrichment logging when user confirms valuation:
```typescript
addEnrichment('valuation_calculator', 'ValuationCalculator', {
  raiseAmount, preMoney, postMoney, actualDilution, signal
}, 'vision_ask');
```

### Phase 3: Integrate Workshop

**File: `WorkshopSection.tsx`**
Add metric extraction and enrichment on save:
```typescript
const handleBlur = async () => {
  if (hasChanges && answer.trim().length > 0) {
    await onSave(answer);
    // Queue for enrichment with metric detection
    addEnrichment('workshop', `workshop_${template.section_key}`, {
      section: template.section_key,
      answer: answer,
      sectionTitle: template.section_title
    }, template.section_key);
  }
};
```

### Phase 4: Create Audit Insight Extraction

**New Edge Function: `supabase/functions/extract-audit-insights/index.ts`**

This function will:
1. Check if company has completed paid audit
2. Parse `structured_content` from `memos` table
3. Extract key metrics from narratives
4. Extract structured data (ARC classification, scores)
5. Queue high-value insights to `profile_enrichment_queue`

```typescript
// Pseudocode
async function extractAuditInsights(companyId: string) {
  // 1. Verify paid status
  const company = await getCompany(companyId);
  if (!company.has_premium || !company.memo_content_generated) return;

  // 2. Fetch audit data
  const memo = await getMemo(companyId);
  const toolData = await getMemoToolData(companyId);

  // 3. Extract from structured_content
  const content = memo.structured_content;
  
  // Extract VC Quick Take metrics
  if (content.vcQuickTake) {
    await queueEnrichment({
      source_type: 'audit_insight',
      source_tool: 'vc_quick_take',
      input_data: {
        verdict: content.vcQuickTake.verdict,
        keyStrengths: content.vcQuickTake.strengths,
        keyWeaknesses: content.vcQuickTake.weaknesses
      },
      target_section_hint: null // AI will route appropriately
    });
  }

  // Extract from section narratives
  for (const section of content.sections) {
    // Extract any metrics mentioned in narrative
    const metrics = extractMetricsFromText(section.narrative);
    
    if (Object.keys(metrics).length > 0) {
      await queueEnrichment({
        source_type: 'audit_insight',
        source_tool: `audit_${section.name}`,
        input_data: section.narrative,
        target_section_hint: section.name,
        metrics_detected: metrics
      });
    }
  }

  // 4. Extract from tool data (section scores, etc.)
  for (const tool of toolData) {
    if (tool.tool_name === 'sectionScore') {
      const scoreData = tool.ai_generated_data;
      await queueEnrichment({
        source_type: 'audit_insight',
        source_tool: `score_${tool.section_name}`,
        input_data: {
          score: scoreData.score,
          improvements: scoreData.improvementAreas
        },
        target_section_hint: tool.section_name
      });
    }
  }
}
```

### Phase 5: Trigger Audit Extraction

Add a hook/call to trigger audit extraction:

1. **After payment completion** - In the payment success flow
2. **When visiting My Profile** - If audit exists but extraction hasn't run
3. **On dashboard load** - Check flag `audit_insights_extracted`

**New column on companies table:**
```sql
ALTER TABLE companies ADD COLUMN audit_insights_extracted BOOLEAN DEFAULT false;
```

### Phase 6: Update Section Mapping

Extend the edge function's `SECTION_MAPPING` to include all new source types:

```typescript
const SECTION_MAPPING: Record<string, string[]> = {
  // ... existing mappings ...
  
  // New strategic tool mappings
  'competitor_chessboard': ['competitive_moat'],
  'moat_durability': ['competitive_moat'],
  'market_readiness': ['target_customer'],
  'vc_narrative': ['target_customer'],
  'founder_blind_spot': ['problem_core'],
  'commoditization_teardown': ['solution_core'],
  'competitor_build': ['competitive_moat', 'solution_core'],
  'technical_defensibility': ['solution_core'],
  'team_credibility': ['team_story'],
  'exit_narrative': ['vision_ask'],
  'milestone_map': ['vision_ask'],
  'scenario_planning': ['vision_ask', 'business_model'],
  
  // Audit insight mappings
  'audit_insight': [], // Will use target_section_hint
  'vc_quick_take': ['problem_core', 'solution_core', 'team_story'],
};
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/extract-audit-insights/index.ts` | Extract insights from paid audit |

## Files to Modify

### Strategic Tools (11 files)
| File | Change |
|------|--------|
| `src/components/memo/tools/CompetitionChessboardCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/CompetitionMoatDurabilityCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/MarketReadinessIndexCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/MarketVCNarrativeCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/ProblemFounderBlindSpot.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/SolutionCommoditizationTeardown.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/SolutionCompetitorBuildAnalysis.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/SolutionTechnicalDefensibility.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/TeamCredibilityGapCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/VisionExitNarrativeCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/VisionMilestoneMapCard.tsx` | Add enrichment hook + onSave logging |
| `src/components/memo/tools/VisionScenarioPlanningCard.tsx` | Add enrichment hook + onSave logging |

### Calculators (2 files)
| File | Change |
|------|--------|
| `src/pages/RaiseCalculator.tsx` | Add enrichment hook + save logging |
| `src/pages/ValuationCalculator.tsx` | Add enrichment hook + save logging |

### Workshop (1 file)
| File | Change |
|------|--------|
| `src/components/workshop/WorkshopSection.tsx` | Add enrichment on handleBlur |

### Edge Functions (1 file)
| File | Change |
|------|--------|
| `supabase/functions/sync-profile-enrichments/index.ts` | Add new source type mappings |

### Database
| Change | Purpose |
|--------|---------|
| Add `audit_insights_extracted` column to `companies` | Track if audit extraction has run |

---

## Complete Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INPUT SOURCES                                  │
├────────────┬────────────┬────────────┬────────────┬────────────┬────────────┤
│ Strategic  │ Improve    │ Calculators│ Workshop   │ Venture    │ Paid Audit │
│ Tools (15) │ Your Score │ (Raise,Val)│ Sections   │ Diagnostic │ (Auto)     │
└─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┘
      │            │            │            │            │            │
      └────────────┴────────────┴────────────┴────────────┴────────────┘
                                       │
                    ┌──────────────────┴───────────────────┐
                    │                                      │
                    ▼                                      ▼
        ┌─────────────────────┐              ┌─────────────────────────┐
        │ extractAllMetrics() │              │ profile_enrichment_queue │
        │ (Client-side)       │              │ • source_type            │
        │ • Parse numbers     │──────────────▶ • input_data (JSONB)     │
        │ • Detect ARR/MRR    │              │ • metrics_detected       │
        │ • Calculate derived │              │ • target_section_hint    │
        └─────────────────────┘              └───────────┬─────────────┘
                                                         │
                    ┌────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                sync-profile-enrichments                      │
        │  1. Fetch pending enrichments                               │
        │  2. Aggregate metrics → calculate derived                   │
        │  3. Group by target section                                 │
        │  4. AI synthesizes content for each section                 │
        │  5. Upsert to memo_responses                                │
        │  6. Update unit_economics_json with all metrics             │
        │  7. Mark enrichments as processed                           │
        └──────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────────┐
        │   memo_responses    │       │   Financial Metrics     │
        │   (Profile Data)    │       │   Dashboard             │
        │   • 8 sections      │       │   • ARR, MRR, ACV       │
        │   • Updated content │       │   • LTV, CAC, Churn     │
        └─────────────────────┘       │   • Derived calculations│
                                      └─────────────────────────┘
```

---

## Summary

This implementation will:

1. **Integrate ALL 21 remaining input surfaces** with the profile enrichment pipeline
2. **Extract insights from paid audits** automatically, feeding AI-generated analysis back into the profile
3. **Detect and extract metrics** from any input (freeform text or structured)
4. **Calculate derived metrics** intelligently (ARR↔MRR, ACV, LTV:CAC, etc.)
5. **Store metrics in a single source of truth** (`unit_economics_json`)
6. **Display metrics in Financial Metrics Dashboard** on My Profile
7. **Ensure regenerated audits** use all accumulated data for more accurate analysis
