"""
커스텀 예외 클래스 모듈

이 모듈은 시스템 모니터링 기능에서 사용하는 커스텀 예외 클래스를 정의합니다.
명확한 예외 계층 구조를 통해 에러 처리를 체계화하고,
클라이언트에게 적절한 HTTP 상태 코드와 에러 메시지를 제공합니다.

Exception Hierarchy:
    SystemMonitorException (기본)
    ├── ResourceNotFoundException (404)
    ├── ResourceUnavailableException (503)
    ├── InvalidParameterException (400)
    └── PermissionDeniedException (403)

Usage:
    from models.exceptions import ResourceNotFoundException

    if not container:
        raise ResourceNotFoundException(
            resource_type="container",
            resource_id=container_name
        )

Author: JB Square Dev Team
Date: 2025-11-07
"""

from typing import Optional


class SystemMonitorException(Exception):
    """시스템 모니터링 예외 기본 클래스

    모든 시스템 모니터링 관련 예외의 기본 클래스입니다.
    HTTP 상태 코드와 에러 코드를 포함하여 API 응답 생성에 사용됩니다.

    Attributes:
        message: 에러 메시지 (사용자에게 표시될 메시지)
        detail: 상세 에러 정보 (디버깅용)
        error_code: 에러 코드 (클라이언트에서 에러 타입 구분용)
        status_code: HTTP 상태 코드

    Example:
        >>> raise SystemMonitorException(
        ...     message="시스템 정보를 가져올 수 없습니다",
        ...     detail="Docker daemon connection failed",
        ...     error_code="SYSTEM_UNAVAILABLE"
        ... )
    """

    def __init__(
        self,
        message: str,
        detail: Optional[str] = None,
        error_code: str = "SYSTEM_ERROR",
        status_code: int = 500
    ):
        """시스템 모니터링 예외 초기화

        Args:
            message: 에러 메시지
            detail: 상세 에러 정보 (선택사항)
            error_code: 에러 코드 (기본값: SYSTEM_ERROR)
            status_code: HTTP 상태 코드 (기본값: 500)
        """
        self.message = message
        self.detail = detail
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)

    def to_dict(self) -> dict:
        """예외 정보를 딕셔너리로 변환

        API 응답 생성을 위해 예외 정보를 딕셔너리로 변환합니다.

        Returns:
            dict: 예외 정보 딕셔너리

        Example:
            >>> try:
            ...     raise ResourceNotFoundException(
            ...         resource_type="container",
            ...         resource_id="test-container"
            ...     )
            ... except SystemMonitorException as e:
            ...     error_dict = e.to_dict()
            ...     # {"error_code": "RESOURCE_NOT_FOUND", "message": "...", ...}
        """
        result = {
            "error_code": self.error_code,
            "message": self.message
        }
        if self.detail:
            result["detail"] = self.detail
        return result


class ResourceNotFoundException(SystemMonitorException):
    """리소스를 찾을 수 없음 예외 (HTTP 404)

    요청한 리소스(컨테이너, 이미지, 로그 등)를 찾을 수 없을 때 발생합니다.

    Attributes:
        resource_type: 리소스 타입 (container, image, log 등)
        resource_id: 리소스 식별자

    Example:
        >>> raise ResourceNotFoundException(
        ...     resource_type="container",
        ...     resource_id="jb2-backend-prod"
        ... )
        # HTTP 404: 컨테이너를 찾을 수 없습니다: jb2-backend-prod
    """

    def __init__(self, resource_type: str, resource_id: str):
        """리소스 미발견 예외 초기화

        Args:
            resource_type: 리소스 타입 (container, image, log 등)
            resource_id: 리소스 식별자
        """
        self.resource_type = resource_type
        self.resource_id = resource_id

        message = f"{self._get_resource_type_ko(resource_type)}를 찾을 수 없습니다: {resource_id}"
        detail = f"Resource not found: type={resource_type}, id={resource_id}"

        super().__init__(
            message=message,
            detail=detail,
            error_code="RESOURCE_NOT_FOUND",
            status_code=404
        )

    @staticmethod
    def _get_resource_type_ko(resource_type: str) -> str:
        """리소스 타입을 한국어로 변환

        Args:
            resource_type: 영문 리소스 타입

        Returns:
            str: 한국어 리소스 타입
        """
        type_map = {
            "container": "컨테이너",
            "image": "이미지",
            "log": "로그",
            "volume": "볼륨",
            "network": "네트워크"
        }
        return type_map.get(resource_type, resource_type)


