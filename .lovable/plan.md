

# Plan: Multi-Select Companies for Cohort Assignment

## Overview

Currently, the `AddStartupToCohortDialog` allows selecting **only one company at a time** (using `selectedCompanyId: string | null`). This plan upgrades the dialog to support **multiple selections** so accelerator managers can assign several startups to a cohort in a single action.

---

## Current Flow

```text
┌─────────────────────────────────────────┐
│  AddStartupToCohortDialog               │
│  ─────────────────────────────          │
│  [Search box]                           │
│                                         │
│  ○ Company A    (radio-style select)    │
│  ● Company B    ← single selection      │
│  ○ Company C                            │
│                                         │
│  [Cancel]  [Add to Cohort]              │
└─────────────────────────────────────────┘
```

## Proposed Flow

```text
┌─────────────────────────────────────────┐
│  Add to Spring 2025                     │
│  ─────────────────────────────          │
│  [Search box]        [Select All] btn   │
│                                         │
│  ☑ Company A    (checkbox-style)        │
│  ☑ Company B    ← multi-selection       │
│  ☐ Company C                            │
│                                         │
│  ───────────────────────────────        │
│  3 startups selected                    │
│  [Cancel]  [Add 3 to Cohort]            │
└─────────────────────────────────────────┘
```

---

## Implementation Details

### File: `src/components/accelerator/AddStartupToCohortDialog.tsx`

### 1. State Changes

Replace single selection with a Set for multi-select:

```typescript
// Before
const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

// After
const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
```

### 2. Selection Toggle Logic

Add helper functions for toggling individual companies and select/deselect all:

```typescript
const toggleCompany = (companyId: string) => {
  setSelectedCompanyIds(prev => {
    const next = new Set(prev);
    if (next.has(companyId)) {
      next.delete(companyId);
    } else {
      next.add(companyId);
    }
    return next;
  });
};

const toggleSelectAll = () => {
  if (selectedCompanyIds.size === filteredCompanies.length) {
    setSelectedCompanyIds(new Set());
  } else {
    setSelectedCompanyIds(new Set(filteredCompanies.map(c => c.id)));
  }
};
```

### 3. Update Reset on Dialog Open/Close

```typescript
useEffect(() => {
  if (open && acceleratorId) {
    fetchAvailableCompanies();
  }
  return () => {
    setSelectedCompanyIds(new Set());  // Clear all selections
    setSearchQuery("");
  };
}, [open, acceleratorId]);
```

### 4. Update `handleAdd` for Batch Operations

Modify the submission handler to iterate over all selected companies:

```typescript
const handleAdd = async () => {
  if (selectedCompanyIds.size === 0 || !cohort) {
    toast.error("Please select at least one startup");
    return;
  }

  setIsAdding(true);
  try {
    let inviteId = cohort.invite_id;

    // Create invite if needed (same logic as before)
    if (!inviteId) {
      // ... existing invite creation code ...
    }

    // Batch update all selected companies
    const { error: updateError } = await supabase
      .from("companies")
      .update({ accelerator_invite_id: inviteId })
      .in("id", Array.from(selectedCompanyIds));

    if (updateError) throw updateError;

    const count = selectedCompanyIds.size;
    toast.success(`${count} startup${count > 1 ? 's' : ''} added to ${cohort.name}`);
    onOpenChange(false);
    onAdded();
  } catch (error: any) {
    console.error("Error adding to cohort:", error);
    toast.error(error.message || "Failed to add to cohort");
  } finally {
    setIsAdding(false);
  }
};
```

### 5. UI Updates

#### a) Add "Select All" Button
In the header area, add a button to toggle all filtered companies:

```tsx
<div className="flex items-center justify-between gap-2">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input placeholder="Search startups..." ... />
  </div>
  {filteredCompanies.length > 0 && (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSelectAll}
      className="text-xs whitespace-nowrap"
    >
      {selectedCompanyIds.size === filteredCompanies.length ? "Deselect All" : "Select All"}
    </Button>
  )}
</div>
```

#### b) Replace Radio-Style with Checkbox-Style
Update each company row to use a checkbox visual:

```tsx
<button
  key={company.id}
  onClick={() => toggleCompany(company.id)}
  className={cn(
    "w-full p-4 rounded-xl border text-left transition-all duration-200",
    selectedCompanyIds.has(company.id)
      ? "border-primary bg-primary/10"
      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
  )}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Checkbox indicator */}
      <div className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
        selectedCompanyIds.has(company.id)
          ? "border-primary bg-primary"
          : "border-white/20 bg-transparent"
      )}>
        {selectedCompanyIds.has(company.id) && (
          <Check className="w-3 h-3 text-primary-foreground" />
        )}
      </div>
      <div className="w-8 h-8 rounded-lg bg-primary/20 ...">
        {company.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="font-medium">{company.name}</p>
        <p className="text-xs text-muted-foreground">{company.category} • {company.stage}</p>
      </div>
    </div>
  </div>
</button>
```

#### c) Update Footer with Selection Count
Show how many startups are selected and pluralize the button text:

```tsx
<DialogFooter className="flex-col sm:flex-row gap-2">
  {selectedCompanyIds.size > 0 && (
    <span className="text-sm text-muted-foreground mr-auto">
      {selectedCompanyIds.size} startup{selectedCompanyIds.size > 1 ? 's' : ''} selected
    </span>
  )}
  <div className="flex gap-2">
    <Button variant="outline" onClick={() => onOpenChange(false)}>
      Cancel
    </Button>
    <Button
      onClick={handleAdd}
      disabled={isAdding || selectedCompanyIds.size === 0}
      style={{ background: 'linear-gradient(...)' }}
    >
      {isAdding ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        `Add ${selectedCompanyIds.size > 0 ? selectedCompanyIds.size : ''} to Cohort`
      )}
    </Button>
  </div>
</DialogFooter>
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/accelerator/AddStartupToCohortDialog.tsx` | Convert single-select to multi-select with checkboxes, batch update logic, Select All button, selection count display |

---

## Summary

This enhancement converts the "Add Startup to Cohort" dialog from single-select to multi-select by:

1. Changing state from `string | null` to `Set<string>`
2. Adding a "Select All / Deselect All" toggle button
3. Replacing the radio-style selection with checkbox indicators
4. Updating the submit handler to batch-update all selected companies
5. Showing a selection count and pluralized button text

