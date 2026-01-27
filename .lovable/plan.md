

# Comprehensive Platform Audit: Profile Accumulation & Smart Metric Extraction

## Executive Summary

After extensive analysis of the startup platform, I've identified **24+ input surfaces** where users can modify information. Of these, only **3 are currently integrated** with the new profile enrichment system. Additionally, the platform lacks **intelligent metric extraction and calculation** - users can say "100k ARR with 2 clients" in any input field, but this data isn't parsed and stored as structured metrics (ARR, ACV, MRR).

This plan addresses both gaps:
1. **Complete enrichment integration** across all input surfaces
2. **AI-powered metric intelligence** that extracts, calculates, and stores derived metrics

---

## Gap Analysis: Input Surfaces

### Currently Integrated (3 tools)
| Component | Integration Status |
|-----------|-------------------|
| MarketTAMCalculator | Logs to enrichment queue |
| ImprovementQuestionCard | Logs to enrichment queue |
| VentureScaleDiagnostic | Logs to enrichment queue |

### Not Integrated (21+ tools)

**Strategic Analysis Tools (in `/src/components/memo/tools/`):**
| Component | Current State | Target Section |
|-----------|--------------|----------------|
| ProblemEvidenceThreshold | Saves to memo_tool_data only | problem_core |
| ProblemFounderBlindSpot | Saves to memo_tool_data only | problem_core |
| SolutionTechnicalDefensibility | Saves to memo_tool_data only | solution_core |
| SolutionCommoditizationTeardown | Saves to memo_tool_data only | solution_core |
| SolutionCompetitorBuildAnalysis | Saves to memo_tool_data only | competitive_moat |
| MarketReadinessIndexCard | Saves to memo_tool_data only | target_customer |
| MarketVCNarrativeCard | Saves to memo_tool_data only | target_customer |
| CompetitionChessboardCard | Saves to memo_tool_data only | competitive_moat |
| CompetitionMoatDurabilityCard | Saves to memo_tool_data only | competitive_moat |
| BusinessModelStressTestCard | Saves to memo_tool_data only | business_model |
| TractionDepthTestCard | Saves to memo_tool_data only | traction_proof |
| TeamCredibilityGapCard | Saves to memo_tool_data only | team_story |
| VisionMilestoneMapCard | Saves to memo_tool_data only | vision_ask |
| VisionScenarioPlanningCard | Saves to memo_tool_data only | vision_ask |
| VisionExitNarrativeCard | Saves to memo_tool_data only | vision_ask |

**Calculator Tools:**
| Component | Current State | Data Captured |
|-----------|--------------|---------------|
| RaiseCalculator | Saves to memo_responses directly | MRR, ARR, burn rate, runway |
| ValuationCalculator | Saves to memo_responses directly | Valuation, dilution |
| UnitEconomicsEditor | Saves to memo_responses as unit_economics_json | All structured metrics |

**Workshop:**
| Component | Current State | Notes |
|-----------|--------------|-------|
| WorkshopSection | Maps to profile on completion | Freeform text contains metrics |

---

## Gap Analysis: Metric Intelligence

### Current Problems

1. **No extraction from freeform text**: When a user writes "We have 100k ARR with 2 enterprise clients", this is stored as plain text. The ACV ($50k) and MRR ($8.3k) are never calculated or stored.

2. **No derived metric calculations**: The system can display metrics but doesn't automatically derive:
   - MRR from ARR (ARR / 12)
   - ACV from ARR + customers (ARR / customers)
   - LTV:CAC ratio from LTV + CAC
   - Runway from burn rate + cash

3. **Metrics scattered across tables**: Financial data lives in:
   - `memo_responses` (unit_economics_json)
   - `memo_tool_data` (TAM calculator ACV values)
   - Freeform text in profile sections
   
4. **No single source of truth**: When TAM Calculator has ACV of $25k but traction section mentions "50k contracts", there's no reconciliation.

### Required Intelligence

The system should:
1. **Extract metrics** from any text input using regex + AI
2. **Calculate derived metrics** automatically
3. **Store to a canonical location** (`unit_economics_json`)
4. **Display in Financial Metrics Dashboard** on My Profile

---

## Implementation Plan

### Phase 1: Extend Enrichment Queue for Metrics

Add a `metrics_detected` JSONB column to track extracted financial data:

```sql
ALTER TABLE profile_enrichment_queue 
ADD COLUMN metrics_detected JSONB DEFAULT NULL;
```

This will store structured metrics found in each enrichment:
```json
{
  "arr": 100000,
  "mrr": 8333,
  "customers": 2,
  "acv": 50000,
  "source_confidence": "high",
  "calculation_notes": "ACV derived from ARR/customers"
}
```

### Phase 2: Create Metric Extraction Utility

Create a shared utility that all input surfaces can use to detect and extract metrics from any text or structured input.

**New file: `src/lib/metricExtractor.ts`**

