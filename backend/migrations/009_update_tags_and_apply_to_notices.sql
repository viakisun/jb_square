-- Migration 009: Update content tags and apply tags to all support notices
-- Purpose: Expand tag system and tag all 60 notices

-- ============================================================================
-- STEP 1: Remove old unused bio tags and add new tags
-- ============================================================================

-- Delete unused bio tags (keep only 4 core bio tags)
DELETE FROM content_tags WHERE slug IN ('bio-chemistry', 'bio-materials', 'clinical-trial', 'bio-certification');

-- Update existing bio tags
UPDATE content_tags SET
    name = '바이오헬스',
    description = '바이오헬스케어 분야 (생명공학, 바이오테크)',
    category = 'field',
    display_order = 1
WHERE slug = 'bio-health';

UPDATE content_tags SET
    name = '바이오의약',
    description = '신약개발, 의약품, 치료제',
    category = 'field',
    display_order = 2
WHERE slug = 'bio-pharma';

UPDATE content_tags SET
    description = '의료기기 개발 및 제조',
    category = 'field',
    display_order = 3
WHERE slug = 'medical-device';

UPDATE content_tags SET
    name = '신약개발',
    description = '신약 및 치료제 R&D',
    category = 'field',
    display_order = 4
WHERE slug = 'drug-development';

-- Add new field tags
INSERT INTO content_tags (name, slug, description, color_hex, category, display_order) VALUES
('농생명', 'agri-bio', '농업, 농식품, 푸드테크', '#C8E6C9', 'field', 5),
('이차전지', 'battery', '배터리, 전기차, 에너지저장', '#B2DFDB', 'field', 6),
('디지털', 'digital', 'ICT, SW, 데이터, AI', '#BBDEFB', 'field', 7),
('기후테크', 'climate-tech', '친환경, 순환경제, 탄소중립', '#C5E1A5', 'field', 8);

-- Add support type tags
INSERT INTO content_tags (name, slug, description, color_hex, category, display_order) VALUES
('R&D', 'rd', '연구개발 지원', '#FFE0B2', 'support', 11),
('창업', 'startup', '창업, 스타트업 지원', '#F8BBD0', 'support', 12),
('사업화', 'commercialization', '기술사업화, 제품화, 시제품', '#D1C4E9', 'support', 13),
('투자유치', 'investment', '민간투자, 펀딩 매칭', '#FFD180', 'support', 14);

-- Add specialized tags
INSERT INTO content_tags (name, slug, description, color_hex, category, display_order) VALUES
('방산', 'defense', '국방, 방위산업', '#BCAAA4', 'special', 21),
('해외진출', 'global', '글로벌 진출, 수출', '#81D4FA', 'special', 22),
('인증', 'certification', '인증취득, GMP, 규제', '#FFCCBC', 'special', 23),
('인력', 'hr', '인력양성, 연구원 지원', '#E1BEE7', 'special', 24);

-- ============================================================================
-- STEP 2: Apply tags to all 60 support notices
-- ============================================================================

-- ID 73: R&D 전담조직 설립
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 73;

-- ID 74: 공동활용연구개발장비
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 74;

-- ID 75: 스타트업 스케일업 실증지원 (2차)
UPDATE support_notices SET tags = '["창업", "사업화"]'::json WHERE id = 75;

-- ID 76: 이차전지 전후방 역량강화
UPDATE support_notices SET tags = '["이차전지", "R&D"]'::json WHERE id = 76;

-- ID 77: 지역혁신클러스터육성 R&D 기술수요조사
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 77;

-- ID 78: ILP 서비스 기술사업화
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 78;

-- ID 79: 농생명바이오 잠재기업군 IR지원
UPDATE support_notices SET tags = '["농생명", "바이오헬스", "투자유치"]'::json WHERE id = 79;

-- ID 80: 디자인 지원사업
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 80;

