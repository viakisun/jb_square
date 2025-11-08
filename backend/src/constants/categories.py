"""
Notice Categories Configuration
카테고리 상수 및 매핑 정의
"""

# Database에서 사용하는 카테고리 (DB CHECK 제약조건)
VALID_CATEGORIES = ['government', 'business', 'rnd', 'startup']

# 카테고리 메타데이터
CATEGORY_METADATA = {
    'government': {
        'id': 'government',
        'label': '정부 공고',
        'description': '중앙정부 및 지자체 공고',
        'sources': ['ntis_rss', 'jbtp'],  # NTIS: 중앙정부, JBTP: 지자체
        'color': '#1E40AF'
    },
    'business': {
        'id': 'business',
        'label': '기업 맞춤형 지원사업',
        'description': '기업을 위한 맞춤형 지원사업 공고',
        'sources': ['bizinfo', 'jbtp'],
        'color': '#059669'
    },
    'rnd': {
        'id': 'rnd',
        'label': '연구개발(R&D)',
        'description': 'R&D 관련 지원사업',
        'sources': ['ntis_rss', 'jbtp'],
        'color': '#7C3AED'
    },
    'startup': {
        'id': 'startup',
        'label': '창업 및 기술이전',
        'description': '창업 지원 및 기술이전 관련 공고',
        'sources': ['jbtp', 'bizinfo'],
        'color': '#DC2626'
    }
}

# Source별 기본 카테고리 매핑
SOURCE_DEFAULT_CATEGORY = {
    'ntis_rss': 'government',  # NTIS → 정부 공고
    'jbtp': 'government',      # JBTP → 정부 공고 (지자체)
    'bizinfo': 'business',     # Bizinfo → 기업 지원
    'manual': 'government'     # 수동 입력 기본값
}

# UI 라우팅 매핑 (프론트엔드 URL과 카테고리 매핑)
ROUTE_CATEGORY_MAP = {
    '/notices/ntis': 'government',        # 정부 공고 (NTIS)
    '/notices/local': 'government',       # 지자체 공고 (JBTP)
    '/notices/business': 'business',      # 기업 맞춤형
    '/notices/rnd': 'rnd',                # R&D
    '/notices/startup': 'startup',        # 창업
    '/notices/latest': None               # 최신공고 (전체)
}


def get_category_label(category: str) -> str:
    """카테고리 ID로 라벨 조회"""
    return CATEGORY_METADATA.get(category, {}).get('label', category)


def get_default_category_for_source(source_id: str) -> str:
    """소스 ID로 기본 카테고리 조회"""
    return SOURCE_DEFAULT_CATEGORY.get(source_id, 'government')


def validate_category(category: str) -> bool:
    """카테고리 유효성 검증"""
    return category in VALID_CATEGORIES


def get_categories_for_source(source_id: str) -> list:
    """특정 소스가 사용 가능한 카테고리 목록"""
    return [
        cat_id
        for cat_id, meta in CATEGORY_METADATA.items()
        if source_id in meta['sources']
    ]