```typescript
interface ExtractedMetrics {
  arr?: number;
  mrr?: number;
  acv?: number;
  customers?: number;
  ltv?: number;
  cac?: number;
  churnRate?: number;
  growthRate?: number;
  burnRate?: number;
  runway?: number;
  revenue?: number;
}

// Regex patterns for metric extraction
const METRIC_PATTERNS = {
  arr: /(?:ARR|annual recurring revenue)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K|M|million)?/gi,
  mrr: /(?:MRR|monthly recurring revenue)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K)?/gi,
  acv: /(?:ACV|annual contract value)[:\s]*[\$€£]?([\d,]+(?:\.\d+)?)\s*(?:k|K)?/gi,
  customers: /(?:(\d+)\s*(?:customers?|clients?|users?|accounts?))/gi,
  // ... more patterns
};

export function extractMetricsFromText(text: string): ExtractedMetrics;
export function extractMetricsFromStructured(data: Record<string, any>): ExtractedMetrics;
export function calculateDerivedMetrics(metrics: ExtractedMetrics): ExtractedMetrics;
export function mergeMetrics(existing: ExtractedMetrics, newMetrics: ExtractedMetrics): ExtractedMetrics;
```

### Phase 3: Update Enrichment Hook with Metric Detection

Enhance `useAddEnrichment` to automatically detect metrics:

```typescript
const addEnrichment = async (
  sourceType: string,
  sourceTool: string,
  inputData: Record<string, any>,
  targetSectionHint?: string
) => {
  // Auto-detect metrics from input data
  const textContent = typeof inputData === 'string' 
    ? inputData 
    : JSON.stringify(inputData);
  
  const detectedMetrics = extractMetricsFromText(textContent);
  const derivedMetrics = calculateDerivedMetrics(detectedMetrics);
  
  await supabase.from('profile_enrichment_queue').insert({
    company_id: companyId,
    source_type: sourceType,
    source_tool: sourceTool,
    input_data: inputData,
    target_section_hint: targetSectionHint,
    metrics_detected: Object.keys(derivedMetrics).length > 0 ? derivedMetrics : null
  });
};
```

### Phase 4: Integrate Remaining Tools

Add enrichment logging to all 21 unintegrated tools. Each tool's `onSave` or `onUpdate` handler will call `addEnrichment()`.

**Example for BusinessModelStressTestCard:**
```typescript
const handleSave = () => {
  if (currentData) {
    onUpdate?.(currentData);
    
    // Log enrichment with detected metrics
    addEnrichment(
      'business_model_stress_test',
      'BusinessModelStressTestCard',
      {
        overallResilience: currentData.overallResilience,
        scenarios: currentData.scenarios,
        // Any revenue/margin data from scenarios
      },
      'business_model'
    );
  }
  setIsEditing(false);
};
```

### Phase 5: Enhanced AI Sync with Metric Processing

Update `sync-profile-enrichments` edge function to:

1. **Aggregate all detected metrics** from pending enrichments
2. **Reconcile conflicts** (prioritize more recent, higher confidence)
3. **Calculate derived metrics**
4. **Update `unit_economics_json`** in memo_responses
5. **Synthesize text into profile sections** (existing behavior)

```typescript
// In sync-profile-enrichments/index.ts

// Step 1: Aggregate metrics from all enrichments
const allMetrics: ExtractedMetrics[] = [];
for (const enrichment of enrichments) {
  if (enrichment.metrics_detected) {
    allMetrics.push({
      ...enrichment.metrics_detected,
      source: enrichment.source_tool,
      timestamp: enrichment.created_at
    });
  }
}

// Step 2: Reconcile and calculate derived metrics
const reconciledMetrics = reconcileMetrics(allMetrics);
const derivedMetrics = calculateDerivedMetrics(reconciledMetrics);

// Step 3: Update unit_economics_json
if (Object.keys(derivedMetrics).length > 0) {
  const existingMetrics = await getExistingMetrics(companyId);
  const mergedMetrics = mergeMetrics(existingMetrics, derivedMetrics);
  
  await supabaseClient
    .from("memo_responses")
    .upsert({
      company_id: companyId,
      question_key: "unit_economics_json",
      answer: JSON.stringify(mergedMetrics),
      source: "enrichment_sync"
    });
}
```

### Phase 6: Derived Metric Calculations

The system will automatically calculate:

| If We Have | We Calculate |
|------------|--------------|
| ARR | MRR = ARR / 12 |
| MRR | ARR = MRR × 12 |
| ARR + Customers | ACV = ARR / Customers |
| ACV + Customers | ARR = ACV × Customers |
| LTV + CAC | LTV:CAC Ratio = LTV / CAC |
| CAC + LTV:CAC | LTV = CAC × Ratio |
| Burn Rate + Cash | Runway = Cash / Burn Rate |
| MRR + Churn Rate | LTV = MRR / Churn Rate |
| CAC + MRR | Payback Months = CAC / MRR |