-- ID 81: ESG역량진단 개선활동 (신규)
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 81;

-- ID 82: ESG역량진단 개선활동 (1차)
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 82;

-- ID 83: 스타트업 스케일업 실증지원 (재공고)
UPDATE support_notices SET tags = '["창업", "사업화"]'::json WHERE id = 83;

-- ID 84: 기술개발제품 인증취득
UPDATE support_notices SET tags = '["인증", "사업화"]'::json WHERE id = 84;

-- ID 85: 전북특화방위산업육성 R&D
UPDATE support_notices SET tags = '["방산", "R&D"]'::json WHERE id = 85;

-- ID 86: 바이오 유럽 GBC-Gateway (연장)
UPDATE support_notices SET tags = '["바이오헬스", "해외진출"]'::json WHERE id = 86;

-- ID 87: ESG 역량진단 (2차)
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 87;

-- ID 88: KIST 유럽 바이오 인재육성 (연장)
UPDATE support_notices SET tags = '["바이오헬스", "인력", "해외진출"]'::json WHERE id = 88;

-- ID 89: 바이오 지역산업 R&D
UPDATE support_notices SET tags = '["바이오헬스", "R&D"]'::json WHERE id = 89;

-- ID 90: 공공데이터 활용 창업경진대회
UPDATE support_notices SET tags = '["디지털", "창업"]'::json WHERE id = 90;

-- ID 91: 재난안전 R&D 기술수요조사
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 91;

-- ID 92: 홀로그램기술 사업화 실증
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 92;

-- ID 93: 기후테크 스타트업 AC 모집
UPDATE support_notices SET tags = '["기후테크", "창업"]'::json WHERE id = 93;

-- ID 94: 중소기업 디자인지원
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 94;

-- ID 95: 연구개발장비 성능향상
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 95;

-- ID 96: 중소기업 연구원 주거비 (2차)
UPDATE support_notices SET tags = '["인력"]'::json WHERE id = 96;

-- ID 97: R&D기술사업화 (2차)
UPDATE support_notices SET tags = '["R&D", "사업화"]'::json WHERE id = 97;

-- ID 98: 인증취득 모의평가
UPDATE support_notices SET tags = '["인증"]'::json WHERE id = 98;

-- ID 99: 전동화 건설농기계 시제품
UPDATE support_notices SET tags = '["농생명", "사업화"]'::json WHERE id = 99;

-- ID 100: SW강소기업 제품화 R&D
UPDATE support_notices SET tags = '["디지털", "R&D", "사업화"]'::json WHERE id = 100;

-- ID 101: 에너지산업 사업화
UPDATE support_notices SET tags = '["기후테크", "사업화"]'::json WHERE id = 101;

-- ID 102: 기후테크 오픈이노베이션
UPDATE support_notices SET tags = '["기후테크", "사업화"]'::json WHERE id = 102;

-- ID 103: 민간투자 기술창업 바이오헬스케어
UPDATE support_notices SET tags = '["바이오헬스", "창업", "투자유치"]'::json WHERE id = 103;

-- ID 104: 민간투자 기술창업 순환경제
UPDATE support_notices SET tags = '["기후테크", "창업", "투자유치"]'::json WHERE id = 104;

-- ID 105: 민간투자 기술창업 방산
UPDATE support_notices SET tags = '["방산", "창업", "투자유치"]'::json WHERE id = 105;

-- ID 106: 민간투자 기술창업 콘텐츠/ICT
UPDATE support_notices SET tags = '["디지털", "창업", "투자유치"]'::json WHERE id = 106;

-- ID 107: 민간투자 기술창업 기후테크
UPDATE support_notices SET tags = '["기후테크", "창업", "투자유치"]'::json WHERE id = 107;

-- ID 108: 민간투자 기술창업 공공기술
UPDATE support_notices SET tags = '["창업", "투자유치", "사업화"]'::json WHERE id = 108;

