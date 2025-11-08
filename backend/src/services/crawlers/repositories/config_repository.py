"""
Config Repository
크롤러 설정 로딩을 담당하는 저장소
"""

from typing import List, Optional, Tuple

from src.core.database import SessionLocal
from src.models.crawler_config import JBTPConfig, BinetConfig, NTISConfig, BizinfoConfig


class ConfigRepository:
    """
    크롤러 설정 저장소

    모든 크롤러의 설정 로딩 로직을 중앙화합니다.
    """

    @staticmethod
    def load_jbtp_configs(config_type: str = 'notices') -> List[Tuple[str, str, List[str], int]]:
        """
        JBTP 설정을 DB에서 로드합니다.

        Args:
            config_type: 설정 타입 ('notices', 'news_events', 'external_notices')

        Returns:
            List[(게시판명, URL, 키워드, date_range_days)]
        """
        session = SessionLocal()
        try:
            configs = session.query(JBTPConfig).filter(
                JBTPConfig.config_type == config_type,
                JBTPConfig.enabled == True
            ).all()
            return [
                (
                    config.name,
                    config.board_url,
                    config.keywords or [],
                    config.date_range_days or 30
                )
                for config in configs
            ]
        finally:
            session.close()

    @staticmethod
    def load_jbtp_external_configs() -> List[Tuple[str, str, List[str], int]]:
        """
        JBTP 유관기관공고 설정을 DB에서 로드합니다.

        Returns:
            List[(게시판명, URL, 키워드, date_range_days)]
        """
        return ConfigRepository.load_jbtp_configs('external_notices')

    @staticmethod
    def load_binet_configs() -> List[Tuple[str, str]]:
        """
        BI Center 설정을 DB에서 로드합니다.

        Returns:
            List[(지역명, 지역코드)]
        """
        session = SessionLocal()
        try:
            configs = session.query(BinetConfig).filter(
                BinetConfig.enabled == True
            ).all()
            return [(config.region_name, config.region_code) for config in configs]
        finally:
            session.close()

    @staticmethod
    def load_ntis_config() -> Optional[NTISConfig]:
        """
        NTIS 설정을 DB에서 로드합니다.

        Returns:
            NTISConfig 또는 None
        """
        session = SessionLocal()
        try:
            return session.query(NTISConfig).filter(
                NTISConfig.enabled == True
            ).first()
        finally:
            session.close()

    @staticmethod
    def load_bizinfo_config() -> Optional[BizinfoConfig]:
        """
        Bizinfo 설정을 DB에서 로드합니다.

        Returns:
            BizinfoConfig 또는 None
        """
        session = SessionLocal()
        try:
            return session.query(BizinfoConfig).filter(
                BizinfoConfig.enabled == True
            ).first()
        finally:
            session.close()

    @staticmethod
    def get_keywords(source_id: str) -> List[str]:
        """
        특정 소스의 키워드를 가져옵니다.

        Args:
            source_id: 크롤러 소스 ID

        Returns:
            키워드 리스트
        """
        if source_id == 'ntis_rss':
            config = ConfigRepository.load_ntis_config()
            return config.search_keywords if config else []
        elif source_id == 'bizinfo':
            config = ConfigRepository.load_bizinfo_config()
            return config.search_keywords if config else []
        else:
            return []

    @staticmethod
    def get_date_range_days(source_id: str) -> int:
        """
        특정 소스의 검색 기간을 가져옵니다.

        Args:
            source_id: 크롤러 소스 ID

        Returns:
            검색 기간 (일 단위), 기본값 30일
        """
        if source_id == 'ntis_rss':
            config = ConfigRepository.load_ntis_config()
            return config.date_range_days if config and config.date_range_days else 30
        elif source_id == 'bizinfo':
            config = ConfigRepository.load_bizinfo_config()
            return config.date_range_days if config and config.date_range_days else 30
        else:
            return 30
