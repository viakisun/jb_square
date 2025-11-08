-- ========================================
-- Professional Tag System - Migrate Notice Tags
-- ========================================
-- Date: 2025-11-08
-- Purpose: Migrate existing notice tags to new professional structure
--
-- PREREQUISITES:
-- 1. Run 012_professional_tag_system_backup.sql
-- 2. Run 013_professional_tag_system_create.sql
--
-- TAG MAPPING STRATEGY:
-- Old → New mappings for existing tags with usage
-- ========================================

-- Report current notice tags
SELECT 'BEFORE MIGRATION - Current Notice Tags' AS report;
SELECT
    tag,
    COUNT(*) AS notice_count
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tags IS NOT NULL
GROUP BY tag
ORDER BY notice_count DESC;

-- ========================================
-- Tag Migration Mappings
-- ========================================
-- R&D (17 uses) → R&D (new)
-- 사업화 (29 uses) → 사업화 (new)
-- 창업 (13 uses) → 창업 (new)
-- 투자유치 (7 uses) → 투자유치 (new)
-- 바이오헬스 (13 uses) → 신약개발, 바이오의약품, 의료기기 (distribute)
-- 그린바이오 (4 uses) → 농생명 (new)
-- 기후테크 (6 uses) → 기후테크 (new)
-- 해외진출 (4 uses) → 해외진출 (new)
-- 인증 (2 uses) → 인증지원 (new)
-- 인력 (4 uses) → 인력양성 (new)
-- ========================================

-- Map: 바이오헬스 → Distribute to 신약개발, 바이오의약품, 의료기기
DO $$
DECLARE
    notice_record RECORD;
    updated_tags JSON;
    tag_array TEXT[];
    notice_count INT := 0;
BEGIN
    FOR notice_record IN
        SELECT id, tags, title
        FROM support_notices
        WHERE tags::text LIKE '%바이오헬스%'
    LOOP
        -- Convert JSON array to PostgreSQL array and remove '바이오헬스'
        SELECT array_agg(value)
        INTO tag_array
        FROM json_array_elements_text(notice_record.tags)
        WHERE value != '바이오헬스';

        -- Add new bio tags based on title keywords
        IF notice_record.title ~* '신약|의약품|치료제' THEN
            tag_array := array_append(tag_array, '신약개발');
            tag_array := array_append(tag_array, '바이오의약품');
        ELSIF notice_record.title ~* '의료기기|진단' THEN
            tag_array := array_append(tag_array, '의료기기');
            tag_array := array_append(tag_array, '진단기술');
        ELSE
            -- Default: add 바이오의약품
            tag_array := array_append(tag_array, '바이오의약품');
        END IF;

        -- Convert back to JSON array
        updated_tags := array_to_json(tag_array);

        UPDATE support_notices
        SET tags = updated_tags, updated_at = NOW()
        WHERE id = notice_record.id;

        notice_count := notice_count + 1;
    END LOOP;

    RAISE NOTICE 'Migrated % notices with 바이오헬스 tag', notice_count;
END $$;

-- Map: 그린바이오 → 농생명
UPDATE support_notices
SET tags = (
    SELECT array_to_json(
        array_agg(
            CASE
                WHEN value = '그린바이오' THEN '농생명'
                ELSE value
            END
        )
    )
    FROM json_array_elements_text(tags)
),
updated_at = NOW()
WHERE tags::text LIKE '%그린바이오%';

-- Map: 인증 → 인증지원
UPDATE support_notices
SET tags = (
    SELECT array_to_json(
        array_agg(
            CASE
                WHEN value = '인증' THEN '인증지원'
                ELSE value
            END
        )
    )
    FROM json_array_elements_text(tags)
),
updated_at = NOW()
WHERE tags::text LIKE '%인증%';

-- Map: 인력 → 인력양성
UPDATE support_notices
SET tags = (
    SELECT array_to_json(
        array_agg(
            CASE
                WHEN value = '인력' THEN '인력양성'
                ELSE value
            END
        )
    )
    FROM json_array_elements_text(tags)
),
updated_at = NOW()
WHERE tags::text LIKE '%인력%';

