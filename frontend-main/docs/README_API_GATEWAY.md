# 🌐 JB SQUARE API 게이트웨이

> 초보 개발자를 위한 전문적이고 직관적인 API 게이트웨이 시스템

---

## 📋 개요

이 프로젝트는 JB SQUARE 웹 포털을 위한 **단일 게이트웨이 API 시스템**을 제공합니다.
모든 백엔드 API 호출은 이 게이트웨이를 통해 처리되며, 타입 안전성과 에러 핸들링이 보장됩니다.

---

## ✨ 주요 기능

- ✅ **단일 진입점**: 모든 API 요청을 하나의 클라이언트로 통합
- ✅ **타입 안전성**: TypeScript로 모든 API 응답 타입 정의
- ✅ **자동 에러 처리**: 사용자 친화적인 한국어 에러 메시지
- ✅ **React 훅 제공**: useNotices, useNoticeSearch 등
- ✅ **디바운싱 검색**: 실시간 검색 with 자동 디바운스
- ✅ **환경변수 관리**: 개발/프로덕션 환경 분리
- ✅ **완벽한 한글 주석**: 모든 코드에 상세한 설명

---

## 📂 프로젝트 구조

```
frontend-main/
├── lib/
│   ├── api/
│   │   ├── client.ts              # 🌐 API 게이트웨이 클라이언트 (진입점)
│   │   ├── types.ts               # 📝 TypeScript 타입 정의
│   │   └── endpoints/
│   │       └── notices.ts         # 📢 공고 API 엔드포인트
│   └── utils/
│       ├── date.ts                # 📅 날짜 유틸리티 함수
│       └── errors.ts              # ⚠️ 에러 처리 유틸리티
├── hooks/
│   ├── useNotices.ts              # 🪝 공고 목록 관리 훅
│   └── useNoticeSearch.ts         # 🔍 검색 기능 훅
├── docs/
│   ├── API_GUIDE.md               # 📚 API 사용 가이드
│   └── README_API_GATEWAY.md      # 이 파일
└── .env.local                     # 🔧 환경 설정
```

---

## 🚀 빠른 시작

### 1단계: 환경 설정

`.env.local` 파일 확인:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2단계: 기본 사용

```typescript
// 컴포넌트에서 사용
import { useNotices } from '@/hooks/useNotices';

function MyComponent() {
  const { notices, loading, error } = useNotices();

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

## 📖 상세 가이드

자세한 사용법은 [API_GUIDE.md](./API_GUIDE.md)를 참고하세요.

### 주요 내용:

1. [시작하기](./API_GUIDE.md#시작하기)
2. [API 게이트웨이 구조](./API_GUIDE.md#api-게이트웨이-구조)
3. [기본 사용법](./API_GUIDE.md#기본-사용법)
4. [커스텀 훅 사용법](./API_GUIDE.md#커스텀-훅-사용법)
5. [에러 처리](./API_GUIDE.md#에러-처리)
6. [실전 예제](./API_GUIDE.md#실전-예제)

---

## 🎯 핵심 개념

### 1. API 게이트웨이 클라이언트

`lib/api/client.ts`는 모든 API 요청의 단일 진입점입니다.

```typescript
import api from '@/lib/api/client';

// 공고 목록 조회
const notices = await api.notices.getList({ category: 'government' });

// 단일 공고 상세
const notice = await api.notices.getById(123);

// 검색
const results = await api.notices.search('바이오');
```

### 2. 커스텀 훅

React 훅을 사용하면 로딩/에러 상태를 자동으로 관리할 수 있습니다.

```typescript
// 공고 목록 관리
const { notices, loading, error, setFilters } = useNotices();

// 실시간 검색 (디바운싱 적용)
const { searchQuery, setSearchQuery, results } = useNoticeSearch();
```

### 3. 타입 안전성

모든 API 응답은 TypeScript 타입으로 정의되어 있습니다.

```typescript
import { Notice, PaginatedResponse } from '@/lib/api/types';

const notice: Notice = { ... };
const response: PaginatedResponse<Notice> = { ... };
```

---

## 🔗 API 문서 링크

### 실시간 API 문서 (Swagger)

백엔드 서버가 실행 중일 때 다음 URL에서 확인:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 주요 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/notices` | GET | 공고 목록 조회 |
| `/api/notices/{id}` | GET | 공고 상세 조회 |
| `/api/notices/latest/list` | GET | 최신 공고 조회 |

