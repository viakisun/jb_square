"""
시스템 정보 제공자 모듈

이 모듈은 psutil 라이브러리를 래핑하여 시스템 리소스 정보를 수집합니다.
Singleton 패턴으로 구현되어 전역에서 단일 인스턴스를 사용합니다.

Usage:
    provider = SystemInfoProvider()
    memory_info = provider.get_memory_info()
    disk_info = provider.get_disk_info()

Author: JB Square Dev Team
Date: 2025-11-07
"""

import logging
import time
from dataclasses import dataclass
from typing import Optional

import psutil

logger = logging.getLogger(__name__)


@dataclass
class MemoryInfo:
    """메모리 사용량 정보

    Attributes:
        total: 총 메모리 크기 (bytes)
        used: 사용 중인 메모리 (bytes)
        available: 사용 가능한 메모리 (bytes)
        percent: 사용률 (0-100)
        free: 완전히 비어있는 메모리 (bytes)
        cached: 캐시로 사용되는 메모리 (bytes)
    """
    total: int
    used: int
    available: int
    percent: float
    free: int
    cached: int


@dataclass
class DiskInfo:
    """디스크 사용량 정보

    Attributes:
        total: 총 디스크 크기 (bytes)
        used: 사용 중인 디스크 공간 (bytes)
        free: 사용 가능한 디스크 공간 (bytes)
        percent: 사용률 (0-100)
        mount_point: 마운트 포인트 경로
    """
    total: int
    used: int
    free: int
    percent: float
    mount_point: str


@dataclass
class CPUInfo:
    """CPU 사용량 정보

    Attributes:
        percent: CPU 사용률 (0-100)
        count: CPU 코어 개수
        load_average: 시스템 로드 평균 (1분, 5분, 15분)
    """
    percent: float
    count: int
    load_average: tuple[float, float, float]


