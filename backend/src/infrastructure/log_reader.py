"""
로그 리더 모듈

이 모듈은 Docker 컨테이너 로그를 안전하게 읽고 필터링하는 기능을 제공합니다.
민감한 정보를 자동으로 마스킹하고, 대용량 로그를 효율적으로 처리합니다.

Usage:
    reader = LogReader()
    logs = reader.read_container_logs('jb2-backend-prod', lines=500)
    filtered = reader.filter_sensitive_data(logs)

Security:
    - 비밀번호, API 키 등 민감한 정보 자동 마스킹
    - 로그 크기 제한으로 메모리 과부하 방지
    - 읽기 전용 작업만 수행

Author: JB Square Dev Team
Date: 2025-11-07
"""

import logging
import re
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import List, Optional, Pattern

logger = logging.getLogger(__name__)


class LogLevel(Enum):
    """로그 레벨 열거형

    Attributes:
        DEBUG: 디버그 레벨
        INFO: 정보 레벨
        WARNING: 경고 레벨
        ERROR: 에러 레벨
        CRITICAL: 치명적 에러 레벨
    """
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


@dataclass
class LogLine:
    """로그 라인 정보

    Attributes:
        timestamp: 로그 발생 시각
        level: 로그 레벨
        message: 로그 메시지
        raw: 원본 로그 라인
    """
    timestamp: Optional[datetime]
    level: Optional[LogLevel]
    message: str
    raw: str


@dataclass
class LogResult:
    """로그 조회 결과

    Attributes:
        lines: 로그 라인 목록
        total_lines: 전체 로그 라인 수
        filtered_lines: 필터링 후 라인 수
        has_more: 더 많은 로그가 있는지 여부
    """
    lines: List[LogLine]
    total_lines: int
    filtered_lines: int
    has_more: bool


