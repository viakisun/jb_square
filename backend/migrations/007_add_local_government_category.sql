-- Migration 007: Add 'local_government' category to notices table
-- This allows separation of national government (NTIS) and local government (JBTP) notices

-- Drop existing check constraint
ALTER TABLE notices DROP CONSTRAINT IF EXISTS check_category;

-- Add new check constraint with 'local_government' category
ALTER TABLE notices ADD CONSTRAINT check_category
    CHECK (category IN ('government', 'local_government', 'business', 'rnd', 'startup'));

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_notices_source_category ON notices(source_id, category, status);

COMMENT ON CONSTRAINT check_category ON notices IS 'Valid categories: government (NTIS national), local_government (JBTP local), business, rnd, startup';
