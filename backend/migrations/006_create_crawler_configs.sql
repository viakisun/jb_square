-- 크롤링 설정 테이블 생성
-- 각 도메인별로 독립적인 설정 관리

-- 1. JBTP 크롤링 설정
CREATE TABLE IF NOT EXISTS jbtp_config (
    id SERIAL PRIMARY KEY,
    config_type VARCHAR(50) NOT NULL,  -- 'notices' or 'news_events'
    name VARCHAR(200) NOT NULL,         -- "사업공고", "바이오 뉴스"
    board_url TEXT NOT NULL,            -- 게시판 URL
    keywords JSONB DEFAULT '[]'::jsonb, -- 필터링 키워드
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- JBTP 초기 데이터: 공고 2개 (채용공고 제외)
INSERT INTO jbtp_config (config_type, name, board_url, keywords) VALUES
('notices', '사업공고', 'https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102001000000', '["전북", "스타트업", "창업", "R&D"]'::jsonb),
('notices', '유관기관공고', 'https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102002000000', '["전북"]'::jsonb)
ON CONFLICT DO NOTHING;


-- 2. BI Center 크롤링 설정
CREATE TABLE IF NOT EXISTS binet_config (
    id SERIAL PRIMARY KEY,
    region_name VARCHAR(50) NOT NULL,   -- "전북"
    region_code VARCHAR(10) NOT NULL,   -- "063"
    keywords JSONB DEFAULT '[]'::jsonb,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- BI Center 초기 데이터
INSERT INTO binet_config (region_name, region_code, keywords) VALUES
('전북', '063', '[]'::jsonb)
ON CONFLICT DO NOTHING;


-- 3. NTIS API 설정
CREATE TABLE IF NOT EXISTS ntis_config (
    id SERIAL PRIMARY KEY,
    api_key TEXT,                       -- API 키
    search_keywords JSONB DEFAULT '[]'::jsonb,  -- API 검색어
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NTIS 초기 데이터
INSERT INTO ntis_config (api_key, search_keywords, enabled) VALUES
('', '["전북", "R&D", "연구개발"]'::jsonb, true)
ON CONFLICT DO NOTHING;


-- 4. Bizinfo API 설정
CREATE TABLE IF NOT EXISTS bizinfo_config (
    id SERIAL PRIMARY KEY,
    api_key TEXT,
    search_keywords JSONB DEFAULT '[]'::jsonb,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bizinfo 초기 데이터
INSERT INTO bizinfo_config (api_key, search_keywords, enabled) VALUES
('', '["전북", "중소기업", "창업"]'::jsonb, true)
ON CONFLICT DO NOTHING;


-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_jbtp_config_type ON jbtp_config(config_type);
CREATE INDEX IF NOT EXISTS idx_jbtp_enabled ON jbtp_config(enabled);
CREATE INDEX IF NOT EXISTS idx_binet_enabled ON binet_config(enabled);
CREATE INDEX IF NOT EXISTS idx_ntis_enabled ON ntis_config(enabled);
CREATE INDEX IF NOT EXISTS idx_bizinfo_enabled ON bizinfo_config(enabled);
