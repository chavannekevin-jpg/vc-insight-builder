-- Add tracking column for audit insights extraction
ALTER TABLE companies ADD COLUMN IF NOT EXISTS audit_insights_extracted BOOLEAN DEFAULT false;