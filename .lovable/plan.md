

# Revert Admin Account to Gemini Flash

## Summary
Remove the admin-specific Gemini Pro model selection and revert everyone (including admins) to use Gemini Flash. This simplifies the codebase and ends the A/B test.

## Changes Required

### File: `supabase/functions/generate-full-memo/index.ts`

| Location | Current Behavior | New Behavior |
|----------|------------------|--------------|
| Lines 4793-4804 | Checks admin role and sets `isAdminUser = true` | Remove this admin check block |
| Line 2205 | `const AI_MODEL = useProModel ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash"` | `const AI_MODEL = "google/gemini-2.5-flash"` |
| Line 2206 | Logs model selection with Pro/Flash distinction | Simplified log without Pro logic |
| Line 2209 | Dynamic token limits `useProModel ? base * 2 : base` | Remove - use base values only |
| Line 1342 | Dynamic token limits in `generateSectionToolData` | Remove - use base values only |
| Function signatures | Accept `useProModel` parameter | Remove parameter, simplify |

## Technical Details

1. **Remove admin role check** (lines 4793-4804)
   - Delete the query to `user_roles` table for admin check
   - Remove `isAdminUser` variable usage related to Pro model

2. **Hardcode Flash model** (line 2205)
   - Change from conditional to always use `"google/gemini-2.5-flash"`

3. **Remove dynamic token limits**
   - Delete `getMaxTokens` helper functions
   - Replace all `getMaxTokens(3000)` calls with just `3000`
   - Revert token limits to original values: 3000, 4500, 1500, 2000

4. **Clean up function signatures**
   - Remove `useProModel` parameter from `generateSectionToolData`
   - Remove `useProModel` parameter from `generateMemoInBackground`
   - Update all call sites

## Outcome
- All users (including admins) will use Gemini Flash
- Simpler codebase without A/B testing logic
- Token limits return to original conservative values
- Lower cost per memo generation

