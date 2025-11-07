"""
Docker 클라이언트 모듈

이 모듈은 Docker SDK를 래핑하여 Docker 리소스 정보를 안전하게 조회합니다.
읽기 전용 작업만 수행하며, 컨테이너 조작 기능은 제공하지 않습니다.

Usage:
    client = DockerClient()
    containers = client.list_containers()
    images = client.list_images()

Security:
    - 읽기 전용 작업만 수행
    - Docker socket은 읽기 전용으로 마운트되어야 함
    - 컨테이너 생성/삭제/실행/중지 기능 없음

Author: JB Square Dev Team
Date: 2025-11-07
"""

import logging
import time
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

import docker
from docker.errors import DockerException, APIError
from docker.models.containers import Container
from docker.models.images import Image

logger = logging.getLogger(__name__)


@dataclass
class ContainerInfo:
    """컨테이너 정보

    Attributes:
        id: 컨테이너 ID (short)
        name: 컨테이너 이름
        image: 사용 중인 이미지 이름
        status: 컨테이너 상태 (running, exited, etc.)
        health: 헬스체크 상태 (healthy, unhealthy, None)
        created: 생성 시각
        started: 시작 시각
        ports: 포트 매핑 정보
        size: 컨테이너 크기 (bytes)
    """
    id: str
    name: str
    image: str
    status: str
    health: Optional[str]
    created: datetime
    started: Optional[datetime]
    ports: dict
    size: int


@dataclass
class ImageInfo:
    """이미지 정보

    Attributes:
        id: 이미지 ID (short)
        repository: 리포지토리 이름
        tag: 이미지 태그
        size: 이미지 크기 (bytes)
        created: 생성 시각
        labels: 이미지 라벨
    """
    id: str
    repository: str
    tag: str
    size: int
    created: datetime
    labels: dict


@dataclass
class DockerSystemInfo:
    """Docker 시스템 정보

    Attributes:
        images_count: 전체 이미지 개수
        containers_count: 전체 컨테이너 개수
        running_containers: 실행 중인 컨테이너 개수
        images_size: 이미지 총 크기 (bytes)
        containers_size: 컨테이너 총 크기 (bytes)
        volumes_count: 볼륨 개수
        build_cache_size: 빌드 캐시 크기 (bytes)
    """
    images_count: int
    containers_count: int
    running_containers: int
    images_size: int
    containers_size: int
    volumes_count: int
    build_cache_size: int


class DockerClientError(Exception):
    """Docker 클라이언트 관련 예외

    Docker 작업 중 발생하는 모든 예외의 기본 클래스
    """
    pass


class DockerConnectionError(DockerClientError):
    """Docker 연결 오류

    Docker 데몬에 연결할 수 없을 때 발생
    """
    pass