---

## 💡 사용 예제

### 예제 1: 카테고리 필터링

```typescript
const { notices, setFilters } = useNotices({ category: 'government' });

// 카테고리 변경
function changeToBusinessNotices() {
  setFilters({ category: 'business' });
}
```

### 예제 2: 페이지네이션

```typescript
const { notices, pagination, setPage } = useNotices();

function goToNextPage() {
  if (pagination?.hasNext) {
    setPage(pagination.page + 1);
  }
}
```

### 예제 3: 실시간 검색

```typescript
const { searchQuery, setSearchQuery, results } = useNoticeSearch({
  debounceDelay: 500  // 500ms 후 자동 검색
});

// 사용자 입력 시
<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

---

## 🛠️ 개발 가이드

### 새로운 API 엔드포인트 추가하기

1. **타입 정의** (`lib/api/types.ts`)
```typescript
export interface MyData {
  id: number;
  name: string;
}
```

2. **API 클래스 작성** (`lib/api/endpoints/mydata.ts`)
```typescript
export class MyDataAPI {
  async getList() {
    return this.client.get<MyData[]>('/api/mydata');
  }
}
```

3. **게이트웨이에 등록** (`lib/api/client.ts`)
```typescript
const api: APIClient = {
  notices: createNoticesAPI(axiosInstance),
  mydata: new MyDataAPI(axiosInstance)  // 추가
};
```

### 커스텀 훅 작성하기

```typescript
// hooks/useMyData.ts
export function useMyData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.mydata.getList()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```

---

## 📊 파일별 역할

| 파일 | 라인 수 | 역할 | 중요도 |
|------|---------|------|--------|
| `lib/api/client.ts` | ~200 | API 게이트웨이 | ⭐⭐⭐⭐⭐ |
| `lib/api/types.ts` | ~150 | 타입 정의 | ⭐⭐⭐⭐⭐ |
| `lib/api/endpoints/notices.ts` | ~200 | 공고 API | ⭐⭐⭐⭐ |
| `hooks/useNotices.ts` | ~200 | 공고 훅 | ⭐⭐⭐⭐ |
| `hooks/useNoticeSearch.ts` | ~150 | 검색 훅 | ⭐⭐⭐ |
| `lib/utils/date.ts` | ~200 | 날짜 유틸 | ⭐⭐⭐ |
| `lib/utils/errors.ts` | ~150 | 에러 처리 | ⭐⭐⭐ |

---

## 🎓 학습 경로

### 초급 (1-2일)

1. ✅ API_GUIDE.md 읽기
2. ✅ useNotices 훅으로 공고 목록 표시
3. ✅ 페이지네이션 구현
4. ✅ 에러 처리 추가

### 중급 (3-5일)

1. ✅ useNoticeSearch 훅으로 검색 기능 추가
2. ✅ 카테고리 필터 구현
3. ✅ 날짜 유틸리티 활용
4. ✅ 커스텀 훅 작성

### 고급 (1주일+)

1. ✅ 새로운 API 엔드포인트 추가
2. ✅ 복잡한 필터링 로직 구현
3. ✅ 캐싱 전략 적용
4. ✅ 성능 최적화

---

## ❓ FAQ

**Q: API 호출이 실패하면 어떻게 하나요?**
A: useNotices 훅 사용 시 error 상태로 자동 처리됩니다.

**Q: 페이지네이션은 어떻게 하나요?**
A: setPage 함수와 pagination 객체를 사용하세요.

**Q: 검색 디바운싱이란?**
A: 사용자 입력이 멈춘 후 일정 시간 후 검색하는 것입니다.

**Q: TypeScript 타입은 어떻게 사용하나요?**
A: `lib/api/types.ts`에서 import하여 사용하세요.

---

## 📝 작성 정보

- **작성일**: 2024년 12월
- **작성자**: JB SQUARE 개발팀
- **버전**: 1.0.0
- **라이선스**: 내부 사용

---

## 🔮 향후 개발 계획

- [ ] React Query 통합
- [ ] WebSocket 실시간 업데이트
- [ ] 오프라인 모드 지원
- [ ] API 응답 캐싱
- [ ] 샘플 게시판 페이지 (Phase 3, 4)

---

**Happy Coding! 🚀**
