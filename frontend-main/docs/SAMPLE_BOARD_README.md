# 📋 샘플 게시판 가이드

> JB SQUARE 프론트엔드 개발자를 위한 완전한 샘플 코드

---

## 🎯 목적

이 샘플 게시판은 **초보 개발자가 JB SQUARE 프론트엔드 개발을 빠르게 시작할 수 있도록** 작성된 완전한 예제입니다.

실제로 동작하는 공고 게시판을 통해 다음을 배울 수 있습니다:
- API 게이트웨이 사용법
- 커스텀 훅 활용법
- 컴포넌트 재사용 방법
- 상태 관리 패턴
- 에러 처리 방법

---

## 📂 전체 구조

```
frontend-main/
├── lib/
│   ├── api/
│   │   ├── client.ts              # 🌐 API 게이트웨이 (단일 진입점)
│   │   ├── types.ts               # 📝 TypeScript 타입 정의
│   │   └── endpoints/
│   │       └── notices.ts         # 📢 공고 API 엔드포인트
│   └── utils/
│       ├── date.ts                # 📅 날짜 유틸리티
│       └── errors.ts              # ⚠️ 에러 처리 유틸리티
├── hooks/
│   ├── useNotices.ts              # 🪝 공고 목록 관리 훅
│   └── useNoticeSearch.ts         # 🔍 검색 기능 훅
├── components/
│   └── sample-board/
│       ├── NoticeCard.tsx         # 📄 공고 카드 컴포넌트
│       ├── SearchBar.tsx          # 🔍 검색바 컴포넌트
│       ├── FilterBar.tsx          # 🎯 필터바 컴포넌트
│       └── Pagination.tsx         # 📄 페이지네이션 컴포넌트
├── pages/
│   └── sample-board/
│       ├── index.tsx              # 📋 공고 목록 페이지
│       └── [id].tsx               # 📄 공고 상세 페이지
├── docs/
│   ├── API_GUIDE.md               # 📚 API 사용 가이드
│   ├── README_API_GATEWAY.md      # 🌐 API 게이트웨이 README
│   └── SAMPLE_BOARD_README.md     # 이 파일
└── .env.local                     # 🔧 환경 설정
```

---

## 🚀 빠른 시작

### 1단계: 백엔드 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상환경 활성화 (이미 설정되어 있다면 생략)
source venv/bin/activate

# 서버 실행
uvicorn src.main:app --reload --port 8000
```

백엔드가 실행되면 다음 URL에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2단계: 프론트엔드 실행

```bash
# 프론트엔드 디렉토리로 이동
cd frontend-main

# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드가 실행되면 다음 URL에서 샘플 게시판을 확인할 수 있습니다:
- **샘플 게시판**: http://localhost:3000/sample-board

---

## 📚 학습 경로

### 초급 (1-2일)

**목표**: 샘플 코드를 이해하고 실행해보기

1. ✅ **API 게이트웨이 이해하기**
   - [lib/api/client.ts](../lib/api/client.ts) 읽어보기
   - API 호출이 어떻게 이루어지는지 파악
   - 환경변수 설정 확인 (.env.local)

2. ✅ **샘플 페이지 실행하기**
   - http://localhost:3000/sample-board 접속
   - 공고 검색, 필터링, 페이지네이션 사용해보기
   - 개발자 도구에서 네트워크 탭 확인

3. ✅ **컴포넌트 구조 파악하기**
   - [pages/sample-board/index.tsx](../pages/sample-board/index.tsx) 읽어보기
   - 컴포넌트들이 어떻게 조합되는지 확인

### 중급 (3-5일)

**목표**: 코드를 수정하고 커스터마이징하기

1. ✅ **컴포넌트 스타일 변경하기**
   - [components/sample-board/NoticeCard.tsx](../components/sample-board/NoticeCard.tsx) 수정
   - Tailwind CSS 클래스 변경
   - variant prop으로 다양한 스타일 시도

2. ✅ **필터 조건 추가하기**
   - [components/sample-board/FilterBar.tsx](../components/sample-board/FilterBar.tsx) 수정
   - 새로운 필터 옵션 추가
   - useNotices 훅과 연동

3. ✅ **커스텀 훅 이해하기**
   - [hooks/useNotices.ts](../hooks/useNotices.ts) 분석
   - 상태 관리 패턴 학습
   - 자신만의 커스텀 훅 작성

### 고급 (1주일+)

**목표**: 새로운 기능 추가하기

1. ✅ **새로운 페이지 만들기**
   - pages/sample-board 패턴 참고
   - 새로운 API 엔드포인트 추가
   - 라우팅 설정

