-- Add custom_message column to accelerator_invites table
ALTER TABLE public.accelerator_invites
ADD COLUMN custom_message TEXT;