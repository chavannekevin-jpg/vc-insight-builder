-- Add currency column to business_opportunities table
ALTER TABLE public.business_opportunities 
ADD COLUMN currency text DEFAULT 'USD' NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.business_opportunities.currency IS 'Currency code: USD, EUR, or CHF';