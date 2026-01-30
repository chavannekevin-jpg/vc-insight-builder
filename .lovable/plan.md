

# Plan: Prepare Admin Account for Google OAuth Demo Video

## Understanding the Situation

Your admin account has a **working Google Calendar integration** that was authorized previously. When you try to "add a calendar," Google recognizes you've already authorized UglyBaby and skips the consent screen.

**Good news**: You don't need to withdraw your investor account or lose any data. You simply need to **revoke the existing Google Calendar authorization** so that the next connection attempt shows the full consent screen.

## Solution Overview

We'll create a simple way to disconnect your Google Calendar, which will:
1. Delete the stored tokens from the database
2. Guide you to revoke the app in your Google Account settings (so Google shows consent screen again)
3. Allow you to reconnect and record the consent screen for the demo

---

## Implementation Steps

### Step 1: Add "Disconnect Calendar" Functionality

Add a disconnect button to the calendar settings that:
- Removes calendar tokens from `linked_calendars` and `google_calendar_tokens` tables
- Shows instructions to revoke the app in Google Account settings

### Step 2: Update the Booking/Calendar Settings Component

Modify the investor booking settings to include a "Disconnect All Calendars" option that:
- Calls a new edge function or direct database delete
- Provides clear instructions for completing the revocation in Google

---

## Technical Details

### Files to Create/Modify

1. **New Edge Function**: `supabase/functions/disconnect-calendar/index.ts`
   - Accepts `investorId` parameter
   - Deletes entries from `linked_calendars` where `investor_id` matches
   - Deletes entries from `google_calendar_tokens` where `investor_id` matches
   - Returns success confirmation

2. **Modify Booking Settings Component**: Find and update the calendar connection UI
   - Add a "Disconnect Calendar" button 
   - Show confirmation dialog before disconnecting
   - Display instructions to visit `https://myaccount.google.com/permissions` to revoke UglyBaby access

---

## After Implementation: Recording the Demo

Once disconnected, follow these steps to record the video:

1. Go to **Google Account > Security > Third-party apps** (`https://myaccount.google.com/permissions`)
2. Find "UglyBaby" and click "Remove Access"
3. Open an **incognito browser window**
4. Log into your app at `/investor/auth`
5. Navigate to calendar settings and click "Connect Google Calendar"
6. **Start screen recording** before clicking
7. The consent screen will now appear showing:
   - App name: "UglyBaby"
   - Requested scopes: 
     - "See and download any calendar you can access using your Google Calendar"
     - "View and edit events on all your calendars"
8. Continue through the flow to show the calendar actually connecting

---

## What Gets Preserved

- All your investor profile data
- All 226 contacts
- All 4 dealflow entries
- All booking availability settings
- All event types

Only the calendar connection tokens are removed - you can reconnect immediately after recording.

