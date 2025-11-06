#!/usr/bin/env python3
"""
Show NTIS RSS 크롤링 결과
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from src.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

results = db.execute(text("""
    SELECT title, raw_data
    FROM notice_crawl_queue
    WHERE crawler_source_id = 'ntis_rss'
    ORDER BY crawler_extracted_at DESC
""")).fetchall()

print('\n' + '='*80)
print(f'NTIS RSS 크롤링 결과 요약 (총 {len(results)}개)')
print('='*80)

total_content_chars = 0
total_attachments = 0

for i, row in enumerate(results, 1):
    title = row[0]
    raw_data = row[1]

    print(f'\n[{i}] {title}')

    if raw_data and 'detail' in raw_data:
        detail = raw_data['detail']
        content = detail.get('content', '')
        attachments = detail.get('attachments', [])

        content_len = len(content)
        att_len = len(attachments)

        total_content_chars += content_len
        total_attachments += att_len

        print(f'    ✓ 본문: {content_len}자')
        if content and content_len > 20:
            preview = content[:100].replace('\n', ' ')
            print(f'      "{preview}..."')
        elif content:
            print(f'      "{content}"')

        print(f'    ✓ 첨부파일: {att_len}개')
        for j, att in enumerate(attachments, 1):
            filename = att.get('filename', 'N/A')
            print(f'      {j}) {filename[:70]}')
    else:
        print('    ⚠ 상세 데이터 없음')

print('\n' + '='*80)
print(f'✅ 요약')
print(f'   - 총 공고: {len(results)}개')
print(f'   - 총 본문 문자 수: {total_content_chars:,}자')
print(f'   - 총 첨부파일: {total_attachments}개')
print('='*80 + '\n')

db.close()
