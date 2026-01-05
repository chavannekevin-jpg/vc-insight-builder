-- Add admin notification tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notified_signup boolean DEFAULT false;
ALTER TABLE memo_purchases ADD COLUMN IF NOT EXISTS admin_notified boolean DEFAULT false;