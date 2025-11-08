"""
JBTP Extraction Strategy
JBTP 상세 페이지에서 정보를 추출하는 전략
"""

import requests
from typing import Dict, Optional
from bs4 import BeautifulSoup

from src.services.rate_limiter import RateLimiter


class JBTPExtractionStrategy:
    """
    JBTP HTML 추출 전략

    JBTP 상세 페이지에서 메타 정보, 첨부파일, 콘텐츠를 추출합니다.
    crawler_manager.py, jbtp_crawler.py, jbtp_external_crawler.py에서
    중복되던 450 lines의 코드를 단일 모듈로 통합합니다.
    """

    @staticmethod
    def extract_meta_info(bbs_view, detail: Dict) -> None:
        """
        JBTP 상세 페이지에서 메타 정보를 추출합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # 제목 추출
            title_elem = bbs_view.select_one('.bbs_vtop h4')
            if title_elem:
                detail['full_title'] = title_elem.get_text(strip=True)

            # 메타 정보 추출 (작성자, 작성일, 조회수, 상태, 마감일)
            txt_list = bbs_view.select('.bbs_vtop ul.txt_list li')
            for li in txt_list:
                strong = li.find('strong')
                span = li.find('span')

                if not strong or not span:
                    continue

                label = strong.get_text(strip=True).rstrip(':').strip()
                value = span.get_text(strip=True)

                if label == '작성자':
                    detail['writer'] = value
                elif label == '작성일':
                    detail['published_date'] = value
                elif label == '조회수':
                    # 숫자로 변환 시도 (실패 시 문자열 그대로)
                    try:
                        detail['views'] = int(value.replace(',', ''))
                    except ValueError:
                        detail['views'] = value
                elif label == '상태':
                    detail['status'] = value
                elif label == '마감일':
                    detail['deadline'] = value
                    # D-day 정보 추출
                    em = span.find('em', class_='dday')
                    if em:
                        detail['d_day'] = em.get_text(strip=True)
        except Exception as error:
            print(f"Error extracting meta info: {str(error)}")

    @staticmethod
    def extract_attachments(bbs_view, detail: Dict) -> None:
        """
        JBTP 상세 페이지에서 첨부파일 정보를 추출합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            file_dl = bbs_view.select('.bbs_filedown dl dd')
            if not file_dl:
                return

            detail['attachments'] = []
            for dd in file_dl:
                # 파일명 추출 (불필요한 텍스트 제거)
                filename = dd.get_text(strip=True)
                filename = filename.replace('미리보기', '').replace('다운로드', '').strip()

                if not filename:
                    continue

                # 다운로드 링크 추출
                download_link = dd.select_one('a.sbtn_down')
                if download_link:
                    file_url = download_link.get('href', '')

                    # 상대 URL을 절대 URL로 변환
                    if file_url and not file_url.startswith('http'):
                        file_url = 'https://www.jbtp.or.kr' + file_url

                    if file_url:
                        detail['attachments'].append({
                            'filename': filename,
                            'url': file_url
                        })
        except Exception as error:
            print(f"Error extracting attachments: {str(error)}")

    @staticmethod
    def extract_content_viewer(bbs_view, detail: Dict) -> None:
        """
        JBTP 상세 페이지에서 콘텐츠 뷰어 정보를 추출합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            content_iframe = bbs_view.select_one('.bbs_con iframe')
            if content_iframe:
                iframe_src = content_iframe.get('src', '')
                if iframe_src:
                    # 상대 URL을 절대 URL로 변환
                    if iframe_src.startswith('/'):
                        detail['content_viewer_url'] = 'https://www.jbtp.or.kr' + iframe_src
                    else:
                        detail['content_viewer_url'] = iframe_src
                    detail['content_type'] = 'pdf_viewer'
        except Exception as error:
            print(f"Error extracting content viewer: {str(error)}")

    @staticmethod
    async def fetch_detail(
        session: requests.Session,
        url: str,
        rate_limiter: RateLimiter
    ) -> Dict:
        """
        JBTP 상세 페이지에서 정보를 추출합니다.

        모든 추출 메서드를 통합하여 호출합니다.

        Args:
            session: requests.Session
            url: 상세 페이지 URL
            rate_limiter: RateLimiter 인스턴스

        Returns:
            dict: 상세 정보 (오류 발생 시 'error' 키 포함)
        """
        detail = {}

        try:
            # Rate limiting 적용 (0.5초 간격)
            rate_limiter.wait()

            # HTTP 요청
            response = session.get(url, timeout=10)

            # 응답 상태 확인
            if response.status_code != 200:
                detail['error'] = f"HTTP {response.status_code}"
                return detail

            # HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')

            # .bbs_view 영역 찾기
            bbs_view = soup.select_one('.bbs_view')
            if not bbs_view:
                detail['error'] = "bbs_view not found"
                return detail

            # 메타 정보 추출
            JBTPExtractionStrategy.extract_meta_info(bbs_view, detail)

            # 첨부파일 추출
            JBTPExtractionStrategy.extract_attachments(bbs_view, detail)

            # 콘텐츠 뷰어 추출
            JBTPExtractionStrategy.extract_content_viewer(bbs_view, detail)

        except requests.exceptions.Timeout:
            detail['error'] = "요청 시간 초과"
        except requests.exceptions.RequestException as error:
            detail['error'] = f"네트워크 오류: {str(error)}"
        except Exception as error:
            detail['error'] = f"예상치 못한 오류: {str(error)}"
            print(f"Error fetching JBTP detail from {url}: {str(error)}")

        return detail
