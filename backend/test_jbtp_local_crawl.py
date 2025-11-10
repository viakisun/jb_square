"""
JBTP 지자체 공고 크롤링 테스트
첨부파일이 있는 공고 1개를 크롤링하여 S3 업로드를 테스트합니다.
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from src.services.sources.jbtp_local import JBTPLocalAdapter
from src.core.database import get_db
from sqlalchemy import text


async def test_crawl():
    """JBTP 지자체 공고 크롤링 테스트"""

    print("=" * 80)
    print("JBTP 지자체 공고 크롤링 테스트 시작")
    print("=" * 80)

    # 크롤러 인스턴스 생성
    crawler = JBTPLocalAdapter()

    # 크롤링 실행
    print("\n[1단계] 크롤링 실행 중...")
    await crawler.execute()

    # 크롤러 상태에서 결과 가져오기
    results = {
        'saved': crawler.status.get('success', 0),
        'failed': crawler.status.get('failed', 0),
        'keyword_filtered': 0  # 키워드 필터링 정보는 상세 로그에서 확인
    }

    print(f"\n크롤링 결과:")
    print(f"  - 성공: {results.get('saved', 0)}개")
    print(f"  - 실패: {results.get('failed', 0)}개")
    print(f"  - 키워드 필터: {results.get('keyword_filtered', 0)}개")

    # 데이터베이스에서 크롤 결과 확인
    print("\n[2단계] 크롤 결과 확인 중...")
    db = next(get_db())
    try:
        query = text("""
            SELECT
                id,
                title,
                link,
                raw_data->'detail'->'attachments' as attachments,
                crawler_extracted_at
            FROM notice_crawl_queue
            WHERE crawler_source_id = 'source:jbtp:local'
            ORDER BY crawler_extracted_at DESC
            LIMIT 3
        """)

        rows = db.execute(query).fetchall()

        print(f"\n최근 크롤된 공고 {len(rows)}개:")
        for idx, row in enumerate(rows, 1):
            print(f"\n  [{idx}] ID: {row.id}")
            print(f"      제목: {row.title}")
            print(f"      링크: {row.link}")
            print(f"      크롤 시각: {row.crawler_extracted_at}")

            # 첨부파일 정보 출력
            if row.attachments:
                import json
                attachments = json.loads(row.attachments) if isinstance(row.attachments, str) else row.attachments
                print(f"      첨부파일: {len(attachments)}개")
                for att_idx, att in enumerate(attachments, 1):
                    print(f"        {att_idx}. {att.get('filename')}")
                    print(f"           URL: {att.get('url')[:100]}...")
                    if att.get('original_url'):
                        print(f"           원본: {att.get('original_url')[:100]}...")
            else:
                print(f"      첨부파일: 없음")

        # S3 업로드 확인을 위한 정보 출력
        print("\n" + "=" * 80)
        print("S3 확인 방법:")
        print("=" * 80)
        print("aws s3 ls s3://jb2_bucket/notices/temp/ --recursive")
        print("\n또는 직접 S3 URL을 브라우저에서 확인하세요.")

    finally:
        db.close()

    print("\n" + "=" * 80)
    print("테스트 완료!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_crawl())
