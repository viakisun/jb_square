#!/usr/bin/env python3
"""
크롤링 시스템 테스트 스크립트
"""

import asyncio
import websockets
import json


async def test_crawling():
    """WebSocket을 통해 크롤링 테스트"""

    print("=" * 80)
    print("JBTP 크롤링 테스트")
    print("=" * 80)

    uri = "ws://localhost:8000/api/crawling/ws/jbtp"

    try:
        async with websockets.connect(uri) as websocket:
            print(f"\n✓ WebSocket 연결 성공: {uri}\n")

            # 메시지 수신
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=60.0)
                    data = json.loads(message)

                    event_type = data.get("type", "unknown")
                    timestamp = data.get("timestamp", "")

                    if event_type == "start":
                        print(f"[{timestamp}] 🚀 시작: {data.get('message')}")

                    elif event_type == "log":
                        print(f"[{timestamp}] 📝 로그: {data.get('message')}")

                    elif event_type == "progress":
                        progress = data.get("progress", 0)
                        total = data.get("total", 0)
                        percentage = data.get("percentage", 0)
                        success = data.get("success", 0)
                        failed = data.get("failed", 0)
                        print(f"[{timestamp}] 📊 진행: {progress}/{total} ({percentage}%) - 성공: {success}, 실패: {failed}")

                    elif event_type == "complete":
                        print(f"\n[{timestamp}] ✅ 완료: {data.get('message')}")
                        print(f"   총 수집: {data.get('total_collected')}개")
                        print(f"   성공: {data.get('success')}개")
                        print(f"   실패: {data.get('failed')}개")

                        rate_stats = data.get('rate_limit_stats', {})
                        if rate_stats:
                            print(f"\n   Rate Limit 통계:")
                            print(f"   - 간격: {rate_stats.get('interval')}초")
                            print(f"   - 대기 횟수: {rate_stats.get('total_waits')}회")
                            print(f"   - 총 대기 시간: {rate_stats.get('total_wait_time')}초")
                            print(f"   - 평균 대기 시간: {rate_stats.get('avg_wait_time')}초")

                        break

                    elif event_type == "error":
                        print(f"\n[{timestamp}] ❌ 오류: {data.get('message')}")
                        break

                    elif event_type == "stopped":
                        print(f"\n[{timestamp}] ⏹️  중단: {data.get('message')}")
                        break

                except asyncio.TimeoutError:
                    print("\n⚠️  타임아웃: 60초 동안 응답이 없습니다.")
                    break

                except websockets.exceptions.ConnectionClosed:
                    print("\n⚠️  WebSocket 연결이 닫혔습니다.")
                    break

    except Exception as e:
        print(f"\n❌ 오류 발생: {str(e)}")

    print("\n" + "=" * 80)
    print("테스트 완료")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_crawling())