2. ✅ **고급 기능 구현하기**
   - 북마크 기능 추가
   - 알림 설정 기능
   - 공유 기능

3. ✅ **성능 최적화**
   - React.memo 적용
   - 이미지 최적화
   - 코드 스플리팅

---

## 🎓 핵심 개념

### 1. API 게이트웨이 패턴

**왜 필요한가요?**
- 모든 API 호출을 한 곳에서 관리
- 중복 코드 제거
- 에러 처리 통합
- 타입 안전성 보장

**사용 예시:**
```typescript
import api from '@/lib/api/client';

// ✅ 좋은 예: API 게이트웨이 사용
const notices = await api.notices.getList({ category: 'government' });

// ❌ 나쁜 예: 직접 axios 호출
const response = await axios.get('http://localhost:8000/api/notices');
```

### 2. 커스텀 훅 패턴

**왜 필요한가요?**
- 로직 재사용
- 컴포넌트 단순화
- 상태 관리 중앙화

**사용 예시:**
```typescript
import { useNotices } from '@/hooks/useNotices';

function MyComponent() {
  // ✅ 좋은 예: 커스텀 훅 사용
  const { notices, loading, error } = useNotices();

  // ❌ 나쁜 예: 컴포넌트 내에서 직접 API 호출
  const [notices, setNotices] = useState([]);
  useEffect(() => {
    fetch('/api/notices').then(/* ... */);
  }, []);
}
```

### 3. 컴포넌트 재사용 패턴

**왜 필요한가요?**
- 코드 중복 방지
- 일관된 UI
- 유지보수 용이

**사용 예시:**
```typescript
// ✅ 좋은 예: 재사용 가능한 컴포넌트
<NoticeCard notice={notice} variant="default" />
<NoticeCard notice={notice} variant="compact" />
<NoticeCard notice={notice} variant="detailed" />

// ❌ 나쁜 예: 각 페이지마다 다른 카드 구현
```

---

## 💡 실전 예제

### 예제 1: 카테고리별 공고 표시

```typescript
import { useNotices } from '@/hooks/useNotices';
import { NoticeCard } from '@/components/sample-board/NoticeCard';

function GovernmentNotices() {
  // government 카테고리만 가져오기
  const { notices, loading } = useNotices({
    category: 'government',
    limit: 10
  });

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  );
}
```

### 예제 2: 실시간 검색

```typescript
import { useNoticeSearch } from '@/hooks/useNoticeSearch';
import { SearchBar } from '@/components/sample-board/SearchBar';
import { NoticeCard } from '@/components/sample-board/NoticeCard';

function SearchableSidebar() {
  // 디바운싱이 자동으로 적용됨
  const { searchQuery, setSearchQuery, results, loading } = useNoticeSearch({
    debounceDelay: 500,  // 500ms 후 검색
    minLength: 2         // 최소 2글자
  });

  return (
    <div>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        loading={loading}
      />
      {results.map(notice => (
        <NoticeCard key={notice.id} notice={notice} variant="compact" />
      ))}
    </div>
  );
}
```

### 예제 3: 마감 임박 공고 위젯

```typescript
import { useNotices } from '@/hooks/useNotices';
import { getDaysUntilDeadline } from '@/lib/utils/date';

function UrgentNotices() {
  const { notices } = useNotices({
    sort_by: 'deadline',
    sort_order: 'asc',
    limit: 5
  });

  // 마감 7일 이내 공고만 필터링
  const urgentNotices = notices.filter(notice => {
    const days = getDaysUntilDeadline(notice.deadline);
    return days !== null && days >= 0 && days <= 7;
  });

  return (
    <div className="bg-red-50 p-4 rounded-lg">
      <h3 className="text-red-800 font-bold mb-3">
        ⚠️ 마감 임박 공고
      </h3>
      {urgentNotices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} variant="compact" />
      ))}
    </div>
  );
}
```

---

## 🔧 커스터마이징 가이드

### 스타일 변경하기

모든 컴포넌트는 Tailwind CSS를 사용합니다. 색상과 스타일을 쉽게 변경할 수 있습니다.

```typescript
// NoticeCard.tsx에서 카테고리 색상 변경
const CATEGORY_COLORS: Record<Notice['category'], { bg: string; text: string }> = {
  government: { bg: 'bg-blue-100', text: 'text-blue-800' },     // 파란색
  business: { bg: 'bg-green-100', text: 'text-green-800' },     // 초록색
  rnd: { bg: 'bg-purple-100', text: 'text-purple-800' },        // 보라색
  startup: { bg: 'bg-orange-100', text: 'text-orange-800' }     // 주황색
};
```

