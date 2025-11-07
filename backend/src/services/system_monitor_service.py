"""
시스템 모니터링 서비스

이 모듈은 Infrastructure Layer의 여러 컴포넌트를 조합하여
시스템 모니터링 비즈니스 로직을 제공합니다.

시스템 리소스(CPU, 메모리, 디스크), Docker 컨테이너/이미지,
로그 등의 정보를 통합하여 제공하며, 알림 임계값 체크 기능도 포함합니다.

Usage:
    service = SystemMonitorService()
    status = await service.get_system_status()
    alerts = service.check_resource_alerts(status)

Architecture:
    이 서비스는 Clean Architecture의 Service Layer에 해당하며,
    Infrastructure Layer(docker_client, system_info_provider, log_reader)를
    조합하여 비즈니스 로직을 구현합니다.

Author: JB Square Dev Team
Date: 2025-11-07
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Optional

from ..infrastructure.docker_client import (
    DockerClient,
    DockerClientError,
    DockerConnectionError,
    ContainerInfo,
    ImageInfo,
    DockerSystemInfo
)
from ..infrastructure.log_reader import LogReader, LogResult, LogLevel
from ..infrastructure.system_info_provider import (
    SystemInfoProvider,
    MemoryInfo,
    DiskInfo,
    CPUInfo
)
from ..models.system_models import (
    SystemStatusResponse,
    MemoryInfoResponse,
    DiskInfoResponse,
    CPUInfoResponse,
    DockerSystemInfoResponse,
    ContainerInfoResponse,
    ImageInfoResponse,
    LogsResponse,
    LogLineResponse
)

logger = logging.getLogger(__name__)


class ResourceAlert:
    """리소스 알림 정보

    시스템 리소스가 임계값을 초과했을 때 발생하는 알림 정보

    Attributes:
        resource_type: 리소스 타입 (memory, disk, cpu)
        level: 알림 레벨 (warning, critical)
        current_value: 현재 값
        threshold: 임계값
        message: 알림 메시지
        timestamp: 알림 발생 시각
    """

    def __init__(
        self,
        resource_type: str,
        level: str,
        current_value: float,
        threshold: float,
        message: str
    ):
        self.resource_type = resource_type
        self.level = level
        self.current_value = current_value
        self.threshold = threshold
        self.message = message
        self.timestamp = datetime.now()

    def to_dict(self) -> dict:
        """딕셔너리로 변환

        Returns:
            dict: 알림 정보 딕셔너리
        """
        return {
            "resource_type": self.resource_type,
            "level": self.level,
            "current_value": self.current_value,
            "threshold": self.threshold,
            "message": self.message,
            "timestamp": self.timestamp.isoformat()
        }


class SystemMonitorService:
    """시스템 모니터링 서비스

    시스템 리소스 및 Docker 정보를 통합하여 제공하는 핵심 서비스입니다.
    Infrastructure Layer의 여러 컴포넌트를 조합하여 사용합니다.

    Attributes:
        _system_provider: 시스템 정보 제공자
        _log_reader: 로그 리더
        _warning_threshold: 경고 임계값 (%)
        _critical_threshold: 위험 임계값 (%)

    Example:
        >>> service = SystemMonitorService()
        >>> status = await service.get_system_status()
        >>> print(f"Memory: {status.memory.percent}%")
        >>>
        >>> alerts = service.check_resource_alerts(status)
        >>> for alert in alerts:
        ...     print(f"[{alert.level}] {alert.message}")

    Note:
        이 서비스는 비동기 메서드를 제공하여 여러 리소스 정보를
        동시에 수집할 수 있습니다 (asyncio.gather 사용).
    """

    # 기본 알림 임계값 (%)
    DEFAULT_WARNING_THRESHOLD = 80.0
    DEFAULT_CRITICAL_THRESHOLD = 90.0

    def __init__(
        self,
        warning_threshold: float = DEFAULT_WARNING_THRESHOLD,
        critical_threshold: float = DEFAULT_CRITICAL_THRESHOLD
    ):
        """시스템 모니터링 서비스 초기화

        Args:
            warning_threshold: 경고 임계값 (기본값: 80%)
            critical_threshold: 위험 임계값 (기본값: 90%)
        """
        self._system_provider = SystemInfoProvider()
        self._log_reader = LogReader()
        self._warning_threshold = warning_threshold
        self._critical_threshold = critical_threshold
        logger.info(
            f"System monitor service initialized "
            f"(warning: {warning_threshold}%, critical: {critical_threshold}%)"
        )

    def _convert_memory_info(self, memory: MemoryInfo) -> MemoryInfoResponse:
        """MemoryInfo를 MemoryInfoResponse로 변환

        Args:
            memory: Infrastructure Layer의 MemoryInfo

        Returns:
            MemoryInfoResponse: API 응답용 Pydantic 모델
        """
        return MemoryInfoResponse(
            total=memory.total,
            used=memory.used,
            available=memory.available,
            percent=memory.percent,
            free=memory.free,
            cached=memory.cached
        )

    def _convert_disk_info(self, disk: DiskInfo) -> DiskInfoResponse:
        """DiskInfo를 DiskInfoResponse로 변환

        Args:
            disk: Infrastructure Layer의 DiskInfo

        Returns:
            DiskInfoResponse: API 응답용 Pydantic 모델
        """
        return DiskInfoResponse(
            total=disk.total,
            used=disk.used,
            free=disk.free,
            percent=disk.percent,
            mount_point=disk.mount_point
        )

    def _convert_cpu_info(self, cpu: CPUInfo) -> CPUInfoResponse:
        """CPUInfo를 CPUInfoResponse로 변환

        Args:
            cpu: Infrastructure Layer의 CPUInfo

        Returns:
            CPUInfoResponse: API 응답용 Pydantic 모델
        """
        return CPUInfoResponse(
            percent=cpu.percent,
            count=cpu.count,
            load_average=cpu.load_average
        )

    def _convert_docker_system_info(
        self,
        docker_info: DockerSystemInfo
    ) -> DockerSystemInfoResponse:
        """DockerSystemInfo를 DockerSystemInfoResponse로 변환

        Args:
            docker_info: Infrastructure Layer의 DockerSystemInfo

        Returns:
            DockerSystemInfoResponse: API 응답용 Pydantic 모델
        """
        return DockerSystemInfoResponse(
            images_count=docker_info.images_count,
            containers_count=docker_info.containers_count,
            running_containers=docker_info.running_containers,
            images_size=docker_info.images_size,
            containers_size=docker_info.containers_size,
            volumes_count=docker_info.volumes_count,
            build_cache_size=docker_info.build_cache_size
        )

    def _convert_container_info(
        self,
        container: ContainerInfo
    ) -> ContainerInfoResponse:
        """ContainerInfo를 ContainerInfoResponse로 변환

        Args:
            container: Infrastructure Layer의 ContainerInfo

        Returns:
            ContainerInfoResponse: API 응답용 Pydantic 모델
        """
        return ContainerInfoResponse(
            id=container.id,
            name=container.name,
            image=container.image,
            status=container.status,
            health=container.health,
            created=container.created,
            started=container.started,
            size=container.size
        )

    def _convert_image_info(self, image: ImageInfo) -> ImageInfoResponse:
        """ImageInfo를 ImageInfoResponse로 변환

        Args:
            image: Infrastructure Layer의 ImageInfo

        Returns:
            ImageInfoResponse: API 응답용 Pydantic 모델
        """
        return ImageInfoResponse(
            id=image.id,
            repository=image.repository,
            tag=image.tag,
            size=image.size,
            created=image.created
        )

    def _convert_log_result(
        self,
        container_name: str,
        log_result: LogResult
    ) -> LogsResponse:
        """LogResult를 LogsResponse로 변환

        Args:
            container_name: 컨테이너 이름
            log_result: Infrastructure Layer의 LogResult

        Returns:
            LogsResponse: API 응답용 Pydantic 모델
        """
        lines = [
            LogLineResponse(
                timestamp=line.timestamp,
                level=line.level.value if line.level else None,
                message=line.message
            )
            for line in log_result.lines
        ]

        return LogsResponse(
            container_name=container_name,
            lines=lines,
            total_lines=log_result.total_lines,
            filtered_lines=log_result.filtered_lines,
            has_more=log_result.has_more
        )

    async def get_system_status(self) -> SystemStatusResponse:
        """전체 시스템 상태 조회

        시스템 리소스(메모리, 디스크, CPU)와 Docker 정보를
        비동기적으로 수집하여 통합 응답을 반환합니다.

        Returns:
            SystemStatusResponse: 전체 시스템 상태

        Raises:
            RuntimeError: 시스템 정보 수집 실패 시

        Example:
            >>> service = SystemMonitorService()
            >>> status = await service.get_system_status()
            >>> print(f"Memory: {status.memory.percent}%")
            >>> print(f"Disk: {status.disk.percent}%")
            >>> print(f"CPU: {status.cpu.percent}%")
            >>> print(f"Containers: {status.docker.running_containers}")

        Note:
            이 메서드는 여러 리소스 정보를 동시에 수집하기 위해
            asyncio.gather를 사용합니다. 하나의 수집 작업이 실패해도
            다른 작업은 계속 진행됩니다.
        """
        try:
            # 비동기로 모든 정보 수집
            memory_task = asyncio.to_thread(self._system_provider.get_memory_info)
            disk_task = asyncio.to_thread(self._system_provider.get_disk_info)
            cpu_task = asyncio.to_thread(self._system_provider.get_cpu_info)
            docker_task = asyncio.to_thread(self._get_docker_system_info)

            # 모든 작업 완료 대기
            memory, disk, cpu, docker_info = await asyncio.gather(
                memory_task,
                disk_task,
                cpu_task,
                docker_task,
                return_exceptions=True
            )

            # 예외 처리
            if isinstance(memory, Exception):
                logger.error(f"Failed to get memory info: {memory}")
                raise RuntimeError(f"메모리 정보 수집 실패: {str(memory)}")

            if isinstance(disk, Exception):
                logger.error(f"Failed to get disk info: {disk}")
                raise RuntimeError(f"디스크 정보 수집 실패: {str(disk)}")

            if isinstance(cpu, Exception):
                logger.error(f"Failed to get CPU info: {cpu}")
                raise RuntimeError(f"CPU 정보 수집 실패: {str(cpu)}")

            if isinstance(docker_info, Exception):
                logger.error(f"Failed to get Docker info: {docker_info}")
                raise RuntimeError(f"Docker 정보 수집 실패: {str(docker_info)}")

            # 응답 모델로 변환
            response = SystemStatusResponse(
                memory=self._convert_memory_info(memory),
                disk=self._convert_disk_info(disk),
                cpu=self._convert_cpu_info(cpu),
                docker=self._convert_docker_system_info(docker_info),
                timestamp=datetime.now()
            )

            logger.info("System status collected successfully")
            return response

        except Exception as e:
            logger.error(f"Failed to get system status: {e}", exc_info=True)
            raise RuntimeError(f"시스템 상태 조회 실패: {str(e)}")

    def _get_docker_system_info(self) -> DockerSystemInfo:
        """Docker 시스템 정보 조회 (동기 메서드)

        Returns:
            DockerSystemInfo: Docker 시스템 정보

        Raises:
            DockerClientError: Docker 정보 조회 실패 시
        """
        with DockerClient() as client:
            return client.get_system_info()

    async def get_containers(self, all: bool = True) -> List[ContainerInfoResponse]:
        """컨테이너 목록 조회

        Args:
            all: 중지된 컨테이너 포함 여부 (기본값: True)

        Returns:
            List[ContainerInfoResponse]: 컨테이너 정보 리스트

        Raises:
            RuntimeError: 컨테이너 조회 실패 시

        Example:
            >>> service = SystemMonitorService()
            >>> containers = await service.get_containers(all=False)
            >>> for c in containers:
            ...     print(f"{c.name}: {c.status} ({c.health})")
        """
        try:
            # 비동기로 컨테이너 목록 조회
            containers = await asyncio.to_thread(
                self._get_containers_sync,
                all
            )

            logger.info(f"Retrieved {len(containers)} containers")
            return containers

        except Exception as e:
            logger.error(f"Failed to get containers: {e}", exc_info=True)
            raise RuntimeError(f"컨테이너 조회 실패: {str(e)}")

    def _get_containers_sync(self, all: bool) -> List[ContainerInfoResponse]:
        """컨테이너 목록 조회 (동기 메서드)

        Args:
            all: 중지된 컨테이너 포함 여부

        Returns:
            List[ContainerInfoResponse]: 컨테이너 정보 리스트
        """
        with DockerClient() as client:
            containers = client.list_containers(all=all)
            return [self._convert_container_info(c) for c in containers]

    async def get_images(self) -> List[ImageInfoResponse]:
        """이미지 목록 조회

        Returns:
            List[ImageInfoResponse]: 이미지 정보 리스트

        Raises:
            RuntimeError: 이미지 조회 실패 시

        Example:
            >>> service = SystemMonitorService()
            >>> images = await service.get_images()
            >>> for img in images:
            ...     print(f"{img.repository}:{img.tag} - {img.size / (1024**2):.2f} MB")
        """
        try:
            # 비동기로 이미지 목록 조회
            images = await asyncio.to_thread(self._get_images_sync)

            logger.info(f"Retrieved {len(images)} images")
            return images

        except Exception as e:
            logger.error(f"Failed to get images: {e}", exc_info=True)
            raise RuntimeError(f"이미지 조회 실패: {str(e)}")

    def _get_images_sync(self) -> List[ImageInfoResponse]:
        """이미지 목록 조회 (동기 메서드)

        Returns:
            List[ImageInfoResponse]: 이미지 정보 리스트
        """
        with DockerClient() as client:
            images = client.list_images()
            return [self._convert_image_info(img) for img in images]

    async def get_container_logs(
        self,
        container_name: str,
        lines: int = 500,
        level_filter: Optional[str] = None,
        search_term: Optional[str] = None
    ) -> LogsResponse:
        """컨테이너 로그 조회

        Args:
            container_name: 컨테이너 이름
            lines: 조회할 로그 라인 수 (기본값: 500)
            level_filter: 로그 레벨 필터 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            search_term: 검색어 (선택사항)

        Returns:
            LogsResponse: 로그 응답

        Raises:
            ValueError: 잘못된 로그 레벨
            RuntimeError: 로그 조회 실패 시

        Example:
            >>> service = SystemMonitorService()
            >>> logs = await service.get_container_logs(
            ...     'jb2-backend-prod',
            ...     lines=100,
            ...     level_filter='ERROR'
            ... )
            >>> print(f"Found {logs.filtered_lines} errors")
        """
        try:
            # 로그 레벨 검증
            log_level = None
            if level_filter:
                try:
                    log_level = LogLevel(level_filter.upper())
                except ValueError:
                    raise ValueError(
                        f"Invalid log level: {level_filter}. "
                        f"Valid levels: {', '.join([l.value for l in LogLevel])}"
                    )

            # 비동기로 로그 조회
            log_result = await asyncio.to_thread(
                self._log_reader.read_container_logs,
                container_name,
                lines,
                log_level,
                search_term
            )

            response = self._convert_log_result(container_name, log_result)

            logger.info(
                f"Retrieved {response.filtered_lines} log lines from {container_name}"
            )
            return response

        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Failed to get container logs: {e}", exc_info=True)
            raise RuntimeError(f"로그 조회 실패: {str(e)}")

    def check_resource_alerts(
        self,
        status: SystemStatusResponse
    ) -> List[ResourceAlert]:
        """리소스 알림 체크

        시스템 상태를 분석하여 임계값을 초과한 리소스에 대한
        알림을 생성합니다.

        Args:
            status: 시스템 상태 정보

        Returns:
            List[ResourceAlert]: 알림 목록 (임계값 초과한 리소스만)

        Example:
            >>> service = SystemMonitorService()
            >>> status = await service.get_system_status()
            >>> alerts = service.check_resource_alerts(status)
            >>> for alert in alerts:
            ...     print(f"[{alert.level}] {alert.resource_type}: {alert.message}")

        Note:
            알림 레벨:
            - warning: warning_threshold 초과 (기본값: 80%)
            - critical: critical_threshold 초과 (기본값: 90%)
        """
        alerts = []

        # 메모리 체크
        if status.memory.percent >= self._critical_threshold:
            alerts.append(ResourceAlert(
                resource_type="memory",
                level="critical",
                current_value=status.memory.percent,
                threshold=self._critical_threshold,
                message=f"메모리 사용량이 위험 수준입니다: {status.memory.percent}%"
            ))
        elif status.memory.percent >= self._warning_threshold:
            alerts.append(ResourceAlert(
                resource_type="memory",
                level="warning",
                current_value=status.memory.percent,
                threshold=self._warning_threshold,
                message=f"메모리 사용량이 높습니다: {status.memory.percent}%"
            ))

        # 디스크 체크
        if status.disk.percent >= self._critical_threshold:
            alerts.append(ResourceAlert(
                resource_type="disk",
                level="critical",
                current_value=status.disk.percent,
                threshold=self._critical_threshold,
                message=f"디스크 사용량이 위험 수준입니다: {status.disk.percent}%"
            ))
        elif status.disk.percent >= self._warning_threshold:
            alerts.append(ResourceAlert(
                resource_type="disk",
                level="warning",
                current_value=status.disk.percent,
                threshold=self._warning_threshold,
                message=f"디스크 사용량이 높습니다: {status.disk.percent}%"
            ))

        # CPU 체크
        if status.cpu.percent >= self._critical_threshold:
            alerts.append(ResourceAlert(
                resource_type="cpu",
                level="critical",
                current_value=status.cpu.percent,
                threshold=self._critical_threshold,
                message=f"CPU 사용량이 위험 수준입니다: {status.cpu.percent}%"
            ))
        elif status.cpu.percent >= self._warning_threshold:
            alerts.append(ResourceAlert(
                resource_type="cpu",
                level="warning",
                current_value=status.cpu.percent,
                threshold=self._warning_threshold,
                message=f"CPU 사용량이 높습니다: {status.cpu.percent}%"
            ))

        logger.info(f"Resource check completed: {len(alerts)} alerts")
        return alerts

    async def get_available_containers(self) -> List[str]:
        """로그 조회 가능한 컨테이너 목록

        Returns:
            List[str]: 컨테이너 이름 목록

        Example:
            >>> service = SystemMonitorService()
            >>> containers = await service.get_available_containers()
            >>> print(containers)  # ['jb2-backend-prod', 'jb2-frontend-admin-prod', ...]
        """
        try:
            containers = await asyncio.to_thread(
                self._log_reader.get_available_containers
            )
            logger.info(f"Found {len(containers)} available containers")
            return containers
        except Exception as e:
            logger.error(f"Failed to get available containers: {e}", exc_info=True)
            return []
