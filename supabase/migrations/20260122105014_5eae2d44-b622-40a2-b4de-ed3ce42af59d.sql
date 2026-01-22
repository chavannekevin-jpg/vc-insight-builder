-- Differentiate KB sources by purpose (quantitative report vs contextual framework)
ALTER TABLE public.kb_sources
ADD COLUMN IF NOT EXISTS content_kind text NOT NULL DEFAULT 'report';

-- Constrain allowed values (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'kb_sources_content_kind_check'
  ) THEN
    ALTER TABLE public.kb_sources
    ADD CONSTRAINT kb_sources_content_kind_check
    CHECK (content_kind IN ('report','framework'));
  END IF;
END $$;

-- Backfill any existing nulls just in case
UPDATE public.kb_sources
SET content_kind = 'report'
WHERE content_kind IS NULL;

-- Store extracted frameworks separately from benchmarks/market notes
CREATE TABLE IF NOT EXISTS public.kb_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  geography_scope text NOT NULL DEFAULT 'Europe',
  region text NULL,
  sector text NULL,
  title text NULL,
  summary text NOT NULL,
  key_points jsonb NULL,
  tags jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_frameworks_source_id ON public.kb_frameworks(source_id);
CREATE INDEX IF NOT EXISTS idx_kb_frameworks_geo_sector ON public.kb_frameworks(geography_scope, sector);

-- Security: enable RLS + align policies with existing KB tables
ALTER TABLE public.kb_frameworks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='kb_frameworks' AND policyname='Authenticated users can read frameworks'
  ) THEN
    CREATE POLICY "Authenticated users can read frameworks"
    ON public.kb_frameworks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='kb_frameworks' AND policyname='Admins can manage frameworks'
  ) THEN
    CREATE POLICY "Admins can manage frameworks"
    ON public.kb_frameworks
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Keep updated_at current
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='update_kb_frameworks_updated_at'
  ) THEN
    CREATE TRIGGER update_kb_frameworks_updated_at
    BEFORE UPDATE ON public.kb_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;