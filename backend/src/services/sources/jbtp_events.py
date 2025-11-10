"""
JBTP Events Adapter
전북테크노파크 교육/행사 크롤러
"""

from .jbtp_base import JBTPBaseAdapter


class JBTPEventsAdapter(JBTPBaseAdapter):
    """
    JBTP 교육/행사 어댑터

    전북테크노파크의 교육/행사 정보를 수집합니다.
    """

    def __init__(self):
        super().__init__("source:jbtp:events")
