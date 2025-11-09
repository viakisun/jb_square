"""
BI Center 좌표 업데이트 스크립트

BI Korea 사이트는 위도만 제공하므로, 센터명과 주소를 활용하여
Naver Geocoding API로 정확한 경도/위도를 가져옵니다.
"""

import asyncio
import aiohttp
from sqlalchemy import text
from src.core.database import engine
import os
from dotenv import load_dotenv

load_dotenv()

# Naver Geocoding API 설정
# IMPORTANT: 이 스크립트는 현재 사용되지 않습니다.
# Naver Geocoding API는 NCP 인증이 필요하며, 401 오류가 발생합니다.
# 대신 set_bi_center_coordinates.py를 사용하세요.
NAVER_CLIENT_ID = os.getenv('NAVER_CLOUD_CLIENT_ID')
NAVER_CLIENT_SECRET = os.getenv('NAVER_CLOUD_CLIENT_SECRET')


async def geocode_address(session, query: str):
    """
    Naver Geocoding API를 사용하여 주소를 좌표로 변환

    Args:
        session: aiohttp ClientSession
        query: 검색할 주소 또는 장소명

    Returns:
        tuple: (latitude, longitude) or (None, None)
    """
    url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode'
    headers = {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
    }
    params = {'query': query}

    try:
        async with session.get(url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()

                if data.get('addresses') and len(data['addresses']) > 0:
                    address = data['addresses'][0]
                    lat = float(address.get('y'))  # 위도
                    lng = float(address.get('x'))  # 경도
                    return (lat, lng)
                else:
                    print(f"  ⚠ 검색 결과 없음: {query}")
                    return (None, None)
            else:
                print(f"  ✗ API 오류 ({response.status}): {query}")
                return (None, None)
    except Exception as e:
        print(f"  ✗ 요청 실패: {e}")
        return (None, None)


async def update_coordinates():
    """
    데이터베이스의 모든 BI 센터에 대해 좌표를 업데이트
    """
    print("=== BI Center 좌표 업데이트 시작 ===\n")

    # 1. 데이터베이스에서 센터 정보 가져오기
    with engine.connect() as conn:
        result = conn.execute(text('''
            SELECT id, center_name, org_name, region, city, location
            FROM bi_centers
            ORDER BY center_name
        '''))
        centers = result.fetchall()

    print(f"총 {len(centers)}개 센터 좌표 업데이트 시작\n")

    # 2. Geocoding API로 좌표 가져오기
    async with aiohttp.ClientSession() as session:
        for idx, center in enumerate(centers):
            center_id, center_name, org_name, region, city, location = center

            print(f"[{idx + 1}/{len(centers)}] {center_name}")

            # 검색 쿼리 구성 (센터명 + 지역)
            # 예: "군산대학교 창업보육센터 전북"
            search_queries = [
                f"{center_name} {region}",
                f"{org_name} {region}" if org_name else None,
                f"{center_name} 전북",
            ]

            lat, lng = None, None

            # 여러 검색어로 시도
            for query in search_queries:
                if not query:
                    continue

                print(f"  검색: {query}")
                lat, lng = await geocode_address(session, query)

                if lat and lng:
                    print(f"  ✓ 좌표 발견: ({lat}, {lng})")
                    break

                # API Rate Limit 고려
                await asyncio.sleep(0.5)

            # 3. 데이터베이스 업데이트
            if lat and lng:
                with engine.connect() as conn:
                    conn.execute(text('''
                        UPDATE bi_centers
                        SET latitude = :lat, longitude = :lng
                        WHERE id = :id
                    '''), {'id': center_id, 'lat': lat, 'lng': lng})
                    conn.commit()
                    print(f"  ✓ 데이터베이스 업데이트 완료\n")
            else:
                print(f"  ✗ 좌표를 찾을 수 없습니다\n")

            # API Rate Limit 고려
            await asyncio.sleep(1)

    print("\n=== 좌표 업데이트 완료 ===")

    # 4. 결과 확인
    with engine.connect() as conn:
        result = conn.execute(text('''
            SELECT
                COUNT(*) as total,
                COUNT(latitude) as with_lat,
                COUNT(longitude) as with_lng,
                COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as complete
            FROM bi_centers
        '''))
        stats = result.fetchone()

    print(f"\n통계:")
    print(f"  전체 센터: {stats[0]}개")
    print(f"  위도 있음: {stats[1]}개")
    print(f"  경도 있음: {stats[2]}개")
    print(f"  좌표 완료: {stats[3]}개")


if __name__ == '__main__':
    asyncio.run(update_coordinates())
