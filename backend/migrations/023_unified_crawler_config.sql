-- Migration 023: Unified Crawler Configuration
-- Consolidates all crawler configs into a single table
-- Author: System
-- Date: 2025-01-10

-- ============================================================================
-- PART 1: Create Unified crawler_config Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS crawler_config (
    id SERIAL PRIMARY KEY,

    -- Identity
    source_id VARCHAR(100) NOT NULL UNIQUE,  -- 'source:jbtp:local', 'source:news:mfds', etc.
    crawler_type VARCHAR(50) NOT NULL,       -- 'jbtp', 'rss', 'api', 'binet'
    name VARCHAR(200) NOT NULL,              -- Display name

    -- URLs (different types need different fields)
    url TEXT,                                 -- Main URL (board_url, feed_url, api_url)

    -- Crawler-specific config
    config_data JSONB DEFAULT '{}'::jsonb,   -- Type-specific settings
    -- For JBTP: {"config_type": "notices", "max_pages": 5}
    -- For BI Center: {"region_code": "063", "region_name": "전북"}
    -- For API crawlers: Empty (API keys removed)

    -- Common settings
    keywords JSONB DEFAULT '[]'::jsonb,      -- Keyword filters
    date_range_days INTEGER DEFAULT 30,      -- Search period
    enabled BOOLEAN DEFAULT TRUE,            -- Active status

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 2: Migrate Data from Existing Tables
-- ============================================================================

-- 2.1 Migrate from jbtp_config (3 boards)
INSERT INTO crawler_config (source_id, crawler_type, name, url, config_data, keywords, date_range_days, enabled)
SELECT
    CASE
        WHEN config_type = 'notices' AND name LIKE '%사업공고%' THEN 'source:jbtp:local'
        WHEN config_type = 'notices' AND name LIKE '%유관기관%' THEN 'source:jbtp:external'
        WHEN config_type = 'news_events' THEN 'source:jbtp:events'
        ELSE CONCAT('source:jbtp:', LOWER(REPLACE(name, ' ', '_')))
    END as source_id,
    'jbtp' as crawler_type,
    name,
    board_url as url,
    jsonb_build_object(
        'config_type', config_type,
        'max_pages', COALESCE(max_pages, 5)
    ) as config_data,
    COALESCE(keywords, '[]'::jsonb),
    COALESCE(date_range_days, 30),
    COALESCE(enabled, TRUE)
FROM jbtp_config
WHERE EXISTS (SELECT 1 FROM jbtp_config)
ON CONFLICT (source_id) DO NOTHING;

-- 2.2 Migrate from binet_config
INSERT INTO crawler_config (source_id, crawler_type, name, url, config_data, keywords, date_range_days, enabled)
SELECT
    'source:binet:' || LOWER(region_code) as source_id,
    'binet' as crawler_type,
    region_name || ' BI센터' as name,
    NULL as url,  -- BI Center doesn't use URLs
    jsonb_build_object(
        'region_name', region_name,
        'region_code', region_code
    ) as config_data,
    COALESCE(keywords, '[]'::jsonb),
    30 as date_range_days,  -- Default 30 days
    COALESCE(enabled, TRUE)
FROM binet_config
WHERE EXISTS (SELECT 1 FROM binet_config)
ON CONFLICT (source_id) DO NOTHING;

-- 2.3 Migrate from ntis_config
INSERT INTO crawler_config (source_id, crawler_type, name, url, config_data, keywords, date_range_days, enabled)
SELECT
    'source:ntis:rss' as source_id,
    'rss' as crawler_type,
    'NTIS 국가R&D통합공고' as name,
    'http://www.ntis.go.kr/rndgate/unRndRss.xml?prt=500&bbs=true' as url,
    '{}'::jsonb as config_data,  -- No longer storing API keys
    COALESCE(search_keywords, '[]'::jsonb),
    30 as date_range_days,  -- Default 30 days (ntis_config doesn't have this field)
    COALESCE(enabled, TRUE)
FROM ntis_config
WHERE EXISTS (SELECT 1 FROM ntis_config)
LIMIT 1
ON CONFLICT (source_id) DO NOTHING;

-- 2.4 Migrate from bizinfo_config
INSERT INTO crawler_config (source_id, crawler_type, name, url, config_data, keywords, date_range_days, enabled)
SELECT
    'source:bizinfo:web' as source_id,
    'web' as crawler_type,
    '기업마당 정책정보' as name,
    'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do' as url,
    '{}'::jsonb as config_data,  -- No longer storing API keys
    COALESCE(search_keywords, '[]'::jsonb),
    30 as date_range_days,  -- Default 30 days (bizinfo_config doesn't have this field)
    COALESCE(enabled, TRUE)
FROM bizinfo_config
WHERE EXISTS (SELECT 1 FROM bizinfo_config)
LIMIT 1
ON CONFLICT (source_id) DO NOTHING;

-- 2.5 Migrate from rss_config (식약처, 복지부)
INSERT INTO crawler_config (source_id, crawler_type, name, url, config_data, keywords, date_range_days, enabled)
SELECT
    source_id,
    'rss' as crawler_type,
    name,
    feed_url as url,
    '{}'::jsonb as config_data,
    COALESCE(keywords, '[]'::jsonb),
    COALESCE(date_range_days, 30),
    COALESCE(enabled, TRUE)
FROM rss_config
WHERE EXISTS (SELECT 1 FROM rss_config)
ON CONFLICT (source_id) DO NOTHING;

-- ============================================================================
-- PART 3: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_crawler_config_source_id ON crawler_config(source_id);
CREATE INDEX IF NOT EXISTS idx_crawler_config_crawler_type ON crawler_config(crawler_type);
CREATE INDEX IF NOT EXISTS idx_crawler_config_enabled ON crawler_config(enabled);
CREATE INDEX IF NOT EXISTS idx_crawler_config_config_data ON crawler_config USING gin(config_data);
CREATE INDEX IF NOT EXISTS idx_crawler_config_keywords ON crawler_config USING gin(keywords);

-- ============================================================================
-- PART 4: Add Comments
-- ============================================================================

COMMENT ON TABLE crawler_config IS 'Unified crawler configuration for all sources - consolidates jbtp_config, rss_config, ntis_config, bizinfo_config, binet_config';
COMMENT ON COLUMN crawler_config.source_id IS 'Unique source identifier (e.g., source:jbtp:local, source:news:mfds)';
COMMENT ON COLUMN crawler_config.crawler_type IS 'Crawler type: jbtp, rss, web, binet';
COMMENT ON COLUMN crawler_config.url IS 'Main URL (board_url for JBTP, feed_url for RSS, web URL for Bizinfo)';
COMMENT ON COLUMN crawler_config.config_data IS 'Type-specific configuration as JSONB (e.g., max_pages, region_code)';
COMMENT ON COLUMN crawler_config.keywords IS 'Keyword filters for content matching (JSONB array)';
COMMENT ON COLUMN crawler_config.date_range_days IS 'Number of days to search back (default 30)';

-- ============================================================================
-- PART 5: Safety Notes
-- ============================================================================

-- IMPORTANT: Old tables are NOT dropped in this migration
-- They are kept as backups for rollback safety
-- Drop them manually after verification (see migration 024)
--
-- Tables kept for backup:
-- - jbtp_config
-- - binet_config
-- - ntis_config
-- - bizinfo_config
-- - rss_config
--
-- To rollback this migration, run: 024_rollback_unified_config.sql

-- ============================================================================
-- PART 6: Verification Queries
-- ============================================================================

-- Run these queries after migration to verify data integrity:
--
-- 1. Count total configs (should match sum of old tables)
-- SELECT COUNT(*) as total FROM crawler_config;
--
-- 2. Verify JBTP configs (should be 3)
-- SELECT source_id, name, jsonb_array_length(keywords) as keyword_count
-- FROM crawler_config WHERE crawler_type = 'jbtp';
--
-- 3. Verify RSS configs (should be 3: NTIS, MFDS, MOHW)
-- SELECT source_id, name, url
-- FROM crawler_config WHERE crawler_type = 'rss';
--
-- 4. Verify keywords preserved
-- SELECT source_id, jsonb_array_length(keywords) as keyword_count
-- FROM crawler_config ORDER BY keyword_count DESC;
--
-- 5. Verify no nulls in critical fields
-- SELECT source_id, name FROM crawler_config
-- WHERE keywords IS NULL OR date_range_days IS NULL;
