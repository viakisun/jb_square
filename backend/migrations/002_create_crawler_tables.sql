-- ============================================
-- Migration 002: Create Crawler Config Tables
-- ============================================

-- 1. Create crawler_configs table
CREATE TABLE IF NOT EXISTS crawler_configs (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) UNIQUE NOT NULL,
    keywords JSON DEFAULT '[]',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create crawl_results table
CREATE TABLE IF NOT EXISTS crawl_results (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    link TEXT,
    date VARCHAR(100),
    board VARCHAR(100),
    keywords_matched JSON DEFAULT '[]',
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert default crawler configs
INSERT INTO crawler_configs (source_id, keywords, enabled)
VALUES
    ('jbtp', '[]', TRUE),
    ('ntis', '[]', TRUE),
    ('bizinfo', '[]', TRUE)
ON CONFLICT (source_id) DO NOTHING;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_crawl_results_source_id ON crawl_results(source_id);
CREATE INDEX IF NOT EXISTS idx_crawl_results_crawled_at ON crawl_results(crawled_at);
