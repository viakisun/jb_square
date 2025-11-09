-- Migration 021: Remove category field and rename source IDs
-- Purpose: Simplify data model by removing category field and standardizing source ID naming
-- Date: 2025-11-09

-- Step 1: Drop category-related constraints and indexes
DROP INDEX IF EXISTS idx_support_notices_category;
DROP INDEX IF EXISTS idx_notices_source_category;
ALTER TABLE support_notices DROP CONSTRAINT IF EXISTS check_category;

-- Step 2: Update all crawler_source_id values to new naming convention
-- Pattern: source:organization:type

UPDATE support_notices
SET crawler_source_id = 'source:jbtp:local'
WHERE crawler_source_id = 'jbtp';

UPDATE support_notices
SET crawler_source_id = 'source:jbtp:external'
WHERE crawler_source_id = 'jbtp_external';

UPDATE support_notices
SET crawler_source_id = 'source:ntis:rss'
WHERE crawler_source_id = 'ntis_rss';

UPDATE support_notices
SET crawler_source_id = 'source:bizinfo:api'
WHERE crawler_source_id = 'bizinfo';

-- Step 3: Remove category column
ALTER TABLE support_notices DROP COLUMN IF EXISTS category;

-- Step 4: Update crawler_configs table source_id values if they exist
UPDATE crawler_configs
SET source_id = 'source:jbtp:local'
WHERE source_id = 'jbtp';

UPDATE crawler_configs
SET source_id = 'source:jbtp:external'
WHERE source_id = 'jbtp_external';

UPDATE crawler_configs
SET source_id = 'source:ntis:rss'
WHERE source_id = 'ntis_rss';

UPDATE crawler_configs
SET source_id = 'source:bizinfo:api'
WHERE source_id = 'bizinfo';

-- Verification queries (comment out for execution)
-- SELECT crawler_source_id, COUNT(*) FROM support_notices GROUP BY crawler_source_id;
-- SELECT source_id FROM crawler_configs;
