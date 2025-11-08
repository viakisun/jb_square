"""
Bizinfo Extraction Strategy
기업마당 상세 페이지에서 정보를 추출하는 전략
"""

import re
import requests
from typing import Dict
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from src.services.rate_limiter import RateLimiter


class BizinoExtractionStrategy:
    """
    Bizinfo HTML 추출 전략

    기업마당 상세 페이지에서 메타 정보, 첨부파일, 콘텐츠를 추출합니다.
    """

    BASE_URL = 'https://www.bizinfo.go.kr'

    @staticmethod
    def extract_meta_info(soup: BeautifulSoup, detail: Dict) -> None:
        """
        Bizinfo 상세 페이지에서 메타 정보를 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # 제목 추출
            title_elem = soup.select_one('h2.title')
            if title_elem:
                detail['full_title'] = title_elem.get_text(strip=True)

            # Bizinfo uses .view_cont container with li elements
            # Each li has .s_title (field name) and .txt (field value)
            view_cont = soup.find('div', class_='view_cont')
            if not view_cont:
                return

            li_elements = view_cont.find_all('li')

            for li in li_elements:
                title_span = li.find('span', class_='s_title')
                txt_div = li.find('div', class_='txt')

                if not title_span or not txt_div:
                    continue

                field_name = title_span.get_text(strip=True)
                field_text = txt_div.get_text(strip=True)

                # 소관부처·지자체
                if re.search(r'소관부처|주관부처', field_name):
                    detail['department'] = field_text

                # 사업수행기관
                elif re.search(r'사업수행기관|담당부서', field_name):
                    detail['organization'] = field_text

                # 신청기간
                elif re.search(r'신청기간|접수기간|모집기간', field_name):
                    detail['date_range'] = field_text
                    # 기간 파싱: YYYY.MM.DD ~ YYYY.MM.DD 형식
                    period_match = re.search(
                        r'(\d{4}[./-]\d{1,2}[./-]\d{1,2})\s*[~\-]\s*(\d{4}[./-]\d{1,2}[./-]\d{1,2})',
                        field_text
                    )
                    if period_match:
                        detail['application_start_date'] = period_match.group(1).replace('.', '-').replace('/', '-')
                        detail['application_end_date'] = period_match.group(2).replace('.', '-').replace('/', '-')

                # 사업개요 (main description)
                elif re.search(r'사업개요', field_name):
                    detail['description'] = field_text

                # 신청방법
                elif re.search(r'신청.*방법|사업신청.*방법', field_name):
                    detail['application_method'] = field_text

                # 문의처
                elif re.search(r'문의처|연락처', field_name):
                    detail['contact_info'] = field_text
                    # 전화번호 패턴 찾기
                    phone_patterns = [
                        r'(0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4})',
                        r'(\d{3,4}[-\s]?\d{3,4}[-\s]?\d{4})',
                    ]
                    for pattern in phone_patterns:
                        phone_match = re.search(pattern, field_text)
                        if phone_match:
                            detail['contact_phone'] = phone_match.group(1)
                            break
                    # 이메일 패턴 찾기
                    email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', field_text)
                    if email_match:
                        detail['contact_email'] = email_match.group(1)

            # 게시일 추출 (in .top_info)
            top_info = soup.find('div', class_='top_info')
            if top_info:
                published_date_elem = top_info.find(string=re.compile(r'\d{4}\.\d{1,2}\.\d{1,2}'))
                if published_date_elem:
                    date_match = re.search(r'(\d{4}\.\d{1,2}\.\d{1,2})', published_date_elem)
                    if date_match:
                        detail['published_date'] = date_match.group(1).replace('.', '-')

        except Exception as error:
            print(f"Error extracting Bizinfo meta info: {str(error)}")

    @staticmethod
    def extract_content(soup: BeautifulSoup, detail: Dict) -> None:
        """
        Bizinfo 상세 페이지에서 본문 콘텐츠를 추출합니다.

        메타 정보 섹션(소관부처, 사업수행기관, 신청기간 등)은 제외하고
        실제 사업 내용만 추출하여 저장합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # Bizinfo uses .view_cont container with li elements
            # Each li has .s_title (field name) and .txt (field content)
            content_parts = []

            # 메타 정보 섹션 제목 목록 (이미 meta_info에서 추출되므로 제외)
            exclude_titles = [
                '소관부처·지자체',
                '소관부처',
                '주관부처',
                '사업수행기관',
                '담당부서',
                '신청기간',
                '접수기간',
                '모집기간',
                '문의처',
                '연락처',
                '담당자',
                '게시일',
                '등록일',
                '신청방법',
                '사업신청방법'
            ]

            view_cont = soup.find('div', class_='view_cont')
            if not view_cont:
                return

            li_elements = view_cont.find_all('li')
            for li in li_elements:
                title_span = li.find('span', class_='s_title')
                txt_div = li.find('div', class_='txt')

                if not title_span or not txt_div:
                    continue

                title_text = title_span.get_text(strip=True)

                # 메타 정보 섹션은 건너뛰기
                if any(excluded in title_text for excluded in exclude_titles):
                    continue

                # Get txt HTML content (preserve formatting)
                content_html = txt_div.decode_contents().strip()

                # Skip empty content
                if not content_html:
                    continue

                # Build structured HTML content
                content_parts.append(f'<div class="content-section">')
                content_parts.append(f'<h3>{title_text}</h3>')
                content_parts.append(f'<div class="content-body">{content_html}</div>')
                content_parts.append(f'</div>')

            if content_parts:
                detail['content_html'] = '\n'.join(content_parts)
                detail['content_type'] = 'html'

        except Exception as error:
            print(f"Error extracting Bizinfo content: {str(error)}")

    @staticmethod
    def extract_attachments(soup: BeautifulSoup, detail: Dict) -> None:
        """
        Bizinfo 상세 페이지에서 첨부파일 정보를 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            detail['attachments'] = []

            # Find all links with download patterns
            # Bizinfo uses /cmm/fms/getImageFile.do for file downloads
            attach_links = soup.select('a[href*="getImageFile.do"], a[href*="/cmm/fms/"], a[onclick*="download"]')

            for link in attach_links:
                href = link.get('href', '')
                onclick = link.get('onclick', '')

                # Skip javascript:void(0) and similar
                if href == '#' or href.startswith('javascript:'):
                    # Try to extract from onclick
                    if 'getImageFile.do' in onclick:
                        href_match = re.search(r"getImageFile\.do\?atchFileId=([^&'\"]+)", onclick)
                        if href_match:
                            href = f"/cmm/fms/getImageFile.do?atchFileId={href_match.group(1)}&fileSn=0"
                        else:
                            continue
                    else:
                        continue

                if not href:
                    continue

                # Get filename from link text
                filename = link.get_text(strip=True)

                # Clean filename (remove download/preview buttons)
                filename = filename.replace('다운로드', '').replace('미리보기', '').replace('바로보기', '').strip()

                # Skip if filename is too short or looks like a button
                if not filename or len(filename) < 3 or filename in ['다운', '보기', '미리보기', '다운로드']:
                    # Try to find filename in nearby elements
                    parent = link.find_parent('li') or link.find_parent('div')
                    if parent:
                        # Look for text nodes in parent
                        text_content = parent.get_text(strip=True)
                        # Remove button texts
                        text_content = text_content.replace('다운로드', '').replace('미리보기', '').replace('바로보기', '').strip()
                        if text_content and len(text_content) >= 3:
                            filename = text_content
                        else:
                            continue
                    else:
                        continue

                # Convert relative URL to absolute
                file_url = urljoin(BizinoExtractionStrategy.BASE_URL, href)

                if filename and file_url:
                    detail['attachments'].append({
                        'filename': filename,
                        'url': file_url
                    })

        except Exception as error:
            print(f"Error extracting Bizinfo attachments: {str(error)}")

    @staticmethod
    def extract_contact_info(soup: BeautifulSoup, detail: Dict) -> None:
        """
        Bizinfo 상세 페이지에서 연락처 정보를 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # 연락처 섹션 찾기
            contact_elem = soup.find(string=re.compile(r'문의처|연락처|담당자'))
            if contact_elem:
                parent = contact_elem.find_parent()
                if parent:
                    contact_text = parent.get_text()

                    # 전화번호 패턴 찾기 (다양한 형식 지원)
                    phone_patterns = [
                        r'(0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4})',  # 02-1234-5678, 031-123-4567
                        r'(\d{3,4}[-\s]?\d{3,4}[-\s]?\d{4})',   # 02-123-4567, 070-4205-8875
                    ]

                    for pattern in phone_patterns:
                        phone_match = re.search(pattern, contact_text)
                        if phone_match:
                            detail['contact_phone'] = phone_match.group(1)
                            break

                    # 이메일 패턴 찾기
                    email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', contact_text)
                    if email_match:
                        detail['contact_email'] = email_match.group(1)

        except Exception as error:
            print(f"Error extracting Bizinfo contact info: {str(error)}")

    @staticmethod
    def extract_application_details(soup: BeautifulSoup, detail: Dict) -> None:
        """
        Bizinfo 상세 페이지에서 신청 관련 정보를 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            # 신청기간 찾기
            period_elem = soup.find(string=re.compile(r'신청기간|접수기간|모집기간'))
            if period_elem:
                parent = period_elem.find_parent()
                if parent:
                    period_text = parent.get_text(strip=True)

                    # 기간 파싱: YYYY.MM.DD ~ YYYY.MM.DD 형식
                    period_match = re.search(
                        r'(\d{4}[./-]\d{1,2}[./-]\d{1,2})\s*[~\-]\s*(\d{4}[./-]\d{1,2}[./-]\d{1,2})',
                        period_text
                    )

                    if period_match:
                        start_date = period_match.group(1).replace('.', '-').replace('/', '-')
                        end_date = period_match.group(2).replace('.', '-').replace('/', '-')

                        detail['application_start_date'] = start_date
                        detail['application_end_date'] = end_date
                        detail['date_range'] = f"{start_date} ~ {end_date}"

            # 신청방법 찾기
            method_elem = soup.find(string=re.compile(r'신청방법'))
            if method_elem:
                parent = method_elem.find_parent()
                if parent:
                    method_text = parent.get_text(strip=True)
                    method_text = method_text.replace('신청방법', '').strip()
                    if method_text and ':' in method_text:
                        detail['application_method'] = method_text.split(':', 1)[1].strip()
                    elif method_text:
                        detail['application_method'] = method_text

            # 신청링크/URL 찾기
            app_link = soup.select_one('a[href*="apply"], a[href*="신청"]')
            if app_link:
                href = app_link.get('href', '')
                if href:
                    detail['application_url'] = urljoin(BizinoExtractionStrategy.BASE_URL, href)

        except Exception as error:
            print(f"Error extracting Bizinfo application details: {str(error)}")

    @staticmethod
    def extract_tags(soup: BeautifulSoup, detail: Dict) -> None:
        """
        Bizinfo 상세 페이지에서 태그/해시태그를 추출합니다.

        Args:
            soup: BeautifulSoup 객체
            detail: 추출된 정보를 저장할 딕셔너리
        """
        try:
            tags = []

            # Bizinfo uses .tag_list or .tag_ul_list for hashtags
            tag_elems = soup.select('.tag_list li, .tag_list a, .tag_ul_list li, .tag_ul_list a, a[href*="#"]')

            for tag_elem in tag_elems:
                tag_text = tag_elem.get_text(strip=True)
                # Remove '#' if present
                tag_text = tag_text.lstrip('#').strip()
                # Skip empty, too short, or too long tags
                if tag_text and len(tag_text) > 1 and len(tag_text) < 50:
                    # Skip if it's a URL or navigation text
                    if not tag_text.startswith('http') and tag_text not in ['다운로드', '미리보기', '바로보기']:
                        tags.append(tag_text)

            if tags:
                detail['tags'] = list(set(tags))  # Remove duplicates

        except Exception as error:
            print(f"Error extracting Bizinfo tags: {str(error)}")

    @staticmethod
    async def fetch_detail(
        session: requests.Session,
        url: str,
        rate_limiter: RateLimiter
    ) -> Dict:
        """
        Bizinfo 상세 페이지에서 정보를 추출합니다.

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
            response = session.get(url, timeout=15)

            # 응답 상태 확인
            if response.status_code != 200:
                detail['error'] = f"HTTP {response.status_code}"
                return detail

            # Encoding 확인 (한글 깨짐 방지)
            response.encoding = response.apparent_encoding

            # HTML 파싱
            soup = BeautifulSoup(response.text, 'html.parser')

            # 모든 정보 추출
            BizinoExtractionStrategy.extract_meta_info(soup, detail)
            BizinoExtractionStrategy.extract_content(soup, detail)
            BizinoExtractionStrategy.extract_attachments(soup, detail)
            BizinoExtractionStrategy.extract_contact_info(soup, detail)
            BizinoExtractionStrategy.extract_application_details(soup, detail)
            BizinoExtractionStrategy.extract_tags(soup, detail)

        except requests.exceptions.Timeout:
            detail['error'] = "요청 시간 초과"
        except requests.exceptions.RequestException as error:
            detail['error'] = f"네트워크 오류: {str(error)}"
        except Exception as error:
            detail['error'] = f"예상치 못한 오류: {str(error)}"
            print(f"Error fetching Bizinfo detail from {url}: {str(error)}")

        return detail
