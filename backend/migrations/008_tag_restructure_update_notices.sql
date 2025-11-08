-- ========================================
-- Tag System Restructuring - Phase 2: UPDATE NOTICES
-- ========================================
-- Date: 2025-11-08
-- Purpose: Update notices to replace/remove old tags before deletion
--
-- PREREQUISITES:
-- 1. Run 007_tag_restructure_backup.sql first
-- 2. Run 009_tag_restructure_add_new_tags.sql BEFORE this script (need new tags to exist)
--
-- TAG MAPPING STRATEGY:
-- - 농생명 → 그린바이오 (Green Bio - agriculture/food)
-- - 방산 → REMOVE (defense industry - not relevant)
-- - 디지털 → REMOVE (too broad, not bio-specific)
-- - 이차전지 → REMOVE (not relevant to bio platform)
-- - 기후테크 → Keep (climate tech is relevant)
-- - 신약개발 → REMOVE (0 usage, redundant with existing tags)
-- ========================================

-- Report current tag usage before migration
SELECT 'BEFORE MIGRATION - Tag Usage Report' AS report;
SELECT
    tag,
    COUNT(*) AS notice_count
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tag IN ('농생명', '방산', '디지털', '이차전지', '기후테크', '신약개발')
GROUP BY tag
ORDER BY notice_count DESC;

-- ========================================
-- STEP 1: Replace 농생명 with 그린바이오
-- ========================================
-- Find notices with 농생명 tag
-- Replace array element: remove '농생명' and add '그린바이오'

DO $$
DECLARE
    notice_record RECORD;
    updated_tags JSON;
    tag_array TEXT[];
BEGIN
    FOR notice_record IN
        SELECT id, tags
        FROM support_notices
        WHERE tags::text LIKE '%농생명%'
    LOOP
        -- Convert JSON array to PostgreSQL array
        SELECT array_agg(value)
        INTO tag_array
        FROM json_array_elements_text(notice_record.tags);

        -- Replace 농생명 with 그린바이오
        tag_array := array_replace(tag_array, '농생명', '그린바이오');

        -- Convert back to JSON array
        updated_tags := array_to_json(tag_array);

        -- Update the notice
        UPDATE support_notices
        SET tags = updated_tags,
            updated_at = NOW()
        WHERE id = notice_record.id;

        RAISE NOTICE 'Updated notice % - replaced 농생명 with 그린바이오', notice_record.id;
    END LOOP;
END $$;

-- ========================================
-- STEP 2: Remove 방산 tag completely
-- ========================================
DO $$
DECLARE
    notice_record RECORD;
    updated_tags JSON;
    tag_array TEXT[];
BEGIN
    FOR notice_record IN
        SELECT id, tags
        FROM support_notices
        WHERE tags::text LIKE '%방산%'
    LOOP
        -- Convert JSON array to PostgreSQL array and remove '방산'
        SELECT array_agg(value)
        INTO tag_array
        FROM json_array_elements_text(notice_record.tags)
        WHERE value != '방산';

        -- Convert back to JSON array
        updated_tags := array_to_json(tag_array);

        -- Update the notice
        UPDATE support_notices
        SET tags = updated_tags,
            updated_at = NOW()
        WHERE id = notice_record.id;

        RAISE NOTICE 'Updated notice % - removed 방산 tag', notice_record.id;
    END LOOP;
END $$;

-- ========================================
-- STEP 3: Remove 디지털 tag completely
-- ========================================
DO $$
DECLARE
    notice_record RECORD;
    updated_tags JSON;
    tag_array TEXT[];
BEGIN
    FOR notice_record IN
        SELECT id, tags
        FROM support_notices
        WHERE tags::text LIKE '%디지털%'
    LOOP
        -- Convert JSON array to PostgreSQL array and remove '디지털'
        SELECT array_agg(value)
        INTO tag_array
        FROM json_array_elements_text(notice_record.tags)
        WHERE value != '디지털';

        -- Convert back to JSON array
        updated_tags := array_to_json(tag_array);

        -- Update the notice
        UPDATE support_notices
        SET tags = updated_tags,
            updated_at = NOW()
        WHERE id = notice_record.id;

        RAISE NOTICE 'Updated notice % - removed 디지털 tag', notice_record.id;
    END LOOP;
END $$;

-- ========================================
-- STEP 4: Remove 이차전지 tag completely
-- ========================================
DO $$
DECLARE
    notice_record RECORD;
    updated_tags JSON;
    tag_array TEXT[];
BEGIN
    FOR notice_record IN
        SELECT id, tags
        FROM support_notices
        WHERE tags::text LIKE '%이차전지%'
    LOOP
        -- Convert JSON array to PostgreSQL array and remove '이차전지'
        SELECT array_agg(value)
        INTO tag_array
        FROM json_array_elements_text(notice_record.tags)
        WHERE value != '이차전지';

        -- Convert back to JSON array
        updated_tags := array_to_json(tag_array);

        -- Update the notice
        UPDATE support_notices
        SET tags = updated_tags,
            updated_at = NOW()
        WHERE id = notice_record.id;

        RAISE NOTICE 'Updated notice % - removed 이차전지 tag', notice_record.id;
    END LOOP;
END $$;

-- Report updated tag usage
SELECT 'AFTER MIGRATION - Verification Report' AS report;
SELECT
    tag,
    COUNT(*) AS notice_count
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tag IN ('농생명', '방산', '디지털', '이차전지', '그린바이오')
GROUP BY tag
ORDER BY notice_count DESC;

-- Verify no notices have the old tags anymore
SELECT 'Verification: Notices still with old tags (should be 0)' AS check_result;
SELECT COUNT(*) AS problematic_notices
FROM support_notices
WHERE tags::text LIKE '%농생명%'
   OR tags::text LIKE '%방산%'
   OR tags::text LIKE '%디지털%'
   OR tags::text LIKE '%이차전지%';

-- Summary
SELECT 'MIGRATION SUMMARY' AS summary,
       (SELECT COUNT(*) FROM support_notices WHERE tags::text LIKE '%그린바이오%') AS notices_with_green_bio,
       (SELECT COUNT(*) FROM support_notices WHERE tags::text LIKE '%기후테크%') AS notices_with_climate_tech;
