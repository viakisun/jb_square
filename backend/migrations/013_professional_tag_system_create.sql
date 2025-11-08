-- ========================================
-- Professional Tag System - Complete Restructuring
-- ========================================
-- Date: 2025-11-08
-- Purpose: Create comprehensive professional tag system (65 tags)
--
-- PREREQUISITES:
-- 1. Run 012_professional_tag_system_backup.sql first
--
-- STRUCTURE:
-- - 바이오분야 (bio_field): 15 tags
-- - 기술분야 (tech_field): 9 tags
-- - 지원유형 (support_type): 7 tags
-- - 정부부처 (ministry): 6 tags
-- - 산하기관 (agency): 12 tags
-- - 대상기업 (target): 5 tags
-- - 특화지원 (specialized): 6 tags
-- - 지역 (region): 5 tags
-- Total: 65 tags
-- ========================================

-- Report current tags before deletion
SELECT 'BEFORE DELETION - Current Tags' AS report;
SELECT category, COUNT(*) AS tag_count
FROM content_tags
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- ========================================
-- STEP 1: Delete ALL existing tags
-- ========================================
DELETE FROM content_tags;

SELECT 'All existing tags deleted' AS status;

-- ========================================
-- STEP 2: Create new professional tag structure
-- ========================================

-- ========================================
-- 1. 바이오분야 (bio_field) - 15 tags
-- ========================================

-- 레드바이오 (Red Biotech)
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('신약개발', 'new-drug-dev', '신약 연구개발 및 임상시험', '#EF4444', 'bio_field', true, 101),
('바이오의약품', 'biopharmaceuticals', '바이오의약품 개발 및 생산', '#EF4444', 'bio_field', true, 102),
('의료기기', 'medical-device', '의료기기 개발 및 제조', '#EF4444', 'bio_field', true, 103),
('진단기술', 'diagnostics', '체외진단, 분자진단 기술', '#EF4444', 'bio_field', true, 104),
('임상시험', 'clinical-trials', '임상시험 및 허가', '#EF4444', 'bio_field', true, 105);

-- 그린바이오 (Green Biotech)
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('농생명', 'agri-bio', '농업 생명공학 및 스마트팜', '#10B981', 'bio_field', true, 111),
('식품바이오', 'food-bio', '기능성식품 및 식품안전', '#10B981', 'bio_field', true, 112),
('바이오에너지', 'bioenergy', '바이오연료 및 재생에너지', '#10B981', 'bio_field', true, 113),
('환경정화', 'environmental', '환경오염 정화 및 복원', '#10B981', 'bio_field', true, 114),
('해양바이오', 'marine-bio', '해양생물자원 활용', '#10B981', 'bio_field', true, 115);

-- 화이트바이오 (White Biotech)
INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('바이오소재', 'biomaterials', '바이오 기반 신소재', '#F3F4F6', 'bio_field', true, 121),
('바이오화학', 'biochemical', '바이오화학 공정 및 제품', '#F3F4F6', 'bio_field', true, 122),
('산업효소', 'industrial-enzyme', '산업용 효소 개발', '#F3F4F6', 'bio_field', true, 123),
('바이오플라스틱', 'bioplastic', '생분해성 플라스틱', '#F3F4F6', 'bio_field', true, 124),
('발효공학', 'fermentation', '발효기술 및 생산', '#F3F4F6', 'bio_field', true, 125);

-- ========================================
-- 2. 기술분야 (tech_field) - 9 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('디지털헬스', 'digital-health', '디지털 헬스케어 솔루션', '#3B82F6', 'tech_field', true, 201),
('AI/빅데이터', 'ai-bigdata', '인공지능 및 빅데이터 분석', '#3B82F6', 'tech_field', true, 202),
('바이오정보학', 'bioinformatics', '바이오인포매틱스 및 데이터분석', '#3B82F6', 'tech_field', true, 203),
('나노기술', 'nanotechnology', '나노바이오 융합기술', '#8B5CF6', 'tech_field', true, 204),
('이차전지', 'battery', '배터리 및 에너지저장', '#F59E0B', 'tech_field', true, 205),
('신소재', 'new-materials', '첨단 신소재 개발', '#8B5CF6', 'tech_field', true, 206),
('기후테크', 'climate-tech', '기후변화 대응 기술', '#10B981', 'tech_field', true, 207),
('탄소중립', 'carbon-neutral', '탄소중립 및 저탄소 기술', '#10B981', 'tech_field', true, 208),
('ESG', 'esg', '환경·사회·지배구조', '#10B981', 'tech_field', true, 209);

-- ========================================
-- 3. 지원유형 (support_type) - 7 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('R&D', 'rnd', '연구개발 지원사업', '#6366F1', 'support_type', true, 301),
('사업화', 'commercialization', '제품화 및 시장진출', '#EC4899', 'support_type', true, 302),
('창업', 'startup', '창업 지원 및 육성', '#F59E0B', 'support_type', true, 303),
('투자유치', 'investment', '투자유치 및 IR 지원', '#10B981', 'support_type', true, 304),
('해외진출', 'global', '수출 및 글로벌 진출', '#0EA5E9', 'support_type', true, 305),
('인력양성', 'hr-development', '인력채용 및 교육훈련', '#8B5CF6', 'support_type', true, 306),
('인증지원', 'certification', '인증취득 및 규제대응', '#EF4444', 'support_type', true, 307);

