-- ========================================
-- Tag Color System - Bio Tags Only
-- ========================================
-- Date: 2025-11-08
-- Purpose: Update tag colors so only bio_field tags have colors, others are gray
--
-- STRATEGY:
-- - bio_field tags: Keep current colors (Red/Green/White Bio)
-- - All other tags: Set to default gray (#6B7280)
-- ========================================

-- Report current colors BEFORE update
SELECT 'BEFORE UPDATE - Current Tag Colors' AS report;
SELECT
    category,
    name,
    color_hex,
    CASE
        WHEN category = 'bio_field' THEN '✓ Bio (Keep Color)'
        ELSE '→ Will change to Gray'
    END AS action
FROM content_tags
WHERE is_active = true
ORDER BY category, display_order, name;

-- ========================================
-- UPDATE: Set non-bio tags to gray
-- ========================================

UPDATE content_tags
SET color_hex = '#6B7280',
    updated_at = NOW()
WHERE category != 'bio_field'
  AND is_active = true;

SELECT 'Non-bio tags updated to gray' AS status;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'AFTER UPDATE - Updated Tag Colors' AS report;
SELECT
    category,
    COUNT(*) AS tag_count,
    COUNT(DISTINCT color_hex) AS unique_colors,
    string_agg(DISTINCT color_hex, ', ' ORDER BY color_hex) AS colors_used
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
    END;

-- Bio tags should have multiple colors
SELECT 'BIO_FIELD TAGS - Should have colored backgrounds' AS bio_check;
SELECT
    name,
    color_hex,
    CASE
        WHEN color_hex = '#EF4444' THEN 'Red Bio'
        WHEN color_hex = '#DC2626' THEN 'Red Bio (Dark)'
        WHEN color_hex = '#10B981' THEN 'Green Bio'
        WHEN color_hex = '#F3F4F6' THEN 'White Bio'
        ELSE 'Other'
    END AS color_category
FROM content_tags
WHERE category = 'bio_field'
  AND is_active = true
ORDER BY display_order, name;

-- Non-bio tags should all be gray
SELECT 'NON-BIO TAGS - Should all be gray (#6B7280)' AS non_bio_check;
SELECT
    category,
    COUNT(*) AS tag_count,
    COUNT(CASE WHEN color_hex != '#6B7280' THEN 1 END) AS non_gray_count
FROM content_tags
WHERE category != 'bio_field'
  AND is_active = true
GROUP BY category
ORDER BY category;

-- Summary
SELECT 'COLOR UPDATE SUMMARY' AS summary;
SELECT
    'Bio field tags (colored)' AS tag_type,
    COUNT(*) AS count,
    COUNT(DISTINCT color_hex) AS unique_colors
FROM content_tags
WHERE category = 'bio_field' AND is_active = true
UNION ALL
SELECT
    'Non-bio tags (gray)' AS tag_type,
    COUNT(*) AS count,
    COUNT(DISTINCT color_hex) AS unique_colors
FROM content_tags
WHERE category != 'bio_field' AND is_active = true;