class SystemInfoProvider:
    """시스템 정보 제공자

    psutil 라이브러리를 사용하여 시스템 리소스 정보를 수집합니다.
    캐싱 메커니즘을 통해 과도한 시스템 호출을 방지합니다.

    Singleton 패턴으로 구현되어 있어 전역에서 단일 인스턴스를 공유합니다.

    Attributes:
        _instance: Singleton 인스턴스
        _cache_ttl: 캐시 유효 시간 (초)
        _memory_cache: 메모리 정보 캐시
        _disk_cache: 디스크 정보 캐시
        _cpu_cache: CPU 정보 캐시

    Example:
        >>> provider = SystemInfoProvider()
        >>> memory = provider.get_memory_info()
        >>> print(f"Memory usage: {memory.percent}%")
    """

    _instance: Optional['SystemInfoProvider'] = None
    _cache_ttl: int = 5  # 캐시 유효 시간 (초)

    def __new__(cls) -> 'SystemInfoProvider':
        """Singleton 패턴 구현

        Returns:
            SystemInfoProvider: 싱글톤 인스턴스
        """
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_caches()
        return cls._instance

    def _init_caches(self) -> None:
        """캐시 초기화

        각 리소스 타입별로 캐시를 초기화합니다.
        캐시는 (data, timestamp) 튜플로 저장됩니다.
        """
        self._memory_cache: Optional[tuple[MemoryInfo, float]] = None
        self._disk_cache: Optional[tuple[DiskInfo, float]] = None
        self._cpu_cache: Optional[tuple[CPUInfo, float]] = None
        logger.info("System info provider caches initialized")

    def _is_cache_valid(self, cache_time: Optional[float]) -> bool:
        """캐시 유효성 검사

        Args:
            cache_time: 캐시 생성 시각 (Unix timestamp)

        Returns:
            bool: 캐시가 유효하면 True, 만료되었으면 False
        """
        if cache_time is None:
            return False
        return (time.time() - cache_time) < self._cache_ttl

    def get_memory_info(self, use_cache: bool = True) -> MemoryInfo:
        """메모리 사용량 정보 조회

        psutil을 사용하여 현재 시스템의 메모리 사용량을 조회합니다.
        캐시가 유효한 경우 캐시된 값을 반환합니다.

        Args:
            use_cache: 캐시 사용 여부 (기본값: True)

        Returns:
            MemoryInfo: 메모리 사용량 정보 객체

        Raises:
            RuntimeError: 메모리 정보 조회 실패 시

        Example:
            >>> provider = SystemInfoProvider()
            >>> memory = provider.get_memory_info()
            >>> print(f"Total: {memory.total / (1024**3):.2f} GB")
            >>> print(f"Used: {memory.used / (1024**3):.2f} GB")
            >>> print(f"Usage: {memory.percent}%")
        """
        try:
            # 캐시 확인
            if use_cache and self._memory_cache:
                data, cache_time = self._memory_cache
                if self._is_cache_valid(cache_time):
                    logger.debug("Returning cached memory info")
                    return data

            # 실제 데이터 수집
            vm = psutil.virtual_memory()

            memory_info = MemoryInfo(
                total=vm.total,
                used=vm.used,
                available=vm.available,
                percent=round(vm.percent, 2),
                free=vm.free,
                cached=getattr(vm, 'cached', 0)  # Linux에서만 사용 가능
            )

            # 캐시 업데이트
            self._memory_cache = (memory_info, time.time())

            logger.debug(f"Memory info collected: {memory_info.percent}% used")
            return memory_info

        except Exception as e:
            logger.error(f"Failed to get memory info: {e}", exc_info=True)
            raise RuntimeError(f"메모리 정보 조회 실패: {str(e)}")

    def get_disk_info(self, path: str = "/", use_cache: bool = True) -> DiskInfo:
        """디스크 사용량 정보 조회

        지정된 경로의 디스크 사용량을 조회합니다.

        Args:
            path: 조회할 디스크 경로 (기본값: "/")
            use_cache: 캐시 사용 여부 (기본값: True)

        Returns:
            DiskInfo: 디스크 사용량 정보 객체

        Raises:
            RuntimeError: 디스크 정보 조회 실패 시
            FileNotFoundError: 지정한 경로가 존재하지 않을 때

        Example:
            >>> provider = SystemInfoProvider()
            >>> disk = provider.get_disk_info("/")
            >>> print(f"Total: {disk.total / (1024**3):.2f} GB")
            >>> print(f"Used: {disk.used / (1024**3):.2f} GB")
            >>> print(f"Free: {disk.free / (1024**3):.2f} GB")
        """
        try:
            # 캐시 확인 (경로별로 별도 캐시 필요 시 확장 가능)
            if use_cache and self._disk_cache and path == "/":
                data, cache_time = self._disk_cache
                if self._is_cache_valid(cache_time):
                    logger.debug("Returning cached disk info")
                    return data

            # 실제 데이터 수집
            usage = psutil.disk_usage(path)

            disk_info = DiskInfo(
                total=usage.total,
                used=usage.used,
                free=usage.free,
                percent=round(usage.percent, 2),
                mount_point=path
            )

            # 캐시 업데이트
            if path == "/":
                self._disk_cache = (disk_info, time.time())

            logger.debug(f"Disk info collected for {path}: {disk_info.percent}% used")
            return disk_info

        except FileNotFoundError:
            logger.error(f"Path not found: {path}")
            raise
        except Exception as e:
            logger.error(f"Failed to get disk info for {path}: {e}", exc_info=True)
            raise RuntimeError(f"디스크 정보 조회 실패: {str(e)}")

    def get_cpu_info(self, interval: float = 1.0, use_cache: bool = True) -> CPUInfo:
        """CPU 사용량 정보 조회

        CPU 사용률과 로드 평균을 조회합니다.

        Args:
            interval: CPU 사용률 측정 간격 (초, 기본값: 1.0)
            use_cache: 캐시 사용 여부 (기본값: True)

        Returns:
            CPUInfo: CPU 사용량 정보 객체

        Raises:
            RuntimeError: CPU 정보 조회 실패 시

        Note:
            interval이 0이면 순간 사용률을 반환하며, 정확하지 않을 수 있습니다.
            1초 이상의 interval을 권장합니다.

        Example:
            >>> provider = SystemInfoProvider()
            >>> cpu = provider.get_cpu_info(interval=1.0)
            >>> print(f"CPU Usage: {cpu.percent}%")
            >>> print(f"CPU Cores: {cpu.count}")
            >>> print(f"Load Average: {cpu.load_average}")
        """
        try:
            # 캐시 확인
            if use_cache and self._cpu_cache:
                data, cache_time = self._cpu_cache
                if self._is_cache_valid(cache_time):
                    logger.debug("Returning cached CPU info")
                    return data

            # 실제 데이터 수집
            cpu_percent = psutil.cpu_percent(interval=interval)
            cpu_count = psutil.cpu_count(logical=True)

            # 로드 평균 (Unix 계열에서만 사용 가능)
            try:
                load_avg = psutil.getloadavg()
            except AttributeError:
                # Windows에서는 지원하지 않음
                load_avg = (0.0, 0.0, 0.0)

            cpu_info = CPUInfo(
                percent=round(cpu_percent, 2),
                count=cpu_count,
                load_average=tuple(round(x, 2) for x in load_avg)
            )

            # 캐시 업데이트
            self._cpu_cache = (cpu_info, time.time())

            logger.debug(f"CPU info collected: {cpu_info.percent}% used")
            return cpu_info

        except Exception as e:
            logger.error(f"Failed to get CPU info: {e}", exc_info=True)
            raise RuntimeError(f"CPU 정보 조회 실패: {str(e)}")

    def clear_cache(self) -> None:
        """모든 캐시 초기화

        강제로 캐시를 초기화하여 다음 조회 시 최신 데이터를 가져오도록 합니다.

        Example:
            >>> provider = SystemInfoProvider()
            >>> provider.clear_cache()
            >>> memory = provider.get_memory_info()  # 캐시 무시하고 최신 데이터 조회
        """
        self._memory_cache = None
        self._disk_cache = None
        self._cpu_cache = None
        logger.info("All system info caches cleared")
