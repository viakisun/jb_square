"""
자동 크롤링 스케줄러
APScheduler를 사용하여 정기적으로 크롤링 실행
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.crawler_manager import CrawlerManager
from backend.models import SessionLocal, Setting
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CrawlerScheduler:
    """크롤링 스케줄러 클래스"""

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()

    def start(self):
        """스케줄러 시작"""
        # 설정에서 크롤링 스케줄 읽기
        db = SessionLocal()
        try:
            schedule_setting = db.query(Setting).filter(Setting.key == 'crawling_schedule').first()
            enabled_setting = db.query(Setting).filter(Setting.key == 'crawling_enabled').first()

            if enabled_setting and enabled_setting.value == 'true':
                schedule = schedule_setting.value if schedule_setting else '0 9 * * *'  # 기본: 매일 09:00

                # Cron 표현식 파싱: 분 시 일 월 요일
                # 예: '0 9 * * *' = 매일 09:00
                cron_parts = schedule.split()
                if len(cron_parts) == 5:
                    trigger = CronTrigger(
                        minute=cron_parts[0],
                        hour=cron_parts[1],
                        day=cron_parts[2],
                        month=cron_parts[3],
                        day_of_week=cron_parts[4]
                    )

                    self.scheduler.add_job(
                        func=self.run_all_crawlers,
                        trigger=trigger,
                        id='crawl_all',
                        replace_existing=True
                    )

                    logger.info(f"✅ 크롤링 스케줄 등록됨: {schedule}")
                else:
                    logger.warning(f"⚠️ 잘못된 cron 표현식: {schedule}")
            else:
                logger.info("ℹ️ 자동 크롤링이 비활성화되어 있습니다.")

        except Exception as e:
            logger.error(f"❌ 스케줄러 시작 오류: {e}")
        finally:
            db.close()

    def run_all_crawlers(self):
        """모든 크롤러 실행 (스케줄러용)"""
        logger.info("🚀 자동 크롤링 시작...")
        try:
            manager = CrawlerManager()
            results = manager.crawl_all()

            logger.info(f"✅ 자동 크롤링 완료:")
            logger.info(f"   JBTP: {results['jbtp'].get('bio', 0)}개")
            logger.info(f"   NTIS: {results['ntis'].get('bio', 0)}개")
            logger.info(f"   BizInfo: {results['bizinfo'].get('bio', 0)}개")
        except Exception as e:
            logger.error(f"❌ 자동 크롤링 오류: {e}")

    def stop(self):
        """스케줄러 정지"""
        self.scheduler.shutdown()
        logger.info("🛑 스케줄러 정지됨")

    def update_schedule(self, cron_expression):
        """스케줄 업데이트"""
        try:
            cron_parts = cron_expression.split()
            if len(cron_parts) == 5:
                trigger = CronTrigger(
                    minute=cron_parts[0],
                    hour=cron_parts[1],
                    day=cron_parts[2],
                    month=cron_parts[3],
                    day_of_week=cron_parts[4]
                )

                self.scheduler.reschedule_job(
                    'crawl_all',
                    trigger=trigger
                )

                logger.info(f"✅ 스케줄 업데이트됨: {cron_expression}")
                return True
            else:
                logger.error(f"⚠️ 잘못된 cron 표현식: {cron_expression}")
                return False
        except Exception as e:
            logger.error(f"❌ 스케줄 업데이트 오류: {e}")
            return False

# 전역 스케줄러 인스턴스
crawler_scheduler = CrawlerScheduler()
