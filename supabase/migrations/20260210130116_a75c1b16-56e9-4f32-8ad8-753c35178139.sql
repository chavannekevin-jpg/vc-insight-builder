
-- Create ai_usage_logs table for tracking AI calls
CREATE TABLE public.ai_usage_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  function_name text NOT NULL,
  model text NOT NULL,
  prompt_tokens int DEFAULT 0,
  completion_tokens int DEFAULT 0,
  total_tokens int DEFAULT 0,
  estimated_cost_usd numeric(10, 6) DEFAULT 0,
  company_id uuid,
  user_id uuid,
  duration_ms int DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for common queries
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs (created_at DESC);
CREATE INDEX idx_ai_usage_logs_function_name ON public.ai_usage_logs (function_name);
CREATE INDEX idx_ai_usage_logs_model ON public.ai_usage_logs (model);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only read access using user_roles table
CREATE POLICY "Admins can read ai_usage_logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
