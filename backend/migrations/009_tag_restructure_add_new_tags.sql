-- ========================================
-- Tag System Restructuring - Phase 4: ADD NEW TAGS
-- ========================================
-- Date: 2025-11-08
-- Purpose: Add new tag structure (그린바이오, 화이트바이오, 기관 categories)
--
-- PREREQUISITES:
-- 1. Run 007_tag_restructure_backup.sql first
-- 2. Run THIS script BEFORE 008_tag_restructure_update_notices.sql
--
-- NEW STRUCTURE:
-- - 그린바이오 (Green Bio): 농업바이오, 식품바이오, 환경바이오
-- - 화이트바이오 (White Bio): 산업바이오, 바이오연료, 바이오소재
-- - 기관 (Organization): 과기부, 산자부, 농식품부
-- ========================================

-- Report current tags before insertion
SELECT 'BEFORE INSERTION - Current Tag Count' AS report, COUNT(*) AS total_tags
FROM content_tags;

-- ========================================
-- 그린바이오 Category Tags
-- ========================================

-- 그린바이오 (Green Bio) - Main category tag
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '그린바이오',
    'green-bio',
    '농업, 식품, 환경 분야 바이오 기술',
    '#10B981', -- Emerald green color
    '그린바이오',
    true,
    10
) ON CONFLICT (name) DO NOTHING;

-- 농업바이오
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '농업바이오',
    'agricultural-bio',
    '농업 생산성 향상 및 친환경 농업 기술',
    '#10B981',
    '그린바이오',
    true,
    11
) ON CONFLICT (name) DO NOTHING;

-- 식품바이오
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '식품바이오',
    'food-bio',
    '식품 안전성, 기능성 식품, 식품 가공 기술',
    '#10B981',
    '그린바이오',
    true,
    12
) ON CONFLICT (name) DO NOTHING;

-- 환경바이오
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '환경바이오',
    'environmental-bio',
    '환경 보전, 오염 정화, 친환경 에너지',
    '#10B981',
    '그린바이오',
    true,
    13
) ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 화이트바이오 Category Tags
-- ========================================

-- 화이트바이오 (White Bio) - Main category tag
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '화이트바이오',
    'white-bio',
    '산업 바이오 기술 및 바이오 기반 제조',
    '#F3F4F6', -- Light gray (white bio)
    '화이트바이오',
    true,
    20
) ON CONFLICT (name) DO NOTHING;

-- 산업바이오
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '산업바이오',
    'industrial-bio',
    '바이오 기반 산업 공정 및 제조 기술',
    '#F3F4F6',
    '화이트바이오',
    true,
    21
) ON CONFLICT (name) DO NOTHING;

-- 바이오연료
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '바이오연료',
    'biofuel',
    '바이오매스 기반 연료 및 에너지',
    '#F3F4F6',
    '화이트바이오',
    true,
    22
) ON CONFLICT (name) DO NOTHING;

-- 바이오소재
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '바이오소재',
    'biomaterial',
    '바이오 기반 신소재 및 바이오플라스틱',
    '#F3F4F6',
    '화이트바이오',
    true,
    23
) ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 기관 (Organization) Category Tags
-- ========================================

-- 과기부 (Ministry of Science and ICT)
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '과기부',
    'msit',
    '과학기술정보통신부 지원사업',
    '#3B82F6', -- Blue
    '기관',
    true,
    30
) ON CONFLICT (name) DO NOTHING;

-- 산자부 (Ministry of Trade, Industry and Energy)
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '산자부',
    'motie',
    '산업통상자원부 지원사업',
    '#EF4444', -- Red
    '기관',
    true,
    31
) ON CONFLICT (name) DO NOTHING;

-- 농식품부 (Ministry of Agriculture, Food and Rural Affairs)
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order)
VALUES (
    '농식품부',
    'mafra',
    '농림축산식품부 지원사업',
    '#10B981', -- Green
    '기관',
    true,
    32
) ON CONFLICT (name) DO NOTHING;

-- Verification Report
SELECT 'AFTER INSERTION - Tag Addition Summary' AS report;
SELECT
    category,
    COUNT(*) AS tag_count,
    string_agg(name, ', ' ORDER BY display_order) AS tags
FROM content_tags
WHERE category IN ('그린바이오', '화이트바이오', '기관')
GROUP BY category
ORDER BY
    CASE category
        WHEN '그린바이오' THEN 1
        WHEN '화이트바이오' THEN 2
        WHEN '기관' THEN 3
    END;

-- Overall summary
SELECT 'FINAL TAG COUNT' AS summary, COUNT(*) AS total_tags
FROM content_tags
WHERE is_active = true;
