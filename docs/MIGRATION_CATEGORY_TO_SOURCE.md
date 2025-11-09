# Category → Source ID 마이그레이션 가이드

## 📋 개요

**마이그레이션 날짜**: 2025-11-09
**마이그레이션 목적**: Notice 모델의 `category` 필드 제거 및 `crawler_source_id` 기반 필터링으로 전환
**영향 범위**: Backend API, Frontend-main, Frontend-admin

---

## 🎯 변경 사항 요약

### Before (구 방식)
```typescript
// 카테고리 기반 필터링
interface Notice {
  category: 'government' | 'startup' | 'local' | 'institution';
  crawler_source_id: string;
}

// API 호출
api.notices.getList({ category: 'government' });
```

### After (신 방식)
```typescript
// Source ID 기반 필터링
interface Notice {
  // category 필드 제거됨
  crawler_source_id: 'source:ntis:rss' | 'source:bizinfo:api' | 'source:jbtp:local' | 'source:jbtp:external';
}

// API 호출
api.notices.getList({ source_id: 'source:ntis:rss' });
```

---

## 📊 Source ID 매핑표

| 구 Category | 신 Source ID | 설명 | 표시명 |
|------------|--------------|------|-------|
| `government` | `source:ntis:rss` | 국가과학기술지식정보서비스 (NTIS) | 정부공고 |
| `startup` | `source:bizinfo:api` | 기업마당 (BizInfo) | 기업지원 |
| `local` | `source:jbtp:local` | 전북테크노파크 지자체 | 지자체공고 |
| `institution` | `source:jbtp:external` | 전북테크노파크 유관기관 | 유관기관 |

---

## 🔧 Backend 변경 사항

### 1. 데이터베이스 스키마

**Migration 021**: `category` 컬럼 제거

```python
# alembic/versions/021_remove_category_from_notice.py
def upgrade():
    op.drop_column('notices', 'category')

def downgrade():
    # 롤백 시 category 컬럼 재생성 (기본값: NULL)
    op.add_column('notices', sa.Column('category', sa.String(50), nullable=True))
```

**영향받는 테이블**:
- `notices` 테이블

**실행 방법**:
```bash
cd backend
alembic upgrade head
```

### 2. API 엔드포인트 변경

**파라미터 변경**:
- ❌ `category` 파라미터 제거
- ✅ `source_id` 파라미터 사용

**예시**:
```python
# Before
GET /api/notices?category=government&limit=20

# After
GET /api/notices?source_id=source:ntis:rss&limit=20
```

### 3. Notice 모델 변경

**파일**: `backend/src/models/notice.py`

```python
class Notice(Base):
    # category 필드 제거됨
    # crawler_source_id 필드로 필터링
    crawler_source_id = Column(String(100), index=True)
```

---

## 💻 Frontend-main 변경 사항

### 1. Type 정의 변경

**파일**: `frontend-main/lib/api/types.ts`

```typescript
// Before
export interface Notice {
  category: 'government' | 'startup' | 'local' | 'institution';
  // ...
}

// After
export interface Notice {
  // category 필드 제거
  crawler_source_id: string;
  // ...
}
```

### 2. API Client 변경

**파일**: `frontend-main/lib/api/endpoints/notices.ts`

```typescript
// Before
export interface NoticeFilterParams {
  category?: 'government' | 'startup' | 'local' | 'institution';
  // ...
}

// After
export interface NoticeFilterParams {
  source_id?: string;  // 'source:ntis:rss', 'source:bizinfo:api', etc.
  // ...
}
```

**메서드 변경**:
```typescript
// Before
notices.getList({ category: 'government' });

// After
notices.getList({ source_id: 'source:ntis:rss' });
```

### 3. 컴포넌트 변경

#### NoticeCard 컴포넌트

**파일**: `frontend-main/components/sample-board/NoticeCard.tsx`

```typescript
// Before: 카테고리 직접 사용
const categoryColors = {
  government: { bg: 'bg-blue-100', text: 'text-blue-800' },
  // ...
};
<span>{notice.category}</span>

// After: source_id에서 파싱
function getSourceDisplay(sourceId: string): { name: string; bg: string; text: string } {
  const parts = sourceId.split(':');
  const organization = parts[1]; // ntis, bizinfo, jbtp
  const type = parts[2]; // rss, api, local, external

  if (organization === 'ntis') {
    return { name: '정부공고', bg: 'bg-blue-100', text: 'text-blue-800' };
  }
  // ...
}

const sourceDisplay = getSourceDisplay(notice.crawler_source_id);
<span className={`${sourceDisplay.bg} ${sourceDisplay.text}`}>
  {sourceDisplay.name}
</span>
```

#### FilterBar 컴포넌트

**파일**: `frontend-main/components/sample-board/FilterBar.tsx`

**변경 사항**:
- ❌ 카테고리 필터 UI 완전 제거
- ✅ 상태(status), 정렬기준(sort_by), 정렬순서(sort_order)만 유지
- Grid 레이아웃: `lg:grid-cols-4` → `lg:grid-cols-3`

**이유**: 카테고리 필터링은 페이지 레벨에서 `source_id`로 처리

#### CategorySection 컴포넌트

**파일**: `frontend-main/components/sample-board/CategorySection.tsx`

```typescript
// Before
interface CategorySectionProps {
  sourceId: string;
  // ...
}

// After
interface CategorySectionProps {
  sourceId?: string;  // 옵셔널로 변경
  // ...
}

// 전체 공고 표시 지원
if (sourceId) {
  params.source_id = sourceId;
}
```

