-- Drop the existing policy and recreate with better approach
DROP POLICY IF EXISTS "Public can view active accelerators for join links" ON public.accelerators;

-- Create a simple policy that allows anyone to view active accelerators
-- This is safe because it only exposes minimal public info (name, slug, discount)
CREATE POLICY "Anyone can view active accelerators"
ON public.accelerators
FOR SELECT
USING (is_active = true);