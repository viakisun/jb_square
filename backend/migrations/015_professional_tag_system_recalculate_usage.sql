-- ========================================
-- Professional Tag System - Recalculate Usage Counts
-- ========================================
-- Date: 2025-11-08
-- Purpose: Recalculate usage_count for all professional tags after migration
--
-- PREREQUISITES:
-- 1. Run 012_professional_tag_system_backup.sql
-- 2. Run 013_professional_tag_system_create.sql
-- 3. Run 014_professional_tag_system_migrate_notices.sql
--
-- This script will:
-- - Reset all usage_count to 0
-- - Count actual tag usage in support_notices
-- - Update usage_count for all tags
-- ========================================

-- Report current usage_count BEFORE recalculation
SELECT 'BEFORE RECALCULATION - Current usage_count' AS report;
SELECT
    category,
    name,
    usage_count
FROM content_tags
WHERE is_active = true
ORDER BY category, display_order, name;

-- ========================================
-- STEP 1: Reset all usage_count to 0
-- ========================================
UPDATE content_tags
SET usage_count = 0;

SELECT 'All usage_count reset to 0' AS status;

-- ========================================
-- STEP 2: Calculate actual usage from notices
-- ========================================

-- Create temporary table with tag usage counts
DROP TABLE IF EXISTS temp_tag_usage;
CREATE TEMP TABLE temp_tag_usage AS
SELECT
    tag AS tag_name,
    COUNT(*) AS actual_usage
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tags IS NOT NULL
GROUP BY tag;

-- Verify temp table
SELECT 'TEMP TABLE - Actual tag usage in notices' AS report;
SELECT * FROM temp_tag_usage ORDER BY actual_usage DESC;

-- ========================================
-- STEP 3: Update content_tags with actual usage
-- ========================================

UPDATE content_tags ct
SET usage_count = COALESCE(tu.actual_usage, 0),
    updated_at = NOW()
FROM temp_tag_usage tu
WHERE ct.name = tu.tag_name;

SELECT 'Usage counts updated from actual notice data' AS status;

-- ========================================
-- VERIFICATION & REPORTING
-- ========================================

-- Report AFTER recalculation
SELECT 'AFTER RECALCULATION - Updated usage_count' AS report;
SELECT
    category,
    name,
    usage_count,
    CASE
        WHEN usage_count = 0 THEN '⚠️ Not used'
        WHEN usage_count < 5 THEN '▫️ Low usage'
        WHEN usage_count < 10 THEN '▪️ Medium usage'
        ELSE '■ High usage'
    END AS usage_level
FROM content_tags
WHERE is_active = true
ORDER BY category, display_order, usage_count DESC, name;

-- Summary by category
SELECT 'SUMMARY BY CATEGORY' AS summary_report;
SELECT
    category,
    COUNT(*) AS total_tags,
    SUM(usage_count) AS total_usage,
    ROUND(AVG(usage_count)::numeric, 2) AS avg_usage_per_tag,
    MAX(usage_count) AS max_usage,
    MIN(usage_count) AS min_usage
FROM content_tags
WHERE is_active = true
GROUP BY category
ORDER BY
    CASE category
        WHEN 'bio_field' THEN 1
        WHEN 'tech_field' THEN 2
        WHEN 'support_type' THEN 3
        WHEN 'ministry' THEN 4
        WHEN 'agency' THEN 5
        WHEN 'target' THEN 6
        WHEN 'specialized' THEN 7
        WHEN 'region' THEN 8
        ELSE 999
    END;

-- Find orphaned tags (tags in notices but not in content_tags)
SELECT 'ORPHANED TAGS - Tags in notices but not in content_tags table' AS orphan_check;
SELECT DISTINCT tag AS orphaned_tag
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tag NOT IN (SELECT name FROM content_tags)
ORDER BY tag;

-- Count notices with vs without tags
SELECT 'NOTICE TAG COVERAGE' AS coverage_report;
SELECT
    'Notices with tags' AS status,
    COUNT(*) AS count
FROM support_notices
WHERE tags IS NOT NULL AND json_array_length(tags) > 0
UNION ALL
SELECT
    'Notices without tags' AS status,
    COUNT(*) AS count
FROM support_notices
WHERE tags IS NULL OR json_array_length(tags) = 0;

-- Final validation
SELECT 'FINAL VALIDATION' AS final_check;
SELECT
    (SELECT COUNT(*) FROM content_tags WHERE is_active = true) AS total_active_tags,
    (SELECT SUM(usage_count) FROM content_tags) AS total_tag_usages,
    (SELECT COUNT(*) FROM support_notices WHERE tags IS NOT NULL AND json_array_length(tags) > 0) AS notices_with_tags;

-- Top 20 most used tags
SELECT 'TOP 20 MOST USED TAGS' AS top_tags_report;
SELECT
    category,
    name,
    usage_count
FROM content_tags
WHERE is_active = true AND usage_count > 0
ORDER BY usage_count DESC, name
LIMIT 20;
