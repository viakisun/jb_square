-- Migration: Create notices and crawl_queue tables
-- Date: 2025-10-26
-- Description: Tables for JB SQUARE notice management system

-- ============================================
-- Table: notices
-- Purpose: Published notices (both crawled and manual)
-- ============================================

CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,

    -- Basic Information
    title TEXT NOT NULL,
    content TEXT,
    link TEXT,

    -- Source Tracking
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('crawled', 'manual')),
    source_id VARCHAR(50),  -- 'jbtp', 'ntis', 'bizinfo', 'manual', etc.
    board VARCHAR(100),     -- Original board name from source

    -- Categorization
    category VARCHAR(20) NOT NULL CHECK (category IN ('government', 'business', 'rnd', 'startup')),
    tags JSON DEFAULT '[]',  -- Additional tags as array of strings

    -- Status & Publishing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'archived')),
    published_at TIMESTAMP,

    -- Important Dates
    deadline TIMESTAMP,
    application_start TIMESTAMP,
    application_end TIMESTAMP,
    announcement_date DATE,

    -- Crawling Metadata
    crawled_at TIMESTAMP,
    original_date VARCHAR(100),  -- Date string from source site

    -- Additional Details
    organization VARCHAR(200),  -- Organizing institution
    department VARCHAR(200),    -- Department/division
    contact VARCHAR(200),       -- Contact information
    attachment_links JSON DEFAULT '[]',  -- Array of attachment URLs

    -- System Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    -- Full-text search
    search_vector tsvector
);

-- ============================================
-- Table: crawl_queue
-- Purpose: Temporary storage for crawled items before publishing
-- ============================================

CREATE TABLE IF NOT EXISTS crawl_queue (
    id SERIAL PRIMARY KEY,

    -- Source Information
    source_id VARCHAR(50) NOT NULL,  -- 'jbtp', 'ntis', 'bizinfo'
    board VARCHAR(100),              -- Board name from source

    -- Crawled Data
    title TEXT NOT NULL,
    link TEXT,
    date VARCHAR(100),               -- Original date string
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Processing State
    selected BOOLEAN DEFAULT FALSE,  -- User selected for publishing
    processed BOOLEAN DEFAULT FALSE, -- Already published or discarded
    notice_id INTEGER REFERENCES notices(id) ON DELETE SET NULL,

    -- Additional metadata from crawler
    raw_data JSON,  -- Full crawled data for reference

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Notices indexes
CREATE INDEX IF NOT EXISTS idx_notices_source_type ON notices(source_type);
CREATE INDEX IF NOT EXISTS idx_notices_source_id ON notices(source_id);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_published_at ON notices(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_deadline ON notices(deadline);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- GIN index for JSON fields (tags search) - using jsonb_path_ops
CREATE INDEX IF NOT EXISTS idx_notices_tags ON notices USING GIN (tags jsonb_path_ops);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_notices_search_vector ON notices USING GIN (search_vector);

-- Crawl queue indexes
CREATE INDEX IF NOT EXISTS idx_crawl_queue_source_id ON crawl_queue(source_id);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_processed ON crawl_queue(processed);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_selected ON crawl_queue(selected);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_notice_id ON crawl_queue(notice_id);

-- ============================================
-- Trigger: Update search_vector on notices
-- ============================================

CREATE OR REPLACE FUNCTION notices_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('korean', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('korean', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('korean', COALESCE(NEW.organization, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notices_search_vector_trigger
    BEFORE INSERT OR UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION notices_search_vector_update();

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notices_updated_at_trigger
    BEFORE UPDATE ON notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- INSERT INTO notices (title, source_type, source_id, category, status, published_at)
-- VALUES
--     ('2025년 바이오 R&D 지원사업', 'manual', 'manual', 'government', 'published', CURRENT_TIMESTAMP),
--     ('창업보육센터 입주기업 모집', 'crawled', 'jbtp', 'startup', 'published', CURRENT_TIMESTAMP);
