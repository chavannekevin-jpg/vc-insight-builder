-- Add structured_content column to store JSON-based memo sections
ALTER TABLE public.memos 
ADD COLUMN structured_content jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.memos.structured_content IS 'Structured JSON content with sections, paragraphs, highlights, and key points for component-based rendering';

-- Create an index for better query performance on structured content
CREATE INDEX idx_memos_structured_content ON public.memos USING gin (structured_content);