### Phase 7: Calculator Integration

Update RaiseCalculator and ValuationCalculator to also log enrichments:

```typescript
// In RaiseCalculator.tsx handleConfirmRaise
addEnrichment(
  'raise_calculator',
  'RaiseCalculator',
  {
    monthlyBurn,
    currentMRR,
    monthlyMRRGrowth,
    projectedARR,
    runway: totalRunway
  },
  'business_model'
);
```

### Phase 8: Workshop Metric Extraction

When workshop answers are saved, extract any metrics mentioned:

```typescript
// In WorkshopSection.tsx handleBlur
const detectedMetrics = extractMetricsFromText(answer);
if (Object.keys(detectedMetrics).length > 0) {
  addEnrichment(
    'workshop',
    `workshop_${template.section_key}`,
    { answer, detectedMetrics },
    template.section_key
  );
}
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/lib/metricExtractor.ts` | Regex + calculation logic for metric extraction |

### Modified Files

**Database:**
| File | Change |
|------|--------|
| Migration | Add `metrics_detected` column to `profile_enrichment_queue` |

**Enrichment System:**
| File | Change |
|------|--------|
| `src/hooks/useProfileEnrichments.ts` | Add metric detection to `addEnrichment()` |
| `supabase/functions/sync-profile-enrichments/index.ts` | Add metric aggregation, reconciliation, and storage |

**Strategic Tools (15 files):**
| File | Change |
|------|--------|
| `src/components/memo/tools/ProblemEvidenceThreshold.tsx` | Add enrichment logging |
| `src/components/memo/tools/ProblemFounderBlindSpot.tsx` | Add enrichment logging |
| `src/components/memo/tools/SolutionTechnicalDefensibility.tsx` | Add enrichment logging |
| `src/components/memo/tools/SolutionCommoditizationTeardown.tsx` | Add enrichment logging |
| `src/components/memo/tools/SolutionCompetitorBuildAnalysis.tsx` | Add enrichment logging |
| `src/components/memo/tools/MarketReadinessIndexCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/MarketVCNarrativeCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/CompetitionChessboardCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/CompetitionMoatDurabilityCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/BusinessModelStressTestCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/TractionDepthTestCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/TeamCredibilityGapCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/VisionMilestoneMapCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/VisionScenarioPlanningCard.tsx` | Add enrichment logging |
| `src/components/memo/tools/VisionExitNarrativeCard.tsx` | Add enrichment logging |

**Calculators:**
| File | Change |
|------|--------|
| `src/pages/RaiseCalculator.tsx` | Add enrichment logging |
| `src/pages/ValuationCalculator.tsx` | Add enrichment logging |

**Workshop:**
| File | Change |
|------|--------|
| `src/components/workshop/WorkshopSection.tsx` | Add metric extraction on save |

---

## User Experience Flow

1. **User opens TAM Calculator** → enters 500 SMBs at $10k ACV
2. **System detects**: ACV = $10,000, Customer Segment = 500
3. **User visits My Profile** → sees "5 new insights to sync"
4. **AI Sync runs**:
   - Merges TAM data into Target Customer section
   - Extracts ACV ($10k) → calculates if user has ARR, derives customer count
   - Updates `unit_economics_json` with ACV: 10000
5. **Financial Metrics Dashboard** now displays ACV alongside other metrics
6. **User regenerates audit** → all tools use consistent $10k ACV

---

## Example: Smart Metric Calculation

**User inputs in Traction section:**
> "We closed 2 enterprise deals this quarter for a total of €100k ARR"

**System extracts:**
- ARR: €100,000
- Customers: 2

**System calculates:**
- MRR: €8,333 (ARR / 12)
- ACV: €50,000 (ARR / Customers)

**Stored in `unit_economics_json`:**
```json
{
  "arr": "100000",
  "mrr": "8333",
  "customers": "2",
  "acv": "50000",
  "source_confidence": "high",
  "last_updated": "2026-01-27T12:00:00Z"
}
```

**Displayed in Financial Metrics Dashboard:**
- ARR: €100K
- MRR: €8.3K
- ACV: €50K
- Customers: 2

---

## Technical Considerations

1. **Conflict Resolution**: When multiple sources provide different values, use:
   - Most recent timestamp wins
   - Explicit user input (UnitEconomicsEditor) overrides extracted values
   - Flag large discrepancies for user review

2. **Currency Handling**: Normalize all values to a base currency (EUR) with exchange rate at extraction time

3. **Confidence Scoring**: Track confidence levels:
   - `high`: Explicit numeric input (UnitEconomicsEditor, calculators)
   - `medium`: Extracted from structured tool data (TAM segments)
   - `low`: Extracted from freeform text via regex

4. **Audit Trail**: Store extraction source and timestamp in the enrichment queue for debugging

