"""
크롤러 통합 관리자
기존 크롤러(JBTP, NTIS, BizInfo)를 통합하여 실행하고 결과를 DB에 저장
"""

import sys
import json
import time
from datetime import datetime
from pathlib import Path
from backend.config import Config
from backend.models import SessionLocal, Content, CrawlLog

# 크롤러 디렉토리를 Python 경로에 추가
crawler_dir = Config.CRAWLER_DIR
sys.path.insert(0, str(crawler_dir))

# 크롤러 임포트
try:
    from jbtp_crawler import JBTPCrawler
    from ntis_crawler import NTISCrawler
    from bizinfo_crawler import BizInfoCrawler
except ImportError as e:
    print(f"Warning: Could not import crawlers: {e}")
    JBTPCrawler = None
    NTISCrawler = None
    BizInfoCrawler = None

class CrawlerManager:
    """크롤러 통합 관리 클래스"""

    def __init__(self):
        self.db = SessionLocal()

    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()

    def crawl_jbtp(self):
        """JBTP 크롤링 실행"""
        if not JBTPCrawler:
            return {'success': False, 'error': 'JBTP Crawler not available'}

        log = CrawlLog(
            source='JBTP',
            status='running',
            started_at=datetime.now()
        )
        self.db.add(log)
        self.db.commit()

        start_time = time.time()

        try:
            crawler = JBTPCrawler()
            all_notices = []

            # 3개 게시판 크롤링
            board_urls = [
                ("사업공고", "https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102001000000"),
                ("채용공고", "https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000101001000000"),
                ("유관기관공고", "https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102002000000"),
            ]

            for board_name, url in board_urls:
                from bs4 import BeautifulSoup
                response = crawler.session.get(url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    notices = crawler._parse_notice_board(soup, url)
                    for notice in notices:
                        notice['board'] = board_name
                        notice['source'] = 'JBTP'
                        notice['region'] = '전북특별자치도'
                    all_notices.extend(notices)
                time.sleep(0.5)

            # 바이오 필터링
            bio_notices = crawler.filter_bio_notices(all_notices)

            # DB에 저장
            saved_count = self._save_notices(bio_notices)

            # 로그 업데이트
            log.status = 'success'
            log.notices_found = len(all_notices)
            log.bio_notices_found = len(bio_notices)
            log.duration = time.time() - start_time
            log.finished_at = datetime.now()
            self.db.commit()

            return {
                'success': True,
                'total': len(all_notices),
                'bio': len(bio_notices),
                'saved': saved_count,
                'duration': log.duration
            }

        except Exception as e:
            log.status = 'error'
            log.error_message = str(e)
            log.duration = time.time() - start_time
            log.finished_at = datetime.now()
            self.db.commit()

            return {'success': False, 'error': str(e)}

    def crawl_ntis(self, search_condition='1m'):
        """NTIS 크롤링 실행"""
        if not NTISCrawler:
            return {'success': False, 'error': 'NTIS Crawler not available'}

        log = CrawlLog(
            source='NTIS',
            status='running',
            started_at=datetime.now()
        )
        self.db.add(log)
        self.db.commit()

        start_time = time.time()

        try:
            crawler = NTISCrawler()
            all_notices = crawler.get_notice_list(search_condition=search_condition)

            for notice in all_notices:
                notice['source'] = 'NTIS'

            # 바이오 필터링
            bio_notices = crawler.filter_bio_notices(all_notices)

            # DB에 저장
            saved_count = self._save_notices(bio_notices)

            # 로그 업데이트
            log.status = 'success'
            log.notices_found = len(all_notices)
            log.bio_notices_found = len(bio_notices)
            log.duration = time.time() - start_time
            log.finished_at = datetime.now()
            self.db.commit()

            return {
                'success': True,
                'total': len(all_notices),
                'bio': len(bio_notices),
                'saved': saved_count,
                'duration': log.duration
            }

        except Exception as e:
            log.status = 'error'
            log.error_message = str(e)
            log.duration = time.time() - start_time
            log.finished_at = datetime.now()
            self.db.commit()

            return {'success': False, 'error': str(e)}

    def crawl_bizinfo(self, max_pages=10):
        """BizInfo 크롤링 실행"""
        if not BizInfoCrawler:
            return {'success': False, 'error': 'BizInfo Crawler not available'}

        log = CrawlLog(
            source='BizInfo',
            status='running',
            started_at=datetime.now()
        )
        self.db.add(log)
        self.db.commit()

        start_time = time.time()

        try:
            crawler = BizInfoCrawler()
            all_notices = crawler.get_notice_list(max_pages=max_pages)

            for notice in all_notices:
                notice['source'] = 'BizInfo'

            # 바이오 필터링
            bio_notices = crawler.filter_bio_notices(all_notices)

            # 오탐 제거
            bio_notices = [n for n in bio_notices if not ('위조상품' in n.get('title', '') or '지식재산' in n.get('agency', ''))]

            # DB에 저장
            saved_count = self._save_notices(bio_notices)

            # 로그 업데이트
            log.status = 'success'
            log.notices_found = len(all_notices)
            log.bio_notices_found = len(bio_notices)
            log.duration = time.time() - start_time
            log.finished_at = datetime.now()
            self.db.commit()

            return {
                'success': True,
                'total': len(all_notices),
                'bio': len(bio_notices),
                'saved': saved_count,
                'duration': log.duration
            }

        except Exception as e:
            log.status = 'error'
            log.error_message = str(e)
            log.duration = time.time() - start_time
            log.finished_at = datetime.now()
            self.db.commit()

            return {'success': False, 'error': str(e)}

    def crawl_all(self):
        """모든 크롤러 실행"""
        results = {
            'jbtp': self.crawl_jbtp(),
            'ntis': self.crawl_ntis(),
            'bizinfo': self.crawl_bizinfo()
        }

        return results

    def _save_notices(self, notices):
        """공고를 DB에 저장 (중복 체크)"""
        saved_count = 0

        for notice in notices:
            # 중복 체크 (제목 + 링크)
            existing = self.db.query(Content).filter(
                Content.title == notice.get('title'),
                Content.link == notice.get('link')
            ).first()

            if existing:
                continue  # 이미 존재하면 스킵

            # 새 콘텐츠 생성
            content = Content(
                title=notice.get('title'),
                link=notice.get('link'),
                source=notice.get('source'),
                status='pending',  # 기본값: 검수 대기
                matched_keywords=json.dumps(notice.get('matched_keywords', []), ensure_ascii=False),
                region=notice.get('region'),
                board=notice.get('board'),
                ministry=notice.get('ministry'),
                receive_date=notice.get('receive_date'),
                dday=notice.get('dday'),
                period=notice.get('period'),
                agency=notice.get('agency'),
                reg_date=notice.get('reg_date'),
                views=notice.get('views'),
                crawled_at=datetime.now()
            )

            # deadline 파싱 시도
            if notice.get('deadline'):
                try:
                    from datetime import datetime as dt
                    content.deadline = dt.strptime(notice['deadline'], '%Y.%m.%d').date()
                except:
                    pass

            self.db.add(content)
            saved_count += 1

        self.db.commit()
        return saved_count

# 단독 실행 테스트
if __name__ == '__main__':
    print("크롤러 관리자 테스트")
    print("=" * 60)

    manager = CrawlerManager()

    print("\n[JBTP 크롤링]")
    result = manager.crawl_jbtp()
    print(json.dumps(result, indent=2, ensure_ascii=False))

    print("\n[NTIS 크롤링]")
    result = manager.crawl_ntis()
    print(json.dumps(result, indent=2, ensure_ascii=False))

    print("\n[BizInfo 크롤링]")
    result = manager.crawl_bizinfo()
    print(json.dumps(result, indent=2, ensure_ascii=False))
