# 📚 JB SQUARE API 사용 가이드

> 초보 개발자를 위한 API 게이트웨이 완벽 가이드

이 문서는 JB SQUARE 프로젝트의 API 게이트웨이 사용법을 단계별로 설명합니다.

---

## 목차

1. [시작하기](#시작하기)
2. [API 게이트웨이 구조](#api-게이트웨이-구조)
3. [기본 사용법](#기본-사용법)
4. [커스텀 훅 사용법](#커스텀-훅-사용법)
5. [에러 처리](#에러-처리)
6. [실전 예제](#실전-예제)
7. [API 문서 링크](#api-문서-링크)

---

## 시작하기

### 1. 환경 설정 확인

`.env.local` 파일에서 API URL이 올바르게 설정되었는지 확인하세요:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. 패키지 설치 확인

axios가 설치되어 있는지 확인하세요:

```bash
npm list axios
```

설치되지 않았다면:

```bash
npm install axios
```

---

## API 게이트웨이 구조

### 전체 구조

```
frontend-main/
├── lib/
│   ├── api/
│   │   ├── client.ts          # 단일 게이트웨이 클라이언트 ⭐
│   │   ├── types.ts           # TypeScript 타입 정의
│   │   └── endpoints/
│   │       └── notices.ts     # 공고 API 엔드포인트
│   └── utils/
│       ├── date.ts            # 날짜 유틸리티
│       └── errors.ts          # 에러 처리 유틸리티
└── hooks/
    ├── useNotices.ts          # 공고 목록 훅
    └── useNoticeSearch.ts     # 검색 훅
```

### 핵심 파일 역할

| 파일 | 역할 | 설명 |
|------|------|------|
| **lib/api/client.ts** | 게이트웨이 | 모든 API 요청의 진입점 |
| **lib/api/types.ts** | 타입 정의 | TypeScript 인터페이스 |
| **lib/api/endpoints/notices.ts** | API 메서드 | 공고 관련 모든 API 함수 |
| **hooks/useNotices.ts** | 상태 관리 | React 훅으로 API 호출 자동화 |
| **lib/utils/date.ts** | 유틸리티 | 날짜 포맷팅 함수들 |
| **lib/utils/errors.ts** | 에러 처리 | 사용자 친화적 에러 메시지 |

---

## 기본 사용법

### 방법 1: API 클라이언트 직접 사용 (기초)

```typescript
import api from '@/lib/api/client';

// 컴포넌트 안에서
async function loadNotices() {
  try {
    // 공고 목록 가져오기
    const response = await api.notices.getList({
      category: 'government',
      page: 1,
      limit: 20
    });

    console.log('공고 목록:', response.items);
    console.log('전체 개수:', response.total);

  } catch (error) {
    console.error('에러 발생:', error);
  }
}
```

### 방법 2: 커스텀 훅 사용 (권장)

```typescript
import { useNotices } from '@/hooks/useNotices';

function NoticeList() {
  const { notices, loading, error } = useNotices({
    category: 'government',
    limit: 20
  });

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div>
      {notices.map(notice => (
        <div key={notice.id}>{notice.title}</div>
      ))}
    </div>
  );
}
```

---

## 커스텀 훅 사용법

### useNotices - 공고 목록 관리

```typescript
import { useNotices } from '@/hooks/useNotices';

function MyComponent() {
  const {
    notices,        // 공고 목록 배열
    loading,        // 로딩 상태
    error,          // 에러 메시지
    pagination,     // 페이지네이션 정보
    setFilters,     // 필터 변경 함수
    setPage,        // 페이지 변경 함수
    fetchNotices    // 새로고침 함수
  } = useNotices();

  // 필터 변경
  function changeCategory(category) {
    setFilters({ category });
  }

  // 페이지 변경
  function goToNextPage() {
    if (pagination?.hasNext) {
      setPage(pagination.page + 1);
    }
  }

  return (
    <div>
      <button onClick={() => changeCategory('business')}>
        지자체 공고
      </button>
      <button onClick={goToNextPage}>
        다음 페이지
      </button>

      {notices.map(notice => (
        <div key={notice.id}>{notice.title}</div>
      ))}
    </div>
  );
}
```

### useNoticeSearch - 실시간 검색

```typescript
import { useNoticeSearch } from '@/hooks/useNoticeSearch';

function SearchBar() {
  const {
    searchQuery,      // 현재 검색어
    setSearchQuery,   // 검색어 변경 함수
    results,          // 검색 결과
    loading,          // 로딩 상태
    totalResults      // 총 결과 개수
  } = useNoticeSearch({
    debounceDelay: 500,  // 500ms 디바운스
    minLength: 2         // 최소 2글자부터 검색
  });

  return (
    <div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="검색어를 입력하세요"
      />

      {loading && <span>검색 중...</span>}

      <div>총 {totalResults}개의 결과</div>

      {results.map(notice => (
        <div key={notice.id}>{notice.title}</div>
      ))}
    </div>
  );
}
```

---

## 에러 처리

### 자동 에러 처리 (useNotices 사용 시)

```typescript
const { notices, loading, error } = useNotices();

if (error) {
  // 에러 메시지가 이미 한국어로 변환되어 있음
  return <div className="error">{error}</div>;
}
```

### 수동 에러 처리 (API 직접 호출 시)

```typescript
import api from '@/lib/api/client';
import { getErrorMessage, logError } from '@/lib/utils/errors';

async function loadData() {
  try {
    const data = await api.notices.getList();
    return data;

  } catch (error) {
    // 사용자 친화적 에러 메시지 추출
    const message = getErrorMessage(error);

    // 에러 로깅 (개발 환경에서는 콘솔에 출력)
    logError(error, '공고 목록 로드 실패');

    // 사용자에게 표시
    alert(message);
  }
}
```

---

## 실전 예제

### 예제 1: 카테고리별 공고 표시

```typescript
import { useNotices } from '@/hooks/useNotices';
import { formatDate } from '@/lib/utils/date';

function GovernmentNotices() {
  const { notices, loading, error, setPage, pagination } = useNotices({
    category: 'government',
    limit: 10,
    sort_by: 'published_at',
    sort_order: 'desc'
  });

  if (loading) {
    return <div>로딩 중입니다...</div>;
  }

  if (error) {
    return <div className="error">오류: {error}</div>;
  }

  return (
    <div>
      <h1>정부 공고</h1>

      {notices.map(notice => (
        <div key={notice.id} className="notice-card">
          <h2>{notice.title}</h2>
          <p>{notice.organization}</p>
          <p>게시일: {formatDate(notice.published_at)}</p>
          {notice.deadline && (
            <p>마감일: {formatDate(notice.deadline)}</p>
          )}
        </div>
      ))}

      {/* 페이지네이션 */}
      {pagination && (
        <div className="pagination">
          <button
            onClick={() => setPage(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            이전
          </button>

          <span>{pagination.page} / {pagination.totalPages}</span>

          <button
            onClick={() => setPage(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
```

### 예제 2: 검색 기능 구현

```typescript
import { useNoticeSearch } from '@/hooks/useNoticeSearch';
import { formatDate, getDeadlineStatus } from '@/lib/utils/date';

function NoticeSearchPage() {
  const {
    searchQuery,
    setSearchQuery,
    results,
    loading,
    totalResults,
    hasSearched
  } = useNoticeSearch({
    debounceDelay: 300,  // 300ms 디바운스
    minLength: 2
  });

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="공고 검색..."
          className="search-input"
        />
        {loading && <span className="loading">🔍 검색 중...</span>}
      </div>

      {hasSearched && (
        <div className="search-results">
          <h2>검색 결과: {totalResults}개</h2>

          {results.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            results.map(notice => (
              <div key={notice.id} className="result-item">
                <h3>{notice.title}</h3>
                <div className="meta">
                  <span>{notice.organization}</span>
                  <span>{formatDate(notice.published_at)}</span>
                  {notice.deadline && (
                    <span className="deadline">
                      {getDeadlineStatus(notice.deadline)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

### 예제 3: 최신 공고 위젯

```typescript
import { useLatestNotices } from '@/hooks/useNotices';
import { formatRelativeTime } from '@/lib/utils/date';

function LatestNoticesWidget() {
  const { notices, loading } = useLatestNotices(5); // 최신 5개

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="widget">
      <h3>최신 공고</h3>
      <ul>
        {notices.map(notice => (
          <li key={notice.id}>
            <a href={`/notices/${notice.id}`}>
              {notice.title}
            </a>
            <small>{formatRelativeTime(notice.published_at)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## API 문서 링크

### Swagger UI (대화형 API 문서)

개발 서버가 실행 중일 때 다음 URL에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### 주요 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/notices` | 공고 목록 조회 |
| GET | `/api/notices/{id}` | 공고 상세 조회 |
| GET | `/api/notices/latest/list` | 최신 공고 조회 |

### 필터 파라미터

- `category`: 카테고리 ('government', 'business', 'rnd', 'startup')
- `status`: 상태 ('pending', 'published', 'archived')
- `search`: 검색어
- `tags`: 태그 (콤마로 구분)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `sort_by`: 정렬 기준 ('created_at', 'published_at', 'deadline')
- `sort_order`: 정렬 순서 ('asc', 'desc')

---

## 자주 묻는 질문

### Q1: API 호출이 실패하면 어떻게 하나요?

A: useNotices 훅을 사용하면 error 상태로 자동 처리됩니다.
직접 호출 시 try-catch로 에러를 잡고 getErrorMessage를 사용하세요.

### Q2: 페이지네이션을 어떻게 구현하나요?

A: useNotices 훅의 setPage 함수와 pagination 객체를 사용하세요.
예제 1을 참고하세요.

### Q3: 검색 디바운싱이란?

A: 사용자가 입력을 멈춘 후 일정 시간 후에 검색을 실행하는 것입니다.
useNoticeSearch 훅에서 자동으로 처리됩니다.

### Q4: TypeScript 타입을 어떻게 사용하나요?

A: Notice, PaginatedResponse 등의 타입을 lib/api/types.ts에서 import하세요.

```typescript
import { Notice } from '@/lib/api/types';

const notice: Notice = { ... };
```

---

## 다음 단계

1. ✅ 이 가이드의 예제 코드를 직접 실행해보세요
2. ✅ Swagger UI에서 API를 직접 테스트해보세요
3. ✅ 자신만의 컴포넌트를 만들어보세요
4. ✅ 에러 처리를 추가하여 안정성을 높이세요

---

**작성일**: 2024년 12월
**작성자**: JB SQUARE 개발팀
**문의**: 프로젝트 이슈 트래커 사용
