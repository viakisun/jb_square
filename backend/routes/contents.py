"""
콘텐츠 관리 API
공고 목록 조회, 검수, 승인/보류/삭제, 편집
"""

from flask import Blueprint, jsonify, request
from backend.models import SessionLocal, Content
from backend.crawler_manager import CrawlerManager
from datetime import datetime
from sqlalchemy import or_, and_, func
import json

bp = Blueprint('contents', __name__)

@bp.route('', methods=['GET'])
def get_contents():
    """콘텐츠 목록 조회 (필터링, 페이지네이션)"""
    db = SessionLocal()
    try:
        # 쿼리 파라미터
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status', '')  # pending, published, hold, deleted
        source = request.args.get('source', '')  # JBTP, NTIS, BizInfo
        search = request.args.get('search', '')

        # 기본 쿼리
        query = db.query(Content)

        # 필터 적용
        if status:
            query = query.filter(Content.status == status)
        if source:
            query = query.filter(Content.source == source)
        if search:
            query = query.filter(
                or_(
                    Content.title.ilike(f'%{search}%'),
                    Content.summary.ilike(f'%{search}%')
                )
            )

        # 총 개수
        total = query.count()

        # 페이지네이션
        offset = (page - 1) * per_page
        contents = query.order_by(Content.created_at.desc()).offset(offset).limit(per_page).all()

        return jsonify({
            'contents': [c.to_dict() for c in contents],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/<int:content_id>', methods=['GET'])
def get_content(content_id):
    """콘텐츠 상세 조회"""
    db = SessionLocal()
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return jsonify({'error': 'Content not found'}), 404

        return jsonify(content.to_dict())

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/<int:content_id>', methods=['PUT'])
def update_content(content_id):
    """콘텐츠 편집 (제목, 요약, 태그, 카테고리)"""
    db = SessionLocal()
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return jsonify({'error': 'Content not found'}), 404

        data = request.json

        # 업데이트 가능 필드
        if 'title' in data:
            content.title = data['title']
        if 'summary' in data:
            content.summary = data['summary']
        if 'tags' in data:
            content.tags = json.dumps(data['tags'], ensure_ascii=False)
        if 'category' in data:
            content.category = data['category']
        if 'deadline' in data:
            from datetime import datetime as dt
            try:
                content.deadline = dt.strptime(data['deadline'], '%Y-%m-%d').date()
            except:
                pass

        content.updated_at = datetime.now()
        db.commit()

        return jsonify(content.to_dict())

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/<int:content_id>/status', methods=['PATCH'])
def update_status(content_id):
    """상태 변경 (pending → published/hold/deleted)"""
    db = SessionLocal()
    try:
        content = db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return jsonify({'error': 'Content not found'}), 404

        data = request.json
        new_status = data.get('status')

        if new_status not in ['pending', 'published', 'hold', 'deleted']:
            return jsonify({'error': 'Invalid status'}), 400

        content.status = new_status

        # 게시 시간 기록
        if new_status == 'published' and not content.published_at:
            content.published_at = datetime.now()

        content.updated_at = datetime.now()
        db.commit()

        return jsonify(content.to_dict())

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/bulk-action', methods=['POST'])
def bulk_action():
    """일괄 작업 (여러 콘텐츠 동시 처리)"""
    db = SessionLocal()
    try:
        data = request.json
        content_ids = data.get('ids', [])
        action = data.get('action')  # publish, hold, delete

        if action not in ['publish', 'hold', 'delete']:
            return jsonify({'error': 'Invalid action'}), 400

        status_map = {
            'publish': 'published',
            'hold': 'hold',
            'delete': 'deleted'
        }

        affected = db.query(Content).filter(Content.id.in_(content_ids)).update(
            {
                Content.status: status_map[action],
                Content.updated_at: datetime.now()
            },
            synchronize_session=False
        )

        db.commit()

        return jsonify({'affected': affected})

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/crawl', methods=['POST'])
def execute_crawl():
    """크롤링 실행"""
    try:
        data = request.json or {}
        source = data.get('source', 'all')  # all, jbtp, ntis, bizinfo

        manager = CrawlerManager()

        if source == 'all':
            results = manager.crawl_all()
        elif source == 'jbtp':
            results = {'jbtp': manager.crawl_jbtp()}
        elif source == 'ntis':
            results = {'ntis': manager.crawl_ntis()}
        elif source == 'bizinfo':
            results = {'bizinfo': manager.crawl_bizinfo()}
        else:
            return jsonify({'error': 'Invalid source'}), 400

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