-- Map: R&D → R&D (exact match, already exists in new system)
-- Map: 사업화 → 사업화 (exact match)
-- Map: 창업 → 창업 (exact match)
-- Map: 투자유치 → 투자유치 (exact match)
-- Map: 기후테크 → 기후테크 (exact match)
-- Map: 해외진출 → 해외진출 (exact match)
-- These tags remain unchanged as they exist in the new support_type category

-- Add default support_type tag if notice has no support type
DO $$
DECLARE
    notice_record RECORD;
    updated_tags JSON;
    tag_array TEXT[];
    has_support_tag BOOLEAN;
BEGIN
    FOR notice_record IN
        SELECT id, tags, title
        FROM support_notices
        WHERE tags IS NOT NULL
    LOOP
        -- Convert JSON array to PostgreSQL array
        SELECT array_agg(value)
        INTO tag_array
        FROM json_array_elements_text(notice_record.tags);

        -- Check if notice has any support_type tag
        has_support_tag := tag_array && ARRAY['R&D', '사업화', '창업', '투자유치', '해외진출', '인력양성', '인증지원'];

        -- If no support tag, infer from title
        IF NOT has_support_tag THEN
            IF notice_record.title ~* 'R&D|연구개발|기술개발' THEN
                tag_array := array_append(tag_array, 'R&D');
            ELSIF notice_record.title ~* '사업화|상용화' THEN
                tag_array := array_append(tag_array, '사업화');
            ELSIF notice_record.title ~* '창업|스타트업' THEN
                tag_array := array_append(tag_array, '창업');
            ELSIF notice_record.title ~* '투자|펀딩' THEN
                tag_array := array_append(tag_array, '투자유치');
            ELSIF notice_record.title ~* '해외|수출|글로벌' THEN
                tag_array := array_append(tag_array, '해외진출');
            ELSIF notice_record.title ~* '인력|인재|교육' THEN
                tag_array := array_append(tag_array, '인력양성');
            ELSIF notice_record.title ~* '인증|허가|규제' THEN
                tag_array := array_append(tag_array, '인증지원');
            END IF;

            -- Update if we added a tag
            IF array_length(tag_array, 1) > (SELECT count(*) FROM json_array_elements_text(notice_record.tags)) THEN
                updated_tags := array_to_json(tag_array);
                UPDATE support_notices
                SET tags = updated_tags, updated_at = NOW()
                WHERE id = notice_record.id;
            END IF;
        END IF;
    END LOOP;
END $$;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'AFTER MIGRATION - Updated Notice Tags' AS report;
SELECT
    tag,
    COUNT(*) AS notice_count
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tags IS NOT NULL
GROUP BY tag
ORDER BY notice_count DESC;

-- Check for orphaned tags (tags in notices but not in content_tags)
SELECT 'ORPHANED TAGS CHECK' AS check_result;
SELECT DISTINCT tag AS orphaned_tag
FROM support_notices,
    json_array_elements_text(tags) AS tag
WHERE tag NOT IN (SELECT name FROM content_tags)
ORDER BY tag;

-- Summary
SELECT 'MIGRATION SUMMARY' AS summary,
       (SELECT COUNT(*) FROM support_notices WHERE tags IS NOT NULL AND json_array_length(tags) > 0) AS total_notices_with_tags,
       (SELECT COUNT(DISTINCT tag) FROM support_notices, json_array_elements_text(tags) AS tag) AS unique_tags_in_use;

-- Tag category breakdown
SELECT 'TAG CATEGORY BREAKDOWN' AS category_report;
SELECT
    ct.category,
    COUNT(DISTINCT ct.name) AS tags_in_category,
    SUM(notice_count.count) AS total_usage
FROM content_tags ct
LEFT JOIN (
    SELECT tag, COUNT(*) as count
    FROM support_notices,
        json_array_elements_text(tags) AS tag
    WHERE tags IS NOT NULL
    GROUP BY tag
) notice_count ON ct.name = notice_count.tag
GROUP BY ct.category
ORDER BY ct.category;
