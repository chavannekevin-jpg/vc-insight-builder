-- Create memo_tool_data table for storing editable tool data
CREATE TABLE public.memo_tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  ai_generated_data JSONB,
  user_overrides JSONB,
  data_source TEXT DEFAULT 'ai-complete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, section_name, tool_name)
);

-- Enable RLS
ALTER TABLE public.memo_tool_data ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Founders can view their company tool data"
  ON public.memo_tool_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = memo_tool_data.company_id 
    AND companies.founder_id = auth.uid()
  ));

CREATE POLICY "Founders can insert their company tool data"
  ON public.memo_tool_data FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = memo_tool_data.company_id 
    AND companies.founder_id = auth.uid()
  ));

CREATE POLICY "Founders can update their company tool data"
  ON public.memo_tool_data FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = memo_tool_data.company_id 
    AND companies.founder_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all tool data"
  ON public.memo_tool_data FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view demo company tool data"
  ON public.memo_tool_data FOR SELECT
  USING (company_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Add trigger for updated_at
CREATE TRIGGER update_memo_tool_data_updated_at
  BEFORE UPDATE ON public.memo_tool_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();