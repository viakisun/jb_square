-- Migration: Restructure crawl queue with typed columns
-- Date: 2025-10-26
-- Description: Add structured columns to notice_crawl_queue for better data integrity

-- Add new columns (deadline already exists)
ALTER TABLE notice_crawl_queue
ADD COLUMN IF NOT EXISTS published_date DATE,
ADD COLUMN IF NOT EXISTS organization VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact VARCHAR(255),
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN notice_crawl_queue.deadline IS 'Parsed deadline from raw_data';
COMMENT ON COLUMN notice_crawl_queue.published_date IS 'Parsed published date from raw_data';
COMMENT ON COLUMN notice_crawl_queue.organization IS 'Organization name';
COMMENT ON COLUMN notice_crawl_queue.department IS 'Department name';
COMMENT ON COLUMN notice_crawl_queue.contact IS 'Contact information';
COMMENT ON COLUMN notice_crawl_queue.views IS 'View count from source';
COMMENT ON COLUMN notice_crawl_queue.status IS 'Status from source (접수중, 마감, etc)';

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_crawl_queue_deadline ON notice_crawl_queue(deadline);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_published_date ON notice_crawl_queue(published_date);
