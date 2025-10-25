-- 바이오 플랫폼 백오피스 데이터베이스 스키마

-- 콘텐츠 (공고/행사)
CREATE TABLE IF NOT EXISTS contents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    link TEXT,
    source TEXT NOT NULL,
    category TEXT,
    deadline DATE,
    tags TEXT,
    status TEXT DEFAULT 'pending',
    matched_keywords TEXT,
    region TEXT,
    board TEXT,
    ministry TEXT,
    receive_date TEXT,
    dday TEXT,
    period TEXT,
    agency TEXT,
    reg_date TEXT,
    views TEXT,
    crawled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_source ON contents(source);
CREATE INDEX IF NOT EXISTS idx_contents_deadline ON contents(deadline);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);

-- 기업·기관
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    field TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    region TEXT,
    city TEXT,
    address TEXT,
    is_resident BOOLEAN DEFAULT FALSE,
    resident_center TEXT,
    support_programs TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_region ON organizations(region);
CREATE INDEX IF NOT EXISTS idx_organizations_updated_at ON organizations(updated_at DESC);

-- 크롤링 로그
CREATE TABLE IF NOT EXISTS crawl_logs (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    notices_found INTEGER DEFAULT 0,
    bio_notices_found INTEGER DEFAULT 0,
    duration REAL,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs(source);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at DESC);

-- 사용자
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'editor',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 시스템 설정
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 초기 설정 데이터
INSERT INTO settings (key, value) VALUES
    ('crawling_enabled', 'true'),
    ('crawling_schedule', '0 9 * * *'),
    ('jbtp_enabled', 'true'),
    ('ntis_enabled', 'true'),
    ('bizinfo_enabled', 'true'),
    ('ntis_search_period', '1m'),
    ('bizinfo_max_pages', '10'),
    ('email_notifications', 'true')
ON CONFLICT (key) DO NOTHING;
