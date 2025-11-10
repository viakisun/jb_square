"""
Unified Config Repository
통합된 크롤러 설정 저장소 - 모든 설정을 crawler_config 테이블에서 로드
"""

from typing import List, Optional, Dict, Any, Tuple

from src.core.database import SessionLocal
from src.models.crawler_config import CrawlerConfig, JBTPConfig, BinetConfig, NTISConfig, BizinfoConfig


class ConfigRepository:
    """
    통합 크롤러 설정 저장소

    crawler_config 테이블에서 모든 크롤러 설정을 로드합니다.
    기존 메서드들은 하위 호환성을 위해 유지됩니다.
    """

    # ========================================================================
    # NEW: Unified Config Methods
    # ========================================================================

    @staticmethod
    def get_config(source_id: str) -> Optional[Dict[str, Any]]:
        """
        통합된 config 조회 메서드 - 모든 Adapter가 사용

        Args:
            source_id: 소스 식별자 (예: 'source:jbtp:local', 'source:news:mfds')

        Returns:
            {
                'url': str,
                'keywords': List[str],
                'date_range_days': int,
                'config_data': dict
            }
            또는 None (설정이 없거나 비활성화된 경우)
        """
        session = SessionLocal()
        try:
            config = session.query(CrawlerConfig).filter(
                CrawlerConfig.source_id == source_id,
                CrawlerConfig.enabled == True
            ).first()

            if not config:
                return None

            return {
                'url': config.url,
                'keywords': config.keywords or [],
                'date_range_days': config.date_range_days or 30,
                'config_data': config.config_data or {}
            }
        finally:
            session.close()

    @staticmethod
    def get_config_by_source_id(source_id: str) -> Optional[CrawlerConfig]:
        """
        source_id로 설정 로드 (CrawlerConfig 객체 반환)

        Args:
            source_id: 소스 식별자 (예: 'source:jbtp:local', 'source:news:mfds')

        Returns:
            CrawlerConfig 또는 None
        """
        session = SessionLocal()
        try:
            return session.query(CrawlerConfig).filter(
                CrawlerConfig.source_id == source_id,
                CrawlerConfig.enabled == True
            ).first()
        finally:
            session.close()

    @staticmethod
    def get_configs_by_type(crawler_type: str) -> List[CrawlerConfig]:
        """
        크롤러 타입으로 모든 설정 로드

        Args:
            crawler_type: 'jbtp', 'rss', 'web', 'binet' 등

        Returns:
            CrawlerConfig 리스트
        """
        session = SessionLocal()
        try:
            return session.query(CrawlerConfig).filter(
                CrawlerConfig.crawler_type == crawler_type,
                CrawlerConfig.enabled == True
            ).order_by(CrawlerConfig.id).all()
        finally:
            session.close()

    @staticmethod
    def get_url(source_id: str) -> Optional[str]:
        """특정 소스의 URL 가져오기"""
        config = ConfigRepository.get_config_by_source_id(source_id)
        return config.url if config else None

    @staticmethod
    def get_keywords(source_id: str) -> List[str]:
        """
        특정 소스의 키워드 가져오기

        Args:
            source_id: 크롤러 소스 ID

        Returns:
            키워드 리스트
        """
        config = ConfigRepository.get_config_by_source_id(source_id)
        return config.keywords if config else []

    @staticmethod
    def get_date_range_days(source_id: str) -> int:
        """
        특정 소스의 검색 기간 가져오기

        Args:
            source_id: 크롤러 소스 ID

        Returns:
            검색 기간 (일 단위), 기본값 30일
        """
        config = ConfigRepository.get_config_by_source_id(source_id)
        return config.date_range_days if config and config.date_range_days else 30

    @staticmethod
    def get_config_data(source_id: str, key: str, default=None) -> Any:
        """
        config_data에서 특정 필드 값 가져오기

        Args:
            source_id: 크롤러 소스 ID
            key: config_data 내 키
            default: 기본값

        Returns:
            config_data[key] 또는 default
        """
        config = ConfigRepository.get_config_by_source_id(source_id)
        if config and config.config_data:
            return config.config_data.get(key, default)
        return default

    # ========================================================================
    # LEGACY: Special case for BI Center
    # BI Center uses different data structure (region_name, region_code)
    # ========================================================================

    @staticmethod
    def load_binet_configs() -> List[Tuple[str, str]]:
        """
        BI Center 설정을 DB에서 로드합니다.

        Returns:
            List[(지역명, 지역코드)]
        """
        session = SessionLocal()
        try:
            unified_configs = session.query(CrawlerConfig).filter(
                CrawlerConfig.crawler_type == 'binet',
                CrawlerConfig.enabled == True
            ).all()

            return [(
                config.config_data.get('region_name', ''),
                config.config_data.get('region_code', '')
            ) for config in unified_configs]
        finally:
            session.close()

    # ========================================================================
    # REMOVED: Legacy methods
    # The following methods have been removed after migration completion:
    # - load_jbtp_configs()
    # - load_jbtp_external_configs()
    # - load_ntis_config()
    # - load_bizinfo_config()
    #
    # Use get_config(source_id) instead for all adapters
    # ========================================================================