### 4. 페이지 컴포넌트 변경

#### 정부공고 페이지

**파일**: `frontend-main/pages/sample-board/government.tsx`

```typescript
// Before
useNotices({ category: 'government' });
useNoticeSearch({ additionalFilters: { category: 'government' } });

// After
useNotices({ source_id: 'source:ntis:rss' });
useNoticeSearch({ additionalFilters: { source_id: 'source:ntis:rss' } });
```

#### 기업지원 페이지

**파일**: `frontend-main/pages/sample-board/business.tsx`

```typescript
useNotices({ source_id: 'source:bizinfo:api' });
useNoticeSearch({ additionalFilters: { source_id: 'source:bizinfo:api' } });
```

#### 지자체공고 페이지

**파일**: `frontend-main/pages/sample-board/local.tsx`

```typescript
useNotices({ source_id: 'source:jbtp:local' });
useNoticeSearch({ additionalFilters: { source_id: 'source:jbtp:local' } });
```

#### 유관기관 페이지

**파일**: `frontend-main/pages/sample-board/institutions.tsx`

```typescript
useNotices({ source_id: 'source:jbtp:external' });
useNoticeSearch({ additionalFilters: { source_id: 'source:jbtp:external' } });
```

---

## 🔍 검증 방법

### 1. TypeScript 컴파일 검증

```bash
cd frontend-main
npx tsc --noEmit --skipLibCheck
# 결과: 에러 없어야 함
```

### 2. Build 검증

```bash
npm run build
# 결과: ✓ Compiled successfully
```

### 3. API 필터링 테스트

```bash
# NTIS 정부공고
curl "http://localhost:8000/api/notices?source_id=source:ntis:rss&limit=3"

# BIZINFO 기업지원
curl "http://localhost:8000/api/notices?source_id=source:bizinfo:api&limit=3"

# JBTP 지자체공고
curl "http://localhost:8000/api/notices?source_id=source:jbtp:local&limit=3"
```

**예상 결과**:
- 각 요청당 해당 source의 공고만 반환
- `crawler_source_id` 필드가 필터와 일치
- `total` 개수 표시

### 4. 페이지네이션 테스트

```bash
curl "http://localhost:8000/api/notices?source_id=source:ntis:rss&limit=5&offset=5"
```

**예상 결과**:
```json
{
  "total": 39,
  "offset": 5,
  "limit": 5,
  "page": 2,
  "total_pages": 8,
  "has_next": true,
  "has_prev": true
}
```

### 5. 정렬 테스트

```bash
curl "http://localhost:8000/api/notices?source_id=source:bizinfo:api&sort_by=deadline&sort_order=asc&limit=3"
```

**예상 결과**: deadline 오름차순 정렬

---

## ⚠️ 주의사항

### 1. 하위 호환성 없음
- 구 `category` 파라미터는 **완전히 제거**됨
- API 요청 시 `category` 파라미터 사용 불가

### 2. 데이터 백업 권장
마이그레이션 전 데이터베이스 백업:
```bash
pg_dump -h <host> -U <user> -d <database> > backup_before_category_removal.sql
```

### 3. 롤백 절차

마이그레이션 문제 발생 시:

```bash
# 1. 데이터베이스 롤백
cd backend
alembic downgrade -1

# 2. 코드 롤백
git revert <commit-hash>

# 3. 서비스 재시작
docker-compose restart
```

---

## 📈 마이그레이션 체크리스트

### Backend
- [x] Migration 021 작성 및 실행
- [x] Notice 모델에서 category 필드 제거
- [x] API 엔드포인트에서 category 파라미터 제거
- [x] source_id 필터링 로직 검증

### Frontend-main
- [x] Notice 타입에서 category 제거
- [x] NoticeFilterParams에서 category 제거, source_id 추가
- [x] API client getList 메서드 수정
- [x] NoticeCard getSourceDisplay() 함수 구현
- [x] FilterBar 카테고리 필터 제거
- [x] CategorySection sourceId 옵셔널 처리
- [x] 모든 페이지 컴포넌트 source_id 사용
- [x] TypeScript 컴파일 통과
- [x] Production 빌드 성공

### Frontend-admin
- [x] Category 관련 코드 제거
- [x] Source ID 기반 필터링으로 변경

### 통합 테스트
- [x] API 필터링 동작 확인
- [x] 페이지네이션 동작 확인
- [x] 정렬 기능 동작 확인
- [x] 검색 + 필터 조합 확인
- [x] 모든 페이지 로드 확인

---

## 🚀 마이그레이션 실행 일정

### Phase 1: 준비 (완료)
- 데이터베이스 백업
- Migration 스크립트 작성
- 코드 변경 사항 리뷰

### Phase 2: 백엔드 마이그레이션 (완료)
- Migration 021 실행
- API 엔드포인트 수정
- 단위 테스트

### Phase 3: 프론트엔드 마이그레이션 (완료)
- Type 정의 수정
- 컴포넌트 업데이트
- 페이지 수정
- 빌드 검증

### Phase 4: 통합 테스트 (완료)
- API 필터링 테스트
- 페이지네이션 테스트
- 정렬 테스트
- End-to-End 테스트

### Phase 5: 배포 (대기중)
- Staging 환경 배포
- Production 환경 배포
- 모니터링

---

## 📞 문의

마이그레이션 관련 문의사항이 있으시면 개발팀에 연락해주세요.

**작성자**: JB SQUARE 개발팀
**최종 업데이트**: 2025-11-09
