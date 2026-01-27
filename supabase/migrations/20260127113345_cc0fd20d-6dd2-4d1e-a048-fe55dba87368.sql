-- Add metrics_detected column to profile_enrichment_queue for smart metric extraction
ALTER TABLE profile_enrichment_queue 
ADD COLUMN IF NOT EXISTS metrics_detected JSONB DEFAULT NULL;

-- Add data_hash column for deduplication
ALTER TABLE profile_enrichment_queue
ADD COLUMN IF NOT EXISTS data_hash TEXT;

-- Create index for faster lookups on data_hash
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_data_hash 
ON profile_enrichment_queue (company_id, data_hash) 
WHERE data_hash IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profile_enrichment_queue.metrics_detected IS 'Structured financial metrics extracted from input_data (ARR, MRR, ACV, customers, etc.)';
COMMENT ON COLUMN profile_enrichment_queue.data_hash IS 'Hash of input_data for deduplication purposes';