"""
BI Center Crawler
전북 창업보육센터 크롤러
"""

import asyncio
from typing import Callable, List, Optional

from src.core.database import SessionLocal
from src.models.bi_center import BICenter, BICompany
from ._base import BaseAdapter, CrawlerStatus
from .repositories.config_repository import ConfigRepository


class GovernmentBiCenterAdapter(BaseAdapter):
    """
    전북 창업보육센터 크롤러

    1. https://www.smes.go.kr/binet/incu/center/list.do에서 전북 BI 센터 목록 수집
    2. 각 센터의 입주기업 정보 수집
    3. bi_centers, bi_companies 테이블에 저장
    """

    def __init__(self):
        super().__init__("bi_center")

    def _load_binet_configs(self) -> List[tuple]:
        """BI Center 설정을 DB에서 로드합니다."""
        return ConfigRepository.load_binet_configs()

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        driver = None

        try:
            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "전북 창업보육센터 데이터 수집을 시작합니다..."
            })

            # Selenium WebDriver 설정
            from selenium import webdriver
            from selenium.webdriver.chrome.service import Service
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.common.by import By
            from webdriver_manager.chrome import ChromeDriverManager
            import os

            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')

            # ChromeDriver 경로 가져오기
            driver_path = ChromeDriverManager().install()

            # webdriver-manager가 잘못된 파일을 선택하는 경우가 있으므로
            # 실제 chromedriver 실행 파일 찾기
            import glob
            if 'chromedriver-mac' in driver_path or 'THIRD_PARTY' in driver_path:
                # chromedriver-mac-arm64 디렉토리에서 실제 chromedriver 찾기
                driver_dir = os.path.dirname(driver_path)
                # chromedriver 파일 검색 (실행 파일만)
                potential_paths = [
                    os.path.join(driver_dir, 'chromedriver'),
                    os.path.join(driver_dir, '..', 'chromedriver'),
                ]
                for path in potential_paths:
                    if os.path.isfile(path):
                        driver_path = path
                        break
                else:
                    # glob으로 검색
                    search_pattern = os.path.join(driver_dir, '**/chromedriver')
                    found = glob.glob(search_pattern, recursive=True)
                    if found:
                        # 실행 파일인 것만 선택 (텍스트 파일 제외)
                        for f in found:
                            if os.path.isfile(f) and not f.endswith('.chromedriver'):
                                driver_path = f
                                break

            # 실행 권한 확인 및 부여
            if os.path.exists(driver_path) and os.path.isfile(driver_path):
                os.chmod(driver_path, 0o755)

            driver = webdriver.Chrome(
                service=Service(driver_path),
                options=chrome_options
            )

            # 1. BI 센터 목록 페이지로 이동
            url = "https://www.smes.go.kr/binet/incu/center/list.do"
            driver.get(url)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": "페이지 로드 완료. 전북 지역 선택 중..."
            })

            # 지역 설정 로드 (DB에서)
            region_configs = self._load_binet_configs()
            if not region_configs:
                raise Exception("설정된 지역이 없습니다")

            # 첫 번째 지역 선택 (현재는 전북만 지원)
            region_name, region_code = region_configs[0]

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"{region_name} 지역 선택 중..."
            })

            # 지역 선택 (JavaScript 함수 호출)
            driver.execute_script(f"fncSelectArea('{region_code}');")
            await asyncio.sleep(3)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"{region_name} 지역 데이터 로드 완료. BI 센터 파싱 중..."
            })

            # 두 번째 테이블이 센터 목록 (첫 번째는 통계)
            tables = driver.find_elements(By.TAG_NAME, 'table')
            if len(tables) < 2:
                raise Exception("센터 목록 테이블을 찾을 수 없습니다")

            table = tables[1]  # 두 번째 테이블
            rows = table.find_elements(By.TAG_NAME, 'tr')[1:]  # 헤더 제외

            centers_data = []
            for row in rows:
                cols = row.find_elements(By.TAG_NAME, 'td')
                if len(cols) >= 11:
                    # 센터 데이터 추출
                    org_name = cols[3].text.strip()
                    center_name_elem = cols[4]
                    center_name = center_name_elem.text.strip()
                    specialization = cols[6].text.strip()
                    vacant_rooms = cols[7].text.strip()  # 공실 정보

                    # 센터 ID 추출 (여러 링크에서 시도)
                    center_seq = None
                    try:
                        # 1. 입주기업 링크에서
                        company_link = cols[9].find_element(By.TAG_NAME, 'a')
                        onclick = company_link.get_attribute('onclick')
                        if onclick and 'fncCreateView' in onclick:
                            import re
                            match = re.search(r"fncCreateView\('([^']+)'\)", onclick)
                            if match:
                                center_seq = match.group(1)
                    except:
                        pass

                    # 2. 센터명 링크에서도 시도
                    if not center_seq:
                        try:
                            center_link = cols[4].find_element(By.TAG_NAME, 'a')
                            onclick = center_link.get_attribute('onclick')
                            if onclick and 'fncEditView' in onclick:
                                import re
                                match = re.search(r"fncEditView\('([^']+)'\)", onclick)
                                if match:
                                    center_seq = match.group(1)
                        except:
                            pass

                    # 지도보기 링크에서 위치 좌표 추출
                    # OpenWindow1('center_id', 'latitude') 형식 - 경도는 제공되지 않음
                    location_coords = ''
                    latitude = None
                    longitude = None
                    center_id = None

                    try:
                        map_link = cols[8].find_element(By.TAG_NAME, 'a')
                        onclick = map_link.get_attribute('onclick')

                        if onclick and 'OpenWindow1' in onclick:
                            import re
                            match = re.search(r"OpenWindow1\('([^']+)','([^']+)'\)", onclick)
                            if match:
                                # 첫 번째 파라미터: 센터 ID (center_id)
                                # 두 번째 파라미터: 위도 (latitude)
                                # 경도는 onclick에서 제공되지 않음
                                center_id = match.group(1)
                                latitude_str = match.group(2)

                                try:
                                    latitude = float(latitude_str)
                                    location_coords = latitude_str  # 기존 location 필드 호환성 유지

                                    await self.send_event(callback, "log", {
                                        "source_id": self.source_id,
                                        "message": f"  ✓ {center_name} 좌표: 위도={latitude} (경도는 제공안됨)"
                                    })
                                except ValueError:
                                    await self.send_event(callback, "log", {
                                        "source_id": self.source_id,
                                        "message": f"  ⚠ {center_name} 위도 변환 실패: {latitude_str}"
                                    })
                    except Exception as e:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ⚠ {center_name} 좌표 추출 실패: {str(e)}"
                        })

                    center_data = {
                        'region': '전북특별자치도',
                        'city': '',
                        'org_name': org_name,
                        'center_name': center_name,
                        'contact': '',  # 상세 페이지에서 수집
                        'specialization': specialization,
                        'vacant_rooms': vacant_rooms,
                        'location': location_coords,
                        'latitude': latitude,
                        'longitude': longitude,
                        'center_seq': center_seq,
                        'center_url': '',  # 상세 페이지에서 수집
                        'companies': []
                    }
                    centers_data.append(center_data)

                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✓ {center_name}"
                    })

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"총 {len(centers_data)}개 BI 센터 발견. 입주기업 정보 수집 중..."
            })

            self.status["total"] = len(centers_data)

            # 2. 각 센터의 입주기업 정보 수집
            for idx, center in enumerate(centers_data):
                # 중단 체크
                if self.stop_flag:
                    await self.send_event(callback, "stopped", {
                        "source_id": self.source_id,
                        "message": "크롤링이 사용자에 의해 중단되었습니다."
                    })
                    self.status["status"] = CrawlerStatus.STOPPED
                    return

                if not center['center_seq']:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ⚠ [{center['center_name']}] 입주기업 링크 없음"
                    })
                    self.status["progress"] = idx + 1
                    continue

                try:
                    # 입주기업 상세 페이지로 이동
                    driver.execute_script(f"fncCreateView('{center['center_seq']}');")
                    await asyncio.sleep(2)

                    # 팝업 윈도우로 전환
                    driver.switch_to.window(driver.window_handles[-1])

                    # 입주기업 테이블 파싱
                    try:
                        company_table = driver.find_element(By.TAG_NAME, 'table')
                        company_rows = company_table.find_elements(By.TAG_NAME, 'tr')[1:]

                        companies = []
                        for company_row in company_rows:
                            company_cols = company_row.find_elements(By.TAG_NAME, 'td')

                            # 테이블 구조: [순서번호, 회사명, 업종, 제품, 빈값]
                            # 컬럼 0 (순서번호)는 무시하고 컬럼 1부터 읽음
                            if len(company_cols) >= 5:
                                company = {
                                    'company_name': company_cols[1].text.strip(),  # 컬럼 1: 회사명
                                    'business_field': company_cols[2].text.strip(),  # 컬럼 2: 업종
                                    'product': company_cols[3].text.strip(),  # 컬럼 3: 제품
                                }
                                companies.append(company)

                        center['companies'] = companies

                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✓ [{center['center_name']}] {len(companies)}개 입주기업 수집"
                        })

                        self.status["success"] += 1

                    except Exception as e:
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✗ [{center['center_name']}] 입주기업 파싱 오류: {str(e)}"
                        })
                        self.status["failed"] += 1

                    # 팝업 닫고 원래 창으로 복귀
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])

                except Exception as e:
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✗ [{center['center_name']}] 오류: {str(e)}"
                    })
                    self.status["failed"] += 1

                    # 팝업이 열렸으면 닫기
                    try:
                        if len(driver.window_handles) > 1:
                            driver.close()
                            driver.switch_to.window(driver.window_handles[0])
                    except:
                        pass

                # Progress update
                self.status["progress"] = idx + 1
                await self.send_event(callback, "progress", {
                    "source_id": self.source_id,
                    "progress": idx + 1,
                    "total": len(centers_data),
                    "percentage": int((idx + 1) / len(centers_data) * 100),
                    "success": self.status["success"],
                    "failed": self.status["failed"]
                })

            # 3. DB에 저장
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": "데이터베이스에 저장 중..."
            })

            db = SessionLocal()
            try:
                total_centers = 0
                total_companies = 0

                for center_data in centers_data:
                    # 센터 중복 체크 (org_name + center_name으로)
                    existing = db.query(BICenter).filter(
                        BICenter.org_name == center_data['org_name'],
                        BICenter.center_name == center_data['center_name']
                    ).first()

                    if existing:
                        # 기존 센터 업데이트
                        existing.region = center_data['region']
                        existing.city = center_data['city']
                        existing.contact = center_data['contact']
                        existing.specialization = center_data['specialization']
                        existing.vacant_rooms = center_data['vacant_rooms']
                        existing.location = center_data['location']
                        existing.latitude = center_data.get('latitude')
                        existing.longitude = center_data.get('longitude')
                        existing.companies_count = len(center_data['companies'])
                        center_obj = existing
                    else:
                        # 새 센터 추가
                        center_obj = BICenter(
                            region=center_data['region'],
                            city=center_data['city'],
                            org_name=center_data['org_name'],
                            center_name=center_data['center_name'],
                            contact=center_data['contact'],
                            specialization=center_data['specialization'],
                            vacant_rooms=center_data['vacant_rooms'],
                            location=center_data['location'],
                            latitude=center_data.get('latitude'),
                            longitude=center_data.get('longitude'),
                            companies_count=len(center_data['companies'])
                        )
                        db.add(center_obj)

                    total_centers += 1

                    db.flush()  # center_obj.id를 얻기 위해

                    # 기존 입주기업 삭제 (최신 데이터로 교체)
                    db.query(BICompany).filter(BICompany.center_id == center_obj.id).delete()

                    # 입주기업 저장
                    for company_data in center_data['companies']:
                        company_obj = BICompany(
                            center_id=center_obj.id,
                            company_name=company_data['company_name'],
                            business_field=company_data['business_field'],
                            product=company_data['product']
                        )
                        db.add(company_obj)
                        total_companies += 1

                db.commit()

                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"저장 완료: {total_centers}개 센터, {total_companies}개 입주기업"
                })

            except Exception as e:
                db.rollback()
                raise Exception(f"DB 저장 오류: {str(e)}")
            finally:
                db.close()

            # 완료
            self.status["status"] = CrawlerStatus.COMPLETED
            await self.send_event(callback, "complete", {
                "source_id": self.source_id,
                "message": "전북 창업보육센터 데이터 수집이 완료되었습니다.",
                "total_centers": len(centers_data),
                "total_companies": sum(len(c['companies']) for c in centers_data)
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })

        finally:
            if driver:
                driver.quit()

    async def get_notices_preview(
        self,
        count: int = 100,
        apply_keyword_filter: bool = False,
        date_range_days: int = 30
    ) -> List:
        """
        BI Center 크롤러는 공고가 아닌 창업보육센터 정보를 수집하므로
        get_notices_preview는 빈 리스트를 반환합니다.

        Args:
            count: 수집할 최대 공고 개수 (사용 안 함)
            apply_keyword_filter: 키워드 필터 적용 여부 (사용 안 함)
            date_range_days: 검색 기간 (사용 안 함)

        Returns:
            빈 리스트 (BI Center는 공고를 수집하지 않음)
        """
        return []
