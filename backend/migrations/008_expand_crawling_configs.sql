-- 크롤링 설정 확장: 페이지네이션 + 바이오 키워드 추가
-- 최근 1개월 데이터 수집 및 바이오 관련 키워드 대폭 확장

-- 1. jbtp_config 테이블에 페이지네이션 필드 추가
ALTER TABLE jbtp_config
ADD COLUMN IF NOT EXISTS max_pages INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS date_range_days INTEGER DEFAULT 30;

COMMENT ON COLUMN jbtp_config.max_pages IS '크롤링할 최대 페이지 수 (기본값: 5페이지)';
COMMENT ON COLUMN jbtp_config.date_range_days IS '검색 기간 (기본값: 30일)';

-- 2. 기존 키워드를 바이오 중심으로 대폭 확장
UPDATE jbtp_config
SET keywords = '[
  "전북", "전라북도", "전주", "익산", "군산",
  "바이오", "bio", "생명공학", "제약", "의료기기",
  "헬스케어", "healthcare", "바이오헬스",
  "의약품", "임상", "진단", "치료제",
  "스타트업", "창업", "R&D", "연구개발",
  "기술개발", "사업화", "실증", "특허",
  "중소기업", "벤처", "예비창업", "초기창업",
  "시제품", "테스트베드", "투자유치"
]'::jsonb
WHERE config_type = 'notices' AND name = '사업공고';

UPDATE jbtp_config
SET keywords = '[
  "전북", "전라북도", "전주", "익산", "군산",
  "바이오", "bio", "생명공학", "제약", "의료기기",
  "헬스케어", "healthcare", "바이오헬스",
  "의약품", "임상", "진단", "치료제"
]'::jsonb
WHERE config_type = 'notices' AND name = '유관기관공고';

-- 3. 인덱스 추가 (페이지네이션 필드)
CREATE INDEX IF NOT EXISTS idx_jbtp_max_pages ON jbtp_config(max_pages);
