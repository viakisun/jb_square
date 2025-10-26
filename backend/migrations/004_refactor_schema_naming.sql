-- Migration 004: Schema Naming Refactoring
-- Date: 2025-10-26
-- Description: 테이블명/칼럼명을 더 명확하게 변경

-- ============================================
-- Phase 1: 테이블명 변경
-- ============================================

-- notices → support_notices (지원사업 공고)
ALTER TABLE IF EXISTS notices RENAME TO support_notices;

-- crawl_queue → notice_crawl_queue (공고 크롤링 대기열)
ALTER TABLE IF EXISTS crawl_queue RENAME TO notice_crawl_queue;


-- ============================================
-- Phase 2: support_notices 칼럼명 변경
-- ============================================

-- source_type → origin_type (출처 타입: crawled/manual)
ALTER TABLE support_notices RENAME COLUMN source_type TO origin_type;

-- source_id → crawler_source_id (크롤러 소스: jbtp/ntis/bizinfo)
ALTER TABLE support_notices RENAME COLUMN source_id TO crawler_source_id;

-- board → source_board_name (원본 게시판명)
ALTER TABLE support_notices RENAME COLUMN board TO source_board_name;

-- original_date → source_date_string (원본 사이트의 날짜 문자열)
ALTER TABLE support_notices RENAME COLUMN original_date TO source_date_string;

-- crawled_at → crawler_extracted_at (크롤러가 추출한 시각)
ALTER TABLE support_notices RENAME COLUMN crawled_at TO crawler_extracted_at;


-- ============================================
-- Phase 3: notice_crawl_queue 칼럼명 변경
-- ============================================

-- source_id → crawler_source_id
ALTER TABLE notice_crawl_queue RENAME COLUMN source_id TO crawler_source_id;

-- board → source_board_name
ALTER TABLE notice_crawl_queue RENAME COLUMN board TO source_board_name;

-- date → source_date_string
ALTER TABLE notice_crawl_queue RENAME COLUMN date TO source_date_string;

-- extracted_at → crawler_extracted_at
ALTER TABLE notice_crawl_queue RENAME COLUMN extracted_at TO crawler_extracted_at;

-- processed → is_processed
ALTER TABLE notice_crawl_queue RENAME COLUMN processed TO is_processed;

-- selected → is_selected
ALTER TABLE notice_crawl_queue RENAME COLUMN selected TO is_selected;

-- processed_at → published_at
ALTER TABLE notice_crawl_queue RENAME COLUMN processed_at TO published_at;


-- ============================================
-- Phase 4: 인덱스명 업데이트
-- ============================================

-- support_notices 인덱스
DROP INDEX IF EXISTS idx_notices_source_type;
DROP INDEX IF EXISTS idx_notices_source_id;
DROP INDEX IF EXISTS idx_notices_category;
DROP INDEX IF EXISTS idx_notices_status;
DROP INDEX IF EXISTS idx_notices_published_at;
DROP INDEX IF EXISTS idx_notices_deadline;
DROP INDEX IF EXISTS idx_notices_created_at;
DROP INDEX IF EXISTS idx_notices_tags;
DROP INDEX IF EXISTS idx_notices_search_vector;

CREATE INDEX idx_support_notices_origin_type ON support_notices(origin_type);
CREATE INDEX idx_support_notices_crawler_source_id ON support_notices(crawler_source_id);
CREATE INDEX idx_support_notices_category ON support_notices(category);
CREATE INDEX idx_support_notices_status ON support_notices(status);
CREATE INDEX idx_support_notices_published_at ON support_notices(published_at DESC);
CREATE INDEX idx_support_notices_deadline ON support_notices(deadline);
CREATE INDEX idx_support_notices_created_at ON support_notices(created_at DESC);
CREATE INDEX idx_support_notices_tags ON support_notices USING GIN (tags jsonb_path_ops);
CREATE INDEX idx_support_notices_search_vector ON support_notices USING GIN (search_vector);

-- notice_crawl_queue 인덱스
DROP INDEX IF EXISTS idx_crawl_queue_source_id;
DROP INDEX IF EXISTS idx_crawl_queue_processed;
DROP INDEX IF EXISTS idx_crawl_queue_selected;
DROP INDEX IF EXISTS idx_crawl_queue_notice_id;

CREATE INDEX idx_notice_crawl_queue_crawler_source_id ON notice_crawl_queue(crawler_source_id);
CREATE INDEX idx_notice_crawl_queue_is_processed ON notice_crawl_queue(is_processed);
CREATE INDEX idx_notice_crawl_queue_is_selected ON notice_crawl_queue(is_selected);
CREATE INDEX idx_notice_crawl_queue_notice_id ON notice_crawl_queue(notice_id);


-- ============================================
-- Phase 5: Foreign Key 업데이트
-- ============================================

-- notice_crawl_queue.notice_id가 support_notices.id를 참조하도록 FK 재생성
ALTER TABLE notice_crawl_queue
DROP CONSTRAINT IF EXISTS crawl_queue_notice_id_fkey;

ALTER TABLE notice_crawl_queue
ADD CONSTRAINT notice_crawl_queue_notice_id_fkey
FOREIGN KEY (notice_id) REFERENCES support_notices(id) ON DELETE SET NULL;


-- ============================================
-- Phase 6: Trigger 함수명 변경
-- ============================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS notices_search_vector_trigger ON support_notices;
DROP TRIGGER IF EXISTS notices_updated_at_trigger ON support_notices;

-- 함수명 변경
DROP FUNCTION IF EXISTS notices_search_vector_update();
CREATE OR REPLACE FUNCTION support_notices_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('korean', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('korean', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('korean', COALESCE(NEW.organization, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 새 트리거 생성
CREATE TRIGGER support_notices_search_vector_trigger
    BEFORE INSERT OR UPDATE ON support_notices
    FOR EACH ROW
    EXECUTE FUNCTION support_notices_search_vector_update();

CREATE TRIGGER support_notices_updated_at_trigger
    BEFORE UPDATE ON support_notices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- Phase 7: CHECK 제약조건 업데이트
-- ============================================

-- origin_type CHECK
ALTER TABLE support_notices DROP CONSTRAINT IF EXISTS notices_source_type_check;
ALTER TABLE support_notices
ADD CONSTRAINT support_notices_origin_type_check
CHECK (origin_type IN ('crawled', 'manual'));

-- category CHECK
ALTER TABLE support_notices DROP CONSTRAINT IF EXISTS notices_category_check;
ALTER TABLE support_notices
ADD CONSTRAINT support_notices_category_check
CHECK (category IN ('government', 'business', 'rnd', 'startup'));

-- status CHECK
ALTER TABLE support_notices DROP CONSTRAINT IF EXISTS notices_status_check;
ALTER TABLE support_notices
ADD CONSTRAINT support_notices_status_check
CHECK (status IN ('pending', 'published', 'archived'));


-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Schema refactoring completed successfully!';
    RAISE NOTICE 'Tables renamed:';
    RAISE NOTICE '  - notices → support_notices';
    RAISE NOTICE '  - crawl_queue → notice_crawl_queue';
    RAISE NOTICE 'Column naming improved for clarity';
END $$;
