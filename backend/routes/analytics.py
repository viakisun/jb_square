"""
통계 리포트 API
콘텐츠 통계, 카테고리 분석, 기업정보 현황
"""

from flask import Blueprint, jsonify, request
from backend.models import SessionLocal, Content, Organization, CrawlLog
from datetime import datetime, timedelta
from sqlalchemy import func, and_
import json

bp = Blueprint('analytics', __name__)

@bp.route('/content-stats', methods=['GET'])
def get_content_stats():
    """기간별 수집·게시 건수"""
    db = SessionLocal()
    try:
        # 기간 파라미터 (기본: 최근 30일)
        days = int(request.args.get('days', 30))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)

        # 일별 통계
        daily_stats = []
        for i in range(days + 1):
            date = start_date + timedelta(days=i)

            collected = db.query(func.count(Content.id)).filter(
                func.date(Content.crawled_at) == date
            ).scalar() or 0

            published = db.query(func.count(Content.id)).filter(
                and_(
                    func.date(Content.published_at) == date,
                    Content.status == 'published'
                )
            ).scalar() or 0

            daily_stats.append({
                'date': date.isoformat(),
                'collected': collected,
                'published': published
            })

        # 출처별 통계
        source_stats = db.query(
            Content.source,
            func.count(Content.id).label('count')
        ).filter(
            func.date(Content.crawled_at) >= start_date
        ).group_by(Content.source).all()

        sources = {source: count for source, count in source_stats}

        return jsonify({
            'daily': daily_stats,
            'by_source': sources
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/category-distribution', methods=['GET'])
def get_category_distribution():
    """카테고리별 게시 비율"""
    db = SessionLocal()
    try:
        stats = db.query(
            Content.category,
            func.count(Content.id).label('count')
        ).filter(
            Content.status == 'published'
        ).group_by(Content.category).all()

        total = sum(count for _, count in stats)

        distribution = []
        for category, count in stats:
            distribution.append({
                'category': category or '미분류',
                'count': count,
                'percentage': round((count / total * 100) if total > 0 else 0, 1)
            })

        return jsonify(distribution)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/organization-freshness', methods=['GET'])
def get_organization_freshness():
    """기업정보 최신성 (90일 기준)"""
    db = SessionLocal()
    try:
        total = db.query(func.count(Organization.id)).scalar() or 0
        cutoff_date = datetime.now() - timedelta(days=90)

        fresh = db.query(func.count(Organization.id)).filter(
            Organization.updated_at >= cutoff_date
        ).scalar() or 0

        stale = total - fresh

        # 90일 이상 미수정 기업 목록
        stale_orgs = db.query(Organization).filter(
            Organization.updated_at < cutoff_date
        ).order_by(Organization.updated_at.asc()).limit(20).all()

        stale_list = []
        for org in stale_orgs:
            days_since = (datetime.now() - org.updated_at).days
            stale_list.append({
                **org.to_dict(),
                'days_since_update': days_since
            })

        return jsonify({
            'total': total,
            'fresh': fresh,
            'stale': stale,
            'fresh_percentage': round((fresh / total * 100) if total > 0 else 0, 1),
            'stale_list': stale_list
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/crawl-success-rate', methods=['GET'])
def get_crawl_success_rate():
    """크롤링 성공률"""
    db = SessionLocal()
    try:
        days = int(request.args.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)

        logs = db.query(CrawlLog).filter(
            CrawlLog.started_at >= start_date
        ).all()

        total = len(logs)
        success = sum(1 for log in logs if log.status == 'success')
        error = total - success

        # 소스별 성공률
        by_source = {}
        for log in logs:
            if log.source not in by_source:
                by_source[log.source] = {'total': 0, 'success': 0}
            by_source[log.source]['total'] += 1
            if log.status == 'success':
                by_source[log.source]['success'] += 1

        source_stats = []
        for source, stats in by_source.items():
            source_stats.append({
                'source': source,
                'success_rate': round((stats['success'] / stats['total'] * 100) if stats['total'] > 0 else 0, 1),
                'total': stats['total'],
                'success': stats['success']
            })

        return jsonify({
            'total': total,
            'success': success,
            'error': error,
            'success_rate': round((success / total * 100) if total > 0 else 0, 1),
            'by_source': source_stats
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
