"""
대시보드 API
오늘 수집/게시 건수, 마감 임박 공고, 최근 업데이트 기업
"""

from flask import Blueprint, jsonify
from backend.models import SessionLocal, Content, Organization, CrawlLog
from datetime import datetime, timedelta
from sqlalchemy import func, and_

bp = Blueprint('dashboard', __name__)

@bp.route('/summary', methods=['GET'])
def get_summary():
    """대시보드 요약 통계"""
    db = SessionLocal()
    try:
        today = datetime.now().date()

        # 오늘 수집된 건수
        today_collected = db.query(func.count(Content.id)).filter(
            func.date(Content.crawled_at) == today
        ).scalar() or 0

        # 검수 대기 건수
        pending_count = db.query(func.count(Content.id)).filter(
            Content.status == 'pending'
        ).scalar() or 0

        # 오늘 게시된 건수
        today_published = db.query(func.count(Content.id)).filter(
            func.date(Content.published_at) == today
        ).scalar() or 0

        # 이번 주 통계
        week_ago = today - timedelta(days=7)
        week_collected = db.query(func.count(Content.id)).filter(
            func.date(Content.crawled_at) >= week_ago
        ).scalar() or 0

        week_published = db.query(func.count(Content.id)).filter(
            and_(
                func.date(Content.published_at) >= week_ago,
                Content.status == 'published'
            )
        ).scalar() or 0

        approval_rate = round((week_published / week_collected * 100) if week_collected > 0 else 0, 1)

        return jsonify({
            'today': {
                'collected': today_collected,
                'pending': pending_count,
                'published': today_published
            },
            'week': {
                'collected': week_collected,
                'published': week_published,
                'approval_rate': approval_rate
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/urgent-notices', methods=['GET'])
def get_urgent_notices():
    """마감 임박 공고 (D-7 이내)"""
    db = SessionLocal()
    try:
        today = datetime.now().date()
        deadline = today + timedelta(days=7)

        notices = db.query(Content).filter(
            and_(
                Content.deadline.isnot(None),
                Content.deadline >= today,
                Content.deadline <= deadline,
                Content.status.in_(['pending', 'published'])
            )
        ).order_by(Content.deadline.asc()).limit(10).all()

        result = []
        for notice in notices:
            days_left = (notice.deadline - today).days
            result.append({
                **notice.to_dict(),
                'days_left': days_left
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/recent-organizations', methods=['GET'])
def get_recent_organizations():
    """최근 업데이트된 기업/기관 (7일 이내)"""
    db = SessionLocal()
    try:
        week_ago = datetime.now() - timedelta(days=7)

        orgs = db.query(Organization).filter(
            Organization.updated_at >= week_ago
        ).order_by(Organization.updated_at.desc()).limit(10).all()

        result = []
        for org in orgs:
            days_ago = (datetime.now() - org.updated_at).days
            result.append({
                **org.to_dict(),
                'days_ago': days_ago
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/recent-logs', methods=['GET'])
def get_recent_logs():
    """최근 크롤링 로그"""
    db = SessionLocal()
    try:
        logs = db.query(CrawlLog).order_by(
            CrawlLog.started_at.desc()
        ).limit(10).all()

        return jsonify([log.to_dict() for log in logs])

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
