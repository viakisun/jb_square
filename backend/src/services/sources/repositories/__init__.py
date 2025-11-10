"""Crawler repositories package"""

from .config_repository import ConfigRepository
from .crawl_queue_repository import CrawlQueueRepository

__all__ = [
    'ConfigRepository',
    'CrawlQueueRepository',
]
