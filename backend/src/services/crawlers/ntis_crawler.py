"""
NTIS Crawler
국가과학기술정보서비스(NTIS) API 크롤러
"""

import os
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Callable, Optional

from src.services.rate_limiter import RateLimiter
from .base_crawler import BaseCrawler, CrawlerStatus


class NTISCrawler(BaseCrawler):
    """
    NTIS API 크롤러

    Note: NTIS는 웹 크롤링을 금지하고 있으며, 공식 OpenAPI를 제공합니다.
    올바른 API 엔드포인트: https://www.ntis.go.kr/rndopen/openApi/public_project

    API 신청: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do
    """

    def __init__(self):
        super().__init__("ntis")

    def _get_xml_text(self, element, tag, default=''):
        """XML 요소에서 텍스트 추출"""
        child = element.find(tag)
        if child is None:
            return default
        # HTML 태그 제거 (예: <span class="search_word">)
        text = child.text if child.text else ''
        for subchild in child:
            if subchild.text:
                text += subchild.text
            if subchild.tail:
                text += subchild.tail
        return text.strip() if text else default

    def _parse_project_hit(self, hit):
        """단일 과제 HIT 파싱"""
        try:
            # ProjectTitle에서 한글/영문 제목 추출
            title_elem = hit.find('ProjectTitle')
            title_korean = ''
            title_english = ''
            if title_elem is not None:
                title_korean = self._get_xml_text(title_elem, 'Korean', '')
                title_english = self._get_xml_text(title_elem, 'English', '')

            # Manager 정보
            manager_name = ''
            manager_elem = hit.find('Manager')
            if manager_elem is not None:
                manager_name = self._get_xml_text(manager_elem, 'Name', '')

            # 키워드 추출
            keyword_korean = ''
            keyword_english = ''
            keyword_elem = hit.find('Keyword')
            if keyword_elem is not None:
                keyword_korean = self._get_xml_text(keyword_elem, 'Korean', '')
                keyword_english = self._get_xml_text(keyword_elem, 'English', '')

            # 연구기관
            research_agency = ''
            research_elem = hit.find('ResearchAgency')
            if research_elem is not None:
                research_agency = self._get_xml_text(research_elem, 'Name', '')

            # 관리기관
            manage_agency = ''
            manage_elem = hit.find('ManageAgency')
            if manage_elem is not None:
                manage_agency = self._get_xml_text(manage_elem, 'Name', '')

            # 부처
            ministry = ''
            ministry_elem = hit.find('Ministry')
            if ministry_elem is not None:
                ministry = self._get_xml_text(ministry_elem, 'Name', '')

            # 기간 정보
            start_date = ''
            end_date = ''
            period_elem = hit.find('ProjectPeriod')
            if period_elem is not None:
                start_date = self._get_xml_text(period_elem, 'Start', '')
                end_date = self._get_xml_text(period_elem, 'End', '')

            # 지역
            region = self._get_xml_text(hit, 'Region', '')

            # 연구비
            gov_funds = self._get_xml_text(hit, 'GovernmentFunds', '')
            total_funds = self._get_xml_text(hit, 'TotalFunds', '')

            # Goal, Abstract, Effect
            goal_full = ''
            goal_elem = hit.find('Goal')
            if goal_elem is not None:
                goal_full = self._get_xml_text(goal_elem, 'Full', '')

            abstract_full = ''
            abstract_elem = hit.find('Abstract')
            if abstract_elem is not None:
                abstract_full = self._get_xml_text(abstract_elem, 'Full', '')

            effect_full = ''
            effect_elem = hit.find('Effect')
            if effect_elem is not None:
                effect_full = self._get_xml_text(effect_elem, 'Full', '')

            project = {
                'title': title_korean or title_english or 'N/A',
                'title_korean': title_korean,
                'title_english': title_english,
                'project_number': self._get_xml_text(hit, 'ProjectNumber', ''),
                'project_manager': manager_name,
                'research_agency': research_agency,
                'manage_agency': manage_agency,
                'ministry': ministry,
                'project_year': self._get_xml_text(hit, 'ProjectYear', ''),
                'start_date': start_date,
                'end_date': end_date,
                'region': region,
                'government_funds': gov_funds,
                'total_funds': total_funds,
                'keywords_korean': keyword_korean,
                'keywords_english': keyword_english,
                'goal': goal_full,
                'abstract': abstract_full,
                'effect': effect_full,
                'six_technology': self._get_xml_text(hit, 'SixTechnology', ''),
                'business_name': self._get_xml_text(hit, 'BusinessName', ''),
            }

            return project

        except Exception as e:
            print(f"✗ 과제 HIT 파싱 중 오류: {e}")
            return None

    def _filter_bio_projects(self, projects):
        """바이오 관련 과제 필터링"""
        bio_keywords = [
            '바이오', '생명', '의료', '제약', '헬스케어', '유전', '건강', '보건',
            '임상', '진단', '치료', '병원', '질병', '의약', '신약', '백신',
            '항체', '세포', '줄기세포', '유전자', '게놈', 'DNA', 'RNA',
            '단백질', '효소', '미생물', '발효', '배양',
            '의료기기', '의료장비', '진단기기', '헬스',
            '식품', '건강기능식품', '뷰티', '화장품', '천연물',
            '농생명', '동물', '수의', '축산',
            'bio', 'Bio', 'BIO', 'biotech', 'Biotech',
            'health', 'Health', 'medical', 'Medical',
            'pharma', 'Pharma', 'drug', 'Drug',
            'clinical', 'Clinical', 'diagnosis', 'Diagnosis',
            'therapy', 'Therapy', 'vaccine', 'Vaccine',
            'antibody', 'cell', 'Cell', 'stem', 'Stem',
            'gene', 'Gene', 'genome', 'Genome',
            'protein', 'Protein', 'enzyme', 'Enzyme'
        ]

        filtered = []
        for project in projects:
            search_text = ' '.join([
                project.get('title', ''),
                project.get('title_korean', ''),
                project.get('title_english', ''),
                project.get('keywords_korean', ''),
                project.get('keywords_english', ''),
                project.get('goal', ''),
                project.get('abstract', ''),
                project.get('effect', '')
            ])

            matched_keywords = [kw for kw in bio_keywords if kw in search_text]

            if matched_keywords:
                project['matched_keywords'] = matched_keywords
                filtered.append(project)

        return filtered

    async def execute(self, callback: Optional[Callable] = None):
        """크롤링 실행"""
        try:
            # DB에서 NTIS 설정 로드
            from src.models.crawler_config import NTISConfig
            from src.core.database import SessionLocal

            db = SessionLocal()

            try:
                # API 키는 환경변수에서만 읽기
                api_key = os.getenv('NTIS_API_KEY', '').strip()

                if not api_key:
                    raise ValueError(
                        "NTIS API 키가 설정되지 않았습니다. "
                        ".env 파일에 NTIS_API_KEY를 입력해주세요. "
                        "API 키 신청: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do"
                    )

                # 검색 키워드는 DB에서 읽기 (UI로 관리)
                ntis_config = db.query(NTISConfig).first()
                search_keywords = ntis_config.search_keywords if ntis_config else []

                if not search_keywords:
                    raise ValueError(
                        "검색 키워드가 설정되지 않았습니다. "
                        "관리자 페이지에서 NTIS 검색 키워드를 추가해주세요."
                    )

                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"NTIS 설정 로드 완료 (검색 키워드: {len(search_keywords)}개)"
                })
            finally:
                db.close()

            await self.send_event(callback, "start", {
                "source_id": self.source_id,
                "message": "NTIS API 데이터 수집을 시작합니다..."
            })

            rate_limiter = RateLimiter(0.5)
            all_projects = []

            # 키워드별로 API 호출
            self.status["total"] = len(search_keywords)

            for idx, keyword in enumerate(search_keywords):
                # 중단 체크
                if self.stop_flag:
                    await self.send_event(callback, "stopped", {
                        "source_id": self.source_id,
                        "message": "데이터 수집이 사용자에 의해 중단되었습니다."
                    })
                    self.status["status"] = CrawlerStatus.STOPPED
                    return

                rate_limiter.wait()

                await self.send_event(callback, "log", {
                    "source_id": self.source_id,
                    "message": f"\n[키워드: {keyword}] API 호출 중..."
                })

                try:
                    # 올바른 NTIS OpenAPI 엔드포인트
                    response = requests.get(
                        "https://www.ntis.go.kr/rndopen/openApi/public_project",
                        params={
                            "apprvKey": api_key,
                            "collection": "project",
                            "SRWR": keyword,
                            "searchFd": "BI",  # 전체 검색
                            "searchRnkn": "DATE/DESC",  # 최신순
                            "startPosition": 1,
                            "displayCnt": 50  # 키워드당 최대 50개
                        },
                        timeout=30
                    )

                    if response.status_code == 200:
                        # XML 응답 파싱
                        try:
                            root = ET.fromstring(response.text)

                            # 에러 응답 체크
                            if root.tag == 'RESULT':
                                error = root.find('error')
                                if error is not None:
                                    self.status["failed"] += 1
                                    await self.send_event(callback, "log", {
                                        "source_id": self.source_id,
                                        "message": f"  ✗ API 오류: {error.text}"
                                    })
                                    continue

                                error = root.find('ERROR')
                                if error is not None:
                                    error_code = error.find('CODE')
                                    error_msg = error.find('MESSAGE')
                                    code_text = error_code.text if error_code is not None else 'Unknown'
                                    msg_text = error_msg.text if error_msg is not None else 'Unknown error'
                                    self.status["failed"] += 1
                                    await self.send_event(callback, "log", {
                                        "source_id": self.source_id,
                                        "message": f"  ✗ API 오류: [코드 {code_text}] {msg_text}"
                                    })
                                    continue

                            # 정상 응답 파싱
                            total_hits = root.find('TOTALHITS')
                            if total_hits is not None:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  총 {total_hits.text}건의 과제를 찾았습니다."
                                })

                            # RESULTSET에서 HIT 추출
                            resultset = root.find('RESULTSET')
                            if resultset is None:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  ⚠ 검색 결과 없음"
                                })
                                continue

                            projects = []
                            for hit in resultset.findall('HIT'):
                                project = self._parse_project_hit(hit)
                                if project:
                                    project['search_keyword'] = keyword
                                    projects.append(project)

                            if projects:
                                all_projects.extend(projects)
                                self.status["success"] += 1

                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  → {len(projects)}개 과제 수집 완료"
                                })
                            else:
                                await self.send_event(callback, "log", {
                                    "source_id": self.source_id,
                                    "message": f"  ⚠ 파싱된 과제 없음"
                                })

                        except ET.ParseError as e:
                            self.status["failed"] += 1
                            await self.send_event(callback, "log", {
                                "source_id": self.source_id,
                                "message": f"  ✗ XML 파싱 오류: {str(e)}"
                            })
                    else:
                        self.status["failed"] += 1
                        await self.send_event(callback, "log", {
                            "source_id": self.source_id,
                            "message": f"  ✗ HTTP {response.status_code} 오류"
                        })

                except requests.exceptions.Timeout:
                    self.status["failed"] += 1
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✗ API 요청 시간 초과"
                    })
                except requests.exceptions.RequestException as e:
                    self.status["failed"] += 1
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✗ 네트워크 오류: {str(e)}"
                    })
                except Exception as e:
                    self.status["failed"] += 1
                    await self.send_event(callback, "log", {
                        "source_id": self.source_id,
                        "message": f"  ✗ 오류: {str(e)}"
                    })

                # Progress update
                self.status["progress"] = idx + 1
                await self.send_event(callback, "progress", {
                    "source_id": self.source_id,
                    "progress": idx + 1,
                    "total": len(search_keywords),
                    "percentage": int((idx + 1) / len(search_keywords) * 100),
                    "success": self.status["success"],
                    "failed": self.status["failed"]
                })

            # 바이오 필터링 적용
            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n바이오 키워드 필터링 중... (총 {len(all_projects)}개 과제)"
            })

            filtered_projects = self._filter_bio_projects(all_projects)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"바이오 관련 과제: {len(filtered_projects)}개"
            })

            # Notice 형식으로 변환하여 DB 저장
            notices = []
            for project in filtered_projects:
                notice = {
                    'title': project['title'],
                    'link': f"https://www.ntis.go.kr/project/pjtInfo.do?pjtId={project.get('project_number', '')}",
                    'date': project.get('start_date', ''),
                    'board': f"R&D 과제 (키워드: {project.get('search_keyword', '')})",
                    'source': 'NTIS',
                    'extracted_at': datetime.now().isoformat(),
                    'raw_data': {
                        'detail': project
                    }
                }
                notices.append(notice)

            # DB에 저장 (BaseCrawler의 save_results 사용)
            self.save_results(notices, search_keywords)

            await self.send_event(callback, "log", {
                "source_id": self.source_id,
                "message": f"\n결과 저장 완료: {len(notices)}개 바이오 과제"
            })

            # 완료
            self.status["status"] = CrawlerStatus.COMPLETED
            await self.send_event(callback, "complete", {
                "source_id": self.source_id,
                "message": "NTIS API 데이터 수집이 완료되었습니다.",
                "total_collected": len(notices),
                "success": self.status["success"],
                "failed": self.status["failed"],
                "rate_limit_stats": rate_limiter.get_stats()
            })

        except ValueError as e:
            # API 키 누락 오류
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)

            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": str(e)
            })

        except Exception as e:
            self.status["status"] = CrawlerStatus.ERROR
            self.status["error_message"] = str(e)
            await self.send_event(callback, "error", {
                "source_id": self.source_id,
                "message": f"크롤링 중 오류 발생: {str(e)}"
            })
