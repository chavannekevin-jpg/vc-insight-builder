

# Cloud Cost Optimization Plan

## What's Actually Costing You Money

Your assistant was right on several points. Here's what I found after digging through the code:

### 1. Zombie Cron Job (Easy Fix, Immediate Savings)
A cron job is firing **every hour** calling `send-abandonment-email` -- a function you already deleted. Each call results in a 404 error but still counts as an edge function invocation. That's **720 wasted invocations per month**.

### 2. Aggressive Polling via Edge Functions (Biggest Cost Driver)
When a memo is generated, the `GeneratedMemo` page calls the `check-memo-job` **edge function** every 5 seconds for up to 100 attempts. Each poll is a full edge function invocation (auth check, 2 DB queries, response). For a typical 5-minute generation, that's **~60 edge function invocations per user per memo**.

The `Portal` page does the same polling but directly against the database (cheaper), then follows up with up to **40 more DB queries** via `checkDashboardReadiness` at 3-second intervals.

### 3. Double Polling on the Hub
`FreemiumHub` also polls `checkDashboardReadiness` every 5 seconds (up to 60 attempts) whenever a company appears to still be processing. This creates another **~60 DB round-trips** per session.

---

## The Fix (3 Changes)

### Step 1: Kill the Zombie Cron
Run a single SQL statement to remove the orphaned cron job that's calling the deleted `send-abandonment-email` function every hour.

### Step 2: Replace Edge Function Polling with Direct DB Polling
The `GeneratedMemo` page currently calls the `check-memo-job` **edge function** every 5 seconds. The Portal page already polls the database directly (much cheaper -- no edge function invocation cost). We'll update `GeneratedMemo` to do the same: query the `memo_generation_jobs` table directly instead of invoking an edge function, cutting out ~60 edge function calls per memo generation.

### Step 3: Replace DB Polling with Realtime Subscriptions
Instead of repeatedly querying the database every 3-5 seconds, subscribe to Realtime changes on the `memo_generation_jobs` table. The database pushes updates to the client when the job status changes -- zero polling, zero wasted queries.

This affects:
- `Portal.tsx` (currently polls DB every 5s)
- `GeneratedMemo.tsx` (currently polls edge function every 5s)
- `FreemiumHub.tsx` (currently polls DB every 5s)
- `AdminCompanyDetail.tsx` (currently polls DB every 3s)

---

## Technical Details

### SQL Migration
- Delete cron job: `SELECT cron.unschedule(2);`
- Enable Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.memo_generation_jobs;`

### Frontend Changes

**All 4 files** (`Portal.tsx`, `GeneratedMemo.tsx`, `FreemiumHub.tsx`, `AdminCompanyDetail.tsx`):
- Replace `setInterval` / `while` polling loops with a Supabase Realtime channel subscription
- Subscribe to `postgres_changes` on `memo_generation_jobs` filtered by job ID
- On `status = 'completed'`, run `checkDashboardReadiness` once (instead of polling it 40 times)
- On `status = 'failed'`, show error
- Keep a safety timeout (10 min) as fallback
- Clean up channel subscription on unmount

**`GeneratedMemo.tsx` specifically**: Replace `supabase.functions.invoke('check-memo-job', ...)` with direct DB query as intermediate step, then Realtime.

### Estimated Savings Per Memo Generation

| Before | After |
|--------|-------|
| ~60 edge fn calls (check-memo-job) | 0 edge fn calls |
| ~40 DB polls (dashboard readiness) | 1 DB query |
| ~60 DB polls (FreemiumHub readiness) | 0 polls |
| ~120 DB polls (Portal + Admin) | 0 polls |
| 720/month zombie cron invocations | 0 |

