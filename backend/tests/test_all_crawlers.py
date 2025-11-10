"""
전체 크롤러 테스트 - 모든 어댑터의 크롤링을 실행하고 결과를 확인
"""

import sys
import asyncio
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from src.services.sources import (
    JBTPLocalAdapter,
    JBTPExternalAdapter,
    JBTPEventsAdapter,
    GovernmentNTISAdapter,
    GovernmentBizinfoAdapter,
    GovernmentBiCenterAdapter,
    GovernmentMFDSAdapter,
    GovernmentMOHWAdapter
)

# 테스트할 어댑터 목록
ADAPTERS = [
    ("JBTP 사업공고", JBTPLocalAdapter),
    ("JBTP 외부사업", JBTPExternalAdapter),
    ("JBTP 행사일정", JBTPEventsAdapter),
    ("정부 NTIS", GovernmentNTISAdapter),
    ("정부 기업마당", GovernmentBizinfoAdapter),
    ("정부 BI센터", GovernmentBiCenterAdapter),
    ("정부 식약처", GovernmentMFDSAdapter),
    ("정부 보건복지부", GovernmentMOHWAdapter),
]


async def test_single_adapter(name: str, adapter_class):
    """단일 어댑터 테스트"""
    print(f"\n{'='*80}")
    print(f"테스트: {name}")
    print(f"{'='*80}")

    try:
        # 어댑터 인스턴스 생성
        adapter = adapter_class()
        print(f"✅ 어댑터 인스턴스 생성 성공: {adapter.source_id}")

        # 콜백 함수 정의 (EventService가 JSON string을 전달함)
        events = []
        async def callback(event_json: str):
            import json
            event = json.loads(event_json)
            event_type = event.get('type')
            events.append((event_type, event))

            if event_type == "log":
                print(f"  📋 {event.get('message', '')}")
            elif event_type == "progress":
                progress = event.get('progress', 0)
                total = event.get('total', 0)
                print(f"  📊 진행: {progress}/{total}")
            elif event_type == "complete":
                print(f"  ✅ 완료: {event.get('message', '')}")
            elif event_type == "error":
                print(f"  ❌ 오류: {event.get('message', '')}")

        # 크롤링 실행
        print(f"🚀 크롤링 시작...")
        await adapter.execute(callback)

        # 결과 확인
        status = adapter.get_status()
        print(f"\n결과:")
        print(f"  - 상태: {status['status']}")
        print(f"  - 진행: {status['progress']}/{status['total']}")
        print(f"  - 성공: {status['success']}")
        print(f"  - 실패: {status['failed']}")

        if status['error_message']:
            print(f"  - 오류 메시지: {status['error_message']}")
            return False

        return True

    except Exception as e:
        print(f"❌ 테스트 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """메인 테스트 함수"""
    print("="*80)
    print("전체 크롤러 테스트 시작")
    print(f"테스트 대상: {len(ADAPTERS)}개 어댑터")
    print("="*80)

    results = {}

    for name, adapter_class in ADAPTERS:
        success = await test_single_adapter(name, adapter_class)
        results[name] = success

        # 각 테스트 사이에 잠시 대기
        await asyncio.sleep(1)

    # 최종 결과 출력
    print("\n" + "="*80)
    print("전체 테스트 결과")
    print("="*80)

    success_count = sum(1 for success in results.values() if success)
    total_count = len(results)

    for name, success in results.items():
        status = "✅ 성공" if success else "❌ 실패"
        print(f"{status}: {name}")

    print("="*80)
    print(f"총 {total_count}개 중 {success_count}개 성공")
    print("="*80)

    if success_count == total_count:
        print("\n🎉 모든 크롤러 테스트 통과!")
        return 0
    else:
        print(f"\n⚠️  {total_count - success_count}개의 크롤러 테스트 실패")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
