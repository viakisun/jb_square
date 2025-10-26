-- Add matched_keywords column to notice_crawl_queue table
-- This stores which keywords were matched for each crawled notice

ALTER TABLE notice_crawl_queue
ADD COLUMN IF NOT EXISTS matched_keywords JSONB DEFAULT '[]'::jsonb;

-- Add index for searching by matched keywords
CREATE INDEX IF NOT EXISTS idx_notice_crawl_queue_matched_keywords
ON notice_crawl_queue USING GIN (matched_keywords jsonb_path_ops);

-- Add comment
COMMENT ON COLUMN notice_crawl_queue.matched_keywords IS 'Keywords that matched this notice title (for filtering/sorting)';
