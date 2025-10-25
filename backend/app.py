"""
바이오 플랫폼 백오피스 Flask 애플리케이션
"""

from flask import Flask, render_template, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.models import engine, Base
import os

def create_app():
    """Flask 앱 팩토리"""
    app = Flask(
        __name__,
        template_folder='../frontend/templates',
        static_folder='../frontend/static'
    )

    # 설정 로드
    app.config.from_object(Config)

    # CORS 설정
    CORS(app)

    # 데이터베이스 테이블 생성 (없으면)
    Base.metadata.create_all(bind=engine)

    # 라우트 등록
    register_routes(app)

    # 에러 핸들러
    register_error_handlers(app)

    return app

def register_routes(app):
    """라우트 등록"""

    # 메인 페이지
    @app.route('/')
    def index():
        """대시보드로 리다이렉트"""
        return render_template('dashboard.html')

    @app.route('/dashboard')
    def dashboard():
        """대시보드 페이지"""
        return render_template('dashboard.html')

    @app.route('/contents')
    def contents():
        """콘텐츠 관리 페이지"""
        return render_template('contents.html')

    @app.route('/organizations')
    def organizations():
        """기업·기관 관리 페이지"""
        return render_template('organizations.html')

    @app.route('/analytics')
    def analytics():
        """통계 리포트 페이지"""
        return render_template('analytics.html')

    @app.route('/settings')
    def settings():
        """설정 페이지"""
        return render_template('settings.html')

    # API 라우트 등록
    from backend.routes import dashboard as dashboard_api
    from backend.routes import contents as contents_api
    from backend.routes import organizations as organizations_api
    from backend.routes import analytics as analytics_api
    from backend.routes import settings as settings_api

    app.register_blueprint(dashboard_api.bp, url_prefix='/api/dashboard')
    app.register_blueprint(contents_api.bp, url_prefix='/api/contents')
    app.register_blueprint(organizations_api.bp, url_prefix='/api/organizations')
    app.register_blueprint(analytics_api.bp, url_prefix='/api/analytics')
    app.register_blueprint(settings_api.bp, url_prefix='/api/settings')

def register_error_handlers(app):
    """에러 핸들러 등록"""

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

# 앱 생성
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("바이오 플랫폼 백오피스 서버 시작")
    print("=" * 60)
    print(f"URL: http://localhost:{Config.PORT}")
    print(f"환경: {Config.ENV}")
    print("=" * 60)

    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=Config.DEBUG
    )
