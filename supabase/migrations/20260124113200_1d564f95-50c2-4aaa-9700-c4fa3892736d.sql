-- Add pending_head_email column to track pre-created accelerators awaiting claim
ALTER TABLE public.accelerators 
ADD COLUMN pending_head_email VARCHAR NULL;

-- Add a comment to explain the column's purpose
COMMENT ON COLUMN public.accelerators.pending_head_email IS 'Email of the invited ecosystem head for pre-created accelerators (NULL after claimed)';