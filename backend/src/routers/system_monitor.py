"""
시스템 모니터링 API 라우터

이 모듈은 시스템 모니터링 관련 REST API 엔드포인트를 정의합니다.
FastAPI의 APIRouter를 사용하여 RESTful API를 제공하며,
자동으로 OpenAPI(Swagger) 문서가 생성됩니다.

Endpoints:
    GET  /api/system/status         - 전체 시스템 상태 조회
    GET  /api/system/memory          - 메모리 상태 조회
    GET  /api/system/disk            - 디스크 상태 조회
    GET  /api/system/cpu             - CPU 상태 조회
    GET  /api/system/alerts          - 리소스 알림 조회
    GET  /api/docker/containers      - 컨테이너 목록 조회
    GET  /api/docker/images          - 이미지 목록 조회
    GET  /api/docker/system          - Docker 시스템 정보 조회
    GET  /api/logs/containers        - 로그 조회 가능한 컨테이너 목록
    GET  /api/logs/{container_name}  - 특정 컨테이너 로그 조회

Authentication:
    모든 엔드포인트는 인증이 필요합니다.
    auth_middleware에서 JWT 토큰 검증을 수행합니다.

Usage:
    from routers.system_monitor import router
    app.include_router(router)

Author: JB Square Dev Team
Date: 2025-11-07
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse

from ..models.exceptions import (
    SystemMonitorException,
    ResourceNotFoundException,
    ResourceUnavailableException,
    InvalidParameterException
)
from ..models.system_models import (
    SystemStatusResponse,
    MemoryInfoResponse,
    DiskInfoResponse,
    CPUInfoResponse,
    DockerSystemInfoResponse,
    ContainerInfoResponse,
    ImageInfoResponse,
    LogsResponse
)
from ..services.system_monitor_service import SystemMonitorService, ResourceAlert

logger = logging.getLogger(__name__)

# APIRouter 생성
router = APIRouter(
    prefix="/api",
    tags=["system-monitor"],
    responses={
        500: {
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "SYSTEM_ERROR",
                        "message": "시스템 오류가 발생했습니다"
                    }
                }
            }
        }
    }
)


def get_system_monitor_service() -> SystemMonitorService:
    """시스템 모니터링 서비스 의존성 주입

    FastAPI의 Depends를 사용하여 서비스 인스턴스를 주입합니다.
    이는 테스트 시 Mock 객체로 대체할 수 있도록 합니다.

    Returns:
        SystemMonitorService: 시스템 모니터링 서비스 인스턴스

    Example:
        @router.get("/test")
        async def test(service: SystemMonitorService = Depends(get_system_monitor_service)):
            return await service.get_system_status()
    """
    return SystemMonitorService()


@router.get(
    "/system/status",
    response_model=SystemStatusResponse,
    summary="전체 시스템 상태 조회",
    description="""
    서버의 전체 시스템 상태를 조회합니다.

    - **메모리**: 총 용량, 사용량, 사용률
    - **디스크**: 총 용량, 사용량, 사용률, 마운트 포인트
    - **CPU**: 사용률, 코어 개수, 로드 평균
    - **Docker**: 이미지/컨테이너 개수, 크기, 볼륨, 빌드 캐시

    모든 정보는 비동기적으로 수집되어 빠르게 응답합니다.
    """,
    responses={
        200: {
            "description": "시스템 상태 조회 성공",
            "model": SystemStatusResponse
        },
        503: {
            "description": "시스템 정보를 사용할 수 없음",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "RESOURCE_UNAVAILABLE",
                        "message": "Docker를 사용할 수 없습니다"
                    }
                }
            }
        }
    }
)
async def get_system_status(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> SystemStatusResponse:
    """전체 시스템 상태 조회

    서버의 메모리, 디스크, CPU, Docker 정보를 통합하여 반환합니다.

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        SystemStatusResponse: 전체 시스템 상태

    Raises:
        HTTPException: 시스템 정보 조회 실패 시
    """
    try:
        logger.info("GET /api/system/status - Fetching system status")
        status = await service.get_system_status()
        return status

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "시스템 상태 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/system/memory",
    response_model=MemoryInfoResponse,
    summary="메모리 상태 조회",
    description="서버의 메모리 사용량 정보를 조회합니다. 총 용량, 사용량, 사용률, 캐시 등의 정보를 제공합니다."
)
async def get_memory_status(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> MemoryInfoResponse:
    """메모리 상태 조회

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        MemoryInfoResponse: 메모리 상태
    """
    try:
        logger.info("GET /api/system/memory")
        status = await service.get_system_status()
        return status.memory

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "메모리 정보 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/system/disk",
    response_model=DiskInfoResponse,
    summary="디스크 상태 조회",
    description="서버의 디스크 사용량 정보를 조회합니다. 총 용량, 사용량, 사용률, 마운트 포인트 정보를 제공합니다."
)
async def get_disk_status(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> DiskInfoResponse:
    """디스크 상태 조회

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        DiskInfoResponse: 디스크 상태
    """
    try:
        logger.info("GET /api/system/disk")
        status = await service.get_system_status()
        return status.disk

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "디스크 정보 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/system/cpu",
    response_model=CPUInfoResponse,
    summary="CPU 상태 조회",
    description="서버의 CPU 사용량 정보를 조회합니다. 사용률, 코어 개수, 로드 평균(1분, 5분, 15분) 정보를 제공합니다."
)
async def get_cpu_status(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> CPUInfoResponse:
    """CPU 상태 조회

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        CPUInfoResponse: CPU 상태
    """
    try:
        logger.info("GET /api/system/cpu")
        status = await service.get_system_status()
        return status.cpu

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "CPU 정보 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/system/alerts",
    summary="리소스 알림 조회",
    description="""
    시스템 리소스 사용량을 분석하여 임계값을 초과한 경우 알림을 반환합니다.

    - **warning**: 사용률 80% 이상 (기본값)
    - **critical**: 사용률 90% 이상 (기본값)

    알림이 없으면 빈 배열을 반환합니다.
    """,
    response_model=List[dict],
    responses={
        200: {
            "description": "알림 조회 성공",
            "content": {
                "application/json": {
                    "example": [
                        {
                            "resource_type": "memory",
                            "level": "warning",
                            "current_value": 85.5,
                            "threshold": 80.0,
                            "message": "메모리 사용량이 높습니다: 85.5%",
                            "timestamp": "2025-11-07T10:30:00Z"
                        }
                    ]
                }
            }
        }
    }
)
async def get_resource_alerts(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> List[dict]:
    """리소스 알림 조회

    시스템 상태를 분석하여 임계값을 초과한 리소스 알림을 반환합니다.

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        List[dict]: 알림 목록 (임계값 초과한 리소스만)
    """
    try:
        logger.info("GET /api/system/alerts")
        status = await service.get_system_status()
        alerts = service.check_resource_alerts(status)

        return [alert.to_dict() for alert in alerts]

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "알림 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/docker/containers",
    response_model=List[ContainerInfoResponse],
    summary="컨테이너 목록 조회",
    description="""
    Docker 컨테이너 목록을 조회합니다.

    컨테이너 ID, 이름, 이미지, 상태, 헬스체크, 생성/시작 시각, 크기 등의 정보를 제공합니다.
    """,
    responses={
        200: {
            "description": "컨테이너 목록 조회 성공",
            "model": List[ContainerInfoResponse]
        },
        503: {
            "description": "Docker를 사용할 수 없음",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "RESOURCE_UNAVAILABLE",
                        "message": "Docker를 사용할 수 없습니다"
                    }
                }
            }
        }
    }
)
async def get_containers(
    all: bool = Query(
        True,
        description="중지된 컨테이너 포함 여부 (true: 전체, false: 실행 중만)"
    ),
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> List[ContainerInfoResponse]:
    """컨테이너 목록 조회

    Args:
        all: 중지된 컨테이너 포함 여부
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        List[ContainerInfoResponse]: 컨테이너 목록
    """
    try:
        logger.info(f"GET /api/docker/containers?all={all}")
        containers = await service.get_containers(all=all)
        return containers

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "컨테이너 목록 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/docker/images",
    response_model=List[ImageInfoResponse],
    summary="이미지 목록 조회",
    description="""
    Docker 이미지 목록을 조회합니다.

    이미지 ID, 리포지토리, 태그, 크기, 생성 시각 등의 정보를 제공합니다.
    """
)
async def get_images(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> List[ImageInfoResponse]:
    """이미지 목록 조회

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        List[ImageInfoResponse]: 이미지 목록
    """
    try:
        logger.info("GET /api/docker/images")
        images = await service.get_images()
        return images

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "이미지 목록 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/docker/system",
    response_model=DockerSystemInfoResponse,
    summary="Docker 시스템 정보 조회",
    description="""
    Docker 시스템의 전반적인 리소스 사용량을 조회합니다.

    - 전체 이미지/컨테이너 개수
    - 실행 중인 컨테이너 개수
    - 이미지/컨테이너 총 크기
    - 볼륨 개수
    - 빌드 캐시 크기
    """
)
async def get_docker_system_info(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> DockerSystemInfoResponse:
    """Docker 시스템 정보 조회

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        DockerSystemInfoResponse: Docker 시스템 정보
    """
    try:
        logger.info("GET /api/docker/system")
        status = await service.get_system_status()
        return status.docker

    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "Docker 시스템 정보 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/logs/containers",
    response_model=List[str],
    summary="로그 조회 가능한 컨테이너 목록",
    description="현재 실행 중인 컨테이너 중 로그 조회가 가능한 컨테이너 이름 목록을 반환합니다."
)
async def get_available_containers(
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> List[str]:
    """로그 조회 가능한 컨테이너 목록

    Args:
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        List[str]: 컨테이너 이름 목록
    """
    try:
        logger.info("GET /api/logs/containers")
        containers = await service.get_available_containers()
        return containers

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "컨테이너 목록 조회 중 오류가 발생했습니다"
            }
        )


@router.get(
    "/logs/{container_name}",
    response_model=LogsResponse,
    summary="컨테이너 로그 조회",
    description="""
    특정 컨테이너의 로그를 조회합니다.

    - **민감한 정보는 자동으로 마스킹됩니다** (비밀번호, API 키, 이메일 등)
    - 타임스탬프, 로그 레벨, 메시지를 파싱하여 제공합니다
    - 로그 레벨 및 검색어 필터링을 지원합니다
    """,
    responses={
        200: {
            "description": "로그 조회 성공",
            "model": LogsResponse
        },
        404: {
            "description": "컨테이너를 찾을 수 없음",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "RESOURCE_NOT_FOUND",
                        "message": "컨테이너를 찾을 수 없습니다: test-container"
                    }
                }
            }
        },
        400: {
            "description": "잘못된 파라미터",
            "content": {
                "application/json": {
                    "example": {
                        "error_code": "INVALID_PARAMETER",
                        "message": "잘못된 파라미터: level_filter = TRACE"
                    }
                }
            }
        }
    }
)
async def get_container_logs(
    container_name: str,
    lines: int = Query(
        500,
        ge=1,
        le=10000,
        description="조회할 로그 라인 수 (1-10000)"
    ),
    level_filter: Optional[str] = Query(
        None,
        description="로그 레벨 필터 (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    ),
    search_term: Optional[str] = Query(
        None,
        description="검색어 (대소문자 구분 없음)"
    ),
    service: SystemMonitorService = Depends(get_system_monitor_service)
) -> LogsResponse:
    """컨테이너 로그 조회

    Args:
        container_name: 컨테이너 이름
        lines: 조회할 로그 라인 수
        level_filter: 로그 레벨 필터
        search_term: 검색어
        service: 시스템 모니터링 서비스 (의존성 주입)

    Returns:
        LogsResponse: 로그 응답

    Raises:
        HTTPException: 로그 조회 실패 시
    """
    try:
        logger.info(
            f"GET /api/logs/{container_name}?"
            f"lines={lines}&level={level_filter}&search={search_term}"
        )

        logs = await service.get_container_logs(
            container_name=container_name,
            lines=lines,
            level_filter=level_filter,
            search_term=search_term
        )

        return logs

    except ValueError as e:
        # 잘못된 로그 레벨
        logger.warning(f"Invalid parameter: {e}")
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "INVALID_PARAMETER",
                "message": str(e)
            }
        )
    except SystemMonitorException as e:
        logger.error(f"System monitor error: {e}", exc_info=True)
        raise HTTPException(status_code=e.status_code, detail=e.to_dict())
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "SYSTEM_ERROR",
                "message": "로그 조회 중 오류가 발생했습니다"
            }
        )