class DockerClient:
    """Docker 클라이언트

    Docker SDK를 사용하여 컨테이너, 이미지, 볼륨 등의 정보를 조회합니다.
    읽기 전용 작업만 수행하며, 안전성을 위해 retry 메커니즘을 제공합니다.

    Attributes:
        _client: Docker API 클라이언트
        _retry_count: 재시도 횟수
        _retry_delay: 재시도 간격 (초)

    Example:
        >>> client = DockerClient()
        >>> containers = client.list_containers(all=False)
        >>> for container in containers:
        ...     print(f"{container.name}: {container.status}")

    Note:
        Docker socket이 /var/run/docker.sock에 마운트되어 있어야 합니다.
        docker-compose.prod.yml에서 다음과 같이 설정:
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
    """

    def __init__(self, base_url: str = "unix://var/run/docker.sock", retry_count: int = 3):
        """Docker 클라이언트 초기화

        Args:
            base_url: Docker 데몬 URL (기본값: unix socket)
            retry_count: 연결 실패 시 재시도 횟수

        Raises:
            DockerConnectionError: Docker 데몬 연결 실패 시
        """
        self._retry_count = retry_count
        self._retry_delay = 1  # 초

        try:
            self._client = docker.DockerClient(base_url=base_url)
            # 연결 테스트
            self._client.ping()
            logger.info(f"Docker client connected to {base_url}")
        except DockerException as e:
            logger.error(f"Failed to connect to Docker daemon: {e}", exc_info=True)
            raise DockerConnectionError(f"Docker 데몬 연결 실패: {str(e)}")

    def _retry_operation(self, operation, *args, **kwargs):
        """작업 재시도 래퍼

        네트워크 오류 등으로 실패한 작업을 재시도합니다.

        Args:
            operation: 실행할 함수
            *args: 함수 인자
            **kwargs: 함수 키워드 인자

        Returns:
            Any: 함수 실행 결과

        Raises:
            DockerClientError: 모든 재시도 실패 시
        """
        last_error = None

        for attempt in range(self._retry_count):
            try:
                return operation(*args, **kwargs)
            except (APIError, DockerException) as e:
                last_error = e
                if attempt < self._retry_count - 1:
                    logger.warning(
                        f"Docker operation failed (attempt {attempt + 1}/{self._retry_count}): {e}"
                    )
                    time.sleep(self._retry_delay * (attempt + 1))  # Exponential backoff
                else:
                    logger.error(f"Docker operation failed after {self._retry_count} attempts: {e}")

        raise DockerClientError(f"Docker 작업 실패: {str(last_error)}")

    def list_containers(self, all: bool = True) -> List[ContainerInfo]:
        """컨테이너 목록 조회

        Docker 컨테이너 목록을 조회하여 ContainerInfo 객체 리스트로 반환합니다.

        Args:
            all: 중지된 컨테이너 포함 여부 (기본값: True)

        Returns:
            List[ContainerInfo]: 컨테이너 정보 리스트

        Raises:
            DockerClientError: 컨테이너 조회 실패 시

        Example:
            >>> client = DockerClient()
            >>> containers = client.list_containers(all=False)  # 실행 중인 컨테이너만
            >>> for c in containers:
            ...     print(f"{c.name}: {c.status} ({c.health})")
        """
        def _list():
            containers = self._client.containers.list(all=all)
            result = []

            for container in containers:
                # 컨테이너 상세 정보 조회
                attrs = container.attrs
                state = attrs.get('State', {})
                config = attrs.get('Config', {})

                # 헬스체크 상태 추출
                health_status = None
                if 'Health' in state:
                    health_status = state['Health'].get('Status')

                # 시작 시각 파싱
                started_at = state.get('StartedAt')
                started = None
                if started_at and started_at != '0001-01-01T00:00:00Z':
                    started = datetime.fromisoformat(started_at.replace('Z', '+00:00'))

                # 생성 시각 파싱
                created_at = attrs.get('Created')
                created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))

                # 컨테이너 크기 조회 (size_rw: 변경된 크기, size_rootfs: 루트 파일시스템 크기)
                size_info = container.client.api.inspect_container(container.id)
                size = size_info.get('SizeRw', 0) or 0

                container_info = ContainerInfo(
                    id=container.short_id,
                    name=container.name,
                    image=config.get('Image', 'unknown'),
                    status=state.get('Status', 'unknown'),
                    health=health_status,
                    created=created,
                    started=started,
                    ports=attrs.get('NetworkSettings', {}).get('Ports', {}),
                    size=size
                )
                result.append(container_info)

            logger.debug(f"Listed {len(result)} containers")
            return result

        return self._retry_operation(_list)

    def list_images(self) -> List[ImageInfo]:
        """이미지 목록 조회

        Docker 이미지 목록을 조회하여 ImageInfo 객체 리스트로 반환합니다.

        Returns:
            List[ImageInfo]: 이미지 정보 리스트

        Raises:
            DockerClientError: 이미지 조회 실패 시

        Example:
            >>> client = DockerClient()
            >>> images = client.list_images()
            >>> for img in images:
            ...     print(f"{img.repository}:{img.tag} - {img.size / (1024**2):.2f} MB")
        """
        def _list():
            images = self._client.images.list()
            result = []

            for image in images:
                attrs = image.attrs

                # 리포지토리와 태그 추출
                repo_tags = attrs.get('RepoTags', [])
                if not repo_tags or repo_tags[0] == '<none>:<none>':
                    repository = '<none>'
                    tag = '<none>'
                else:
                    repo_tag = repo_tags[0]
                    if ':' in repo_tag:
                        repository, tag = repo_tag.rsplit(':', 1)
                    else:
                        repository = repo_tag
                        tag = 'latest'

                # 생성 시각 파싱
                created_at = attrs.get('Created')
                created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))

                image_info = ImageInfo(
                    id=image.short_id.replace('sha256:', ''),
                    repository=repository,
                    tag=tag,
                    size=attrs.get('Size', 0),
                    created=created,
                    labels=attrs.get('Config', {}).get('Labels', {}) or {}
                )
                result.append(image_info)

            logger.debug(f"Listed {len(result)} images")
            return result

        return self._retry_operation(_list)

    def get_system_info(self) -> DockerSystemInfo:
        """Docker 시스템 정보 조회

        Docker 시스템의 전반적인 리소스 사용량을 조회합니다.

        Returns:
            DockerSystemInfo: Docker 시스템 정보

        Raises:
            DockerClientError: 시스템 정보 조회 실패 시

        Example:
            >>> client = DockerClient()
            >>> info = client.get_system_info()
            >>> print(f"Images: {info.images_count}")
            >>> print(f"Running: {info.running_containers}/{info.containers_count}")
            >>> print(f"Total size: {info.images_size / (1024**3):.2f} GB")
        """
        def _get_info():
            # docker system df 명령어와 유사한 정보 수집
            images = self._client.images.list()
            containers = self._client.containers.list(all=True)
            volumes = self._client.volumes.list()

            # 이미지 크기 계산
            images_size = sum(img.attrs.get('Size', 0) for img in images)

            # 컨테이너 크기 계산
            containers_size = 0
            running_count = 0
            for container in containers:
                if container.status == 'running':
                    running_count += 1
                size_info = container.client.api.inspect_container(container.id)
                containers_size += size_info.get('SizeRw', 0) or 0

            # 빌드 캐시 크기 조회 (API 사용)
            try:
                df_data = self._client.df()
                build_cache_size = sum(
                    cache.get('Size', 0) for cache in df_data.get('BuildCache', [])
                )
            except Exception as e:
                logger.warning(f"Failed to get build cache size: {e}")
                build_cache_size = 0

            system_info = DockerSystemInfo(
                images_count=len(images),
                containers_count=len(containers),
                running_containers=running_count,
                images_size=images_size,
                containers_size=containers_size,
                volumes_count=len(volumes),
                build_cache_size=build_cache_size
            )

            logger.debug(f"Docker system info: {system_info}")
            return system_info

        return self._retry_operation(_get_info)

    def get_container_logs(
        self,
        container_name: str,
        tail: int = 500,
        since: Optional[datetime] = None
    ) -> str:
        """컨테이너 로그 조회

        지정한 컨테이너의 로그를 조회합니다.

        Args:
            container_name: 컨테이너 이름 또는 ID
            tail: 최근 N줄만 조회 (기본값: 500)
            since: 특정 시각 이후의 로그만 조회 (선택사항)

        Returns:
            str: 로그 내용

        Raises:
            DockerClientError: 로그 조회 실패 시
            ValueError: 컨테이너를 찾을 수 없을 때

        Example:
            >>> client = DockerClient()
            >>> logs = client.get_container_logs('jb2-backend-prod', tail=100)
            >>> print(logs)
        """
        def _get_logs():
            try:
                container = self._client.containers.get(container_name)
                logs = container.logs(
                    tail=tail,
                    since=since,
                    timestamps=True
                ).decode('utf-8', errors='replace')

                logger.debug(f"Retrieved {len(logs.splitlines())} log lines from {container_name}")
                return logs

            except docker.errors.NotFound:
                raise ValueError(f"컨테이너를 찾을 수 없습니다: {container_name}")

        return self._retry_operation(_get_logs)

    def close(self) -> None:
        """Docker 클라이언트 종료

        리소스를 정리하고 연결을 종료합니다.

        Example:
            >>> client = DockerClient()
            >>> try:
            ...     containers = client.list_containers()
            ... finally:
            ...     client.close()
        """
        if self._client:
            self._client.close()
            logger.info("Docker client closed")

    def __enter__(self):
        """Context manager 진입"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager 종료"""
        self.close()
