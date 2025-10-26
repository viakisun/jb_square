"""
BI Center Crawler Test Script
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from src.services.crawler_manager import crawler_manager

async def callback(message):
    """Print callback messages"""
    import json
    data = json.loads(message)
    msg_type = data.get('type')
    msg = data.get('message', '')

    if msg_type == 'start':
        print(f'\n▶ {msg}')
    elif msg_type == 'log':
        print(f'  {msg}')
    elif msg_type == 'progress':
        progress = data.get('progress', 0)
        total = data.get('total', 0)
        success = data.get('success', 0)
        failed = data.get('failed', 0)
        if msg:
            print(f'  {msg}')
        if total > 0:
            print(f'  진행: {progress}/{total} (성공: {success}, 실패: {failed})')
    elif msg_type == 'complete':
        print(f'\n✅ {msg}')
        total_centers = data.get('total_centers', 0)
        total_companies = data.get('total_companies', 0)
        print(f'📊 총 {total_centers}개 센터, {total_companies}개 입주기업 수집 완료')
    elif msg_type == 'error':
        print(f'\n❌ 오류: {msg}')
    elif msg_type == 'stopped':
        print(f'\n⚠️  {msg}')

async def main():
    print('=' * 60)
    print('BI 센터 크롤링 테스트')
    print('=' * 60)

    await crawler_manager.execute_bi_center(callback)

    print('\n' + '=' * 60)
    print('크롤링 완료')
    print('=' * 60)

if __name__ == '__main__':
    asyncio.run(main())
