-- ============================================
-- Migration 003: Add Rejection Tracking to CrawlQueue
-- ============================================
-- Purpose: Track rejected/hidden items to prevent re-crawling unwanted notices

-- 1. Add rejection tracking columns to crawl_queue
ALTER TABLE crawl_queue
    ADD COLUMN IF NOT EXISTS rejection_status VARCHAR(20),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(100);

-- 2. Add index for efficient rejection filtering
CREATE INDEX IF NOT EXISTS idx_crawl_queue_rejection
    ON crawl_queue(source_id, rejection_status);

-- 3. Add composite index for duplicate detection
CREATE INDEX IF NOT EXISTS idx_crawl_queue_dedup
    ON crawl_queue(source_id, title);

-- 4. Add check constraint for rejection_status values
ALTER TABLE crawl_queue
    ADD CONSTRAINT check_rejection_status
    CHECK (rejection_status IS NULL OR rejection_status IN ('rejected', 'kept'));

COMMENT ON COLUMN crawl_queue.rejection_status IS 'NULL=pending review, rejected=hidden/dont show again, kept=approved for publishing';
COMMENT ON COLUMN crawl_queue.rejection_reason IS 'Optional notes on why item was rejected';
COMMENT ON COLUMN crawl_queue.rejected_at IS 'Timestamp when item was rejected';
COMMENT ON COLUMN crawl_queue.rejected_by IS 'User who rejected the item (for future auth)';
