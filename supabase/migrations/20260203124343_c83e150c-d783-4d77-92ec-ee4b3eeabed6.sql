-- Create table for memo share links
CREATE TABLE public.memo_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    token VARCHAR(32) NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    views INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique index on token for fast lookup
CREATE INDEX idx_memo_share_links_token ON public.memo_share_links(token) WHERE is_active = true;
CREATE INDEX idx_memo_share_links_company ON public.memo_share_links(company_id);

-- Enable RLS
ALTER TABLE public.memo_share_links ENABLE ROW LEVEL SECURITY;

-- Admin can create, view, and manage share links
CREATE POLICY "Admins can manage share links"
ON public.memo_share_links
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create view for public access to shared memos (no auth required)
CREATE OR REPLACE VIEW public.shared_memo_view AS
SELECT 
    sl.token,
    sl.company_id,
    sl.is_active,
    sl.expires_at,
    c.name as company_name,
    c.category,
    c.stage,
    c.description,
    c.public_score,
    c.vc_verdict_json,
    m.structured_content,
    m.created_at as memo_created_at
FROM public.memo_share_links sl
JOIN public.companies c ON c.id = sl.company_id
LEFT JOIN (
    SELECT DISTINCT ON (company_id) *
    FROM public.memos
    ORDER BY company_id, created_at DESC
) m ON m.company_id = sl.company_id
WHERE sl.is_active = true 
  AND (sl.expires_at IS NULL OR sl.expires_at > now());

-- Grant anon access to the view
GRANT SELECT ON public.shared_memo_view TO anon;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_share_link_views(p_token VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.memo_share_links
    SET views = views + 1, updated_at = now()
    WHERE token = p_token AND is_active = true;
END;
$$;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION public.increment_share_link_views(VARCHAR) TO anon;

-- Trigger for updated_at
CREATE TRIGGER update_memo_share_links_updated_at
    BEFORE UPDATE ON public.memo_share_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();