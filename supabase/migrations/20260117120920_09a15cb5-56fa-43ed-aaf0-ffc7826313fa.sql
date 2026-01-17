-- Fix RLS policy for investor_profiles to be more permissive during initial insert
-- Drop existing insert policy and recreate

DROP POLICY IF EXISTS "Users can insert their own investor profile" ON public.investor_profiles;

-- Allow authenticated users to insert their own profile (id must match auth.uid())
CREATE POLICY "Users can insert their own investor profile"
ON public.investor_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);