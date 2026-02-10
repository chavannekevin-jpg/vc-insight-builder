
CREATE OR REPLACE FUNCTION public.get_storage_stats()
RETURNS TABLE(bucket_id text, bucket_name text, file_count bigint, total_size_bytes bigint, total_size_pretty text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'storage'
AS $$
  SELECT
    b.id::text AS bucket_id,
    b.name::text AS bucket_name,
    COALESCE(COUNT(o.id), 0)::bigint AS file_count,
    COALESCE(SUM((o.metadata->>'size')::bigint), 0)::bigint AS total_size_bytes,
    pg_size_pretty(COALESCE(SUM((o.metadata->>'size')::bigint), 0)::bigint) AS total_size_pretty
  FROM storage.buckets b
  LEFT JOIN storage.objects o ON o.bucket_id = b.id
  GROUP BY b.id, b.name
  ORDER BY COALESCE(SUM((o.metadata->>'size')::bigint), 0) DESC;
$$;
