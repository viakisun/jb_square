"""
설정 API
크롤링 소스 관리, 사용자 권한, 시스템 설정
"""

from flask import Blueprint, jsonify, request
from backend.models import SessionLocal, Setting, User, CrawlLog
from backend.crawler_manager import CrawlerManager
from backend.scheduler import crawler_scheduler
from datetime import datetime
from werkzeug.security import generate_password_hash

bp = Blueprint('settings', __name__)

@bp.route('/crawling-sources', methods=['GET'])
def get_crawling_sources():
    """크롤링 소스 설정 조회"""
    db = SessionLocal()
    try:
        settings = db.query(Setting).filter(
            Setting.key.in_([
                'crawling_enabled', 'crawling_schedule',
                'jbtp_enabled', 'ntis_enabled', 'bizinfo_enabled',
                'ntis_search_period', 'bizinfo_max_pages'
            ])
        ).all()

        config = {s.key: s.value for s in settings}

        # 각 소스별 최근 실행 로그
        sources = ['JBTP', 'NTIS', 'BizInfo']
        for source in sources:
            last_log = db.query(CrawlLog).filter(
                CrawlLog.source == source
            ).order_by(CrawlLog.started_at.desc()).first()

            if last_log:
                config[f'{source.lower()}_last_run'] = last_log.to_dict()

        return jsonify(config)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/crawling-sources', methods=['PUT'])
def update_crawling_sources():
    """크롤링 소스 설정 변경"""
    db = SessionLocal()
    try:
        data = request.json

        # 업데이트 가능한 설정들
        allowed_keys = [
            'crawling_enabled', 'crawling_schedule',
            'jbtp_enabled', 'ntis_enabled', 'bizinfo_enabled',
            'ntis_search_period', 'bizinfo_max_pages'
        ]

        for key, value in data.items():
            if key in allowed_keys:
                setting = db.query(Setting).filter(Setting.key == key).first()
                if setting:
                    setting.value = str(value)
                    setting.updated_at = datetime.now()
                else:
                    setting = Setting(key=key, value=str(value))
                    db.add(setting)

        db.commit()

        # 스케줄 업데이트
        if 'crawling_schedule' in data:
            crawler_scheduler.update_schedule(data['crawling_schedule'])

        return jsonify({'message': 'Settings updated'})

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/crawling-sources/<source>/execute', methods=['POST'])
def execute_crawling(source):
    """특정 소스 크롤링 수동 실행"""
    try:
        manager = CrawlerManager()

        if source == 'jbtp':
            result = manager.crawl_jbtp()
        elif source == 'ntis':
            result = manager.crawl_ntis()
        elif source == 'bizinfo':
            result = manager.crawl_bizinfo()
        elif source == 'all':
            result = manager.crawl_all()
        else:
            return jsonify({'error': 'Invalid source'}), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['GET'])
def get_users():
    """사용자 목록 조회"""
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return jsonify([user.to_dict() for user in users])

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/users', methods=['POST'])
def create_user():
    """사용자 추가"""
    db = SessionLocal()
    try:
        data = request.json

        # 이메일 중복 체크
        existing = db.query(User).filter(User.email == data['email']).first()
        if existing:
            return jsonify({'error': 'Email already exists'}), 400

        user = User(
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role=data.get('role', 'editor')
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return jsonify(user.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """사용자 수정"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json

        if 'name' in data:
            user.name = data['name']
        if 'role' in data:
            user.role = data['role']
        if 'password' in data:
            user.password_hash = generate_password_hash(data['password'])

        db.commit()
        db.refresh(user)

        return jsonify(user.to_dict())

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """사용자 삭제"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        db.delete(user)
        db.commit()

        return jsonify({'message': 'User deleted'}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/system', methods=['GET'])
def get_system_settings():
    """시스템 설정 조회"""
    db = SessionLocal()
    try:
        settings = db.query(Setting).filter(
            Setting.key.in_(['email_notifications'])
        ).all()

        return jsonify({s.key: s.value for s in settings})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/system', methods=['PUT'])
def update_system_settings():
    """시스템 설정 변경"""
    db = SessionLocal()
    try:
        data = request.json

        for key, value in data.items():
            setting = db.query(Setting).filter(Setting.key == key).first()
            if setting:
                setting.value = str(value)
                setting.updated_at = datetime.now()
            else:
                setting = Setting(key=key, value=str(value))
                db.add(setting)

        db.commit()

        return jsonify({'message': 'Settings updated'})

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
