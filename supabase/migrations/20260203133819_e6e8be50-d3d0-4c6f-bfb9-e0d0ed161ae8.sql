-- Add share_type column to distinguish between full and simplified memo shares
ALTER TABLE public.memo_share_links
ADD COLUMN IF NOT EXISTS share_type text DEFAULT 'full' CHECK (share_type IN ('full', 'simplified'));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_memo_share_links_share_type ON public.memo_share_links(share_type);

-- Update RLS policy to allow company founders to create share links for their own companies
CREATE POLICY "Founders can create share links for own companies"
ON public.memo_share_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = memo_share_links.company_id
    AND companies.founder_id = auth.uid()
  )
);

-- Allow founders to view their own share links
CREATE POLICY "Founders can view own company share links"
ON public.memo_share_links
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = memo_share_links.company_id
    AND companies.founder_id = auth.uid()
  )
);

-- Allow founders to update their own share links
CREATE POLICY "Founders can update own company share links"
ON public.memo_share_links
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = memo_share_links.company_id
    AND companies.founder_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = memo_share_links.company_id
    AND companies.founder_id = auth.uid()
  )
);

-- Allow founders to delete their own share links
CREATE POLICY "Founders can delete own company share links"
ON public.memo_share_links
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = memo_share_links.company_id
    AND companies.founder_id = auth.uid()
  )
);

-- Create a view for shared simplified memos (public access via token)
CREATE OR REPLACE VIEW public.shared_simplified_memo_view AS
SELECT 
  msl.token,
  msl.company_id,
  msl.share_type,
  msl.is_active,
  msl.expires_at,
  msl.created_at as share_created_at,
  c.name as company_name,
  c.description,
  c.category,
  c.stage,
  c.memo_content_generated
FROM public.memo_share_links msl
JOIN public.companies c ON c.id = msl.company_id
WHERE msl.is_active = true
  AND msl.share_type = 'simplified'
  AND (msl.expires_at IS NULL OR msl.expires_at > now())
  AND c.memo_content_generated = true;

-- Grant anonymous access to the view
GRANT SELECT ON public.shared_simplified_memo_view TO anon;

-- Enable RLS on memo_share_links if not already enabled
ALTER TABLE public.memo_share_links ENABLE ROW LEVEL SECURITY;