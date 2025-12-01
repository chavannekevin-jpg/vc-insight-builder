-- Add has_premium column to companies table
ALTER TABLE companies ADD COLUMN has_premium BOOLEAN DEFAULT FALSE;