#!/usr/bin/env python3
"""
Organizations 더미 데이터 생성 스크립트
100개의 전북 바이오 기업 데이터 생성
- BIO_CORE: 50개 (50%)
- BIO_RELATED: 30개 (30%)
- NON_BIO: 20개 (20%)
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import date, timedelta
import random
from faker import Faker
from src.core.database import SessionLocal
from src.models.organization import Organization

fake = Faker('ko_KR')

# KSIC 코드 매핑 (실제 바이오산업 분류 기준)
KSIC_CODES = {
    'BIO_CORE': [
        ('21101', '의약용 화합물 및 항생물질 제조업'),
        ('21102', '생물학적 제제 제조업'),
        ('21210', '완제 의약품 제조업'),
        ('21220', '한의약품 제조업'),
        ('21230', '동물용 의약품 제조업'),
        ('21300', '의료용품 및 기타 의약 관련제품 제조업'),
        ('27199', '기타 의료용 기기 제조업'),
        ('70113', '생명공학 연구개발업'),
        ('86101', '병원')
    ],
    'BIO_RELATED': [
        ('10121', '낙농제품 제조업'),
        ('10749', '기타 곡물가공품 제조업'),
        ('10759', '기타 식품 첨가물 제조업'),
        ('10797', '건강보조용 액화식품 제조업'),
        ('10799', '그외 기타 식품 제조업'),
        ('10801', '배합사료 제조업'),
        ('10902', '동물용 사료 제조업'),
        ('10802', '애완용 동물 사료 제조업'),
        ('20423', '화장품 제조업'),
        ('27111', '전기식 진단 및 요법 기기 제조업'),
        ('27213', '방사선 장치 제조업'),
        ('27219', '기타 의료용 기기 제조업'),
        ('46441', '의료용품 및 의약품 도매업'),
        ('47811', '의약품 및 의료용품 소매업'),
        ('70111', '자연과학 연구개발업')
    ],
    'NON_BIO': [
        ('26400', '통신 및 방송 장비 제조업'),
        ('28120', '일반 목적용 기계 제조업'),
        ('46900', '기타 전문 도매업'),
        ('62010', '컴퓨터 프로그래밍 서비스업'),
        ('70200', '연구개발업'),
        ('71400', '기타 엔지니어링 서비스업'),
        ('73209', '기타 광고업')
    ]
}

# 기업명 접두사 및 접미사
COMPANY_PREFIXES = [
    '㈜', '(주)', '', ''  # 빈 문자열을 더 많이 포함하여 개인사업자도 생성
]

COMPANY_NAMES_BIO = [
    '바이오메드', '메디젠', '셀바이오', '진바이오', '헬스케어',
    '바이오텍', '메디칼', '파마', '셀텍', '바이오랩',
    '제넥스', '셀트리온', '유한양행', '대웅', '종근당',
    '녹십자', '한미약품', '일동제약', '부광약품', '동아에스티',
    '삼성바이오', 'SK바이오', 'LG화학', '메디톡스', '휴온스',
    '제넨바이오', '압타바이오', '레고켐', '올릭스', '헬릭스미스',
    '크리스탈지노믹스', '바이넥스', '지놈앤컴퍼니', '툴젠', '앱클론',
    '에이비온', '바이오니아', '신테카바이오', '큐리언트', '프레스티지바이오로직스'
]

COMPANY_NAMES_RELATED = [
    '푸드텍', '뉴트리', '헬스푸드', '바이탈', '웰니스',
    '코스메틱', '뷰티랩', '스킨케어', '네이처', '그린바이오',
    '아모레퍼시픽', 'LG생활건강', '한국콜마', '코스맥스', '웰크론',
    '매일유업', '남양유업', '빙그레', '동원F&B', '오뚜기'
]

COMPANY_NAMES_NON_BIO = [
    '테크', '솔루션', '시스템', '엔지니어링', '컨설팅',
    '정보기술', '소프트웨어', '데이터', '클라우드', 'AI연구소',
    '삼성전자', 'LG전자', 'SK하이닉스', '네이버', '카카오'
]

CEO_SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍']
CEO_GIVEN_NAMES = ['민준', '서준', '도윤', '예준', '시우', '주원', '하준', '지호', '지우', '준서', '수빈', '서연', '지민', '서현', '민서', '하은', '수현', '지유', '윤서', '채원']

COMPANY_SCALES = ['대기업', '중견기업', '중소기업']
COMPANY_STATUSES = ['영업중', '폐업', '휴업']
COMPANY_TYPES = ['법인', '개인', '비영리']

MAIN_PRODUCTS_BIO = [
    '항암제', '백신', '진단키트', '의료기기', '바이오시밀러',
    '줄기세포치료제', '유전자치료제', '세포배양배지', '항체의약품', '면역항암제',
    '합성신약', '천연물신약', '개량신약', '바이오베터', '바이오마커',
    '진단시약', 'PCR 키트', 'ELISA 키트', '혈액검사기', 'CT 조영제'
]

MAIN_PRODUCTS_RELATED = [
    '건강기능식품', '프로바이오틱스', '유산균', '홍삼제품', '비타민',
    '화장품', '기능성화장품', '스킨케어', '안티에이징', '바이오마스크',
    '배합사료', '기능성사료', '애완동물사료', '유기농제품', '발효식품'
]

MAIN_PRODUCTS_NON_BIO = [
    'IT솔루션', '클라우드서비스', 'AI플랫폼', '데이터분석', '컨설팅서비스',
    '반도체', '디스플레이', '통신장비', '소프트웨어', '웹개발'
]


def generate_business_number():
    """사업자등록번호 생성 (XXX-XX-XXXXX)"""
    return f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(10000, 99999)}"


def generate_email(company_name_clean):
    """이메일 생성"""
    domains = ['biotech.co.kr', 'pharma.co.kr', 'med.co.kr', 'health.co.kr', 'bio.kr', 'kr.com']
    clean_name = company_name_clean.replace('㈜', '').replace('(주)', '').replace(' ', '')
    if clean_name:
        return f"info@{clean_name.lower()}.{random.choice(domains)}"
    return f"info@company{random.randint(1, 999)}.{random.choice(domains)}"


def generate_established_date():
    """설립일자 생성 (1980-2023)"""
    start_date = date(1980, 1, 1)
    end_date = date(2023, 12, 31)
    days_between = (end_date - start_date).days
    random_days = random.randint(0, days_between)
    return start_date + timedelta(days=random_days)


def generate_yearly_revenue(company_scale, year_offset):
    """연도별 매출액 생성 (2020-2024)"""
    base_revenues = {
        '대기업': random.randint(500_000_000_000, 5_000_000_000_000),  # 5천억 ~ 5조
        '중견기업': random.randint(50_000_000_000, 500_000_000_000),   # 500억 ~ 5천억
        '중소기업': random.randint(1_000_000_000, 50_000_000_000)      # 10억 ~ 500억
    }
    base = base_revenues[company_scale]
    # 연도별 성장률 적용 (-10% ~ +20%)
    growth_rate = random.uniform(0.9, 1.2)
    return int(base * (growth_rate ** year_offset)) if random.random() > 0.1 else None


def generate_yearly_employees(company_scale, year_offset):
    """연도별 종사자 수 생성"""
    base_employees = {
        '대기업': random.randint(500, 5000),
        '중견기업': random.randint(100, 500),
        '중소기업': random.randint(5, 100)
    }
    base = base_employees[company_scale]
    # 연도별 변동 (-5% ~ +15%)
    change_rate = random.uniform(0.95, 1.15)
    return int(base * (change_rate ** year_offset)) if random.random() > 0.15 else None


def generate_yearly_export(revenue):
    """수출액 생성 (매출의 0-40%)"""
    if revenue and random.random() > 0.4:  # 60% 기업만 수출
        return int(revenue * random.uniform(0, 0.4))
    return None


def generate_yearly_operating_profit(revenue):
    """영업이익 생성 (매출의 -10% ~ +30%)"""
    if revenue:
        return int(revenue * random.uniform(-0.1, 0.3))
    return None


def generate_yearly_net_income(revenue):
    """당기순이익 생성 (매출의 -15% ~ +25%)"""
    if revenue:
        return int(revenue * random.uniform(-0.15, 0.25))
    return None


def generate_yearly_rd_expense(revenue, industry_type):
    """연구개발비 생성"""
    if revenue and random.random() > 0.2:  # 80% 기업만 R&D 투자
        # BIO_CORE는 더 높은 비율 (5-20%), 기타는 (1-10%)
        rd_ratio = random.uniform(0.05, 0.2) if industry_type == 'BIO_CORE' else random.uniform(0.01, 0.1)
        return int(revenue * rd_ratio)
    return None


def generate_yearly_assets(revenue):
    """자산총계 생성 (매출의 1-3배)"""
    if revenue:
        return int(revenue * random.uniform(1, 3))
    return None


def generate_yearly_liabilities(assets):
    """부채총계 생성 (자산의 20-80%)"""
    if assets:
        return int(assets * random.uniform(0.2, 0.8))
    return None


def generate_yearly_patents(industry_type, company_scale):
    """특허 건수 생성"""
    if random.random() > 0.3:  # 70% 기업만 특허 보유
        base_count = {
            'BIO_CORE': random.randint(5, 50) if company_scale == '대기업' else random.randint(1, 20),
            'BIO_RELATED': random.randint(2, 20) if company_scale == '대기업' else random.randint(0, 10),
            'NON_BIO': random.randint(0, 10)
        }
        return base_count.get(industry_type, 0)
    return None


def generate_organization(industry_type: str, ksic_code: str, ksic_name: str):
    """단일 기업 데이터 생성"""

    # 산업 분류에 따른 기업명 선택
    if industry_type == 'BIO_CORE':
        name_pool = COMPANY_NAMES_BIO
        product_pool = MAIN_PRODUCTS_BIO
    elif industry_type == 'BIO_RELATED':
        name_pool = COMPANY_NAMES_RELATED
        product_pool = MAIN_PRODUCTS_RELATED
    else:
        name_pool = COMPANY_NAMES_NON_BIO
        product_pool = MAIN_PRODUCTS_NON_BIO

    company_name_base = random.choice(name_pool)
    prefix = random.choice(COMPANY_PREFIXES)
    company_name = f"{prefix}{company_name_base}"
    company_name_with_type = company_name if prefix else f"{company_name} (개인)"

    # 기본 정보
    company_scale = random.choice(COMPANY_SCALES)
    company_status = random.choices(COMPANY_STATUSES, weights=[85, 10, 5])[0]  # 85% 영업중
    company_type = random.choices(COMPANY_TYPES, weights=[70, 25, 5])[0]  # 70% 법인

    ceo_name = random.choice(CEO_SURNAMES) + random.choice(CEO_GIVEN_NAMES)
    email = generate_email(company_name_base)
    established_date = generate_established_date()

    # 기업부설연구소 (바이오 핵심은 80%, 연관은 50%, 비바이오는 20%)
    has_ri_prob = {'BIO_CORE': 0.8, 'BIO_RELATED': 0.5, 'NON_BIO': 0.2}
    has_research_institute = random.random() < has_ri_prob.get(industry_type, 0.3)

    # 주요제품
    num_products = random.randint(1, 3)
    main_products = ', '.join(random.sample(product_pool, min(num_products, len(product_pool))))

    # 연도별 데이터 생성
    org_data = {
        'company_name': company_name,
        'company_name_with_type': company_name_with_type,
        'kedcd': f"KEDCD{random.randint(10000, 99999)}",
        'business_registration_number': generate_business_number(),
        'ceo_name': ceo_name,
        'email': email,
        'company_status': company_status,
        'company_scale': company_scale,
        'company_type': company_type,
        'ksic_10th_code': ksic_code,
        'ksic_10th_name': ksic_name,
        'main_products': main_products,
        'established_date': established_date,
        'has_research_institute': has_research_institute
    }

    # 연도별 재무/특허 데이터 (2020-2024)
    for year_offset, year in enumerate(range(2020, 2025)):
        revenue = generate_yearly_revenue(company_scale, year_offset)
        employees = generate_yearly_employees(company_scale, year_offset)
        assets = generate_yearly_assets(revenue)

        org_data.update({
            f'revenue_{year}': revenue,
            f'employees_{year}': employees,
            f'export_amount_{year}': generate_yearly_export(revenue),
            f'operating_profit_{year}': generate_yearly_operating_profit(revenue),
            f'net_income_{year}': generate_yearly_net_income(revenue),
            f'rd_expense_{year}': generate_yearly_rd_expense(revenue, industry_type),
            f'value_added_{year}': int(revenue * random.uniform(0.2, 0.4)) if revenue else None,
            f'total_assets_{year}': assets,
            f'total_liabilities_{year}': generate_yearly_liabilities(assets),
            f'retained_earnings_{year}': int(assets * random.uniform(0.1, 0.3)) if assets else None,
            f'working_capital_{year}': int(assets * random.uniform(0.05, 0.2)) if assets else None,
            f'patent_registrations_{year}': generate_yearly_patents(industry_type, company_scale),
            f'patent_applications_{year}': generate_yearly_patents(industry_type, company_scale)
        })

    return Organization(**org_data)


def main():
    """100개 기업 데이터 생성 및 저장"""
    print("=" * 70)
    print("Organizations 더미 데이터 생성 시작 (100개 기업)")
    print("=" * 70)
    print()

    db = SessionLocal()

    try:
        # 기존 데이터 삭제
        existing_count = db.query(Organization).count()
        if existing_count > 0:
            print(f"⚠ 기존 데이터 {existing_count}개 삭제 중...")
            db.query(Organization).delete()
            db.commit()
            print("  ✓ 삭제 완료")
            print()

        # 산업별 분배 (BIO_CORE: 50%, BIO_RELATED: 30%, NON_BIO: 20%)
        distribution = {
            'BIO_CORE': 50,
            'BIO_RELATED': 30,
            'NON_BIO': 20
        }

        organizations = []
        total_generated = 0

        for industry_type, count in distribution.items():
            print(f"[{industry_type}] {count}개 기업 생성 중...")
            ksic_codes = KSIC_CODES[industry_type]

            for i in range(count):
                ksic_code, ksic_name = random.choice(ksic_codes)
                org = generate_organization(industry_type, ksic_code, ksic_name)
                organizations.append(org)
                total_generated += 1

                if (i + 1) % 10 == 0:
                    print(f"  진행: {i + 1}/{count}")

            print(f"  ✓ 완료: {count}개")
            print()

        # 데이터베이스에 저장
        print(f"데이터베이스에 {total_generated}개 기업 저장 중...")
        db.bulk_save_objects(organizations)
        db.commit()

        print("✓ 저장 완료!")
        print()

        # 통계 출력
        print("=" * 70)
        print("생성된 데이터 통계")
        print("=" * 70)

        for industry_type in ['BIO_CORE', 'BIO_RELATED', 'NON_BIO']:
            count = db.query(Organization).filter(
                Organization.industry_type == industry_type
            ).count()
            print(f"  {industry_type}: {count}개")

        print()

        for scale in COMPANY_SCALES:
            count = db.query(Organization).filter(
                Organization.company_scale == scale
            ).count()
            print(f"  {scale}: {count}개")

        print()

        ri_count = db.query(Organization).filter(
            Organization.has_research_institute == True
        ).count()
        print(f"  기업부설연구소 보유: {ri_count}개")

        print()
        print(f"✅ 총 {total_generated}개 기업 데이터 생성 완료!")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()

    finally:
        db.close()


if __name__ == "__main__":
    main()
