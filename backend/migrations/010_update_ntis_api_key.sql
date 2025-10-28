-- NTIS API 키 및 키워드 업데이트
-- API 키를 테스트용 키로 설정하고 기본 키워드 추가

UPDATE ntis_config
SET
    api_key = 'e62353777ztu2k1zyh07',
    search_keywords = '["바이오", "R&D", "전북", "창업", "스타트업"]'::jsonb,
    enabled = true
WHERE id = 1;

-- 만약 ntis_config 레코드가 없다면 삽입
INSERT INTO ntis_config (api_key, search_keywords, enabled)
SELECT 'e62353777ztu2k1zyh07', '["바이오", "R&D", "전북", "창업", "스타트업"]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM ntis_config WHERE id = 1);
