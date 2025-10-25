#!/usr/bin/env python3
"""
데이터베이스 초기화 스크립트
RDS PostgreSQL에 연결하여 테이블을 생성하고 초기 데이터를 설정합니다.
"""

import os
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

# 환경변수 로드
load_dotenv(project_root / '.env')

def create_database_if_not_exists():
    """데이터베이스가 없으면 생성"""
    try:
        # postgres 데이터베이스에 연결 (기본 DB)
        conn = psycopg2.connect(
            host=os.getenv('AWS_DB_HOST'),
            port=os.getenv('AWS_DB_PORT'),
            user=os.getenv('AWS_DB_USER'),
            password=os.getenv('AWS_DB_PASSWORD'),
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # jb2_database가 있는지 확인
        cursor.execute("SELECT 1 FROM pg_database WHERE datname='jb2_database'")
        exists = cursor.fetchone()

        if not exists:
            print("📦 Creating database 'jb2_database'...")
            cursor.execute("CREATE DATABASE jb2_database")
            print("✅ Database created successfully!")
        else:
            print("✅ Database 'jb2_database' already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

def init_tables():
    """테이블 생성"""
    try:
        # jb2_database에 연결
        conn = psycopg2.connect(
            host=os.getenv('AWS_DB_HOST'),
            port=os.getenv('AWS_DB_PORT'),
            user=os.getenv('AWS_DB_USER'),
            password=os.getenv('AWS_DB_PASSWORD'),
            database=os.getenv('AWS_DB_NAME')
        )
        cursor = conn.cursor()

        print("\n📋 Creating tables...")

        # schema.sql 파일 읽기 및 실행
        schema_path = Path(__file__).parent / 'schema.sql'
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()

        cursor.execute(schema_sql)
        conn.commit()

        print("✅ Tables created successfully!")

        # 초기 관리자 계정 생성
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@bio.kr')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')

        cursor.execute("SELECT 1 FROM users WHERE email = %s", (admin_email,))
        if not cursor.fetchone():
            print(f"\n👤 Creating admin user ({admin_email})...")
            password_hash = generate_password_hash(admin_password)
            cursor.execute(
                "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                ('관리자', admin_email, password_hash, 'admin')
            )
            conn.commit()
            print("✅ Admin user created successfully!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
        else:
            print(f"\n✅ Admin user ({admin_email}) already exists.")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def test_connection():
    """데이터베이스 연결 테스트"""
    try:
        print("\n🔍 Testing database connection...")
        conn = psycopg2.connect(
            host=os.getenv('AWS_DB_HOST'),
            port=os.getenv('AWS_DB_PORT'),
            user=os.getenv('AWS_DB_USER'),
            password=os.getenv('AWS_DB_PASSWORD'),
            database=os.getenv('AWS_DB_NAME')
        )
        cursor = conn.cursor()

        # 테이블 개수 확인
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        table_count = cursor.fetchone()[0]

        print(f"✅ Connection successful! Found {table_count} tables.")

        # 각 테이블 확인
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        print("\n📊 Tables:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"   - {table[0]}: {count} rows")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        sys.exit(1)

def main():
    print("=" * 60)
    print("바이오 플랫폼 백오피스 - 데이터베이스 초기화")
    print("=" * 60)

    # 1. 데이터베이스 생성
    create_database_if_not_exists()

    # 2. 테이블 생성
    init_tables()

    # 3. 연결 테스트
    test_connection()

    print("\n" + "=" * 60)
    print("✅ 데이터베이스 초기화 완료!")
    print("=" * 60)
    print("\n다음 단계:")
    print("  1. pip install -r requirements.txt")
    print("  2. python run.py")
    print("  3. http://localhost:5000 접속")
    print()

if __name__ == '__main__':
    main()