class ResourceUnavailableException(SystemMonitorException):
    """리소스를 사용할 수 없음 예외 (HTTP 503)

    리소스는 존재하지만 현재 사용할 수 없을 때 발생합니다.
    예: Docker 데몬 연결 불가, 컨테이너 중지 상태 등

    Attributes:
        resource_type: 리소스 타입
        reason: 사용 불가 이유

    Example:
        >>> raise ResourceUnavailableException(
        ...     resource_type="docker",
        ...     reason="Docker daemon is not running"
        ... )
        # HTTP 503: Docker를 사용할 수 없습니다: Docker daemon is not running
    """

    def __init__(self, resource_type: str, reason: str):
        """리소스 사용 불가 예외 초기화

        Args:
            resource_type: 리소스 타입
            reason: 사용 불가 이유
        """
        self.resource_type = resource_type
        self.reason = reason

        message = f"{self._get_resource_type_ko(resource_type)}를 사용할 수 없습니다"
        detail = f"Resource unavailable: type={resource_type}, reason={reason}"

        super().__init__(
            message=message,
            detail=detail,
            error_code="RESOURCE_UNAVAILABLE",
            status_code=503
        )

    @staticmethod
    def _get_resource_type_ko(resource_type: str) -> str:
        """리소스 타입을 한국어로 변환

        Args:
            resource_type: 영문 리소스 타입

        Returns:
            str: 한국어 리소스 타입
        """
        type_map = {
            "docker": "Docker",
            "system": "시스템",
            "network": "네트워크",
            "database": "데이터베이스"
        }
        return type_map.get(resource_type, resource_type)


class InvalidParameterException(SystemMonitorException):
    """잘못된 파라미터 예외 (HTTP 400)

    API 요청 파라미터가 유효하지 않을 때 발생합니다.

    Attributes:
        parameter_name: 파라미터 이름
        provided_value: 제공된 값
        expected_format: 기대되는 형식

    Example:
        >>> raise InvalidParameterException(
        ...     parameter_name="level_filter",
        ...     provided_value="TRACE",
        ...     expected_format="DEBUG, INFO, WARNING, ERROR, CRITICAL"
        ... )
        # HTTP 400: 잘못된 파라미터: level_filter = TRACE
    """

    def __init__(
        self,
        parameter_name: str,
        provided_value: Optional[str] = None,
        expected_format: Optional[str] = None
    ):
        """잘못된 파라미터 예외 초기화

        Args:
            parameter_name: 파라미터 이름
            provided_value: 제공된 값 (선택사항)
            expected_format: 기대되는 형식 (선택사항)
        """
        self.parameter_name = parameter_name
        self.provided_value = provided_value
        self.expected_format = expected_format

        message = f"잘못된 파라미터: {parameter_name}"
        if provided_value:
            message += f" = {provided_value}"

        detail = f"Invalid parameter: {parameter_name}"
        if provided_value:
            detail += f", provided={provided_value}"
        if expected_format:
            detail += f", expected={expected_format}"

        super().__init__(
            message=message,
            detail=detail,
            error_code="INVALID_PARAMETER",
            status_code=400
        )


class PermissionDeniedException(SystemMonitorException):
    """권한 거부 예외 (HTTP 403)

    리소스에 대한 접근 권한이 없을 때 발생합니다.

    Attributes:
        resource_type: 리소스 타입
        action: 시도한 작업

    Example:
        >>> raise PermissionDeniedException(
        ...     resource_type="container",
        ...     action="stop"
        ... )
        # HTTP 403: 컨테이너에 대한 stop 권한이 없습니다
    """

    def __init__(self, resource_type: str, action: str):
        """권한 거부 예외 초기화

        Args:
            resource_type: 리소스 타입
            action: 시도한 작업
        """
        self.resource_type = resource_type
        self.action = action

        message = f"{self._get_resource_type_ko(resource_type)}에 대한 {action} 권한이 없습니다"
        detail = f"Permission denied: resource={resource_type}, action={action}"

        super().__init__(
            message=message,
            detail=detail,
            error_code="PERMISSION_DENIED",
            status_code=403
        )

    @staticmethod
    def _get_resource_type_ko(resource_type: str) -> str:
        """리소스 타입을 한국어로 변환

        Args:
            resource_type: 영문 리소스 타입

        Returns:
            str: 한국어 리소스 타입
        """
        type_map = {
            "container": "컨테이너",
            "image": "이미지",
            "volume": "볼륨",
            "network": "네트워크",
            "system": "시스템"
        }
        return type_map.get(resource_type, resource_type)


class RateLimitExceededException(SystemMonitorException):
    """요청 제한 초과 예외 (HTTP 429)

    API 요청 횟수가 제한을 초과했을 때 발생합니다.

    Attributes:
        limit: 제한 횟수
        window: 시간 윈도우 (초)
        retry_after: 재시도 가능 시각 (초)

    Example:
        >>> raise RateLimitExceededException(
        ...     limit=100,
        ...     window=60,
        ...     retry_after=30
        ... )
        # HTTP 429: API 요청 제한을 초과했습니다. 30초 후에 다시 시도해주세요.
    """

    def __init__(self, limit: int, window: int, retry_after: int):
        """요청 제한 초과 예외 초기화

        Args:
            limit: 제한 횟수
            window: 시간 윈도우 (초)
            retry_after: 재시도 가능 시각 (초)
        """
        self.limit = limit
        self.window = window
        self.retry_after = retry_after

        message = f"API 요청 제한을 초과했습니다. {retry_after}초 후에 다시 시도해주세요."
        detail = f"Rate limit exceeded: {limit} requests per {window} seconds"

        super().__init__(
            message=message,
            detail=detail,
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=429
        )
