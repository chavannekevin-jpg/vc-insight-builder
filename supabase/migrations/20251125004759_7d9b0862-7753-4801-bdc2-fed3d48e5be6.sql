-- Create table for memo section prompts
CREATE TABLE IF NOT EXISTS public.memo_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name text NOT NULL UNIQUE,
  prompt text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memo_prompts ENABLE ROW LEVEL SECURITY;

-- Admins can manage prompts
CREATE POLICY "Admins can manage prompts"
  ON public.memo_prompts
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_memo_prompts_updated_at
  BEFORE UPDATE ON public.memo_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default prompts for each section
INSERT INTO public.memo_prompts (section_name, prompt) VALUES
  ('Problem', 'You are a professional VC investment memo writer. Take the following startup information for the "Problem" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight the pain points, market gaps, and why this problem matters
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('Solution', 'You are a professional VC investment memo writer. Take the following startup information for the "Solution" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight how the solution addresses the problem, key features, and differentiation
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('Market', 'You are a professional VC investment memo writer. Take the following startup information for the "Market" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight target market size, customer segments, and market opportunity
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('Competition', 'You are a professional VC investment memo writer. Take the following startup information for the "Competition" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight competitive landscape, differentiation, and competitive advantages
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('Team', 'You are a professional VC investment memo writer. Take the following startup information for the "Team" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight team expertise, relevant experience, and why this team can execute
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('USP', 'You are a professional VC investment memo writer. Take the following startup information for the "USP" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight unique value propositions, defensibility, and what makes this startup special
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('Business Model', 'You are a professional VC investment memo writer. Take the following startup information for the "Business Model" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight revenue model, pricing strategy, and path to profitability
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations'),

  ('Traction', 'You are a professional VC investment memo writer. Take the following startup information for the "Traction" section and create a clear, concise, and compelling narrative. 

Requirements:
- Synthesize all the information into a cohesive 2-4 paragraph narrative
- Use professional, direct language that VCs expect
- Highlight key metrics, growth rates, milestones, and customer traction
- Keep it between 150-250 words
- Focus on facts and concrete details
- Return ONLY the enhanced narrative, no preambles or explanations');