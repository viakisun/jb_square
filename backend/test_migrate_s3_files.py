"""
S3 파일 마이그레이션 테스트
기존 공고의 temp 폴더 파일들을 최종 위치로 이동
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from src.core.database import SessionLocal
from src.models.notice import Notice
from src.core.s3_client import s3_client


def migrate_notice_files(notice_id: int):
    """공고의 S3 파일을 temp에서 최종 위치로 이동"""

    db = SessionLocal()
    try:
        # 공고 조회
        notice = db.query(Notice).filter(Notice.id == notice_id).first()

        if not notice:
            print(f"공고 ID {notice_id}를 찾을 수 없습니다.")
            return

        print(f"공고 ID: {notice.id}")
        print(f"제목: {notice.title}")
        print(f"첨부파일: {len(notice.attachment_links or [])}개")

        if not notice.attachment_links:
            print("첨부파일이 없습니다.")
            return

        # temp 파일 확인
        has_temp_files = any('notices/temp/' in att.get('url', '') for att in notice.attachment_links)

        if not has_temp_files:
            print("이미 최종 위치에 있습니다.")
            print("\n현재 첨부파일:")
            for idx, att in enumerate(notice.attachment_links, 1):
                print(f"  {idx}. {att['filename']}")
                print(f"     URL: {att['url']}")
            return

        print("\ntemp 폴더 파일 발견, 마이그레이션 시작...")

        # 마이그레이션 실행
        migrated_attachments = s3_client.migrate_temp_files_to_notice(
            notice.attachment_links, notice.id
        )

        # DB 업데이트
        notice.attachment_links = migrated_attachments
        db.commit()

        print("\n마이그레이션 완료!")
        print("\n최종 첨부파일:")
        for idx, att in enumerate(migrated_attachments, 1):
            print(f"  {idx}. {att['filename']}")
            print(f"     URL: {att['url']}")

    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python test_migrate_s3_files.py <notice_id>")
        sys.exit(1)

    notice_id = int(sys.argv[1])
    migrate_notice_files(notice_id)
