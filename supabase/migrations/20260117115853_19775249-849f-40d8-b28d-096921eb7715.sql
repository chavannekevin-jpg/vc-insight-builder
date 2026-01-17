-- Step 1: Extend app_role enum to include 'investor'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'investor';