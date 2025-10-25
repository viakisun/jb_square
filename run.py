#!/usr/bin/env python3
"""
바이오 플랫폼 백오피스 실행 스크립트
"""

from backend.app import app
from backend.scheduler import crawler_scheduler

# 스케줄러 시작
crawler_scheduler.start()

if __name__ == '__main__':
    app.run()
