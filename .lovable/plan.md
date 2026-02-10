

# Admin AI & Cloud Usage Dashboard

## Overview
Build a new admin page at `/admin/ai-usage` that tracks every AI call made by edge functions, showing costs, models used, function names, and trends over time. This gives you full visibility into where your cloud spending goes.

## Architecture

### 1. New Database Table: `ai_usage_logs`

A logging table that every edge function writes to after each AI call:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| created_at | timestamptz | When the call happened |
| function_name | text | Edge function name (e.g., `parse-pitch-deck`) |
| model | text | AI model used (e.g., `google/gemini-2.5-pro`) |
| prompt_tokens | int | Input tokens used |
| completion_tokens | int | Output tokens used |
| total_tokens | int | Total tokens |
| estimated_cost_usd | numeric | Estimated cost based on model pricing |
| company_id | uuid (nullable) | Which company triggered this |
| user_id | uuid (nullable) | Which user triggered this |
| duration_ms | int | How long the AI call took |
| status | text | `success` or `error` |
| error_message | text (nullable) | Error details if failed |
| metadata | jsonb | Any extra context (e.g., number of pages parsed) |

RLS: Admin-only read access, service-role insert (edge functions use service role).

### 2. Shared Logging Helper

Create a reusable utility at `supabase/functions/_shared/log-ai-usage.ts` that every edge function can import. It:
- Wraps the AI fetch call
- Automatically records tokens from the response (`usage.prompt_tokens`, `usage.completion_tokens`)
- Estimates cost based on model
- Inserts a row into `ai_usage_logs`
- Returns the AI response as normal

This means each edge function only needs a one-line change to start logging.

### 3. Cost Estimation Logic

Hardcoded cost-per-token estimates (updated as needed):

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| gemini-2.5-pro | ~$1.25 | ~$10.00 |
| gemini-2.5-flash | ~$0.15 | ~$0.60 |
| gemini-2.5-flash-lite | ~$0.075 | ~$0.30 |
| gemini-3-flash-preview | ~$0.15 | ~$0.60 |

### 4. Admin UI Page: `/admin/ai-usage`

**Top-level Stats Cards:**
- Total AI calls (today / this week / this month)
- Total estimated cost (today / this week / this month)
- Most expensive function
- Average response time

**Cost Breakdown Chart (Recharts):**
- Bar chart showing daily cost over the last 30 days
- Stacked by model or by function (toggle)

**Function Leaderboard Table:**
- Function name, total calls, total tokens, total estimated cost, avg duration
- Sortable columns
- Ranked by cost (highest first)

**Model Usage Pie Chart:**
- Proportion of calls and cost per model

**Recent Logs Table:**
- Scrollable table of the last 100 AI calls
- Columns: Time, Function, Model, Tokens, Cost, Duration, Status, Company, User
- Filter by function name, model, date range, status
- Click to expand and see metadata

### 5. Edge Function Updates

Incrementally update the highest-cost functions first to use the logging helper:
- `parse-pitch-deck` (gemini-2.5-pro -- most expensive)
- `generate-full-memo`
- `generate-vc-verdict`
- `compile-workshop-memo`
- `generate-data-room-memo`
- `score-roast-answer` (high frequency)
- `vc-coach-feedback` (high frequency)

Then all remaining ~28 functions.

### 6. Sidebar Navigation

Add "AI Usage" under the Tools section in `AdminSidebar.tsx` with the `Activity` icon.

## File Changes Summary

| File | Change |
|------|--------|
| **New migration** | Create `ai_usage_logs` table with RLS |
| `supabase/functions/_shared/log-ai-usage.ts` | New shared logging helper |
| `supabase/functions/parse-pitch-deck/index.ts` | Use logging helper |
| `supabase/functions/generate-full-memo/index.ts` | Use logging helper |
| `supabase/functions/generate-vc-verdict/index.ts` | Use logging helper |
| `supabase/functions/compile-workshop-memo/index.ts` | Use logging helper |
| `supabase/functions/score-roast-answer/index.ts` | Use logging helper |
| `supabase/functions/vc-coach-feedback/index.ts` | Use logging helper |
| ~28 more edge functions | Use logging helper |
| `src/pages/AdminAIUsage.tsx` | New admin page with charts and tables |
| `src/components/admin/AdminSidebar.tsx` | Add "AI Usage" nav item |
| `src/App.tsx` | Add route for `/admin/ai-usage` |

## Implementation Order

1. Create database table
2. Build the shared logging helper
3. Update top 7 edge functions (highest cost/frequency)
4. Build the admin UI page with charts
5. Add sidebar nav and route
6. Update remaining edge functions

