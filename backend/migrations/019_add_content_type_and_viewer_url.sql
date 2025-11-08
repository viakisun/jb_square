-- Migration: Add content_type and content_viewer_url to support_notices
-- Purpose: Simplify content management by moving data from raw_data to dedicated columns
-- Date: 2025-11-08

-- Add content_type column (text, html, pdf_viewer)
ALTER TABLE support_notices
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20);

-- Add content_viewer_url column (for JBTP PDF viewer)
ALTER TABLE support_notices
ADD COLUMN IF NOT EXISTS content_viewer_url TEXT;

-- Create index for content_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_support_notices_content_type
ON support_notices(content_type);

-- Add comment for documentation
COMMENT ON COLUMN support_notices.content_type IS 'Content type: text, html, or pdf_viewer';
COMMENT ON COLUMN support_notices.content_viewer_url IS 'URL for PDF viewer iframe (JBTP notices)';