### 새로운 필터 추가하기

FilterBar 컴포넌트에 새로운 필터 옵션을 추가할 수 있습니다.

```typescript
// FilterBar.tsx에 태그 필터 추가
const [selectedTags, setSelectedTags] = useState<string[]>([]);

const handleTagChange = (tag: string) => {
  const newTags = selectedTags.includes(tag)
    ? selectedTags.filter(t => t !== tag)
    : [...selectedTags, tag];

  setSelectedTags(newTags);
  onFilterChange({ tags: newTags.join(',') });
};
```

### 새로운 컴포넌트 만들기

샘플 컴포넌트를 참고하여 새로운 컴포넌트를 만들 수 있습니다.

```typescript
// components/sample-board/NoticeBookmark.tsx
import React from 'react';
import { Notice } from '@/lib/api/types';

interface NoticeBookmarkProps {
  notice: Notice;
  isBookmarked: boolean;
  onToggle: (noticeId: number) => void;
}

export const NoticeBookmark: React.FC<NoticeBookmarkProps> = ({
  notice,
  isBookmarked,
  onToggle
}) => {
  return (
    <button
      onClick={() => onToggle(notice.id)}
      className={`p-2 rounded ${isBookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
    >
      {isBookmarked ? '⭐' : '☆'}
    </button>
  );
};
```

---

## 🐛 문제 해결

### API 호출이 실패해요

1. **백엔드 서버가 실행 중인지 확인**
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **.env.local 파일 확인**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. **브라우저 콘솔 확인**
   - F12 > Network 탭에서 API 요청 확인
   - 에러 메시지 확인

### 컴포넌트가 렌더링되지 않아요

1. **Import 경로 확인**
   ```typescript
   // ✅ 올바른 import
   import { NoticeCard } from '@/components/sample-board/NoticeCard';

   // ❌ 잘못된 import
   import { NoticeCard } from 'components/sample-board/NoticeCard';
   ```

2. **TypeScript 에러 확인**
   ```bash
   npm run type-check
   ```

### 스타일이 적용되지 않아요

1. **Tailwind CSS 빌드 확인**
   - 개발 서버 재시작
   - 브라우저 캐시 삭제

2. **클래스 이름 오타 확인**
   ```typescript
   // ✅ 올바른 클래스
   className="bg-blue-100"

   // ❌ 잘못된 클래스
   className="bg-blue100"
   ```

---

## 📖 추가 자료

### 문서
- [API_GUIDE.md](./API_GUIDE.md) - API 사용 가이드
- [README_API_GATEWAY.md](./README_API_GATEWAY.md) - API 게이트웨이 개요

### API 문서
- [Swagger UI](http://localhost:8000/docs) - 인터랙티브 API 문서
- [ReDoc](http://localhost:8000/redoc) - 깔끔한 API 문서

### 외부 자료
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)

---

## ❓ FAQ

**Q: 다른 API 엔드포인트는 어떻게 추가하나요?**

A: 다음 3단계를 따르세요:
1. `lib/api/types.ts`에 타입 추가
2. `lib/api/endpoints/` 에 새 파일 생성
3. `lib/api/client.ts`에 등록

**Q: 커스텀 훅은 언제 만들어야 하나요?**

A: 다음 경우에 커스텀 훅을 만드세요:
- 여러 컴포넌트에서 같은 로직을 사용할 때
- 상태 관리가 복잡할 때
- API 호출과 상태 관리를 함께 해야 할 때

**Q: 컴포넌트는 어떻게 나눠야 하나요?**

A: 다음 원칙을 따르세요:
- 한 컴포넌트는 한 가지 역할만
- 재사용 가능하게 만들기
- Props는 명확하게 정의
- 100줄 이상이면 분리 고려

**Q: 에러 처리는 어떻게 하나요?**

A: `lib/utils/errors.ts`의 함수들을 사용하세요:
```typescript
import { getErrorMessage, logError } from '@/lib/utils/errors';

try {
  const data = await api.notices.getList();
} catch (error) {
  const message = getErrorMessage(error);
  logError(error, '공고 목록 조회 실패');
  alert(message);
}
```

---

## 🎉 마치며

이 샘플 코드는 JB SQUARE 개발의 시작점입니다!

궁금한 점이 있다면:
1. 코드 주석을 꼼꼼히 읽어보세요
2. 개발자 도구를 활용하세요
3. 팀원들에게 질문하세요

**Happy Coding! 🚀**

---

**작성일**: 2024년 12월
**작성자**: JB SQUARE 개발팀
**버전**: 1.0.0
