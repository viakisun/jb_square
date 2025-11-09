-- Add JBTP Events configuration
INSERT INTO jbtp_config (config_type, name, board_url, keywords, date_range_days, enabled, created_at, updated_at)
VALUES (
    'events',
    '교육/행사',
    'https://www.jbtp.or.kr/board/list.jbtp?boardId=BBS_0000003',
    '[]',
    90,
    true,
    NOW(),
    NOW()
);