-- ID 109: 이차전지 디지털 혁신
UPDATE support_notices SET tags = '["이차전지", "디지털", "사업화"]'::json WHERE id = 109;

-- ID 110: 홀로그램 사업화 (추가모집)
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 110;

-- ID 111: 제품생산 활성화 (시제품/제품고급화)
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 111;

-- ID 112: 기술교류 R&D과제 기획
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 112;

-- ID 113: KIST 유럽 바이오 인재육성 (마감)
UPDATE support_notices SET tags = '["바이오헬스", "인력", "해외진출"]'::json WHERE id = 113;

-- ID 114: 바이오 시장진입 기술사업화
UPDATE support_notices SET tags = '["바이오헬스", "사업화"]'::json WHERE id = 114;

-- ID 115: 탄소소재 방산 기술사업화
UPDATE support_notices SET tags = '["방산", "사업화"]'::json WHERE id = 115;

-- ID 116: 바이오 지역산업 비R&D
UPDATE support_notices SET tags = '["바이오헬스", "사업화"]'::json WHERE id = 116;

-- ID 117: 홀로그램 제품제작 (추가모집)
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 117;

-- ID 118: 농식품 데이터 서비스 개발
UPDATE support_notices SET tags = '["농생명", "디지털", "R&D"]'::json WHERE id = 118;

-- ID 119: 중소기업 연구원 주거비 (3차)
UPDATE support_notices SET tags = '["인력"]'::json WHERE id = 119;

-- ID 120: 바이오기업 보스턴 CIC센터
UPDATE support_notices SET tags = '["바이오헬스", "해외진출"]'::json WHERE id = 120;

-- ID 121: 바이오 시장진입 기술사업화 (연장)
UPDATE support_notices SET tags = '["바이오헬스", "사업화"]'::json WHERE id = 121;

-- ID 122: 기후테크 데모데이 SWITCH
UPDATE support_notices SET tags = '["기후테크", "사업화"]'::json WHERE id = 122;

-- ID 123: 혁신성장 R&D+ 2차
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 123;

-- ID 124: 공공데이터 창업경진대회 2차심사
UPDATE support_notices SET tags = '["디지털", "창업"]'::json WHERE id = 124;

-- ID 125: 혁신기업 R&D 사전기획 1차
UPDATE support_notices SET tags = '["R&D"]'::json WHERE id = 125;

-- ID 126: R&D기술사업화 3차
UPDATE support_notices SET tags = '["R&D", "사업화"]'::json WHERE id = 126;

-- ID 127: 스타트업 스케일업 실증지원
UPDATE support_notices SET tags = '["창업", "사업화"]'::json WHERE id = 127;

-- ID 128: 첨단바이오육성 R&D 2차
UPDATE support_notices SET tags = '["바이오헬스", "R&D"]'::json WHERE id = 128;

-- ID 129: 중소기업 밀집지역 위기대응
UPDATE support_notices SET tags = '["사업화"]'::json WHERE id = 129;

-- ID 130: 공공데이터 창업경진대회 결과
UPDATE support_notices SET tags = '["디지털", "창업"]'::json WHERE id = 130;

-- ID 131: KRIBB 테크비즈 프로그램
UPDATE support_notices SET tags = '["바이오헬스", "사업화"]'::json WHERE id = 131;

-- ID 132: 농식품 R&D 바이오·푸드테크 매칭
UPDATE support_notices SET tags = '["농생명", "바이오헬스", "R&D"]'::json WHERE id = 132;

-- ============================================================================
-- STEP 3: Update usage_count for all tags
-- ============================================================================

UPDATE content_tags SET usage_count = (
    SELECT COUNT(*)
    FROM support_notices
    WHERE tags::text LIKE '%' || content_tags.name || '%'
);

-- Add comment
COMMENT ON TABLE content_tags IS 'Updated tag system with 15 tags covering various fields and support types';
