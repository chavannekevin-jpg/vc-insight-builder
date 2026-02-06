
## Diagnosis (why you see “Finalizing Your Analysis” every login)

For the user **kevin.chavanne@tenity.com** and company **“Test”**:

- The company record has **has_premium = true** (so the Hub treats it as “paid/unlocked”).
- But there is **no memo at all** yet (no rows in `memos`, no `memo_generation_jobs`).
- In `FreemiumHub.tsx`, there’s a “paid → finalization polling” loop that turns on whenever:
  - `hasPaid === true`
  - and the dashboard isn’t “ready” (which will never become ready if no memo exists)
- After the polling times out, the effect **re-triggers again** because the conditions are still true, so it looks like an endless loading screen on every visit.

So it’s not that the system is generating something each time; it’s that the Hub is stuck in a “waiting for data that doesn’t exist” state for premium-but-not-generated companies.

---

## What we’ll change (behavior)

### A) Only show “Finalizing…” when it’s actually plausible
We’ll start “finalizing polling” only when **there is evidence a memo exists / is in progress**, e.g.:
- `hasMemoData === true` (a memo row exists), OR
- optionally: a recent generation job exists / memo status indicates generating (nice-to-have)

If **no memo exists**, we will **not** show “Finalizing”.

### B) Replace the full-page blocker with an actionable “Start your analysis” state
When:
- `hasPaid === true` AND `hasMemoData === false` (premium access but no memo yet)

We’ll show a clear card in the Hub (and keep the sidebar accessible) that says something like:
- “You have access, but your analysis hasn’t been generated yet.”
- Primary CTA: **“Generate my analysis”** → navigates to:
  - `/portal?companyId=<currentCompanyId>`
- Secondary CTA: “Go to Workshop” (optional if you want)  
This also ensures NPS deep-links can open the modal since we won’t early-return a blocking screen.

### C) Prevent infinite re-polling after timeout
If we do run polling (because a memo exists but readiness data is still syncing), and it times out:
- We’ll stop auto-restarting it on the same session/mount
- We can show a small inline “Still preparing… Refresh / Retry” message instead of restarting a full-screen lock

---

## Implementation steps (code)

### 1) Update `src/pages/FreemiumHub.tsx`

#### 1.1 Refine the “finalizing polling” trigger condition
Currently, polling triggers whenever `hasPaid` is true and the dashboard isn’t ready.

We will change it so polling only triggers when:
- `hasPaid && company?.id`
- AND **`hasMemoData` is true** (memo row exists)
- AND `(!memoHasContent || !hasSectionToolsReady)`
- AND not already loading/regenerating

This prevents the finalizing loop for accounts that have premium access but have not generated anything yet.

#### 1.2 Remove (or avoid) the early-return full-screen finalizing screen
Right now, the component does:
- `if (isFinalizingAnalysis ...) return <FullScreenFinalizing />;`

We’ll replace this with an in-page branch inside the main content area so the sidebar + modals remain mounted.

#### 1.3 Add a new “Premium but no memo yet” branch in main content
Where the Hub currently decides between:
- Paid dashboard (`hasPaid && memoGenerated`)
- Otherwise it shows `VCVerdictCard`

We’ll introduce a third state:

- If `hasPaid && !hasMemoData`:
  - Render a “Start your analysis” card with a button to:
    - `navigate(/portal?companyId=${company.id})`
  - (Optional) Show `generationsAvailable` info (“You have 1 analysis credit available”)

This avoids showing the freemium verdict UI to premium users and avoids the misleading “finalizing” state.

#### 1.4 Keep NPS deep-link working
Because we won’t full-screen early-return anymore, the existing `openNps=true` handler will be able to:
- open `WorkshopNPSModal` immediately after login, even if no memo exists

---

## Acceptance criteria (what will be true after)

1. Logging in as **kevin.chavanne@tenity.com** no longer shows the “Finalizing Your Analysis” blocker.
2. If a premium company has **no memo yet**, the Hub shows a clear **“Generate analysis”** CTA (no polling).
3. If a memo exists and readiness is still syncing, the Hub can show a **non-blocking** “finalizing” state and it won’t restart forever after timing out.
4. The NPS deep-link `/auth?redirect=/hub?openNps=true` opens the NPS modal even for premium users without a memo.

---

## Testing checklist (end-to-end)

1. Sign in as kevin → verify Hub shows “Generate analysis” CTA (no finalizing blocker).
2. Click “Generate my analysis” → verify you land on Portal with the correct company selected.
3. Start generation → after completion, verify Hub shows the paid dashboard.
4. Use the email deep-link `/auth?redirect=/hub?openNps=true` → verify NPS modal opens immediately after login.
