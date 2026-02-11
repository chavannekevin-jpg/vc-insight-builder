

# Remove Abandonment Email System

## What's being removed
The `send-abandonment-email` edge function and its hourly cron job. Most eligible users have already been emailed, so it's just burning credits with empty runs.

## Steps

### 1. Remove the cron job (database)
```sql
SELECT cron.unschedule('send-abandonment-email');
```

### 2. Delete the edge function
Remove `supabase/functions/send-abandonment-email/` directory and delete the deployed function.

### 3. Clean up config.toml
Remove the `[functions.send-abandonment-email]` entry.

### 4. Clean up UI references
Check `AdminEmails.tsx` for any abandonment email stats/cards and remove them.

### What's NOT being removed
- The `sent_emails` and `email_templates` tables -- they store historical data and template content. Harmless to keep.