-- ========================================
-- 4. 정부부처 (ministry) - 6 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('과기정통부', 'msit', '과학기술정보통신부', '#3B82F6', 'ministry', true, 401),
('산업부', 'motie', '산업통상자원부', '#EF4444', 'ministry', true, 402),
('보건복지부', 'mohw', '보건복지부', '#10B981', 'ministry', true, 403),
('농식품부', 'mafra', '농림축산식품부', '#F59E0B', 'ministry', true, 404),
('환경부', 'me', '환경부', '#10B981', 'ministry', true, 405),
('중기부', 'mss', '중소벤처기업부', '#8B5CF6', 'ministry', true, 406);

-- ========================================
-- 5. 산하기관 (agency) - 12 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('KEIT', 'keit', '한국산업기술평가관리원', '#6366F1', 'agency', true, 501),
('KIAT', 'kiat', '한국산업기술진흥원', '#6366F1', 'agency', true, 502),
('TIPA', 'tipa', '중소기업기술정보진흥원', '#8B5CF6', 'agency', true, 503),
('창업진흥원', 'kised', '한국창업진흥원', '#F59E0B', 'agency', true, 504),
('KHIDI', 'khidi', '한국보건산업진흥원', '#10B981', 'agency', true, 505),
('KOTRA', 'kotra', '대한무역투자진흥공사', '#0EA5E9', 'agency', true, 506),
('NRF', 'nrf', '한국연구재단', '#3B82F6', 'agency', true, 507),
('KISTEP', 'kistep', '한국과학기술기획평가원', '#3B82F6', 'agency', true, 508),
('NIPA', 'nipa', '한국지능정보사회진흥원', '#6366F1', 'agency', true, 509),
('KBIZ', 'kbiz', '중소기업중앙회', '#8B5CF6', 'agency', true, 510),
('SMTECH', 'smtech', '중소기업기술혁신협회', '#8B5CF6', 'agency', true, 511),
('KOSME', 'kosme', '소상공인시장진흥공단', '#8B5CF6', 'agency', true, 512);

-- ========================================
-- 6. 대상기업 (target) - 5 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('예비창업', 'pre-startup', '예비창업자 및 아이디어 단계', '#F59E0B', 'target', true, 601),
('스타트업', 'startup-company', '7년 미만 초기기업', '#F59E0B', 'target', true, 602),
('중소기업', 'sme', '중소기업 (매출 1,500억 미만)', '#6366F1', 'target', true, 603),
('중견기업', 'mid-sized', '중견기업 (매출 1,500억 이상)', '#8B5CF6', 'target', true, 604),
('대학/연구소', 'university-research', '대학 및 연구기관', '#3B82F6', 'target', true, 605);

-- ========================================
-- 7. 특화지원 (specialized) - 6 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('규제샌드박스', 'regulatory-sandbox', '규제특례 및 실증특례', '#EF4444', 'specialized', true, 701),
('특허IP', 'patent-ip', '특허출원 및 IP 확보', '#8B5CF6', 'specialized', true, 702),
('실증테스트', 'testbed', '실증 및 테스트베드', '#3B82F6', 'specialized', true, 703),
('컨소시엄', 'consortium', '공동연구 및 협력', '#6366F1', 'specialized', true, 704),
('멘토링', 'mentoring', '전문가 멘토링 및 컨설팅', '#EC4899', 'specialized', true, 705),
('네트워킹', 'networking', '기업간 네트워킹 및 교류', '#0EA5E9', 'specialized', true, 706);

-- ========================================
-- 8. 지역 (region) - 5 tags
-- ========================================

INSERT INTO content_tags (name, slug, description, color_hex, category, is_active, display_order) VALUES
('전북', 'jeonbuk', '전북특별자치도', '#10B981', 'region', true, 801),
('수도권', 'metro', '서울/경기/인천', '#6366F1', 'region', true, 802),
('지방', 'regional', '지방 소재 기업', '#8B5CF6', 'region', true, 803),
('자유무역지역', 'ftz', '자유무역지역 입주기업', '#0EA5E9', 'region', true, 804),
('산업단지', 'industrial-complex', '산업단지 입주기업', '#F59E0B', 'region', true, 805);

-- ========================================
-- VERIFICATION
-- ========================================

SELECT 'AFTER CREATION - New Tag Structure' AS report;
SELECT
    category,
    COUNT(*) AS tag_count,
    string_agg(name, ', ' ORDER BY display_order) AS tags
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

-- Total count
SELECT 'TOTAL TAGS CREATED' AS summary, COUNT(*) AS total_tags
FROM content_tags
WHERE is_active = true;

-- Detail list
SELECT 'COMPLETE TAG LIST' AS detail_report;
SELECT
    category,
    name,
    slug,
    color_hex,
    display_order
FROM content_tags
WHERE is_active = true
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
    END,
    display_order;
