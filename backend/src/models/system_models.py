"""
시스템 모니터링 Pydantic 모델

API 응답을 위한 Pydantic 모델을 정의합니다.
타입 안전성과 자동 검증, OpenAPI 문서 생성을 제공합니다.

Author: JB Square Dev Team
Date: 2025-11-07
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class MemoryInfoResponse(BaseModel):
    """메모리 사용량 응답 모델

    Attributes:
        total: 총 메모리 (bytes)
        used: 사용 중인 메모리 (bytes)
        available: 사용 가능한 메모리 (bytes)
        percent: 사용률 (0-100)
        free: 완전히 비어있는 메모리 (bytes)
        cached: 캐시로 사용되는 메모리 (bytes)

    Example:
        {
            "total": 2147483648,
            "used": 1073741824,
            "available": 536870912,
            "percent": 50.0,
            "free": 268435456,
            "cached": 268435456
        }
    """
    total: int = Field(..., description="총 메모리 (bytes)", gt=0)
    used: int = Field(..., description="사용 중인 메모리 (bytes)", ge=0)
    available: int = Field(..., description="사용 가능한 메모리 (bytes)", ge=0)
    percent: float = Field(..., description="사용률 (%)", ge=0, le=100)
    free: int = Field(..., description="완전히 비어있는 메모리 (bytes)", ge=0)
    cached: int = Field(..., description="캐시로 사용되는 메모리 (bytes)", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "total": 2147483648,
                "used": 1073741824,
                "available": 536870912,
                "percent": 50.0,
                "free": 268435456,
                "cached": 268435456
            }
        }


class DiskInfoResponse(BaseModel):
    """디스크 사용량 응답 모델

    Attributes:
        total: 총 디스크 크기 (bytes)
        used: 사용 중인 디스크 공간 (bytes)
        free: 사용 가능한 디스크 공간 (bytes)
        percent: 사용률 (0-100)
        mount_point: 마운트 포인트 경로
    """
    total: int = Field(..., description="총 디스크 크기 (bytes)", gt=0)
    used: int = Field(..., description="사용 중인 디스크 공간 (bytes)", ge=0)
    free: int = Field(..., description="사용 가능한 디스크 공간 (bytes)", ge=0)
    percent: float = Field(..., description="사용률 (%)", ge=0, le=100)
    mount_point: str = Field(..., description="마운트 포인트 경로")

    class Config:
        json_schema_extra = {
            "example": {
                "total": 32212254720,
                "used": 16106127360,
                "free": 16106127360,
                "percent": 50.0,
                "mount_point": "/"
            }
        }


class CPUInfoResponse(BaseModel):
    """CPU 사용량 응답 모델

    Attributes:
        percent: CPU 사용률 (0-100)
        count: CPU 코어 개수
        load_average: 시스템 로드 평균 (1분, 5분, 15분)
    """
    percent: float = Field(..., description="CPU 사용률 (%)", ge=0, le=100)
    count: int = Field(..., description="CPU 코어 개수", gt=0)
    load_average: tuple[float, float, float] = Field(..., description="로드 평균 (1분, 5분, 15분)")

    class Config:
        json_schema_extra = {
            "example": {
                "percent": 25.5,
                "count": 2,
                "load_average": [0.5, 0.6, 0.7]
            }
        }


class ContainerStatusEnum(str, Enum):
    """컨테이너 상태 열거형"""
    RUNNING = "running"
    EXITED = "exited"
    RESTARTING = "restarting"
    PAUSED = "paused"
    DEAD = "dead"
    CREATED = "created"


class HealthStatusEnum(str, Enum):
    """헬스체크 상태 열거형"""
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    STARTING = "starting"
    NONE = "none"


class ContainerInfoResponse(BaseModel):
    """컨테이너 정보 응답 모델

    Attributes:
        id: 컨테이너 ID (short)
        name: 컨테이너 이름
        image: 사용 중인 이미지
        status: 컨테이너 상태
        health: 헬스체크 상태
        created: 생성 시각
        started: 시작 시각
        size: 컨테이너 크기 (bytes)
    """
    id: str = Field(..., description="컨테이너 ID")
    name: str = Field(..., description="컨테이너 이름")
    image: str = Field(..., description="사용 중인 이미지")
    status: str = Field(..., description="컨테이너 상태")
    health: Optional[str] = Field(None, description="헬스체크 상태")
    created: datetime = Field(..., description="생성 시각")
    started: Optional[datetime] = Field(None, description="시작 시각")
    size: int = Field(..., description="컨테이너 크기 (bytes)", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "1234567890ab",
                "name": "jb2-backend-prod",
                "image": "711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square:backend-latest",
                "status": "running",
                "health": "healthy",
                "created": "2025-11-07T10:00:00Z",
                "started": "2025-11-07T10:00:05Z",
                "size": 365000
            }
        }


class ImageInfoResponse(BaseModel):
    """이미지 정보 응답 모델

    Attributes:
        id: 이미지 ID (short)
        repository: 리포지토리 이름
        tag: 이미지 태그
        size: 이미지 크기 (bytes)
        created: 생성 시각
    """
    id: str = Field(..., description="이미지 ID")
    repository: str = Field(..., description="리포지토리 이름")
    tag: str = Field(..., description="이미지 태그")
    size: int = Field(..., description="이미지 크기 (bytes)", ge=0)
    created: datetime = Field(..., description="생성 시각")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "8e5c521a33a4",
                "repository": "711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square",
                "tag": "backend-latest",
                "size": 517000000,
                "created": "2025-11-07T09:00:00Z"
            }
        }


class DockerSystemInfoResponse(BaseModel):
    """Docker 시스템 정보 응답 모델

    Attributes:
        images_count: 전체 이미지 개수
        containers_count: 전체 컨테이너 개수
        running_containers: 실행 중인 컨테이너 개수
        images_size: 이미지 총 크기 (bytes)
        containers_size: 컨테이너 총 크기 (bytes)
        volumes_count: 볼륨 개수
        build_cache_size: 빌드 캐시 크기 (bytes)
    """
    images_count: int = Field(..., description="전체 이미지 개수", ge=0)
    containers_count: int = Field(..., description="전체 컨테이너 개수", ge=0)
    running_containers: int = Field(..., description="실행 중인 컨테이너 개수", ge=0)
    images_size: int = Field(..., description="이미지 총 크기 (bytes)", ge=0)
    containers_size: int = Field(..., description="컨테이너 총 크기 (bytes)", ge=0)
    volumes_count: int = Field(..., description="볼륨 개수", ge=0)
    build_cache_size: int = Field(..., description="빌드 캐시 크기 (bytes)", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "images_count": 4,
                "containers_count": 4,
                "running_containers": 4,
                "images_size": 1747000000,
                "containers_size": 366800,
                "volumes_count": 0,
                "build_cache_size": 0
            }
        }


class SystemStatusResponse(BaseModel):
    """전체 시스템 상태 응답 모델

    모든 시스템 리소스 정보를 포함하는 종합 응답

    Attributes:
        memory: 메모리 사용량 정보
        disk: 디스크 사용량 정보
        cpu: CPU 사용량 정보
        docker: Docker 시스템 정보
        timestamp: 조회 시각
    """
    memory: MemoryInfoResponse = Field(..., description="메모리 사용량")
    disk: DiskInfoResponse = Field(..., description="디스크 사용량")
    cpu: CPUInfoResponse = Field(..., description="CPU 사용량")
    docker: DockerSystemInfoResponse = Field(..., description="Docker 시스템 정보")
    timestamp: datetime = Field(default_factory=datetime.now, description="조회 시각")

    class Config:
        json_schema_extra = {
            "example": {
                "memory": {
                    "total": 2147483648,
                    "used": 1073741824,
                    "available": 536870912,
                    "percent": 50.0,
                    "free": 268435456,
                    "cached": 268435456
                },
                "disk": {
                    "total": 32212254720,
                    "used": 16106127360,
                    "free": 16106127360,
                    "percent": 50.0,
                    "mount_point": "/"
                },
                "cpu": {
                    "percent": 25.5,
                    "count": 2,
                    "load_average": [0.5, 0.6, 0.7]
                },
                "docker": {
                    "images_count": 4,
                    "containers_count": 4,
                    "running_containers": 4,
                    "images_size": 1747000000,
                    "containers_size": 366800,
                    "volumes_count": 0,
                    "build_cache_size": 0
                },
                "timestamp": "2025-11-07T10:30:00Z"
            }
        }


class LogLineResponse(BaseModel):
    """로그 라인 응답 모델

    Attributes:
        timestamp: 로그 발생 시각
        level: 로그 레벨
        message: 로그 메시지
    """
    timestamp: Optional[datetime] = Field(None, description="로그 발생 시각")
    level: Optional[str] = Field(None, description="로그 레벨")
    message: str = Field(..., description="로그 메시지")


class LogsResponse(BaseModel):
    """로그 조회 응답 모델

    Attributes:
        container_name: 컨테이너 이름
        lines: 로그 라인 목록
        total_lines: 전체 로그 라인 수
        filtered_lines: 필터링 후 라인 수
        has_more: 더 많은 로그가 있는지 여부
    """
    container_name: str = Field(..., description="컨테이너 이름")
    lines: List[LogLineResponse] = Field(..., description="로그 라인 목록")
    total_lines: int = Field(..., description="전체 로그 라인 수", ge=0)
    filtered_lines: int = Field(..., description="필터링 후 라인 수", ge=0)
    has_more: bool = Field(..., description="더 많은 로그가 있는지 여부")

    class Config:
        json_schema_extra = {
            "example": {
                "container_name": "jb2-backend-prod",
                "lines": [
                    {
                        "timestamp": "2025-11-07T10:30:00Z",
                        "level": "INFO",
                        "message": "Application started successfully"
                    }
                ],
                "total_lines": 500,
                "filtered_lines": 1,
                "has_more": False
            }
        }
