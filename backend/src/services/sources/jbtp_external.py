"""
JBTP External Adapter
JBTP 유관기관공고 크롤러
"""

from .jbtp_base import JBTPBaseAdapter


class JBTPExternalAdapter(JBTPBaseAdapter):
    """
    JBTP 유관기관공고 어댑터

    JBTP 웹사이트의 유관기관공고 게시판에서 공고를 수집합니다.
    """

    def __init__(self):
        super().__init__("source:jbtp:external")
