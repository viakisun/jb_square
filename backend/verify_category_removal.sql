-- Database Integrity Verification for Category Removal
-- Execute: psql $DATABASE_URL -f verify_category_removal.sql

\echo '====================================================================='
\echo 'CATEGORY REMOVAL VERIFICATION'
\echo '====================================================================='
\echo ''

-- Check 1: Verify category column is removed
\echo '--- Check 1: Verify category column is removed ---'
SELECT COUNT(*) as category_column_exists
FROM information_schema.columns
WHERE table_name = 'support_notices' AND column_name = 'category';
\echo 'Expected: 0 (column should not exist)'
\echo ''

-- Check 2: Verify all source_ids follow new naming convention
\echo '--- Check 2: Verify all source_ids follow new naming convention ---'
SELECT crawler_source_id, COUNT(*) as count
FROM support_notices
GROUP BY crawler_source_id
ORDER BY count DESC;
\echo 'Expected: Only source:*:* format values'
\echo ''

-- Check 3: Check for NULL or invalid source_ids
\echo '--- Check 3: Check for NULL or invalid source_ids ---'
SELECT COUNT(*) as invalid_count
FROM support_notices
WHERE crawler_source_id IS NULL
   OR crawler_source_id NOT LIKE 'source:%:%';
\echo 'Expected: 0 (no invalid source_ids)'
\echo ''

-- Check 4: Verify crawler_configs table updated
\echo '--- Check 4: Verify crawler_configs table updated ---'
SELECT source_id, enabled
FROM crawler_configs
ORDER BY source_id;
\echo 'Expected: All source_id values in source:*:* format'
\echo ''

-- Check 5: Check manual notices
\echo '--- Check 5: Check manual notices source_ids ---'
SELECT crawler_source_id, COUNT(*) as count
FROM support_notices
WHERE origin_type = 'manual'
GROUP BY crawler_source_id
ORDER BY count DESC;
\echo 'Expected: Should have valid source_id or be "manual"'
\echo ''

\echo '====================================================================='
\echo 'VERIFICATION COMPLETE'
\echo '====================================================================='
