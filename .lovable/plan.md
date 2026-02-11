

# Remove Admin Notifications

## What's being removed
The `send-admin-notifications` edge function and its cron job. This function emails you about new signups and memo purchases every 15 minutes, but it's been failing (broken column reference) and burning through credits unnecessarily.

## Steps

### 1. Remove the cron job (database migration)
Run SQL to unschedule the cron job (job ID 4):
```sql
SELECT cron.unschedule('send-admin-notifications');
```

### 2. Delete the edge function
Remove the `supabase/functions/send-admin-notifications/` directory and delete the deployed function.

### 3. Clean up config.toml
Remove the `[functions.send-admin-notifications]` entry.

### 4. Clean up UI references
- In `AdminUsersHub.tsx`: Remove the notification bell icon that shows whether admin was notified about a signup.
- In `AdminEmails.tsx`: Remove references to `admin_notified_signup` stats (signup notification counts).

### What's NOT being removed
- The `admin_notified_signup` column on `profiles` and `admin_notified` column on `memo_purchases` -- these are harmless and removing columns risks data issues. They'll just stop being updated.
- The `send-abandonment-email` cron job -- that's a separate function (let me know if you want that removed too).

