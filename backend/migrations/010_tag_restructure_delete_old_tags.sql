-- ========================================
-- Tag System Restructuring - Phase 3: DELETE OLD TAGS
-- ========================================
-- Date: 2025-11-08
-- Purpose: Delete old tags from field category and 방산 tag
--
-- PREREQUISITES:
-- 1. Run 007_tag_restructure_backup.sql first
-- 2. Run 009_tag_restructure_add_new_tags.sql second
-- 3. Run 008_tag_restructure_update_notices.sql third
-- 4. Run THIS script LAST to clean up old tags
--
-- TAGS TO DELETE:
-- - field category: 신약개발, 농생명, 이차전지, 디지털, 기후테크 (but keep 기후테크)
-- - special category: 방산
-- ========================================

-- Report tags before deletion
SELECT 'BEFORE DELETION - Tags to be removed' AS report;
SELECT id, name, slug, category, usage_count
FROM content_tags
WHERE name IN ('신약개발', '농생명', '이차전지', '디지털', '방산')
ORDER BY category, name;

-- Verify these tags are not used in any notices (should be 0)
SELECT 'PRE-DELETE VERIFICATION - Notice usage (should be 0 for all)' AS check_result;
SELECT
    tag,
    COUNT(*) AS notice_count
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tag IN ('신약개발', '농생명', '이차전지', '디지털', '방산')
GROUP BY tag
ORDER BY notice_count DESC;

-- ========================================
-- DELETE TAGS
-- ========================================

-- Delete 신약개발 (0 usage, redundant)
DELETE FROM content_tags
WHERE name = '신약개발';

-- Delete 농생명 (replaced by 그린바이오)
DELETE FROM content_tags
WHERE name = '농생명';

-- Delete 이차전지 (not relevant to bio platform)
DELETE FROM content_tags
WHERE name = '이차전지';

-- Delete 디지털 (too broad, not bio-specific)
DELETE FROM content_tags
WHERE name = '디지털';

-- Delete 방산 (defense industry - not relevant)
DELETE FROM content_tags
WHERE name = '방산';

-- Keep 기후테크 (climate tech is relevant)
-- No deletion needed for 기후테크

-- Report deleted tags
SELECT 'AFTER DELETION - Remaining tags by category' AS report;
SELECT
    category,
    COUNT(*) AS tag_count,
    string_agg(name, ', ' ORDER BY display_order, name) AS tags
FROM content_tags
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Verify field category is gone
SELECT 'VERIFICATION - Field category should be empty' AS check;
SELECT COUNT(*) AS field_category_count
FROM content_tags
WHERE category = 'field';

-- Final summary
SELECT 'DELETION SUMMARY' AS summary,
       (SELECT COUNT(*) FROM content_tags WHERE is_active = true) AS total_active_tags,
       (SELECT COUNT(DISTINCT category) FROM content_tags WHERE is_active = true) AS total_categories;

-- List all active tags grouped by category
SELECT 'FINAL TAG STRUCTURE' AS final_report;
SELECT
    category,
    name,
    usage_count,
    display_order
FROM content_tags
WHERE is_active = true
ORDER BY
    CASE category
        WHEN '레드바이오' THEN 1
        WHEN '그린바이오' THEN 2
        WHEN '화이트바이오' THEN 3
        WHEN 'support' THEN 4
        WHEN 'special' THEN 5
        WHEN '기관' THEN 6
        ELSE 999
    END,
    display_order,
    name;
