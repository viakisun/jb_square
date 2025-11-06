-- 006_prevent_crawl_queue_duplicates.sql
-- 크롤링 대기열 중복 방지를 위한 제약조건 및 인덱스 추가
-- Created: 2025-11-06

-- 1. 기존 중복 데이터 정리 (최신 항목만 유지)
-- notice_id가 NULL이고 rejection_status가 'rejected'가 아닌 항목 중 중복 제거
WITH duplicates AS (
    SELECT
        id,
        crawler_source_id,
        title,
        ROW_NUMBER() OVER (
            PARTITION BY crawler_source_id, title
            ORDER BY created_at DESC
        ) as rn
    FROM notice_crawl_queue
    WHERE notice_id IS NULL
    AND (rejection_status IS NULL OR rejection_status != 'rejected')
)
DELETE FROM notice_crawl_queue
WHERE id IN (
    SELECT id
    FROM duplicates
    WHERE rn > 1
);

-- 2. UNIQUE 인덱스 추가 (미처리 항목에 대해서만)
-- 부분 인덱스를 사용하여 notice_id가 NULL인 항목만 중복 체크
CREATE UNIQUE INDEX IF NOT EXISTS idx_crawl_queue_unique_unprocessed
ON notice_crawl_queue(crawler_source_id, title)
WHERE notice_id IS NULL AND (rejection_status IS NULL OR rejection_status != 'rejected');

-- 3. 성능 향상을 위한 추가 인덱스
CREATE INDEX IF NOT EXISTS idx_crawl_queue_title
ON notice_crawl_queue(title);

CREATE INDEX IF NOT EXISTS idx_crawl_queue_source_title
ON notice_crawl_queue(crawler_source_id, title);

-- 4. 중복 체크 함수 생성 (수정됨 - notice_id 기준)
CREATE OR REPLACE FUNCTION check_crawl_queue_duplicate()
RETURNS TRIGGER AS $$
BEGIN
    -- 이미 처리된 항목(notice_id가 있음) 이거나 거부된 항목이면 허용
    IF NEW.notice_id IS NOT NULL OR NEW.rejection_status = 'rejected' THEN
        RETURN NEW;
    END IF;

    -- 미처리 항목 중 중복 체크
    IF EXISTS (
        SELECT 1
        FROM notice_crawl_queue
        WHERE crawler_source_id = NEW.crawler_source_id
        AND title = NEW.title
        AND notice_id IS NULL
        AND (rejection_status IS NULL OR rejection_status != 'rejected')
        AND id != COALESCE(NEW.id, 0)
    ) THEN
        -- 중복이면 기존 항목 업데이트
        UPDATE notice_crawl_queue
        SET
            link = COALESCE(NEW.link, link),
            deadline = COALESCE(NEW.deadline, deadline),
            organization = COALESCE(NEW.organization, organization),
            department = COALESCE(NEW.department, department),
            contact = COALESCE(NEW.contact, contact),
            raw_data = COALESCE(NEW.raw_data, raw_data),
            published_date = COALESCE(NEW.published_date, published_date),
            views = COALESCE(NEW.views, views)
        WHERE crawler_source_id = NEW.crawler_source_id
        AND title = NEW.title
        AND notice_id IS NULL
        AND (rejection_status IS NULL OR rejection_status != 'rejected');

        -- INSERT 취소
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 생성 (INSERT 시 중복 체크)
DROP TRIGGER IF EXISTS trigger_check_crawl_queue_duplicate ON notice_crawl_queue;
CREATE TRIGGER trigger_check_crawl_queue_duplicate
BEFORE INSERT ON notice_crawl_queue
FOR EACH ROW
EXECUTE FUNCTION check_crawl_queue_duplicate();

-- 6. 통계 정보 업데이트
ANALYZE notice_crawl_queue;

-- 7. 중복 제거 stored procedure (수정됨)
CREATE OR REPLACE FUNCTION remove_duplicate_crawl_items()
RETURNS TABLE(removed_count INTEGER) AS $$
DECLARE
    count_removed INTEGER;
BEGIN
    WITH duplicates AS (
        SELECT
            id,
            crawler_source_id,
            title,
            ROW_NUMBER() OVER (
                PARTITION BY crawler_source_id, title
                ORDER BY created_at DESC
            ) as rn
        FROM notice_crawl_queue
        WHERE notice_id IS NULL
        AND (rejection_status IS NULL OR rejection_status != 'rejected')
    )
    DELETE FROM notice_crawl_queue
    WHERE id IN (
        SELECT id
        FROM duplicates
        WHERE rn > 1
    );

    GET DIAGNOSTICS count_removed = ROW_COUNT;

    RETURN QUERY SELECT count_removed;
END;
$$ LANGUAGE plpgsql;

-- 실행 로그
DO $$
BEGIN
    RAISE NOTICE 'Migration 006: Crawl queue duplicate prevention completed successfully';
    RAISE NOTICE 'Added unique constraint for (crawler_source_id, title) on unprocessed items';
    RAISE NOTICE 'Created trigger for automatic duplicate handling';
END $$;