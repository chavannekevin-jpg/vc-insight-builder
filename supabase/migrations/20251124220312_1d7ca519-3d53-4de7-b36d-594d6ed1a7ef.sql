-- Create educational_articles table
CREATE TABLE IF NOT EXISTS public.educational_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.educational_articles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published articles
CREATE POLICY "Anyone can view published articles"
ON public.educational_articles
FOR SELECT
USING (published = true);

-- Allow admins to do everything
CREATE POLICY "Admins can manage articles"
ON public.educational_articles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_educational_articles_updated_at
BEFORE UPDATE ON public.educational_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();