-- Add posted_date and deadline columns to notice_crawl_queue
-- This separates the two dates that were being confused:
-- - posted_date: When the notice was posted (작성일)
-- - deadline: Application deadline (마감일)

-- Add new columns
ALTER TABLE notice_crawl_queue
ADD COLUMN IF NOT EXISTS posted_date VARCHAR(100),
ADD COLUMN IF NOT EXISTS deadline VARCHAR(100);

-- Migrate existing data: source_date_string was actually deadline
UPDATE notice_crawl_queue
SET deadline = source_date_string
WHERE deadline IS NULL AND source_date_string IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN notice_crawl_queue.posted_date IS '공고 작성일 (게시일)';
COMMENT ON COLUMN notice_crawl_queue.deadline IS '신청 마감일';
COMMENT ON COLUMN notice_crawl_queue.source_date_string IS 'Deprecated: Use posted_date or deadline instead';
