-- ========================================
-- Update Green Bio Tag Colors
-- ========================================
-- Date: 2025-11-08
-- Purpose: Update Green Bio tags to darker shades for better text contrast
--
-- ISSUE: Current Green Bio tags use #10B981 (luminance 0.569) showing black text
-- FIX: Update to darker greens (#059669, #047857, #065F46) to show white text
-- ========================================

-- Report current Green Bio colors BEFORE update
SELECT 'BEFORE UPDATE - Current Green Bio Tag Colors' AS report;
SELECT
    name,
    color_hex,
    category
FROM content_tags
WHERE category = 'bio_field'
  AND name IN ('농생명', '식품바이오', '바이오에너지', '환경정화', '해양바이오')
ORDER BY name;

-- ========================================
-- UPDATE: Green Bio tags to darker shades
-- ========================================

-- Distribute tags across three darker green shades
UPDATE content_tags
SET color_hex = CASE name
    WHEN '농생명' THEN '#059669'
    WHEN '식품바이오' THEN '#047857'
    WHEN '바이오에너지' THEN '#065F46'
    WHEN '환경정화' THEN '#059669'
    WHEN '해양바이오' THEN '#047857'
    ELSE color_hex
END,
updated_at = NOW()
WHERE category = 'bio_field'
  AND name IN ('농생명', '식품바이오', '바이오에너지', '환경정화', '해양바이오');

SELECT 'Green Bio tags updated to darker shades' AS status;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'AFTER UPDATE - Updated Green Bio Tag Colors' AS report;
SELECT
    name,
    color_hex,
    category,
    CASE color_hex
        WHEN '#059669' THEN 'Dark Green 1 (luminance: 0.322)'
        WHEN '#047857' THEN 'Dark Green 2 (luminance: 0.248)'
        WHEN '#065F46' THEN 'Dark Green 3 (luminance: 0.206)'
        ELSE 'Other'
    END AS color_info
FROM content_tags
WHERE category = 'bio_field'
  AND name IN ('농생명', '식품바이오', '바이오에너지', '환경정화', '해양바이오')
ORDER BY name;

-- All Green Bio tags should now show white text
SELECT 'TEXT COLOR VERIFICATION' AS verification;
SELECT
    name,
    color_hex,
    CASE
        WHEN color_hex IN ('#059669', '#047857', '#065F46') THEN '✓ White text (correct)'
        ELSE '✗ May have contrast issue'
    END AS text_color_status
FROM content_tags
WHERE category = 'bio_field'
  AND name IN ('농생명', '식품바이오', '바이오에너지', '환경정화', '해양바이오')
ORDER BY name;

-- Summary
SELECT 'UPDATE SUMMARY' AS summary;
SELECT
    'Green Bio tags updated' AS action,
    COUNT(*) AS affected_tags
FROM content_tags
WHERE category = 'bio_field'
  AND color_hex IN ('#059669', '#047857', '#065F46')
  AND name IN ('농생명', '식품바이오', '바이오에너지', '환경정화', '해양바이오');
