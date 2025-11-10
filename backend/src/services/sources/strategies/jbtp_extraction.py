"""
JBTP Extraction Strategy
JBTP 상세 페이지에서 정보를 추출하는 전략
"""

import requests
import hashlib
from typing import Dict, Optional
from bs4 import BeautifulSoup

from src.services.rate_limiter import RateLimiter
from src.core.s3_client import s3_client


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
    def extract_attachments(
        bbs_view,
        detail: Dict,
        session: Optional[requests.Session] = None,
        notice_id: Optional[int] = None
    ) -> None:
        """
        JBTP 상세 페이지에서 첨부파일 정보를 추출하고 S3에 업로드합니다.

        Args:
            bbs_view: BeautifulSoup 객체 (.bbs_view 영역)
            detail: 추출된 정보를 저장할 딕셔너리
            session: requests.Session 인스턴스 (S3 업로드를 위해 필요)
            notice_id: 공고 ID (S3 폴더 구조에 사용)
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

                    if not file_url:
                        continue

                    # S3 업로드 시도
                    s3_url = None
                    if session:
                        s3_url = JBTPExtractionStrategy._upload_attachment_to_s3(
                            session, file_url, filename, notice_id
                        )

                    # S3 업로드 성공 시 S3 URL 사용, 실패 시 원본 URL 사용
                    attachment_entry = {
                        'filename': filename,
                        'url': s3_url if s3_url else file_url,
                    }

                    # S3 업로드가 성공한 경우 원본 URL도 보관
                    if s3_url:
                        attachment_entry['original_url'] = file_url

                    detail['attachments'].append(attachment_entry)

        except Exception as error:
            print(f"Error extracting attachments: {str(error)}")

    @staticmethod
    def _upload_attachment_to_s3(
        session: requests.Session,
        file_url: str,
        filename: str,
        notice_id: Optional[int] = None
    ) -> Optional[str]:
        """
        첨부파일을 다운로드하여 S3에 업로드합니다.

        Args:
            session: requests.Session 인스턴스 (JBTP 세션 쿠키 포함)
            file_url: 다운로드할 파일의 URL
            filename: 파일명
            notice_id: 공고 ID (S3 폴더 구조에 사용)

        Returns:
            S3 URL (업로드 성공 시) 또는 None (실패 시)
        """
        try:
            # 파일 다운로드
            response = session.get(file_url, timeout=30)

            # 응답 상태 확인
            if response.status_code != 200:
                print(f"Failed to download file {filename}: HTTP {response.status_code}")
                return None

            # Content-Type 확인 (HTML 에러 페이지가 아닌지 체크)
            content_type = response.headers.get('content-type', '').lower()
            if 'text/html' in content_type:
                print(f"Received HTML instead of file for {filename}, skipping S3 upload")
                return None

            # 파일 크기 확인 (너무 작으면 에러 페이지일 가능성)
            content_length = len(response.content)
            if content_length < 100:  # 100 bytes 미만은 의심
                print(f"File {filename} too small ({content_length} bytes), might be error page")
                return None

            # S3 키 생성: notices/{notice_id}/{filename}
            # notice_id가 없으면 임시 폴더에 저장
            if notice_id:
                s3_key = f"notices/{notice_id}/{filename}"
            else:
                # 임시 해시를 사용하여 고유한 경로 생성
                file_hash = hashlib.md5(response.content).hexdigest()[:8]
                s3_key = f"notices/temp/{file_hash}/{filename}"

            # S3에 업로드
            success = s3_client.upload_file_content(
                content=response.content,
                key=s3_key,
                content_type=content_type or 'application/octet-stream'
            )

            if success:
                # S3 URL 반환
                s3_url = s3_client.get_public_url(s3_key)
                print(f"Successfully uploaded {filename} to S3: {s3_url}")
                return s3_url
            else:
                print(f"Failed to upload {filename} to S3")
                return None

        except requests.exceptions.Timeout:
            print(f"Timeout downloading {filename}")
            return None
        except requests.exceptions.RequestException as error:
            print(f"Network error downloading {filename}: {str(error)}")
            return None
        except Exception as error:
            print(f"Error uploading {filename} to S3: {str(error)}")
            return None

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
            await rate_limiter.wait()

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

            # 첨부파일 추출 (S3 업로드 포함)
            JBTPExtractionStrategy.extract_attachments(bbs_view, detail, session)

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
