-- Knowledge Base: sources + benchmarks + notes (full, corrected)

CREATE TABLE IF NOT EXISTS public.kb_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('web','pdf_upload')),
  title text,
  publisher text,
  source_url text,
  storage_path text,
  geography_scope text NOT NULL DEFAULT 'Europe',
  publication_date date,
  data_period_start date,
  data_period_end date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  extracted_json jsonb,
  extraction_confidence text CHECK (extraction_confidence IN ('high','medium','low')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_sources_status ON public.kb_sources(status);
CREATE INDEX IF NOT EXISTS idx_kb_sources_geo ON public.kb_sources(geography_scope);
CREATE INDEX IF NOT EXISTS idx_kb_sources_pubdate ON public.kb_sources(publication_date DESC);

CREATE TABLE IF NOT EXISTS public.kb_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  geography_scope text NOT NULL DEFAULT 'Europe',
  region text,
  stage text NOT NULL,
  sector text,
  business_model text,
  timeframe_label text,
  sample_size integer,
  currency text NOT NULL DEFAULT 'EUR',
  metric_key text NOT NULL,
  metric_label text,
  median_value numeric,
  p25_value numeric,
  p75_value numeric,
  unit text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_benchmarks_lookup ON public.kb_benchmarks(geography_scope, stage, sector, business_model, metric_key);
CREATE INDEX IF NOT EXISTS idx_kb_benchmarks_source ON public.kb_benchmarks(source_id);

CREATE TABLE IF NOT EXISTS public.kb_market_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  geography_scope text NOT NULL DEFAULT 'Europe',
  region text,
  sector text,
  timeframe_label text,
  headline text,
  summary text NOT NULL,
  key_points jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_market_notes_lookup ON public.kb_market_notes(geography_scope, sector, timeframe_label);
CREATE INDEX IF NOT EXISTS idx_kb_market_notes_source ON public.kb_market_notes(source_id);

-- Enable RLS
ALTER TABLE public.kb_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_market_notes ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent via pg_policies checks)
DO $$ BEGIN
  -- kb_sources: admin-only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kb_sources' AND policyname='Admins can manage KB sources'
  ) THEN
    CREATE POLICY "Admins can manage KB sources"
    ON public.kb_sources
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- kb_benchmarks: authenticated read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kb_benchmarks' AND policyname='Authenticated users can read benchmarks'
  ) THEN
    CREATE POLICY "Authenticated users can read benchmarks"
    ON public.kb_benchmarks
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;

  -- kb_benchmarks: admin manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kb_benchmarks' AND policyname='Admins can manage benchmarks'
  ) THEN
    CREATE POLICY "Admins can manage benchmarks"
    ON public.kb_benchmarks
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  -- kb_market_notes: authenticated read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kb_market_notes' AND policyname='Authenticated users can read market notes'
  ) THEN
    CREATE POLICY "Authenticated users can read market notes"
    ON public.kb_market_notes
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;

  -- kb_market_notes: admin manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kb_market_notes' AND policyname='Admins can manage market notes'
  ) THEN
    CREATE POLICY "Admins can manage market notes"
    ON public.kb_market_notes
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- updated_at triggers (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kb_sources_updated_at') THEN
    CREATE TRIGGER trg_kb_sources_updated_at
    BEFORE UPDATE ON public.kb_sources
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kb_benchmarks_updated_at') THEN
    CREATE TRIGGER trg_kb_benchmarks_updated_at
    BEFORE UPDATE ON public.kb_benchmarks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kb_market_notes_updated_at') THEN
    CREATE TRIGGER trg_kb_market_notes_updated_at
    BEFORE UPDATE ON public.kb_market_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;