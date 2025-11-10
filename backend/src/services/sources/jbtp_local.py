"""
JBTP Local Adapter
전북테크노파크 사업공고 크롤러
"""

from .jbtp_base import JBTPBaseAdapter


class JBTPLocalAdapter(JBTPBaseAdapter):
    """
    JBTP 사업공고 어댑터

    전북테크노파크의 사업공고를 수집합니다.
    """

    def __init__(self):
        super().__init__("source:jbtp:local")
