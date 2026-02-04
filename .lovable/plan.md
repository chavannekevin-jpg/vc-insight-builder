
# Plan: Fix Discount for All Kevin's Workshop Companies

## Problem

All 23 companies that joined via `/join/kevin-s-workshop` are linked to the **wrong invite**:

| Current State | What It Should Be |
|--------------|-------------------|
| Invite: `KEVIN-S-WORKSHOP-PLUG&P-IPRU` | Invite: `KEVINSWORKSHOP-ML526UV6` |
| Discount: **0%** | Discount: **50%** |
| Cohort: "Plug & Play Albania" | Cohort: (none - generic) |

## Affected Companies (23 total)

1. Test
2. Tendr
3. Levita
4. SKAITECH
5. Onemor, Inc.
6. MedicAL Wallet
7. Sainni
8. SURFARCH
9. Rent From Locals
10. Greecon
11. Drospect
12. VX NORTH
13. Katalogim
14. Atelia
15. Holos Health
16. SmartDose
17. Ciceroni
18. Sainni AI LTD
19. LekoTech
20. Beach Master
21. Sorsend
22. LookUp
23. Kontrol

## Solution

### Database Update

Run a single SQL migration to update all affected companies to use the correct 50% discount invite:

```sql
-- Update all companies currently linked to the wrong invite (0% discount)
-- to the correct generic invite (50% discount)
UPDATE companies 
SET accelerator_invite_id = '1f6ea445-4dda-4011-b4a9-9b91fcaa3748'
WHERE accelerator_invite_id = 'e9f816c3-93ba-4667-85b6-d7a10104d9c9';
```

**Explanation:**
- `1f6ea445-...` = Correct invite with **50% discount**
- `e9f816c3-...` = Wrong invite with **0% discount** (Plug & Play Albania cohort)

### Also Fix the Root Cause

Update `src/pages/AcceleratorJoinLanding.tsx` to prevent this from happening again by filtering for generic invites only:

```typescript
// Add filter to only select generic invites (no cohort)
.is("cohort_name", null)
```

This ensures the main `/join/:slug` landing page always uses the accelerator's default invite, not a cohort-specific one.

## Impact

- **23 companies** will now see the correct 50% discount at checkout
- Future users visiting `/join/kevin-s-workshop` will also get the 50% discount
- Cohort-specific invites remain unaffected for their intended use cases

## Files Modified

| Change | Description |
|--------|-------------|
| Database migration | Relink all 23 companies to the correct 50% discount invite |
| `src/pages/AcceleratorJoinLanding.tsx` | Add `.is("cohort_name", null)` filter to prevent future mismatches |
