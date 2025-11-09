"""
BI Center 좌표 수동 설정 스크립트

크롤러 로그에서 추출한 위도 데이터와
전북 도시별 경도를 매핑하여 좌표를 설정합니다.
"""

from sqlalchemy import text
from src.core.database import engine

# 크롤러 로그에서 추출한 데이터 + 도시 기반 경도 매핑
COORDINATES = {
    '군산대학교 창업보육센터': (35.9470944, 126.72),  # 군산
    '남원시바이오산업연구원 창업보육센터': (35.3892782, 127.39),  # 남원
    '바이오플렉스 창업보육센터': (35.8519274, 127.14),  # 전주
    '에코인쇄전자 창업보육센터': (35.8589161, 127.14),  # 전주
    '에코파이버 창업보육센터': (35.9501274, 126.88),  # 김제
    '우석대학교 창업보육센터': (35.9127996, 127.00),  # 완주
    '원광대학교 IT·BT창업보육센터': (35.96783, 126.70),  # 익산
    '익산창업보육센터': (35.9500404, 127.00),  # 익산
    '전북과학대학교 창업보육센터': (35.5494151, 126.88),  # 정읍
    '전북대 창업보육센터': (35.8462574, 127.08),  # 전주
    '전주대학교 창업보육센터': (35.8141581, 127.14),  # 전주
    '전주비전대학교 창업보육센터': (35.8094963, 127.14),  # 전주
    '한국농수산대학교 창업보육센터': (35.8271275, 127.16),  # 완주
    '호원대학교 창업보육센터': (35.9667427, 127.00),  # 군산
    '희망전북 POST-BI': (35.8522191, 127.14),  # 전주
}


def main():
    print("=== BI Center 좌표 수동 설정 ===\n")

    updated = 0
    not_found = []

    with engine.connect() as conn:
        # 모든 센터 이름 가져오기
        result = conn.execute(text('SELECT id, center_name FROM bi_centers'))
        centers = result.fetchall()

        for center_id, center_name in centers:
            if center_name in COORDINATES:
                lat, lng = COORDINATES[center_name]

                print(f"✓ {center_name}")
                print(f"  좌표: ({lat}, {lng})")

                conn.execute(text('''
                    UPDATE bi_centers
                    SET latitude = :lat, longitude = :lng
                    WHERE id = :id
                '''), {'id': center_id, 'lat': lat, 'lng': lng})
                conn.commit()

                updated += 1
            else:
                print(f"⚠ 좌표 없음: {center_name}")
                not_found.append(center_name)

    print(f"\n=== 완료: {updated}개 센터 업데이트 ===")

    if not_found:
        print(f"\n좌표를 찾지 못한 센터 ({len(not_found)}개):")
        for name in not_found:
            print(f"  - {name}")

    # 최종 확인
    print("\n최종 좌표 목록:")
    print("=" * 80)

    with engine.connect() as conn:
        result = conn.execute(text('''
            SELECT center_name, latitude, longitude
            FROM bi_centers
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            ORDER BY center_name
        '''))
        rows = result.fetchall()

        for name, lat, lng in rows:
            print(f"{name}: ({lat}, {lng})")

    print(f"\n전체 {len(rows)}개 센터에 좌표 설정 완료")


if __name__ == '__main__':
    main()