class LogReader:
    """로그 리더

    Docker 컨테이너 로그를 읽고 처리하는 기능을 제공합니다.
    민감한 정보를 자동으로 마스킹하고, 대용량 로그를 효율적으로 처리합니다.

    Attributes:
        _sensitive_patterns: 민감한 정보 패턴 목록
        _max_line_length: 최대 라인 길이 (bytes)
        _max_total_size: 최대 총 크기 (bytes)

    Example:
        >>> reader = LogReader()
        >>> result = reader.read_container_logs('jb2-backend-prod', lines=100)
        >>> for line in result.lines:
        ...     print(f"[{line.level}] {line.message}")

    Note:
        - 로그는 Docker API를 통해 조회됩니다
        - 민감한 정보는 자동으로 마스킹됩니다
        - 대용량 로그는 페이징 처리가 필요합니다
    """

    # 민감한 정보 패턴 정의
    SENSITIVE_PATTERNS: List[tuple[Pattern, str]] = [
        # 비밀번호 패턴
        (re.compile(r'password["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'password=***'),
        (re.compile(r'passwd["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'passwd=***'),
        (re.compile(r'pwd["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'pwd=***'),

        # API 키 패턴
        (re.compile(r'api[_-]?key["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'api_key=***'),
        (re.compile(r'apikey["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'apikey=***'),
        (re.compile(r'access[_-]?key["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'access_key=***'),

        # 시크릿 키 패턴
        (re.compile(r'secret[_-]?key["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'secret_key=***'),
        (re.compile(r'private[_-]?key["\s:=]+["\']?([^\s"\']+)["\']?', re.IGNORECASE), 'private_key=***'),

        # 토큰 패턴
        (re.compile(r'token["\s:=]+["\']?([^\s"\']{20,})["\']?', re.IGNORECASE), 'token=***'),
        (re.compile(r'bearer\s+([^\s]{20,})', re.IGNORECASE), 'bearer ***'),

        # 이메일 패턴
        (re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'), '***@***.***'),

        # AWS 키 패턴
        (re.compile(r'AKIA[0-9A-Z]{16}'), 'AKIA***'),

        # JWT 토큰 패턴
        (re.compile(r'eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+'), 'jwt_token_***'),
    ]

    def __init__(
        self,
        max_line_length: int = 10000,
        max_total_size: int = 10 * 1024 * 1024  # 10MB
    ):
        """로그 리더 초기화

        Args:
            max_line_length: 최대 라인 길이 (bytes, 기본값: 10000)
            max_total_size: 최대 총 크기 (bytes, 기본값: 10MB)
        """
        self._max_line_length = max_line_length
        self._max_total_size = max_total_size
        self._sensitive_patterns = self.SENSITIVE_PATTERNS
        logger.info("Log reader initialized")

    def filter_sensitive_data(self, text: str) -> str:
        """민감한 정보 필터링

        로그 텍스트에서 민감한 정보를 찾아 마스킹합니다.

        Args:
            text: 필터링할 텍스트

        Returns:
            str: 필터링된 텍스트

        Example:
            >>> reader = LogReader()
            >>> log = "User password=secret123 logged in"
            >>> filtered = reader.filter_sensitive_data(log)
            >>> print(filtered)  # "User password=*** logged in"
        """
        filtered = text

        for pattern, replacement in self._sensitive_patterns:
            filtered = pattern.sub(replacement, filtered)

        return filtered

    def parse_log_line(self, line: str) -> LogLine:
        """로그 라인 파싱

        로그 라인을 파싱하여 타임스탬프, 레벨, 메시지를 추출합니다.

        Args:
            line: 파싱할 로그 라인

        Returns:
            LogLine: 파싱된 로그 라인 객체

        Note:
            지원하는 로그 포맷:
            - ISO 8601: 2025-11-07T10:30:15.123456+00:00
            - Docker timestamp: 2025-11-07T10:30:15.123456789Z
            - Python logging: 2025-11-07 10:30:15,123

        Example:
            >>> reader = LogReader()
            >>> line = "2025-11-07T10:30:15Z INFO Starting application"
            >>> parsed = reader.parse_log_line(line)
            >>> print(parsed.level)  # LogLevel.INFO
        """
        # 타임스탬프 추출 시도
        timestamp = None
        timestamp_patterns = [
            # ISO 8601 / Docker format
            (r'^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)', '%Y-%m-%dT%H:%M:%S'),
            # Python logging format
            (r'^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:,\d+)?)', '%Y-%m-%d %H:%M:%S'),
        ]

        for pattern, date_format in timestamp_patterns:
            match = re.match(pattern, line)
            if match:
                timestamp_str = match.group(1)
                try:
                    # 마이크로초 및 타임존 처리
                    if 'T' in timestamp_str:
                        timestamp_str = timestamp_str.replace('Z', '+00:00')
                        # 나노초 제거 (Python은 마이크로초까지만 지원)
                        if '.' in timestamp_str:
                            parts = timestamp_str.split('.')
                            microseconds = parts[1][:6]  # 첫 6자리만 (마이크로초)
                            timestamp_str = f"{parts[0]}.{microseconds}{parts[1][6:]}"
                        timestamp = datetime.fromisoformat(timestamp_str)
                    else:
                        timestamp_str = timestamp_str.split(',')[0]  # 밀리초 제거
                        timestamp = datetime.strptime(timestamp_str, date_format)
                except ValueError as e:
                    logger.debug(f"Failed to parse timestamp: {e}")
                break

        # 로그 레벨 추출
        level = None
        level_pattern = r'\b(DEBUG|INFO|WARNING|ERROR|CRITICAL)\b'
        level_match = re.search(level_pattern, line, re.IGNORECASE)
        if level_match:
            try:
                level = LogLevel(level_match.group(1).upper())
            except ValueError:
                pass

        # 메시지 추출 (타임스탬프 제거)
        message = line
        if timestamp:
            # 타임스탬프 부분 제거
            message = re.sub(r'^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^\s]*\s*', '', line)

        # 민감한 정보 필터링
        message = self.filter_sensitive_data(message)

        return LogLine(
            timestamp=timestamp,
            level=level,
            message=message.strip(),
            raw=line
        )

    def read_container_logs(
        self,
        container_name: str,
        lines: int = 500,
        level_filter: Optional[LogLevel] = None,
        search_term: Optional[str] = None
    ) -> LogResult:
        """컨테이너 로그 읽기

        Docker 컨테이너의 로그를 읽어 파싱합니다.

        Args:
            container_name: 컨테이너 이름 또는 ID
            lines: 읽을 로그 라인 수 (기본값: 500)
            level_filter: 로그 레벨 필터 (선택사항)
            search_term: 검색어 (선택사항)

        Returns:
            LogResult: 로그 조회 결과

        Raises:
            ValueError: 컨테이너를 찾을 수 없을 때
            RuntimeError: 로그 읽기 실패 시

        Example:
            >>> reader = LogReader()
            >>> result = reader.read_container_logs(
            ...     'jb2-backend-prod',
            ...     lines=100,
            ...     level_filter=LogLevel.ERROR
            ... )
            >>> print(f"Found {result.filtered_lines} errors")

        Note:
            이 메서드는 DockerClient를 내부적으로 사용합니다.
            Service Layer에서 의존성 주입을 통해 호출하는 것을 권장합니다.
        """
        from .docker_client import DockerClient, DockerClientError

        try:
            with DockerClient() as docker_client:
                # Docker 로그 조회
                raw_logs = docker_client.get_container_logs(
                    container_name=container_name,
                    tail=lines
                )

                # 로그 파싱
                log_lines = []
                total_lines = 0

                for line in raw_logs.splitlines():
                    total_lines += 1

                    # 라인 길이 제한
                    if len(line) > self._max_line_length:
                        line = line[:self._max_line_length] + '... (truncated)'

                    # 파싱
                    parsed_line = self.parse_log_line(line)

                    # 레벨 필터링
                    if level_filter and parsed_line.level != level_filter:
                        continue

                    # 검색어 필터링
                    if search_term and search_term.lower() not in parsed_line.message.lower():
                        continue

                    log_lines.append(parsed_line)

                    # 총 크기 제한
                    if sum(len(l.message) for l in log_lines) > self._max_total_size:
                        break

                result = LogResult(
                    lines=log_lines,
                    total_lines=total_lines,
                    filtered_lines=len(log_lines),
                    has_more=total_lines > lines
                )

                logger.info(
                    f"Read {result.filtered_lines} lines from {container_name} "
                    f"(total: {result.total_lines})"
                )
                return result

        except DockerClientError as e:
            logger.error(f"Failed to read container logs: {e}", exc_info=True)
            raise RuntimeError(f"로그 읽기 실패: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error reading logs: {e}", exc_info=True)
            raise RuntimeError(f"예상치 못한 오류: {str(e)}")

    def get_available_containers(self) -> List[str]:
        """로그 조회 가능한 컨테이너 목록

        현재 실행 중인 컨테이너 중 로그 조회가 가능한 목록을 반환합니다.

        Returns:
            List[str]: 컨테이너 이름 목록

        Example:
            >>> reader = LogReader()
            >>> containers = reader.get_available_containers()
            >>> print(containers)  # ['jb2-backend-prod', 'jb2-frontend-admin-prod', ...]
        """
        from .docker_client import DockerClient, DockerClientError

        try:
            with DockerClient() as docker_client:
                containers = docker_client.list_containers(all=False)
                return [c.name for c in containers]
        except DockerClientError as e:
            logger.error(f"Failed to get container list: {e}")
            return []

    def export_logs(
        self,
        container_name: str,
        output_path: Path,
        lines: int = 1000
    ) -> None:
        """로그 파일로 내보내기

        컨테이너 로그를 파일로 내보냅니다.

        Args:
            container_name: 컨테이너 이름
            output_path: 출력 파일 경로
            lines: 내보낼 로그 라인 수 (기본값: 1000)

        Raises:
            RuntimeError: 로그 내보내기 실패 시

        Example:
            >>> reader = LogReader()
            >>> reader.export_logs('jb2-backend-prod', Path('/tmp/backend.log'))

        Note:
            출력 파일은 UTF-8 인코딩으로 저장됩니다.
        """
        try:
            result = self.read_container_logs(container_name, lines=lines)

            with open(output_path, 'w', encoding='utf-8') as f:
                for line in result.lines:
                    timestamp_str = line.timestamp.isoformat() if line.timestamp else 'N/A'
                    level_str = line.level.value if line.level else 'N/A'
                    f.write(f"[{timestamp_str}] [{level_str}] {line.message}\n")

            logger.info(f"Exported {result.filtered_lines} lines to {output_path}")

        except Exception as e:
            logger.error(f"Failed to export logs: {e}", exc_info=True)
            raise RuntimeError(f"로그 내보내기 실패: {str(e)}")
