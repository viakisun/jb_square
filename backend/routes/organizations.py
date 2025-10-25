"""
기업·기관 관리 API
기업/기관 CRUD, 검색/필터링
"""

from flask import Blueprint, jsonify, request
from backend.models import SessionLocal, Organization
from datetime import datetime
from sqlalchemy import or_

bp = Blueprint('organizations', __name__)

@bp.route('', methods=['GET'])
def get_organizations():
    """기업/기관 목록 조회"""
    db = SessionLocal()
    try:
        # 쿼리 파라미터
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '')
        field = request.args.get('field', '')
        region = request.args.get('region', '')
        is_resident = request.args.get('is_resident', '')

        # 기본 쿼리
        query = db.query(Organization)

        # 필터 적용
        if search:
            query = query.filter(
                or_(
                    Organization.name.ilike(f'%{search}%'),
                    Organization.contact_person.ilike(f'%{search}%')
                )
            )
        if field:
            query = query.filter(Organization.field == field)
        if region:
            query = query.filter(Organization.region == region)
        if is_resident:
            query = query.filter(Organization.is_resident == (is_resident == 'true'))

        # 총 개수
        total = query.count()

        # 페이지네이션
        offset = (page - 1) * per_page
        orgs = query.order_by(Organization.updated_at.desc()).offset(offset).limit(per_page).all()

        return jsonify({
            'organizations': [org.to_dict() for org in orgs],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/<int:org_id>', methods=['GET'])
def get_organization(org_id):
    """기업/기관 상세 조회"""
    db = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            return jsonify({'error': 'Organization not found'}), 404

        return jsonify(org.to_dict())

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('', methods=['POST'])
def create_organization():
    """기업/기관 신규 등록"""
    db = SessionLocal()
    try:
        data = request.json

        org = Organization(
            name=data.get('name'),
            type=data.get('type'),
            field=data.get('field'),
            contact_person=data.get('contact_person'),
            phone=data.get('phone'),
            email=data.get('email'),
            website=data.get('website'),
            region=data.get('region'),
            city=data.get('city'),
            address=data.get('address'),
            is_resident=data.get('is_resident', False),
            resident_center=data.get('resident_center'),
            support_programs=data.get('support_programs'),
            notes=data.get('notes')
        )

        db.add(org)
        db.commit()
        db.refresh(org)

        return jsonify(org.to_dict()), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/<int:org_id>', methods=['PUT'])
def update_organization(org_id):
    """기업/기관 수정"""
    db = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            return jsonify({'error': 'Organization not found'}), 404

        data = request.json

        # 업데이트 가능 필드
        updatable_fields = [
            'name', 'type', 'field', 'contact_person', 'phone', 'email', 'website',
            'region', 'city', 'address', 'is_resident', 'resident_center',
            'support_programs', 'notes'
        ]

        for field in updatable_fields:
            if field in data:
                setattr(org, field, data[field])

        org.updated_at = datetime.now()
        db.commit()
        db.refresh(org)

        return jsonify(org.to_dict())

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@bp.route('/<int:org_id>', methods=['DELETE'])
def delete_organization(org_id):
    """기업/기관 삭제"""
    db = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            return jsonify({'error': 'Organization not found'}), 404

        db.delete(org)
        db.commit()

        return jsonify({'message': 'Organization deleted'}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
