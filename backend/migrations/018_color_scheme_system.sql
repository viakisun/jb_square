-- ========================================
-- Color Scheme System - Simplify Tag Colors
-- ========================================
-- Date: 2025-11-08
-- Purpose: Create color_schemes table and migrate to reference-based color system
--
-- STRATEGY:
-- 1. Create color_schemes table with predefined colors
-- 2. Add color_scheme_id to content_tags
-- 3. Migrate existing tags to use color schemes
-- 4. Simplify: 1 color per preset (Red Bio, Green Bio, White Bio, Gray)
-- ========================================

-- ========================================
-- STEP 1: Create color_schemes table
-- ========================================

CREATE TABLE IF NOT EXISTS color_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    text_color VARCHAR(7) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

SELECT 'color_schemes table created' AS status;

-- ========================================
-- STEP 2: Insert predefined color schemes
-- ========================================

INSERT INTO color_schemes (name, display_name, color_hex, text_color, category, description) VALUES
('red_bio', 'Red Bio', '#DC2626', '#FFFFFF', 'bio', '레드 바이오 - 신약개발, 바이오의약품, 임상시험'),
('green_bio', 'Green Bio', '#047857', '#FFFFFF', 'bio', '그린 바이오 - 농생명, 식품바이오, 환경'),
('white_bio', 'White Bio', '#F3F4F6', '#000000', 'bio', '화이트 바이오 - 바이오화학, 산업바이오'),
('gray_default', 'Gray', '#6B7280', '#FFFFFF', 'default', '기본 회색 - 일반 태그');

SELECT 'Color schemes inserted' AS status;

-- Verify inserted schemes
SELECT 'INSERTED COLOR SCHEMES' AS report;
SELECT * FROM color_schemes ORDER BY id;

-- ========================================
-- STEP 3: Add color_scheme_id to content_tags
-- ========================================

ALTER TABLE content_tags
ADD COLUMN IF NOT EXISTS color_scheme_id INTEGER REFERENCES color_schemes(id);

SELECT 'color_scheme_id column added to content_tags' AS status;

-- ========================================
-- STEP 4: Migrate existing tags to color schemes
-- ========================================

-- Map Red Bio tags (#EF4444, #DC2626, #B91C1C) → red_bio
UPDATE content_tags
SET color_scheme_id = (SELECT id FROM color_schemes WHERE name = 'red_bio'),
    updated_at = NOW()
WHERE color_hex IN ('#EF4444', '#DC2626', '#B91C1C')
  AND category = 'bio_field';

-- Map Green Bio tags (#10B981, #059669, #047857, #065F46) → green_bio
UPDATE content_tags
SET color_scheme_id = (SELECT id FROM color_schemes WHERE name = 'green_bio'),
    updated_at = NOW()
WHERE color_hex IN ('#10B981', '#059669', '#047857', '#065F46')
  AND category = 'bio_field';

-- Map White Bio tags (#F3F4F6, #E5E7EB, #D1D5DB) → white_bio
UPDATE content_tags
SET color_scheme_id = (SELECT id FROM color_schemes WHERE name = 'white_bio'),
    updated_at = NOW()
WHERE color_hex IN ('#F3F4F6', '#E5E7EB', '#D1D5DB')
  AND category = 'bio_field';

-- Map Gray/Default tags (#6B7280, #9CA3AF) → gray_default
UPDATE content_tags
SET color_scheme_id = (SELECT id FROM color_schemes WHERE name = 'gray_default'),
    updated_at = NOW()
WHERE color_hex IN ('#6B7280', '#9CA3AF')
  OR category != 'bio_field';

SELECT 'Existing tags migrated to color schemes' AS status;

-- ========================================
-- STEP 5: Update color_hex to match scheme
-- ========================================

-- Update all tags to use the canonical color from their scheme
UPDATE content_tags ct
SET color_hex = cs.color_hex,
    updated_at = NOW()
FROM color_schemes cs
WHERE ct.color_scheme_id = cs.id;

SELECT 'Tags updated to canonical colors' AS status;

-- ========================================
-- VERIFICATION & REPORTING
-- ========================================

SELECT 'MIGRATION COMPLETE - Tag Color Distribution' AS report;
SELECT
    cs.display_name AS scheme_name,
    cs.color_hex,
    cs.text_color,
    COUNT(ct.id) AS tag_count,
    string_agg(ct.name, ', ' ORDER BY ct.name) AS tags
FROM color_schemes cs
LEFT JOIN content_tags ct ON ct.color_scheme_id = cs.id
WHERE ct.is_active = true
GROUP BY cs.id, cs.display_name, cs.color_hex, cs.text_color
ORDER BY cs.id;

-- Verify all tags have a scheme
SELECT 'TAGS WITHOUT COLOR SCHEME' AS orphan_check;
SELECT
    name,
    color_hex,
    category
FROM content_tags
WHERE color_scheme_id IS NULL
  AND is_active = true;

-- Category breakdown
SELECT 'TAG DISTRIBUTION BY CATEGORY' AS category_report;
SELECT
    ct.category,
    cs.display_name AS color_scheme,
    COUNT(*) AS tag_count
FROM content_tags ct
LEFT JOIN color_schemes cs ON ct.color_scheme_id = cs.id
WHERE ct.is_active = true
GROUP BY ct.category, cs.display_name
ORDER BY ct.category, cs.display_name;

-- Final summary
SELECT 'FINAL SUMMARY' AS summary;
SELECT
    'Total color schemes' AS metric,
    COUNT(*) AS count
FROM color_schemes
WHERE is_active = true
UNION ALL
SELECT
    'Total tags with schemes' AS metric,
    COUNT(*) AS count
FROM content_tags
WHERE color_scheme_id IS NOT NULL
  AND is_active = true
UNION ALL
SELECT
    'Tags without schemes' AS metric,
    COUNT(*) AS count
FROM content_tags
WHERE color_scheme_id IS NULL
  AND is_active = true;
