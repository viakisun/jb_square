-- Migration 022: RSS News Configuration Table
-- RSS 뉴스 크롤링 설정 테이블 생성

-- RSS 설정 테이블
CREATE TABLE IF NOT EXISTS rss_config (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL UNIQUE,     -- 'source:news:mfds', 'source:news:mohw'
    name VARCHAR(200) NOT NULL,                 -- "식약처 뉴스", "복지부 보도자료"
    feed_url TEXT NOT NULL,                     -- RSS 피드 URL
    keywords JSONB DEFAULT '[]'::jsonb,         -- 필터링 키워드
    date_range_days INTEGER DEFAULT 30,         -- 검색 기간 (일)
    enabled BOOLEAN DEFAULT TRUE,               -- 활성화 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_rss_config_source_id ON rss_config(source_id);
CREATE INDEX IF NOT EXISTS idx_rss_config_enabled ON rss_config(enabled);

-- 초기 데이터 삽입
INSERT INTO rss_config (source_id, name, feed_url, keywords, enabled)
VALUES
    (
        'source:news:mfds',
        '식약처 공지사항',
        'http://www.mfds.go.kr/www/rss/brd.do?brdId=ntc0003',
        '["바이오", "의약품", "생물학적제제", "임상시험", "의약외품", "허가", "승인"]'::jsonb,
        true
    ),
    (
        'source:news:mohw',
        '보건복지부 보도자료',
        'http://www.mohw.go.kr/rss/board.es?mid=a10503000000&bid=0027',
        '["바이오", "생명공학", "R&D", "연구개발", "정책", "지원사업", "보건산업"]'::jsonb,
        true
    )
ON CONFLICT (source_id) DO NOTHING;

-- 설명 추가
COMMENT ON TABLE rss_config IS 'RSS 뉴스 크롤링 설정';
COMMENT ON COLUMN rss_config.source_id IS '출처 ID (source:news:organization 형식)';
COMMENT ON COLUMN rss_config.name IS '피드 이름';
COMMENT ON COLUMN rss_config.feed_url IS 'RSS 피드 URL';
COMMENT ON COLUMN rss_config.keywords IS '키워드 필터 (선택사항)';
COMMENT ON COLUMN rss_config.date_range_days IS '수집할 뉴스 기간 (일)';
COMMENT ON COLUMN rss_config.enabled IS '크롤링 활성화 여부';
