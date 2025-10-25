"""
백오피스 설정 관리
환경변수 로드 및 데이터베이스/AWS 설정
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# 프로젝트 루트에서 .env 파일 로드
BASE_DIR = Path(__file__).parent.parent
load_dotenv(BASE_DIR / '.env')

class Config:
    """애플리케이션 설정"""

    # Flask
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = ENV == 'development'
    PORT = int(os.getenv('FLASK_PORT', 5000))

    # Database
    DB_HOST = os.getenv('AWS_DB_HOST')
    DB_PORT = int(os.getenv('AWS_DB_PORT', 5432))
    DB_NAME = os.getenv('AWS_DB_NAME')
    DB_USER = os.getenv('AWS_DB_USER')
    DB_PASSWORD = os.getenv('AWS_DB_PASSWORD')

    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
    }

    # AWS S3
    AWS_REGION = os.getenv('AWS_REGION', 'ap-northeast-2')
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    S3_BUCKET_NAME = os.getenv('AWS_S3_BUCKET_NAME')
    S3_REGION = os.getenv('AWS_S3_REGION', 'ap-northeast-2')

    # Crawler paths
    CRAWLER_DIR = BASE_DIR.parent / 'crawler'

    # Admin
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@bio.kr')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')

    @staticmethod
    def validate():
        """필수 설정 검증"""
        required_vars = [
            'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
            'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'
        ]
        missing = []
        for var in required_vars:
            if not getattr(Config, var):
                missing.append(var)

        if missing:
            raise ValueError(f"Missing required configuration: {', '.join(missing)}")

        return True

# 설정 검증
Config.validate()
