-- Migration 024: Drop Old Config Tables
-- 통합 crawler_config로 마이그레이션 완료 후 기존 테이블 삭제
-- Date: 2025-01-10

-- ============================================================================
-- SAFETY CHECKS (실행 전 확인)
-- ============================================================================
-- 1. crawler_config 테이블에 데이터가 있는지 확인
-- SELECT COUNT(*) FROM crawler_config; -- 최소 8개 이상이어야 함
--
-- 2. 모든 크롤러가 정상 작동하는지 확인
-- python test_all_crawlers.py
--
-- 3. 백업이 있는지 확인
-- pg_dump 또는 RDS 스냅샷
--
-- ============================================================================

-- ============================================================================
-- PART 1: Final Verification Queries (삭제 전 최종 확인)
-- ============================================================================

-- 현재 상태 확인
DO $$
DECLARE
    unified_count INTEGER;
    old_jbtp_count INTEGER;
    old_rss_count INTEGER;
    old_ntis_count INTEGER;
    old_bizinfo_count INTEGER;
    old_binet_count INTEGER;
BEGIN
    -- Count records in new table
    SELECT COUNT(*) INTO unified_count FROM crawler_config;

    -- Count records in old tables
    SELECT COUNT(*) INTO old_jbtp_count FROM jbtp_config WHERE enabled = TRUE;
    SELECT COUNT(*) INTO old_rss_count FROM rss_config WHERE enabled = TRUE;
    SELECT COUNT(*) INTO old_ntis_count FROM ntis_config WHERE enabled = TRUE;
    SELECT COUNT(*) INTO old_bizinfo_count FROM bizinfo_config WHERE enabled = TRUE;
    SELECT COUNT(*) INTO old_binet_count FROM binet_config WHERE enabled = TRUE;

    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'Pre-deletion Verification';
    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'Unified table (crawler_config): % records', unified_count;
    RAISE NOTICE 'Old tables total: % records', (old_jbtp_count + old_rss_count + old_ntis_count + old_bizinfo_count + old_binet_count);
    RAISE NOTICE '  - jbtp_config: %', old_jbtp_count;
    RAISE NOTICE '  - rss_config: %', old_rss_count;
    RAISE NOTICE '  - ntis_config: %', old_ntis_count;
    RAISE NOTICE '  - bizinfo_config: %', old_bizinfo_count;
    RAISE NOTICE '  - binet_config: %', old_binet_count;
    RAISE NOTICE '=============================================================';

    -- Safety check
    IF unified_count < 5 THEN
        RAISE EXCEPTION 'SAFETY CHECK FAILED: crawler_config has less than 5 records. Aborting deletion.';
    END IF;

    RAISE NOTICE '✅ Safety check passed. Proceeding with deletion...';
END $$;

-- ============================================================================
-- PART 2: Drop Old Config Tables
-- ============================================================================

-- Drop old config tables
DROP TABLE IF EXISTS jbtp_config CASCADE;
DROP TABLE IF EXISTS binet_config CASCADE;
DROP TABLE IF EXISTS ntis_config CASCADE;
DROP TABLE IF EXISTS bizinfo_config CASCADE;
DROP TABLE IF EXISTS rss_config CASCADE;

-- ============================================================================
-- PART 3: Post-deletion Verification
-- ============================================================================

DO $$
DECLARE
    unified_count INTEGER;
    tables_exist BOOLEAN;
BEGIN
    -- Verify unified table still exists and has data
    SELECT COUNT(*) INTO unified_count FROM crawler_config;

    -- Check if old tables still exist
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name IN ('jbtp_config', 'binet_config', 'ntis_config', 'bizinfo_config', 'rss_config')
    ) INTO tables_exist;

    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'Post-deletion Verification';
    RAISE NOTICE '=============================================================';
    RAISE NOTICE 'Unified table (crawler_config): % records', unified_count;
    RAISE NOTICE 'Old tables exist: %', tables_exist;
    RAISE NOTICE '=============================================================';

    IF tables_exist THEN
        RAISE WARNING 'Some old tables still exist!';
    ELSE
        RAISE NOTICE '✅ All old tables successfully deleted';
    END IF;

    IF unified_count = 0 THEN
        RAISE EXCEPTION 'CRITICAL: crawler_config is empty after deletion!';
    END IF;

    RAISE NOTICE '✅ Migration 024 completed successfully';
END $$;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 삭제된 테이블:
-- - jbtp_config (JBTP 게시판 설정)
-- - binet_config (BI센터 설정)
-- - ntis_config (NTIS API 설정)
-- - bizinfo_config (기업마당 API 설정)
-- - rss_config (RSS 뉴스 설정)
--
-- 새로운 통합 테이블:
-- - crawler_config (모든 크롤러 설정 통합)
--
-- 롤백 방법:
-- 1. 데이터베이스 스냅샷에서 복원
-- 2. 또는 migration 023 이전 상태로 복원
--
-- ============================================================================
