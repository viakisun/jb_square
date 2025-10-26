-- Migration: Optimize crawl queue schema
-- Date: 2025-10-26
-- Description: Fix deadline type and remove redundant columns

-- 1. Drop old deadline index (on VARCHAR column)
DROP INDEX IF EXISTS idx_crawl_queue_deadline;

-- 2. Convert deadline from VARCHAR to TIMESTAMP
-- Parse and clean deadline strings (remove D-day suffix)
ALTER TABLE notice_crawl_queue
  ALTER COLUMN deadline TYPE TIMESTAMP
  USING CASE
    WHEN deadline IS NULL THEN NULL
    WHEN deadline ~ '^\d{4}-\d{2}-\d{2}' THEN
      regexp_replace(deadline, '-D-\d+$', '')::TIMESTAMP
    ELSE NULL
  END;

-- 3. Create proper TIMESTAMP index on deadline
CREATE INDEX idx_crawl_queue_deadline ON notice_crawl_queue(deadline);

-- 4. Drop redundant/legacy columns
ALTER TABLE notice_crawl_queue
  DROP COLUMN IF EXISTS posted_date,        -- Use published_date instead
  DROP COLUMN IF EXISTS is_processed,       -- Using DELETE pattern
  DROP COLUMN IF EXISTS is_selected,        -- Frontend state (not DB concern)
  DROP COLUMN IF EXISTS published_at,       -- Not needed in queue
  DROP COLUMN IF EXISTS source_date_string; -- Legacy field

-- 5. Add comments for clarity
COMMENT ON COLUMN notice_crawl_queue.deadline IS 'Parsed deadline (TIMESTAMP) - cleaned from D-day suffix';
COMMENT ON COLUMN notice_crawl_queue.published_date IS 'Date published on source website';
COMMENT ON COLUMN notice_crawl_queue.organization IS 'Organization/writer name from source';
COMMENT ON COLUMN notice_crawl_queue.views IS 'View count from source website';
COMMENT ON COLUMN notice_crawl_queue.status IS 'Status from source (접수중, 마감, etc)';

-- 6. Verify cleanup
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'notice_crawl_queue' ORDER BY ordinal_position;
